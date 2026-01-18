# Database Backup Strategy Guide

## Overview

Complete database backup solution for TravelAgency MongoDB database with automated backups, retention policies, recovery procedures, and disaster recovery testing.

**Risk Mitigation:** Protects against data loss from hardware failure, accidental deletion, ransomware attacks, or application bugs.

---

## Architecture

### Backup Types

#### 1. Full Backup
**What it does:** Complete snapshot of entire database using `mongodump`
- Creates complete copy of all collections
- Suitable for complete disaster recovery
- Larger file size, longer backup time

**When to use:**
- Initial backup before production deployment
- Weekly baseline backups
- Before major deployments or migrations

**Pros:**
- Fastest recovery
- Complete data preservation
- Works with any MongoDB version

**Cons:**
- Larger storage requirement
- Longer backup duration
- Less frequent (typically weekly)

#### 2. Incremental Backup
**What it does:** Exports collections as JSON with timestamps
- Captures collection state at specific point in time
- Faster for frequently-backed collections
- Smaller footprint for small changes

**When to use:**
- Daily backups
- Before API updates
- Before admin operations

**Pros:**
- Faster backup process
- Smaller file size
- JSON format (human readable)

**Cons:**
- Slower recovery (document-by-document insert)
- Requires manual Mongoose connection
- Not suitable for very large collections

### Backup Storage

```
backups/
├── backup-2024-01-15-120000/          [Full backup directory]
│   ├── admin/
│   ├── local/
│   └── travelagency/
│       ├── packages.bson
│       ├── packages.metadata.json
│       ├── fairs.bson
│       ├── fairs.metadata.json
│       ├── gallery.bson
│       ├── gallery.metadata.json
│       ├── inquiries.bson
│       ├── inquiries.metadata.json
│       └── ...
├── backup-2024-01-15-120000.tar.gz     [Compressed full backup]
├── backup-2024-01-15-120000-manifest.json [Backup metadata]
│
├── backup-2024-01-16-090000/           [Incremental backup directory]
│   ├── packages.json
│   ├── fairs.json
│   ├── gallery.json
│   ├── inquiries.json
│   ├── metadata.json
│   └── ...
├── backup-2024-01-16-090000.tar.gz
├── backup-2024-01-16-090000-manifest.json
```

### Backup Retention Policy

| Backup Type | Frequency | Retention | Purpose |
|-------------|-----------|-----------|---------|
| Full | Weekly (Sunday) | 30 days | Baseline recovery |
| Incremental | Daily | 30 days | Point-in-time recovery |
| Pre-deployment | Before major updates | 60 days | Version rollback |
| Monthly | First of month | 1 year | Compliance/archival |

**Automatic cleanup:** Backups older than `BACKUP_RETENTION_DAYS` (default: 30) are automatically deleted.

---

## Configuration

### Environment Variables

```bash
# .env or .env.local

# Backup directory (relative or absolute path)
BACKUP_DIR=./backups
# Production: BACKUP_DIR=/var/backups/travelagency (Linux)
# Production: BACKUP_DIR=C:\Backups\TravelAgency (Windows)

# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/travelagency
# Production: mongodb+srv://user:pass@cluster.mongodb.net/travelagency

# Backup settings
BACKUP_RETENTION_DAYS=30        # Delete backups older than 30 days
BACKUP_COMPRESSION=true         # Gzip compression enabled
DB_NAME=travelagency            # Database to backup
```

### Directory Permissions

**Linux/Mac:**
```bash
mkdir -p ./backups
chmod 700 ./backups                    # Only owner can read/write
chmod 600 ./backups/backup-*.tar.gz   # Restricted backup files
```

**Windows:**
```powershell
mkdir .\backups
icacls ".\backups" /grant Users:F      # Full permissions for app
icacls ".\backups" /inheritance:r      # Remove inherited permissions
```

---

## Usage

### Backup Commands

#### Create Backup (Default: Full)
```bash
npm run backup
# Creates full backup with gzip compression
```

#### Create Full Backup (Explicit)
```bash
npm run backup:full
# Same as npm run backup, uses mongodump
```

#### Create Incremental Backup
```bash
npm run backup:incremental
# Faster, smaller, JSON format
```

#### List Available Backups
```bash
npm run backup:list
# Shows all backups with sizes, dates, status
```

#### Customize Backup Settings
```bash
# Change retention to 60 days for this run
BACKUP_RETENTION_DAYS=60 npm run backup

# Disable compression
BACKUP_COMPRESSION=false npm run backup

# Backup to specific directory
BACKUP_DIR=/mnt/backup-storage npm run backup
```

### Recovery Commands

#### Restore Latest Backup (Interactive)
```bash
npm run restore
# Shows available backups, let you select one, confirms before recovery
```

#### Restore Specific Backup
```bash
npm run restore -- --backup backup-2024-01-15-120000
# Restores from specified backup without selection
```

#### List Available Backups for Recovery
```bash
npm run restore:list
# Shows all backups eligible for recovery
```

#### Test Recovery (Dry Run)
```bash
npm run restore:dry-run
# Shows what would happen, makes NO changes
```

#### Advanced Recovery
```bash
# Restore from specific backup in dry-run mode
npm run restore -- --backup backup-2024-01-14-000000 --dry-run
```

---

## Backup Output Example

### Successful Full Backup
```
[2024-01-15T12:00:00.000Z] ====== Database Backup Started ======
[2024-01-15T12:00:00.010Z] Database: mongodb://localhost:27017/travelagency
[2024-01-15T12:00:00.020Z] Backup Type: FULL
[2024-01-15T12:00:00.030Z] Backup Dir: ./backups
[2024-01-15T12:00:00.100Z] ✓ Created backup directory: ./backups
[2024-01-15T12:00:00.200Z] Starting full backup to: ./backups/backup-2024-01-15-120000
[2024-01-15T12:00:00.300Z] Executing: mongodump...
[2024-01-15T12:00:05.500Z] ✓ Full backup completed successfully
[2024-01-15T12:00:05.600Z]   Backup size: 45.32 MB
[2024-01-15T12:00:05.700Z] Validating backup...
[2024-01-15T12:00:05.750Z] ✓ Backup valid: 8 collections found
[2024-01-15T12:00:05.800Z] Compressing backup...
[2024-01-15T12:00:08.200Z] ✓ Backup compressed
[2024-01-15T12:00:08.300Z]   Original: 45.32 MB
[2024-01-15T12:00:08.400Z]   Compressed: 12.45 MB (72.5% reduction)
[2024-01-15T12:00:08.500Z] ✓ Manifest created: backup-2024-01-15-120000-manifest.json
[2024-01-15T12:00:08.600Z] Cleaning backups older than 30 days...
[2024-01-15T12:00:08.700Z] ✓ No old backups to remove
[2024-01-15T12:00:08.800Z] ====== Backup Completed Successfully ======
[2024-01-15T12:00:08.900Z] Backup name: backup-2024-01-15-120000
[2024-01-15T12:00:08.950Z] Location: ./backups/backup-2024-01-15-120000.tar.gz
```

### Manifest File Example
```json
{
  "backupName": "backup-2024-01-15-120000",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "type": "full",
  "database": "travelagency",
  "status": "completed",
  "sizes": {
    "original": "45.32 MB",
    "originalBytes": 47538585,
    "compressed": "12.45 MB",
    "compressedBytes": 13045894,
    "compressionRatio": "72.5%"
  },
  "paths": {
    "backup": "./backups/backup-2024-01-15-120000",
    "compressed": "./backups/backup-2024-01-15-120000.tar.gz"
  },
  "retention": {
    "retentionDays": 30,
    "expiryDate": "2024-02-14T12:00:00.000Z"
  }
}
```

---

## Backup Strategy by Environment

### Development

**Frequency:** As needed (manual)
**Retention:** 7 days
**Compression:** Optional
**Storage:** Local backups/ directory

```bash
# Daily development backup before major changes
npm run backup:incremental

# Restore if you accidentally delete something
npm run restore
```

### Staging

**Frequency:** Daily (automated via cron/task scheduler)
**Retention:** 14 days
**Compression:** Yes
**Storage:** /var/backups/staging or cloud storage

**Cron job (Linux):**
```bash
# Add to crontab -e
# Every day at 2 AM
0 2 * * * cd /app/travelagency && npm run backup:full

# Every day at 3 AM, list for monitoring
0 3 * * * cd /app/travelagency && npm run backup:list >> /var/log/backup.log 2>&1
```

**Task Scheduler (Windows):**
```powershell
# Run via Windows Task Scheduler
# Trigger: Daily at 2:00 AM
# Action: "cmd /c cd C:\app\travelagency && npm run backup:full"
```

### Production

**Frequency:**
- Full backup: Weekly (Sunday 2 AM)
- Incremental backup: Daily (2 AM)

**Retention:** 30 days (configurable)
**Compression:** Yes (essential for storage)
**Storage:** Multi-location (see next section)

**Production Cron:**
```bash
# Full backup every Sunday at 2 AM
0 2 * * 0 /app/travelagency/scripts/backup-full.sh

# Incremental daily at 3 AM
0 3 * * * /app/travelagency/scripts/backup-incremental.sh

# Monthly archive (first of month)
0 4 1 * * /app/travelagency/scripts/backup-archive.sh
```

---

## Multi-Location Backup Strategy

### Local Storage (Quick Recovery)
- **Location:** Server's `/var/backups/travelagency`
- **Retention:** 7 days
- **Purpose:** Daily recovery (fastest)
- **RTO:** < 5 minutes

### Network Storage (Medium Recovery)
- **Location:** NAS or cloud storage bucket
- **Retention:** 30 days
- **Purpose:** Disaster recovery across servers
- **RTO:** 30-60 minutes
- **Setup:**
```bash
# Mount network storage
mount -t nfs nas-server:/backups /mnt/network-backups

# Copy backups to network storage
cp -r /var/backups/travelagency/*.tar.gz /mnt/network-backups/
```

### Cloud Storage (Archive)
- **Location:** AWS S3, Azure Blob, Google Cloud Storage
- **Retention:** 90-365 days
- **Purpose:** Long-term compliance, disaster recovery
- **RTO:** Hours
- **Setup:**
```bash
# Upload compressed backups to S3
aws s3 cp /var/backups/travelagency/backup-*.tar.gz s3://travelagency-backups/ --storage-class GLACIER

# Restore from S3
aws s3 cp s3://travelagency-backups/backup-2024-01-15-120000.tar.gz ./backups/
```

### Backup Verification Strategy

**Monthly recovery test:**
```bash
# 1. List all backups
npm run restore:list

# 2. Select oldest backup to test
# 3. Run dry-run first
npm run restore -- --backup backup-2024-01-01-020000 --dry-run

# 4. Verify recovery works (test environment)
npm run restore -- --backup backup-2024-01-01-020000

# 5. Validate data integrity
npm run verify-backup  # (custom script)
```

---

## Recovery Procedures

### Quick Recovery (Last Backup)

```bash
# 1. Verify backup exists
npm run restore:list

# 2. Check current data (optional backup first)
npm run backup:incremental

# 3. Restore from latest
npm run restore

# 4. Verify application works
npm run dev
# Test all endpoints

# 5. Verify data integrity
curl http://localhost:3000/api/packages
# Check data looks correct
```

### Point-in-Time Recovery

```bash
# 1. Find backup timestamp you want to restore to
npm run restore:list

# 2. Restore from specific backup
npm run restore -- --backup backup-2024-01-14-140000

# 3. Verify restored state
npm run dev
```

### Partial Recovery (Single Collection)

```bash
# 1. Extract backup
tar -xzf backups/backup-2024-01-15-120000.tar.gz -C backups/

# 2. Restore specific collection with mongorestore
mongorestore --uri "mongodb://localhost:27017/travelagency" \
  --collection packages \
  backups/backup-2024-01-15-120000/travelagency/packages.bson

# 3. Verify collection
curl http://localhost:3000/api/packages
```

### Disaster Recovery (Complete Database Loss)

```bash
# 1. Restore from cloud backup
aws s3 cp s3://travelagency-backups/backup-2024-01-15-120000.tar.gz ./backups/
tar -xzf backups/backup-2024-01-15-120000.tar.gz -C backups/

# 2. Full recovery
npm run restore -- --backup backup-2024-01-15-120000

# 3. Comprehensive testing
npm run dev

# 4. Load test
npm run test:load

# 5. Verify all data
npm run test:integration
```

---

## Backup Verification

### Automated Checks

The backup scripts automatically verify:
- ✅ Backup directory structure valid
- ✅ Collections count matches expected
- ✅ Metadata file exists
- ✅ Compression successful (if enabled)
- ✅ Manifest created correctly
- ✅ Backup not expired

### Manual Verification

```bash
# List backup contents (full backup)
mongodump --uri "mongodb://localhost:27017/travelagency" \
  --archive=./backups/backup-verify.archive \
  --dryRun

# Inspect manifest
cat backups/backup-2024-01-15-120000-manifest.json | jq

# Check backup file integrity
tar -tzf backups/backup-2024-01-15-120000.tar.gz | head -20

# Verify compressed backup size
ls -lh backups/backup-*.tar.gz
```

### Recovery Test Checklist

- [ ] Backup manifest valid
- [ ] Backup files exist and not corrupted
- [ ] Decompression successful
- [ ] Restore command executes without errors
- [ ] Database contains expected collections
- [ ] Document count matches original
- [ ] Sample documents have correct data
- [ ] Indexes are properly restored
- [ ] Application connects and queries work
- [ ] API endpoints return expected data

---

## Troubleshooting

### Issue: "mongodump: command not found"

**Solution:**
```bash
# Install MongoDB Database Tools
# macOS
brew install mongodb-database-tools

# Ubuntu/Debian
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.8.0.tgz
tar -xzf mongodb-database-tools-*.tgz
export PATH=$PATH:./mongodb-database-tools-*/bin

# Windows
# Download from: https://www.mongodb.com/try/download/database-tools
# Extract and add to PATH
```

### Issue: "BACKUP_DIR permission denied"

**Solution:**
```bash
# Linux/Mac
sudo mkdir -p /var/backups/travelagency
sudo chown $USER:$USER /var/backups/travelagency
sudo chmod 700 /var/backups/travelagency

# Windows (Run as Admin)
mkdir C:\Backups\TravelAgency
icacls "C:\Backups\TravelAgency" /grant Users:F
```

### Issue: "Backup larger than expected"

**Solution:**
```bash
# Check database size
mongosh --eval "db.stats()" mongodb://localhost:27017/travelagency

# Check collection sizes
mongosh --eval "db.getCollectionStats()" mongodb://localhost:27017/travelagency

# Remove old/unnecessary data
# In admin panel, delete old inquiries/logs

# Re-run backup
npm run backup
```

### Issue: "Recovery fails - 'database already exists'"

**Solution:**
```bash
# The --drop flag should handle this, but if not:
# Option 1: Use mongorestore with dropDatabase
npm run restore

# Option 2: Manual fix
mongosh mongodb://localhost:27017/admin << EOF
use travelagency
db.dropDatabase()
exit
EOF

# Then restore
npm run restore
```

### Issue: "Backup verification fails"

**Solution:**
```bash
# Check manifest file
cat backups/backup-*/backup-*-manifest.json

# Verify backup not expired
# Date should not be > BACKUP_RETENTION_DAYS old

# Try creating new backup
npm run backup:full

# Then restore the new backup
npm run restore
```

---

## Performance Considerations

### Backup Impact on Running Application

| Backup Type | Duration | CPU | I/O | Memory | Best Time |
|-------------|----------|-----|-----|--------|-----------|
| Full | 5-30 min | 20% | 60% | 100-500MB | Off-hours |
| Incremental | 1-5 min | 10% | 30% | 50-200MB | Any time |

**Recommendation:** Schedule full backups during low-traffic hours (2-4 AM).

### Backup Storage Estimates

```
Per backup:
- Small database (< 100MB)  → 10-20 MB compressed
- Medium database (100-500MB) → 30-100 MB compressed
- Large database (500MB-1GB) → 100-300 MB compressed

Monthly storage (30-day retention):
- Full weekly (4) + Daily incremental (26)
- Small: ~150-400 MB
- Medium: ~600-1500 MB
- Large: ~1.5-4 GB
```

### Compression Ratio by Data Type

```
Collections with text (high compression):
- inquiry, logs, messages      → 70-85% compression

Collections with binary data (lower compression):
- gallery images               → 50-70% compression

Collections with JSON (good compression):
- packages, fairs, settings    → 60-75% compression
```

---

## Compliance & Audit Trail

### Backup Manifest Tracking

Each backup includes metadata for audit:
```json
{
  "timestamp": "2024-01-15T12:00:00Z",  // Backup creation time
  "status": "completed",                 // Success/failure
  "backup_operator": "automated",        // Who initiated
  "retention_days": 30,                  // Retention policy
  "verified": true,                      // Verification status
  "encryption": "none"                   // Security info
}
```

### Audit Log

```bash
# All backup operations logged
cat /var/log/backup.log

# Example log entry
[2024-01-15T12:00:00] Backup completed: backup-2024-01-15-120000
[2024-01-15T12:00:08] Manifest created: backup-2024-01-15-120000-manifest.json
[2024-01-15T12:00:10] Cleanup: Removed 2 backups (freed 234 MB)
```

### Compliance Requirements

- ✅ Regular backup frequency documented
- ✅ Retention policy enforced
- ✅ Recovery testing scheduled (monthly)
- ✅ Backup encryption (recommended for production)
- ✅ Access logs to backup storage
- ✅ Off-site backup copies (required for production)

---

## Future Enhancements

### Planned Improvements

- [ ] **Encryption:** AES-256 encryption for sensitive backups
- [ ] **Incremental Snapshots:** MongoDB's native change streams for true incremental backups
- [ ] **Automated Verification:** Scheduled recovery tests
- [ ] **Cloud Integration:** Direct S3/Azure Blob uploads
- [ ] **Deduplication:** Identify and remove duplicate data between backups
- [ ] **Backup Chaining:** Faster recovery from multiple incremental backups
- [ ] **Bandwidth Throttling:** Limit network usage during uploads
- [ ] **Alerting:** Email/Slack notifications on backup success/failure
- [ ] **Web Dashboard:** GUI for backup management and recovery

### Redis-Based Rate Limiting Integration

```bash
# Future: Backup Redis data alongside MongoDB
npm run backup:redis   # Backup session/cache data
npm run restore:redis  # Restore Redis state
```

---

## Production Checklist

- [ ] Backup directory created with correct permissions
- [ ] BACKUP_DIR environment variable set
- [ ] MongoDB tools (mongodump, mongorestore) installed
- [ ] Backup scripts tested in staging
- [ ] Cron job configured and tested
- [ ] Cloud storage account configured (AWS S3, etc.)
- [ ] Network storage mounted and accessible
- [ ] Backup encryption configured (if required)
- [ ] Monitoring/alerting set up
- [ ] Recovery procedure tested
- [ ] Team trained on recovery procedures
- [ ] Documentation updated with specific timings
- [ ] Backup retention policy approved
- [ ] Disaster recovery plan documented

---

## References

- [MongoDB Backup Methods](https://docs.mongodb.com/manual/core/backups/)
- [mongodump Documentation](https://docs.mongodb.com/database-tools/mongodump/)
- [mongorestore Documentation](https://docs.mongodb.com/database-tools/mongorestore/)
- [Backup Best Practices](https://docs.mongodb.com/manual/core/backup-restore-procedures/)
- [RPO/RTO Concepts](https://en.wikipedia.org/wiki/Disaster_recovery)

---

## Support

For issues or questions about backups:
1. Check this documentation
2. Review backup logs: `npm run backup:list`
3. Test recovery: `npm run restore:dry-run`
4. Check MongoDB logs for errors
5. Verify disk space: `df -h`
6. Consult MongoDB documentation
