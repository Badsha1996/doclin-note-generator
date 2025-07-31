from typing import Optional
from pydantic import BaseModel,  field_validator, model_validator

class RegisterSchema(BaseModel):
    # email : EmailStr
    email : str
    username: str
    password: str
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, password):
        if len(password) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return password
    
class LoginSchema(BaseModel):
    # If you do not set it to NONE this property will stll throw missing feild error 🤦
    email : Optional[str] = None
    username : Optional[str] = None 
    password : str

    @model_validator(mode="before")
    def check_email_or_username(cls, data):
        if not data.get("email") and not data.get("username"):
            raise ValueError("Either email or username must be provided.")
        return data

class APIResponseSchema(BaseModel):
    success : bool
    data: Optional[dict] = None
    message: str