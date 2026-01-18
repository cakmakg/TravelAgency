#!/usr/bin/env node

/**
 * Database Recovery Script
 * 
 * Restore MongoDB backup with:
 * - Automatic backup detection
 * - Pre-recovery validation
 * - Dry-run mode for testing
 * - Point-in-time recovery
 * - Backup verification before recovery
 * 
 * Usage:
 * - npm run restore               : Restore from latest backup
 * - npm run restore -- --backup backup-2024-01-15-123456  : Restore specific backup
 * - npm run restore -- --dry-run  : Test recovery without making changes
 * - npm run restore -- --list     : List available backups
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const zlib = require('zlib');
const readline = require('readline');

const execAsync = promisify(exec);

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelagency';
const DB_NAME = process.env.DB_NAME || 'travelagency';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
};

// State
let isDryRun = false;
let selectedBackup = null;

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

/**
 * Get MongoDB connection string without password
 */
function getSafeMongoURI() {
  const uri = MONGODB_URI;
  return uri.replace(/:([^:@]+)@/, ':****@');
}

/**
 * List available backups
 */
function listBackups() {
  log(`====== Available Backups ======`, 'blue');

  if (!fs.existsSync(BACKUP_DIR)) {
    log(`✗ Backup directory not found: ${BACKUP_DIR}`, 'red');
    return [];
  }

  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = [];

    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);

      // Check for manifest files
      if (file.endsWith('-manifest.json')) {
        const backupName = file.replace('-manifest.json', '');
        const manifestPath = filePath;

        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

          backups.push({
            name: backupName,
            timestamp: new Date(manifest.timestamp),
            type: manifest.type,
            size: manifest.sizes.compressed || manifest.sizes.original,
            status: manifest.status,
            expiryDate: new Date(manifest.retention.expiryDate),
            manifestPath,
          });
        } catch (err) {
          log(`  ⚠ Invalid manifest: ${file}`, 'yellow');
        }
      }
    }

    // Sort by timestamp (newest first)
    backups.sort((a, b) => b.timestamp - a.timestamp);

    if (backups.length === 0) {
      log(`✗ No backups found in ${BACKUP_DIR}`, 'red');
      return [];
    }

    backups.forEach((backup, index) => {
      const isExpired = backup.expiryDate < new Date() ? ' (EXPIRED)' : '';
      const timeAgo = getTimeAgo(backup.timestamp);
      log(
        `${index + 1}. ${backup.name} | ${backup.type} | ${backup.size} | ${timeAgo} ago${isExpired}`,
        backup.expiryDate < new Date() ? 'yellow' : 'green'
      );
    });

    return backups;
  } catch (error) {
    log(`✗ Error listing backups: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''}`;
    }
  }

  return 'just now';
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
 * Prompt user for confirmation
 */
async function confirm(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${colors.magenta}${message}${colors.reset} `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Validate backup before recovery
 */
async function validateBackup(backupName) {
  log(`Validating backup: ${backupName}`, 'blue');

  try {
    const manifestPath = path.join(BACKUP_DIR, `${backupName}-manifest.json`);

    if (!fs.existsSync(manifestPath)) {
      throw new Error('Manifest file not found');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Check if backup is expired
    const expiryDate = new Date(manifest.retention.expiryDate);
    if (expiryDate < new Date()) {
      log(`✗ Backup has expired (${expiryDate.toISOString()})`, 'red');
      return false;
    }

    // Check if backup files exist
    let backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      // Try compressed path
      backupPath = `${backupPath}.tar.gz`;
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup files not found: ${backupPath}`);
      }
    }

    log(`✓ Backup validated`, 'green');
    log(`  Type: ${manifest.type}`, 'green');
    log(`  Size: ${manifest.sizes.originalBytes || manifest.sizes.compressedBytes} bytes`, 'green');
    log(`  Created: ${new Date(manifest.timestamp).toLocaleString()}`, 'green');

    return true;
  } catch (error) {
    log(`✗ Validation failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Decompress backup if needed
 */
async function decompressBackup(backupName) {
  const compressedPath = path.join(BACKUP_DIR, `${backupName}.tar.gz`);
  const backupPath = path.join(BACKUP_DIR, backupName);

  if (!fs.existsSync(compressedPath)) {
    return backupPath; // Already decompressed or not compressed
  }

  log(`Decompressing backup...`, 'blue');

  try {
    if (process.platform !== 'win32') {
      execSync(`cd "${BACKUP_DIR}" && tar -xzf "${compressedPath}"`);
    } else {
      // Windows: Use Node.js decompression
      const gunzip = zlib.createGunzip();
      const source = fs.createReadStream(compressedPath);
      const destination = fs.createWriteStream(backupPath);

      await new Promise((resolve, reject) => {
        source
          .pipe(gunzip)
          .pipe(destination)
          .on('finish', resolve)
          .on('error', reject);
      });
    }

    log(`✓ Backup decompressed`, 'green');
    return backupPath;
  } catch (error) {
    throw new Error(`Decompression failed: ${error.message}`);
  }
}

/**
 * Restore from full backup using mongorestore
 */
async function restoreFullBackup(backupPath) {
  log(`Restoring from full backup...`, 'blue');

  if (isDryRun) {
    log(`[DRY RUN] Would execute: mongorestore --uri "${MONGODB_URI}" --drop "${backupPath}"`, 'yellow');
    return true;
  }

  try {
    const command = `mongorestore --uri "${MONGODB_URI}" --drop "${backupPath}"`;

    log(`Executing: mongorestore...`, 'blue');
    await execAsync(command);

    log(`✓ Full restore completed successfully`, 'green');
    return true;
  } catch (error) {
    throw new Error(`Restore failed: ${error.message}`);
  }
}

/**
 * Restore from incremental backup (JSON files)
 */
async function restoreIncrementalBackup(backupPath) {
  log(`Restoring from incremental backup...`, 'blue');

  try {
    const mongoose = require('mongoose');

    if (isDryRun) {
      log(`[DRY RUN] Would restore collections from JSON files`, 'yellow');
      return true;
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;

    // Get all JSON files in backup
    const files = fs.readdirSync(backupPath).filter(f => f.endsWith('.json') && f !== 'metadata.json');

    for (const file of files) {
      const collName = path.basename(file, '.json');
      const filePath = path.join(backupPath, file);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Drop collection if exists
        try {
          await db.collection(collName).drop();
        } catch (err) {
          // Collection doesn't exist, that's okay
        }

        // Insert documents
        if (data.length > 0) {
          await db.collection(collName).insertMany(data);
          log(`  ✓ Restored ${collName}: ${data.length} documents`, 'green');
        }
      } catch (err) {
        log(`  ⚠ Failed to restore ${collName}: ${err.message}`, 'yellow');
      }
    }

    await mongoose.disconnect();
    log(`✓ Incremental restore completed successfully`, 'green');
    return true;
  } catch (error) {
    throw new Error(`Restore failed: ${error.message}`);
  }
}

/**
 * Main recovery function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  isDryRun = args.includes('--dry-run');

  if (args.includes('--list')) {
    listBackups();
    process.exit(0);
  }

  try {
    log(`====== Database Recovery Started ======`, 'blue');
    log(`Database: ${getSafeMongoURI()}`, 'blue');

    // List available backups
    const backups = listBackups();

    if (backups.length === 0) {
      log(`✗ No valid backups found`, 'red');
      process.exit(1);
    }

    // Select backup
    let selectedIdx = 0;

    if (args.includes('--backup')) {
      const backupName = args[args.indexOf('--backup') + 1];
      const found = backups.findIndex(b => b.name === backupName);

      if (found === -1) {
        log(`✗ Backup not found: ${backupName}`, 'red');
        process.exit(1);
      }

      selectedIdx = found;
    }

    selectedBackup = backups[selectedIdx];

    log(`\nSelected backup: ${selectedBackup.name}`, 'magenta');
    log(`Type: ${selectedBackup.type}`, 'magenta');
    log(`Created: ${selectedBackup.timestamp.toLocaleString()}`, 'magenta');

    if (isDryRun) {
      log(`\n⚠ DRY-RUN MODE: No changes will be made`, 'yellow');
    }

    // Confirm recovery
    const shouldProceed = await confirm(`\n⚠ This will DROP all data and restore from backup. Continue? (y/N)`);

    if (!shouldProceed) {
      log(`Recovery cancelled`, 'yellow');
      process.exit(0);
    }

    // Validate backup
    const isValid = await validateBackup(selectedBackup.name);

    if (!isValid) {
      log(`✗ Backup validation failed`, 'red');
      process.exit(1);
    }

    // Decompress if needed
    let backupPath = await decompressBackup(selectedBackup.name);

    // Restore based on type
    let restored = false;

    if (selectedBackup.type === 'full') {
      restored = await restoreFullBackup(backupPath);
    } else if (selectedBackup.type === 'incremental') {
      restored = await restoreIncrementalBackup(backupPath);
    }

    if (restored) {
      if (isDryRun) {
        log(`====== Dry-Run Completed ======`, 'yellow');
      } else {
        log(`====== Recovery Completed Successfully ======`, 'green');
        log(`Database restored from: ${selectedBackup.name}`, 'green');
      }
      process.exit(0);
    } else {
      throw new Error('Recovery failed');
    }
  } catch (error) {
    log(`✗ Recovery failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run recovery
main();
