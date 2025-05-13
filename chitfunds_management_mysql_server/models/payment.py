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
    PHONEPAY = "phonepay"
    GPAY = "gpay"
    PAYTM = "paytm"
    CHEQUE = "cheque"
    OTHER = "other"


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(String(36), primary_key=True)

    payment_amount = Column(Float, nullable=False)
    payment_date = Column(DateTime, default=func.now())

    net_paid_cash = Column(Float, nullable=True, default=0)
    net_paid_online = Column(Float, nullable=True, default=0)

    payment_method = Column(Enum(PaymentMethodEnum), nullable=True)
    reference_number = Column(String(100), nullable=True)
    payment_status = Column(Enum(PaymentStatusEnum), nullable=False, default=PaymentStatusEnum.SUCCESS)

    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    payment_installments = relationship("PaymentInstallment", back_populates="payment", cascade="all, delete-orphan")