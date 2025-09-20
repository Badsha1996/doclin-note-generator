from pydantic import BaseModel
from typing import Optional
from ...core.entities.user_entities import UserRole


class UserRoleChangeSchema(BaseModel):
    user_id:str
    role:UserRole
class UserDeleteSchema(BaseModel):
    user_id:str