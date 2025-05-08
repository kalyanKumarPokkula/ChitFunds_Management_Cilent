import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, Float,Integer,Date,ForeignKey,func
from sqlalchemy.orm import relationship
from base import Base



class PaymentStatus(enum.Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    PARTIAL = "partial"

class Installment(Base):
    __tablename__ = "installments"

    installment_id = Column(String(36), primary_key=True)
    chit_member_id = Column(String(36), ForeignKey("chit_members.chit_member_id"), nullable=False)
    month_number = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, nullable=False, default=0)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.UNPAID)
    payment_date = Column(Date, nullable=True)
    note = Column(Text, nullable=True) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    chit_member = relationship("ChitMember", back_populates="installments")
    payment_installments = relationship("PaymentInstallment", back_populates="installment")