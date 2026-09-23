#!/bin/bash
# backup.sh - Creates a backup of the PostgreSQL database and MinIO files

# Load variables from .env
if [ -f ../.env ]; then
  export $(cat ../.env | grep -v '#' | awk '/=/ {print $1}')
elif [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Set default values if not found in .env
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-ieeecusb}
MINIO_USER=${MINIO_ROOT_USER:-admin}
MINIO_PASS=${MINIO_ROOT_PASSWORD:-admin12345}
BUCKET_NAME=${BB_BUCKET_NAME:-ieee-storage}
# Get the network name dynamically from docker-compose (defaults to directory name + _default)
COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-$(basename "$PWD" | tr '[:upper:]' '[:lower:]')}
NETWORK_NAME="${COMPOSE_PROJECT_NAME}_default"

# Set backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
MINIO_BACKUP_FILE="$BACKUP_DIR/minio_backup_$TIMESTAMP.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup process..."

# 1. Backup PostgreSQL Database
echo "Backing up PostgreSQL database..."
docker-compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" > "$DB_BACKUP_FILE"

# 2. Backup MinIO Files (S3 bucket data)
echo "Backing up MinIO files..."
mkdir -p "$BACKUP_DIR/minio_tmp"
docker run --rm -v $(pwd)/$BACKUP_DIR/minio_tmp:/export --network="$NETWORK_NAME" quay.io/minio/mc \
  /bin/sh -c "mc alias set myminio http://minio:9000 $MINIO_USER $MINIO_PASS; mc mirror myminio/$BUCKET_NAME /export"
tar -czvf "$MINIO_BACKUP_FILE" -C "$BACKUP_DIR/minio_tmp" .
rm -rf "$BACKUP_DIR/minio_tmp"

echo ""
echo "✅ Backup Completed Successfully!"
echo "Database Backup: $DB_BACKUP_FILE"
echo "Files Backup: $MINIO_BACKUP_FILE"
echo ""
echo "⚠️ IMPORTANT: Move these files off the VPS (e.g., to Google Drive or Backblaze) so you don't lose them if the server dies."
