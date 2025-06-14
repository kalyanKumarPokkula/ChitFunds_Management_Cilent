import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, func
from sqlalchemy.orm import relationship
from base import Base

class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"
    MANAGER = "manager"

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    aadhaar_number = Column(String(12), nullable=True)
    pan_number = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    chit_members = relationship("ChitMember", back_populates="user")
