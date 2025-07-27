from typing import Optional
from pydantic import BaseModel,  field_validator

class RegisterSchema(BaseModel):
    # email : EmailStr
    email : str
    username: str
    password: str
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class APIResponseSchema(BaseModel):
    success : bool
    data: Optional[dict] = None
    message: str