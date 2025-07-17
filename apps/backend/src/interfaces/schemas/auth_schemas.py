from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    email : EmailStr
    username: str
    password: str
    confirm_password : str