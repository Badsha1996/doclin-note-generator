from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey,Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from ...database.database import Base

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    super_admin="superAdmin"

class UserPlan(str,enum.Enum):
    free="free"

class UserModel(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True) 
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hash_password = Column(String, nullable=False)
    role = Column(Enum(UserRole, name="user_role",), default="user")
    is_verified = Column(Boolean, default=False)
    plan = Column(Enum(UserPlan,name="user_plan"),default="free")
    blocked = Column(Boolean,default=False)
    model_hit_count=Column(Integer,default=5)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    oauth_accounts = relationship("OAuthModel", back_populates="user")
    files = relationship("FileModel", back_populates="user", cascade="all, delete-orphan")


class OAuthModel(Base):
    __tablename__ = "oauth_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)
    provider_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserModel", back_populates="oauth_accounts")
