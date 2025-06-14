#!/bin/bash

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env file not found!"
  exit 1
fi

# Run Python script to download latest backup and capture filename
FILE_NAME=$(python3 download_latest_backup.py)

if [ ! -f "$FILE_NAME" ]; then
  echo "❌ Failed to download: $FILE_NAME not found."
  exit 1
fi

echo "📦 Downloaded file: $FILE_NAME"

# Restore using streaming
gunzip -c "$FILE_NAME" | mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME"

echo "✅ Restore completed."

