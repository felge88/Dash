#!/bin/bash

# 🔧 Blaster - Automatisches Backup Script
# Führt tägliche SQLite-Backups durch

set -e

# Configuration
BACKUP_DIR="/home/deploy/blaster/backups"
DB_PATH="/home/deploy/blaster/database.sqlite"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    error "Database not found: $DB_PATH"
    exit 1
fi

log "🗄️ Starting SQLite backup..."

# Create backup with WAL checkpoint
sqlite3 "$DB_PATH" "PRAGMA wal_checkpoint(FULL);"
sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/database_backup_$DATE.sqlite"

if [ $? -eq 0 ]; then
    log "✅ Backup created: database_backup_$DATE.sqlite"
    
    # Compress backup
    gzip "$BACKUP_DIR/database_backup_$DATE.sqlite"
    log "✅ Backup compressed: database_backup_$DATE.sqlite.gz"
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/database_backup_$DATE.sqlite.gz" | cut -f1)
    log "📦 Backup size: $BACKUP_SIZE"
    
else
    error "Backup failed!"
    exit 1
fi

# Cleanup old backups
log "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "database_backup_*.sqlite.gz" -mtime +$RETENTION_DAYS -delete

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "database_backup_*.sqlite.gz" | wc -l)
log "📊 Remaining backups: $REMAINING_BACKUPS"

# Disk space check
DISK_USAGE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    warn "Disk usage high: ${DISK_USAGE}%"
fi

log "🎉 Backup completed successfully!"
