import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, Float,Integer,Date,func
from sqlalchemy.orm import relationship
from base import Base

class ChitGroup(Base):
    __tablename__ = "chit_groups"

    chit_group_id = Column(String(36), primary_key=True)
    chit_name = Column(String(255), nullable=False)
    chit_amount = Column(Float, nullable=False)
    duration_months = Column(Integer, nullable=False)
    total_members = Column(Integer, nullable=False)
    monthly_installment = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)  # active, upcoming, completed
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    chit_members = relationship("ChitMember", back_populates="chit_group")
    monthly_projections = relationship("MonthlyProjection", back_populates="chit_group")