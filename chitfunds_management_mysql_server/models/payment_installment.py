import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, Float,Integer,Date,ForeignKey,func
from sqlalchemy.orm import relationship
from base import Base


class PaymentInstallment(Base):
    __tablename__ = "payment_installments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    payment_id = Column(String(36), ForeignKey("payments.payment_id"), nullable=False)
    installment_id = Column(String(36), ForeignKey("installments.installment_id"), nullable=False)
    chit_member_id = Column(String(36), ForeignKey("chit_members.chit_member_id"), nullable=False)
    

    payment = relationship("Payment", back_populates="payment_installments")
    installment = relationship("Installment", back_populates="payment_installments")
    chit_member = relationship("ChitMember", back_populates="payment_installments")
  
