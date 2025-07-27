import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, Integer, ForeignKey, Float,Date,func
from sqlalchemy.orm import relationship
from base import Base
import uuid


class ProjectionTemplate(Base):

    __tablename__ = "projections_template"

    projectionTemplate_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4().hex[:8]))
    name = Column(String(255), nullable=False)
    total_value = Column(Float, nullable=False)             # e.g., 100000
    monthly_subscription = Column(Float, nullable=False)     # e.g., 5000
    months = Column(Float , nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


    monthly_projection_template = relationship("MonthlyProjectionsTemplate", back_populates="projection_template")

