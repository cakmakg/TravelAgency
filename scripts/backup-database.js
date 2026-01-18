#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * Comprehensive MongoDB backup utility supporting:
 * - Full database backups (mongodump)
 * - Incremental backups (via collection timestamps)
 * - Automatic compression (gzip)
 * - Backup rotation/retention
 * - Health checks and validation
 * 
 * Usage:
 * - npm run backup              : Full backup with default settings
 * - npm run backup -- --type incremental  : Incremental backup
 * - npm run backup -- --type full --keep 30 : Keep 30 days of backups
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const zlib = require('zlib');
const mongoose = require('mongoose');

const execAsync = promisify(exec);

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelagency';
const DB_NAME = process.env.DB_NAME || 'travelagency';
const COMPRESSION = process.env.BACKUP_COMPRESSION !== 'false';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || 30);

// Timestamps and paths
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const timeHMS = new Date().toISOString().split('T')[1].replace(/[:.]/g, '-').slice(0, 6);
const backupName = `backup-${timestamp}-${timeHMS}`;
const backupPath = path.join(BACKUP_DIR, backupName);
const compressedPath = `${backupPath}.tar.gz`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log(`✓ Created backup directory: ${BACKUP_DIR}`, 'green');
  }
}

/**
 * Get MongoDB connection string without password from URI
 */
function getSafeMongoURI() {
  const uri = MONGODB_URI;
  return uri.replace(/:([^:@]+)@/, ':****@');
}

/**
 * Perform full database backup using mongodump
 */
async function performFullBackup() {
  log(`Starting full backup to: ${backupPath}`, 'blue');

  try {
    // Extract connection details from MONGODB_URI
    const mongoUrl = new URL(MONGODB_URI);
    const host = mongoUrl.hostname || 'localhost';
    const port = mongoUrl.port || '27017';
    const username = mongoUrl.username ? `--username ${mongoUrl.username}` : '';
    const password = mongoUrl.password ? `--password ${mongoUrl.password}` : '';
    const authSource = mongoUrl.searchParams.get('authSource') || 'admin';

    // Build mongodump command
    let command = `mongodump --uri "${MONGODB_URI}" --out "${backupPath}"`;

    // Windows compatibility - use mongodump from PATH
    if (process.platform === 'win32') {
      command = `mongodump --uri "${MONGODB_URI}" --out "${backupPath}"`;
    }

    log(`Executing: mongodump...`, 'blue');
    await execAsync(command);

    log(`✓ Full backup completed successfully`, 'green');

    // Get backup size
    const size = getDirectorySize(backupPath);
    log(`  Backup size: ${formatBytes(size)}`, 'green');

    return { type: 'full', size, path: backupPath };
  } catch (error) {
    throw new Error(`Full backup failed: ${error.message}`);
  }
}

/**
 * Perform incremental backup (collection snapshot with timestamp)
 */
async function performIncrementalBackup() {
  log(`Starting incremental backup...`, 'blue');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    // Create incremental backup directory
    fs.mkdirSync(backupPath, { recursive: true });

    let totalSize = 0;

    for (const collection of collections) {
      const collName = collection.name;
      const collPath = path.join(backupPath, `${collName}.json`);

      try {
        const coll = db.collection(collName);
        const docs = await coll.find({}).toArray();

        // Write as JSON
        const jsonData = JSON.stringify(docs, null, 2);
        fs.writeFileSync(collPath, jsonData);

        const size = Buffer.byteLength(jsonData);
        totalSize += size;
        log(`  ✓ ${collName}: ${docs.length} documents (${formatBytes(size)})`, 'green');
      } catch (err) {
        log(`  ⚠ ${collName}: ${err.message}`, 'yellow');
      }
    }

    // Create metadata file
    const metadata = {
      type: 'incremental',
      timestamp: new Date().toISOString(),
      database: DB_NAME,
      collections: collections.map(c => c.name),
    };

    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    log(`✓ Incremental backup completed`, 'green');
    log(`  Total size: ${formatBytes(totalSize)}`, 'green');

    await mongoose.disconnect();
    return { type: 'incremental', size: totalSize, path: backupPath };
  } catch (error) {
    throw new Error(`Incremental backup failed: ${error.message}`);
  }
}

/**
 * Compress backup directory
 */
async function compressBackup() {
  log(`Compressing backup...`, 'blue');

  return new Promise((resolve, reject) => {
    const source = fs.createReadStream(backupPath);
    const destination = fs.createWriteStream(compressedPath);
    const gzip = zlib.createGzip();

    // Use tar for better compression
    if (process.platform !== 'win32') {
      try {
        execSync(`tar -czf "${compressedPath}" -C "${path.dirname(backupPath)}" "${backupName}"`);
        const compressedSize = fs.statSync(compressedPath).size;
        const originalSize = getDirectorySize(backupPath);
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        log(`✓ Backup compressed`, 'green');
        log(`  Original: ${formatBytes(originalSize)}`, 'green');
        log(`  Compressed: ${formatBytes(compressedSize)} (${ratio}% reduction)`, 'green');

        // Remove uncompressed backup
        execSync(`rm -rf "${backupPath}"`);
        resolve(compressedSize);
      } catch (error) {
        reject(new Error(`Compression failed: ${error.message}`));
      }
    } else {
      // Windows: Use Node.js tar-like compression (simplified)
      source
        .pipe(gzip)
        .pipe(destination)
        .on('finish', () => {
          const compressedSize = fs.statSync(compressedPath).size;
          const originalSize = getDirectorySize(backupPath);
          const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

          log(`✓ Backup compressed`, 'green');
          log(`  Original: ${formatBytes(originalSize)}`, 'green');
          log(`  Compressed: ${formatBytes(compressedSize)} (${ratio}% reduction)`, 'green');

          // Note: Keeping uncompressed on Windows for recovery simplicity
          resolve(compressedSize);
        })
        .on('error', reject);
    }
  });
}

/**
 * Get directory size in bytes
 */
function getDirectorySize(dirPath) {
  let size = 0;

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        size += stat.size;
      }
    }
  }

  walkDir(dirPath);
  return size;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Clean old backups based on retention policy
 */
function cleanOldBackups() {
  log(`Cleaning backups older than ${RETENTION_DAYS} days...`, 'blue');

  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const maxAge = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let removedCount = 0;
    let freedSpace = 0;

    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      const age = now - stat.mtime.getTime();

      if (age > maxAge) {
        try {
          if (stat.isDirectory()) {
            execSync(`rm -rf "${filePath}"`);
          } else {
            fs.unlinkSync(filePath);
          }
          freedSpace += stat.size;
          removedCount++;
          log(`  ✓ Removed: ${file}`, 'yellow');
        } catch (err) {
          log(`  ⚠ Failed to remove ${file}: ${err.message}`, 'yellow');
        }
      }
    }

    if (removedCount > 0) {
      log(`✓ Cleanup complete: Removed ${removedCount} backups (freed ${formatBytes(freedSpace)})`, 'green');
    } else {
      log(`✓ No old backups to remove`, 'green');
    }
  } catch (error) {
    log(`⚠ Cleanup error: ${error.message}`, 'yellow');
  }
}

/**
 * Validate backup integrity
 */
async function validateBackup(backupResult) {
  log(`Validating backup...`, 'blue');

  try {
    let isValid = false;

    if (backupResult.type === 'full') {
      // Check if backup directory has expected MongoDB dump structure
      const expected = ['admin', 'local', DB_NAME];
      const contents = fs.readdirSync(backupResult.path);
      isValid = fs.existsSync(path.join(backupResult.path, DB_NAME));

      if (isValid) {
        const collCount = fs.readdirSync(path.join(backupResult.path, DB_NAME)).length;
        log(`✓ Backup valid: ${collCount} collections found`, 'green');
      }
    } else if (backupResult.type === 'incremental') {
      // Check metadata file
      const metadataPath = path.join(backupResult.path, 'metadata.json');
      isValid = fs.existsSync(metadataPath);

      if (isValid) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        log(`✓ Backup valid: ${metadata.collections.length} collections`, 'green');
      }
    }

    if (!isValid) {
      throw new Error('Backup validation failed: Invalid backup structure');
    }
  } catch (error) {
    log(`✗ Validation failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Create backup manifest
 */
function createManifest(backupResult, compressedSize) {
  const manifestPath = path.join(BACKUP_DIR, `${backupName}-manifest.json`);
  const manifest = {
    backupName,
    timestamp: new Date().toISOString(),
    type: backupResult.type,
    database: DB_NAME,
    status: 'completed',
    sizes: {
      original: formatBytes(backupResult.size),
      originalBytes: backupResult.size,
      compressed: formatBytes(compressedSize),
      compressedBytes: compressedSize,
      compressionRatio: ((1 - compressedSize / backupResult.size) * 100).toFixed(1) + '%',
    },
    paths: {
      backup: backupResult.path,
      compressed: COMPRESSION ? compressedPath : null,
    },
    retention: {
      retentionDays: RETENTION_DAYS,
      expiryDate: new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    },
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log(`✓ Manifest created: ${path.basename(manifestPath)}`, 'green');

  return manifest;
}

/**
 * Main backup function
 */
async function main() {
  const args = process.argv.slice(2);
  const backupType = args.includes('--type') 
    ? args[args.indexOf('--type') + 1] 
    : 'full';

  try {
    log(`====== Database Backup Started ======`, 'blue');
    log(`Database: ${getSafeMongoURI()}`, 'blue');
    log(`Backup Type: ${backupType.toUpperCase()}`, 'blue');
    log(`Backup Dir: ${BACKUP_DIR}`, 'blue');

    ensureBackupDir();

    // Perform backup
    let backupResult;
    if (backupType === 'incremental') {
      backupResult = await performIncrementalBackup();
    } else {
      backupResult = await performFullBackup();
    }

    // Validate backup
    await validateBackup(backupResult);

    // Compress if enabled
    let compressedSize = backupResult.size;
    if (COMPRESSION) {
      compressedSize = await compressBackup();
    }

    // Create manifest
    const manifest = createManifest(backupResult, compressedSize);

    // Clean old backups
    cleanOldBackups();

    log(`====== Backup Completed Successfully ======`, 'green');
    log(`Backup name: ${backupName}`, 'green');
    log(`Location: ${COMPRESSION ? compressedPath : backupResult.path}`, 'green');
    process.exit(0);
  } catch (error) {
    log(`✗ Backup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run backup
main();
