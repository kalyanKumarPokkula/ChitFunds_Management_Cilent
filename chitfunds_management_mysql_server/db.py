import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from base import Base

# Load DB credentials
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'chitfunds_password')
DB_HOST = '127.0.0.1'  # Hard-coded to localhost
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
