#!/bin/bash

set -e

# Load .env file if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env file not found!"
  exit 1
fi

# # Validate confirmation flag
# if [ "$CONFIRM_RESTORE" != "yes" ]; then
#   echo "❌ Aborted. Set CONFIRM_RESTORE=yes to proceed."
#   exit 1
# fi

# # Parse TABLES_TO_DELETE from comma-separated string to array
# IFS=',' read -r -a TABLES_ARRAY <<< "$TABLES_TO_DELETE"

# echo "⚠️  WARNING: The following tables will be permanently deleted from '$DB_NAME':"
# for table in "${TABLES_ARRAY[@]}"; do
#   echo " - $table"
# done

# # Drop selected tables
# for table in "${TABLES_ARRAY[@]}"; do
#   echo "🗑️ Dropping table: $table"
#   mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP TABLE IF EXISTS \`$DB_NAME\`.\`$table\`;" || {
#     echo "❌ Failed to drop $table"
#   }
# done

# echo "✅ Selected tables deleted from database '$DB_NAME'."

# Run Python script to download latest backup and capture filename
FILE_NAME=$(python3 download_latest_backup.py)

if [ ! -f "$FILE_NAME" ]; then
  echo "❌ Failed to download: $FILE_NAME not found."
  exit 1
fi

echo "📦 Downloaded file: $FILE_NAME"

# Restore using streaming
gunzip -c "$FILE_NAME" | mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
if [ $? -ne 0 ]; then
  echo "❌ MySQL restore failed!"
  exit 1
else
  echo "✅ Restore completed."
fi
