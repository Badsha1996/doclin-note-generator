'''
why we need ENTITIES ?
well in simple term only create entity when you are making a TYPE which will
be used to interact with DB such as CRUD operations 
It should be database type agnostic 
'''
import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRole(str,Enum):
    USER = "user"
    ADMIN = "admin"

class User(BaseModel):
    id: str
    username: str
    email:EmailStr 
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    # This is important as this will allow us to use SQLalchemy objects 
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password : str
    role: UserRole = UserRole.USER


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[UserRole] = None

# we need oAuth class


