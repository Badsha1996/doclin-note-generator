from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class OTP(BaseModel):
    id:UUID
    email:str
    otp_hash:str
    created_at:datetime
    expires_at:datetime
    class Config:
        from_attributes = True

class OTPCreate(BaseModel):
    email:str
    otp_hash:str