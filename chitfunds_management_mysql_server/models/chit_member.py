import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum,ForeignKey, func
from sqlalchemy.orm import relationship
from base import Base

class ChitMember(Base):
    __tablename__ = "chit_members"

    chit_member_id = Column(String(36), primary_key=True)
    chit_group_id = Column(String(36), ForeignKey("chit_groups.chit_group_id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(DateTime, default=func.now(), onupdate=func.now())
    
    
    # Relationships
    chit_group = relationship("ChitGroup", back_populates="chit_members")
    user = relationship("User", back_populates="chit_members")
    installments = relationship("Installment", back_populates="chit_member")
    payments = relationship("Payment", foreign_keys="[Payment.chit_member_id]")