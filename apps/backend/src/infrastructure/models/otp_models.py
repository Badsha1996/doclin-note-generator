from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
import uuid
from ...database.database import Base

class OTPModel(Base):
    __tablename__ = "otp_lookup"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, index=True, nullable=False, unique=True)
    otp_hash = Column(String, nullable=False)         
    expires_at = Column(DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(minutes=5))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))