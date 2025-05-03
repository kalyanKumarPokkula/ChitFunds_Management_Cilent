import enum
from sqlalchemy import Column, String, Text, DateTime,Float,ForeignKey, Boolean, Enum, func
from sqlalchemy.orm import relationship
from base import Base


class PaymentStatusEnum(enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"

class PaymentMethodEnum(enum.Enum):
    CASH = "cash"
    UPI = "upi"
    PHONEPAY = "phonepay"
    GPAY = "gpay"
    OTHER = "other"
class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(String(36), primary_key=True)
    chit_member_id = Column(String(36), ForeignKey("chit_members.chit_member_id"), nullable=False)
    installment_id = Column(String(36), ForeignKey("installments.installment_id"), nullable=False)

    payment_amount = Column(Float, nullable=False)
    payment_date = Column(DateTime, default=func.now())

    net_paid_cash = Column(Float, nullable=True, default=0)
    net_paid_online = Column(Float, nullable=True, default=0)

    payment_method = Column(Enum(PaymentMethodEnum), nullable=True)
    reference_number = Column(String(100), nullable=True)
    payment_status = Column(Enum(PaymentStatusEnum), nullable=False, default=PaymentStatusEnum.SUCCESS)

    note = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_at = Column(DateTime, default=func.now())

    # Relationships
    chit_member = relationship("ChitMember", foreign_keys=[chit_member_id])
    installment = relationship("Installment", foreign_keys=[installment_id])