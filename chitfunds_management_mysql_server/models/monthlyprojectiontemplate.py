import uuid
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, func , ForeignKey
from base import Base
from sqlalchemy.orm import relationship

class MonthlyProjectionsTemplate(Base):
    __tablename__ = "monthlyprojections_template"

    monthlyprojection_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4().hex[:36]))
    projectionTemplate_id = Column(String(10) , ForeignKey("projections_template.projectionTemplate_id"), nullable=False )
    month_number = Column(Integer , nullable=False)
    total_payout = Column(Float, nullable=False)             # e.g., 100000
    monthly_subscription = Column(Float, nullable=False)     # e.g., 5000
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


    projection_template = relationship("ProjectionTemplate", back_populates="monthly_projection_template")