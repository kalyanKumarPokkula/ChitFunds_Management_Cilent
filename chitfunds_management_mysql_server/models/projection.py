import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, Integer, ForeignKey, Float,Date,func
from sqlalchemy.orm import relationship
from base import Base

class MonthlyProjection(Base):
    __tablename__ = "monthly_projections"

    monthly_projections_id = Column(String(36), primary_key=True)
    chit_group_id = Column(String(36), ForeignKey("chit_groups.chit_group_id"), nullable=False)
    month_number = Column(Integer, nullable=False)
    monthly_subcription = Column(Float, nullable=False)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    total_payout = Column(Float, nullable=False)
    lifted_date = Column(Date, nullable=True)
    note = Column(Text, nullable=True) 
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    
    # Relationships
    chit_group = relationship("ChitGroup", back_populates="monthly_projections")