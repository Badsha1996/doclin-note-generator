from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
import uuid
from ...database.database import Base

class FileModel(Base):
    __tablename__ = 'files'

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True) 
    url = Column(String, unique=True, index=True, nullable=False)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    user = relationship("UserModel", back_populates="files")

    file_name = Column(String, nullable=False) 
    file_type = Column(String, nullable=False)
    file_size = Column(String, nullable=False)
    analysis_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
