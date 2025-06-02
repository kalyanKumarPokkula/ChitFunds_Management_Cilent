# download_latest_backup.py

import boto3
import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BUCKET_NAME = "tulsi-akka-chits-backup-059"
PREFIX = "backups/"

def get_latest_backup():
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION,
    )
    s3 = session.client("s3")

    response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=PREFIX)
    contents = response.get("Contents", [])

    if not contents:
        print("❌ No backups found.")
        exit(1)

    # Sort by LastModified, descending
    latest = sorted(contents, key=lambda x: x["LastModified"], reverse=True)[0]
    key = latest["Key"]
    file_name = os.path.basename(key)

    # Download the file
    s3.download_file(BUCKET_NAME, key, file_name)

    print(file_name)

if __name__ == "__main__":
    get_latest_backup()
