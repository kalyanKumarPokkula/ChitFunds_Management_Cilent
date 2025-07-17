import uuid
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, func
from base import Base

class ProjectionTemplate(Base):
    __tablename__ = "projection_templates"

    template_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True)  # e.g., "1 Lakh Plan"
    total_payout = Column(Float, nullable=False)             # e.g., 100000
    monthly_subscription = Column(Float, nullable=False)     # e.g., 5000
    duration_months = Column(Integer, nullable=False)        # e.g., 20
    note = Column(Text, nullable=True)                       # Optional
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
