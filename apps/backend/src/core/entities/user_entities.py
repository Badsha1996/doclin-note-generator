from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class UserRole(str,Enum):
    USER = "user"
    ADMIN = "admin"

class OAuthProvider(str,Enum):
    GOOGLE='google'
    META='meta'
    
class User(BaseModel):
    id: UUID
    username: str
    # email:EmailStr 
    email:str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    # This is important as this will allow us to use SQLalchemy objects 
    class Config:
        from_attributes = True

# This is very important 
# As this will expose password to actual class 
class InternalUser(User):
    hash_password: str

class UserCreate(BaseModel):
    username: str
    # email:EmailStr 
    email:str
    password : str
    role: UserRole = UserRole.USER


class UserUpdate(BaseModel):
    # email: Optional[EmailStr] = None
    email: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[UserRole] = None

# we need oAuth class

class OAuthUser(BaseModel):
    email:str
    username: str
    provider_id:str
    provider:OAuthProvider


