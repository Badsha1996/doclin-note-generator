'''
why we need ENTITIES ?
well in simple term only create entity when you are making a TYPE which will
be used to interact with DB such as CRUD operations 
It should be database type agnostic 
'''
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class UserRole(str,Enum):
    USER = "user"
    ADMIN = "admin"

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


