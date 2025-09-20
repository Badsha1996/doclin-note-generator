from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional,List,Dict, Union
from pydantic import BaseModel


class UserRole(str,Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "superAdmin"

class UserPlan(str,Enum):
    free="free"


class OAuthProvider(str,Enum):
    GOOGLE='google'
    META='meta'
    
class User(BaseModel):
    id: UUID
    username: str
    # email:EmailStr 
    email:str
    role: UserRole
    is_verified: bool
    plan:UserPlan
    blocked:bool
    model_hit_count:int
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

class UserCreateByAdmin(BaseModel):
    username: str
    # email:EmailStr 
    email:str
    password : str
    role: UserRole = UserRole.USER
    is_verified:bool

class UserUpdate(BaseModel):
    # email: Optional[EmailStr] = None
    email: Optional[str] = None
    username: Optional[str] = None
    blocked: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[UserRole] = None


class UserKPI(BaseModel):
    total_users:int
    blocked_users:int
    paid_users:int
    new_users:int
    trend:List[Dict[str, Union[str, int]]]



class OAuthUser(BaseModel):
    email:str
    username: str
    provider_id:str
    provider:OAuthProvider


