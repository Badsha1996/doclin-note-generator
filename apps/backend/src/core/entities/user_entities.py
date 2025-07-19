'''
why we need ENTITIES ?
well in simple term only create entity when you are making a TYPE which will
be used to interact with DB such as CRUD operations 
It should be database type agnostic 
'''

import datetime
from enum import Enum
from pydantic import BaseModel


class UserRole(str,Enum):
    USER = "user"
    ADMIN = "admin"

class User(BaseModel):
    id: str
    username: str
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
    email: str
    password : str
    role: UserRole = UserRole.USER



