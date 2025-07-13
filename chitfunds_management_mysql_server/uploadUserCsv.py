import pandas as pd
import uuid
from sqlalchemy.orm import Session
from  db import get_db # update with your actual import
from models.user import User     # update with your actual import
from auth import get_password_hash

# Load CSV
df = pd.read_csv("users.csv")  # Replace with your actual file name

# Get DB session
db: Session = get_db()

try:
    for _, row in df.iterrows():
        user_id = str(uuid.uuid4().hex[:12])
        
        
        # Extract data from CSV
        full_name = str(row.get("Full Name"))
        # This safely removes .0 and keeps phone as string
        raw_phone = row.get("Phone")
        phone = str(int(float(raw_phone))) if pd.notnull(raw_phone) else None
        address = str(row.get("Address"))
        email = str(row.get("Email", ""))  # Optional fields
        aadhaar_number = str(row.get("Aadhaar", ""))
        pan_number = str(row.get("PAN", ""))
        city = str(row.get("City", ""))
        state = str(row.get("State", ""))
        pincode = str(row.get("Pincode", ""))
        # role = row.get("Role", "user")  # Default to 'user'
        password = str(row.get("Password", "123456"))
        
        # Duplicate checks
        # if db.query(User).filter(User.phone == phone).first():
        #     print(f"User with phone {phone} already exists.")
        #     continue
        
        # if aadhaar_number and db.query(User).filter(User.aadhaar_number == aadhaar_number).first():
        #     print(f"User with Aadhaar {aadhaar_number} already exists.")
        #     continue
        
        # if pan_number and db.query(User).filter(User.pan_number == pan_number).first():
        #     print(f"User with PAN {pan_number} already exists.")
        #     continue
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create user object
        new_user = User(
            user_id=user_id,
            full_name=full_name,
            phone=phone,
            email=email,
            password=hashed_password,
            aadhaar_number=aadhaar_number,
            pan_number=pan_number,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            # role=role,
            is_verified=True
        )
        
        # Add to DB
        db.add(new_user)
        print(f"Added user: {full_name}")

    # Commit after all inserts
    db.commit()
    print("All users processed.")

except Exception as e:
    db.rollback()
    print(f"Error occurred: {e}")

finally:
    db.close()
