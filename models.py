"""SQLAlchemy models for User entities."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database.connection import Base
import enum

class DocumentType(str, enum.Enum):
    GST_CERTIFICATE = "GST_CERTIFICATE"
    PAN_CARD = "PAN_CARD"
    PITCH_DECK = "PITCH_DECK"
    INCORPORATION_CERTIFICATE = "INCORPORATION_CERTIFICATE"
    MSME_REGISTRATION = "MSME_REGISTRATION"
    AADHAAR_CARD = "AADHAAR_CARD"
    BANK_STATEMENT = "BANK_STATEMENT"
    CONTRACT = "CONTRACT"
    INVOICE = "INVOICE"
    OTHER = "OTHER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    api_calls_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user")
    investor_matches = relationship("InvestorMatch", back_populates="user")
    compliance_deadlines = relationship("ComplianceDeadline", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    document_type = Column(Enum(DocumentType))
    status = Column(String)
    expiry_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="documents")

class InvestorMatch(Base):
    __tablename__ = "investor_matches"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    investor_name = Column(String)
    match_score = Column(Float)
    status = Column(String)
    contacted_at = Column(DateTime)

    user = relationship("User", back_populates="investor_matches")

class ComplianceDeadline(Base):
    __tablename__ = "compliance_deadlines"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    deadline_type = Column(String)
    due_date = Column(DateTime)
    status = Column(String, default="pending")

    user = relationship("User", back_populates="compliance_deadlines")

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    key_prefix = Column(String(8), nullable=False, index=True)
    hashed_key = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="api_keys")