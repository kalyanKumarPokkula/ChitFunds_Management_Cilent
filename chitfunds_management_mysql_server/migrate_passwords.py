"""
Script to migrate existing user passwords to hashed passwords.
Run this script after adding JWT authentication to the application.
"""

from db import get_db
from models.user import User
from auth import get_password_hash

def migrate_passwords():
    """
    Migrate all existing plain-text passwords to hashed passwords.
    This function should be run once after adding JWT authentication.
    """
    db = get_db()
    try:
        # Get all users
        users = db.query(User).all()
        
        for user in users:
            # We assume the current password is plain text
            # If a user's password is already hashed, you may need to check
            # its format or length to avoid double-hashing
            plain_password = user.password
            hashed_password = get_password_hash(plain_password)
            
            # Update the user's password
            user.password = hashed_password
            
        # Commit all changes
        db.commit()
        print(f"Successfully migrated {len(users)} user passwords to hashed format.")
        
    except Exception as e:
        db.rollback()
        print(f"Error migrating passwords: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_passwords() 