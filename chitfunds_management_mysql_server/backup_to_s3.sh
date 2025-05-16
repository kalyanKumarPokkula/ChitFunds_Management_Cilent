#!/bin/bash

# Variables
DATABASE_NAME="chitfunds"
BACKUP_FILE_NAME="mysql_backup_$(date +%Y%m%d).sql.gz"
MYSQL_USER="root"
MYSQL_PASSWORD="chitfunds_password"
S3_BUCKET="tulsi-akka-chits-backup-059"
S3_PATH="backups"
MYSQL_CONTAINER="chitfunds_mysql"


# Backup the database from Docker container and compress
if docker exec $MYSQL_CONTAINER sh -c "exec mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $DATABASE_NAME" | gzip > "$BACKUP_FILE_NAME"; then
  echo "✅ Database backup created: $BACKUP_FILE_NAME"
else
  echo "❌ Failed to create database backup."
  exit 1
fi

# Upload to S3 (Check file existence first)
if [ -f "$BACKUP_FILE_NAME" ]; then
  if aws s3 cp "$BACKUP_FILE_NAME" s3://$S3_BUCKET/$S3_PATH/$BACKUP_FILE_NAME; then
    echo "✅ Backup uploaded to S3: s3://$S3_BUCKET/$S3_PATH/$BACKUP_FILE_NAME"
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