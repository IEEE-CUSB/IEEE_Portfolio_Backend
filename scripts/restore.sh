#!/bin/bash
# restore.sh - Restores a backup of the PostgreSQL database and MinIO files

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <db_backup_file.sql> <minio_backup_file.tar.gz>"
    exit 1
fi

DB_BACKUP_FILE=$1
MINIO_BACKUP_FILE=$2

if [ ! -f "$DB_BACKUP_FILE" ]; then
    echo "Error: Database backup file not found: $DB_BACKUP_FILE"
    exit 1
fi

if [ ! -f "$MINIO_BACKUP_FILE" ]; then
    echo "Error: MinIO backup file not found: $MINIO_BACKUP_FILE"
    exit 1
fi

# Load variables from .env
if [ -f ../.env ]; then
  export $(cat ../.env | grep -v '#' | awk '/=/ {print $1}')
elif [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-ieeecusb}
MINIO_USER=${MINIO_ROOT_USER:-admin}
MINIO_PASS=${MINIO_ROOT_PASSWORD:-admin12345}
BUCKET_NAME=${BB_BUCKET_NAME:-ieee-storage}
COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-$(basename "$PWD" | tr '[:upper:]' '[:lower:]')}
NETWORK_NAME="${COMPOSE_PROJECT_NAME}_default"

echo "Starting restore process..."

# 1. Restore PostgreSQL Database
echo "Restoring PostgreSQL database..."
cat "$DB_BACKUP_FILE" | docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME"

# 2. Restore MinIO Files
echo "Restoring MinIO files..."
mkdir -p ./backups/minio_tmp
tar -xzvf "$MINIO_BACKUP_FILE" -C ./backups/minio_tmp

docker run --rm -v $(pwd)/backups/minio_tmp:/export --network="$NETWORK_NAME" quay.io/minio/mc \
  /bin/sh -c "mc alias set myminio http://minio:9000 $MINIO_USER $MINIO_PASS; mc mirror /export myminio/$BUCKET_NAME"

rm -rf ./backups/minio_tmp

echo ""
echo "✅ Restore Completed Successfully!"
