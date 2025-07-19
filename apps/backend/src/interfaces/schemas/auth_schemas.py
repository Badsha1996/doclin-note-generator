from typing import Optional
from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    email : EmailStr
    username: str
    password: str
    confirm_password : str

class APIResponseSchema(BaseModel):
    success : bool
    data: Optional[dict] = None
    message: str