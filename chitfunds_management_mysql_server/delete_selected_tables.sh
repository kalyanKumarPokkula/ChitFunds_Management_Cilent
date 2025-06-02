#!/bin/bash

# Load .env file if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env file not found!"
  exit 1
fi

# Parse TABLES_TO_DELETE from comma-separated string to array
IFS=',' read -r -a TABLES_ARRAY <<< "$TABLES_TO_DELETE"

echo $IFS

echo "⚠️  WARNING: The following tables will be permanently deleted from '$DB_NAME':"
for table in "${TABLES_ARRAY[@]}"; do
  echo " - $table"
done

read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Aborted."
  exit 1
fi

# Drop selected tables
for table in "${TABLES_ARRAY[@]}"; do
  echo "🗑️ Dropping table: $table"
  docker exec "$MYSQL_CONTAINER" sh -c "mysql -u$DB_USER -p$DB_PASSWORD -e 'DROP TABLE IF EXISTS \`$DB_NAME\`.\`$table\`;'" || {
    echo "❌ Failed to drop $table"
  }
done

echo "✅ Selected tables deleted from database '$DB_NAME'."
