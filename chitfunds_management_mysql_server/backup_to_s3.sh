#!/bin/bash

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env file not found!"
  exit 1
fi

# Set BACKUP_FILE_NAME dynamically in script since .env can't handle command substitution
BACKUP_FILE_NAME="mysql_backup_$(date +%Y%m%d).sql.gz"

# Full S3 path including filename
FULL_S3_PATH="$S3_PATH/$BACKUP_FILE_NAME"

# Backup the database from Docker container and compress
if docker exec "$MYSQL_CONTAINER" sh -c "exec mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME" | gzip > "$BACKUP_FILE_NAME"; then
  echo "✅ Database backup created: $BACKUP_FILE_NAME"
else
  echo "❌ Failed to create database backup."
  exit 1
fi

# Upload to S3 using boto3 Python script
if [ -f "$BACKUP_FILE_NAME" ]; then
  if python3 upload_to_s3.py "$BACKUP_FILE_NAME" "$S3_BUCKET" "$FULL_S3_PATH"; then
    echo "✅ Backup uploaded to S3: s3://$S3_BUCKET/$FULL_S3_PATH"
    rm "$BACKUP_FILE_NAME"
    echo "✅ Local backup deleted."
  else
    echo "❌ Failed to upload to S3."
    exit 1
  fi
else
  echo "❌ Backup file not found: $BACKUP_FILE_NAME"
  exit 1
fi

