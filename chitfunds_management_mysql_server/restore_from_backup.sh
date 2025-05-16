#!/bin/bash

# Variables
DATABASE_NAME="chitfunds"
BACKUP_FILE_NAME=$(aws s3api list-objects-v2 --bucket tulsi-akka-chits-backup-059 --prefix 'backups/' --query 'Contents | sort_by(@, &LastModified)[-1].Key' --output text)
MYSQL_USER="root"
MYSQL_PASSWORD="chitfunds_password"
S3_BUCKET="tulsi-akka-chits-backup-059"
S3_PATH="backups"
MYSQL_CONTAINER="chitfunds_mysql"

# # Check if file exists
# if [ ! -f "$BACKUP_FILE_NAME" ]; then
#   echo "❌ Backup file $BACKUP_FILE_NAME not found."
#   exit 1
# fi

# Extract just the file name (remove the prefix path if needed)
FILE_NAME=$(basename "$BACKUP_FILE_NAME")

# Download and save with the file name
aws s3 cp "s3://$S3_BUCKET/$BACKUP_FILE_NAME" "$FILE_NAME"

# Optional: Show the saved file name
echo "Downloaded file saved as: $FILE_NAME"

# Restore using streaming (no copy needed)
gunzip -c $FILE_NAME | docker exec -i $MYSQL_CONTAINER sh -c "mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $DATABASE_NAME" 

echo "✅ Restore completed."