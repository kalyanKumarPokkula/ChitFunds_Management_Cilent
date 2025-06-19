import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , Session
from base import Base
from models.user import User, UserRole
import uuid
import bcrypt


# Load DB credentials
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'root')
DB_HOST = 'host.docker.internal'  # Hard-coded to localhost
DB_PORT = os.environ.get('DB_PORT', '3306')
DB_NAME = os.environ.get('DB_NAME', 'chitfunds')

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Get DB session
def get_db():
    db = SessionLocal()
    return db

# For use with context managers
def get_db_context():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize all tables
def init_db():
    # Import all models here to avoid circular imports
    import models
    Base.metadata.create_all(bind=engine)

    # Insert default admin user if users table is empty
    with Session(engine) as session:
        if session.query(User).count() == 0:
            hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            default_admin = User(
                user_id=str(uuid.uuid4().hex[:12]),
                full_name="Default Admin",
                email="admin@example.com",
                password=hashed_password,
                phone="9999999999",
                aadhaar_number=None,
                pan_number=None,
                address="Admin Address",
                city="Admin City",
                state="Admin State",
                pincode="000000",
                role=UserRole.ADMIN
            )
            session.add(default_admin)
            session.commit()
