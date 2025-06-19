# Load .env file if it exists
$envFile = ".env"

if (-Not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Load environment variables from .env
Get-Content $envFile | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
}

# Run Python script to get backup filename
$fileName = python download_latest_backup.py

if (-Not (Test-Path $fileName)) {
    Write-Host "❌ Failed to download: $fileName not found." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Downloaded file: $fileName" -ForegroundColor Green

# Unzip to a temporary SQL file
$sqlFile = "restore_temp.sql"
& gzip -d -c $fileName > $sqlFile

if (-Not (Test-Path $sqlFile)) {
    Write-Host "❌ Failed to extract SQL file from backup." -ForegroundColor Red
    exit 1
}

# Run the MySQL import
$mysqlCommand = "mysql -u$($env:DB_USER) -p$($env:DB_PASSWORD) $($env:DB_NAME)"
Get-Content $sqlFile | & $mysqlCommand

Write-Host "[OK] Restore completed." -ForegroundColor Green

