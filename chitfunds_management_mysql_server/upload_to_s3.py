import boto3
import sys
import os
from dotenv import load_dotenv
from botocore.exceptions import NoCredentialsError, ClientError

# Load environment variables from .env file
load_dotenv()

# Read AWS credentials from environment
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')  # default to ap-south-1

def upload_to_s3(file_name, bucket, s3_path):
    # Create session with credentials from .env
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

    s3 = session.client('s3')

    try:
        s3.upload_file(file_name, bucket, s3_path)
        print(f"✅ Successfully uploaded {file_name} to s3://{bucket}/{s3_path}")
        return True
    except FileNotFoundError:
        print(f"❌ File not found: {file_name}")
    except NoCredentialsError:
        print("❌ AWS credentials not found.")
    except ClientError as e:
        print(f"❌ ClientError: {e}")
    return False

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python upload_to_s3.py <file_name> <bucket> <s3_path>")
        sys.exit(1)

    file_name = sys.argv[1]
    bucket = sys.argv[2]
    s3_path = sys.argv[3]

    success = upload_to_s3(file_name, bucket, s3_path)
    sys.exit(0 if success else 1)
