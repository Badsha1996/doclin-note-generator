from pydantic import BaseModel,  field_validator, model_validator
from typing import Optional

class OTPGenerateSchema(BaseModel):
    email:str
    user_name:Optional[str]="Brave soul"
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, email):
        if "@" not in email:
            raise ValueError("Invalid email format")
        return email
class OTPVerifySchema(BaseModel):
    email:str
    otp:str
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, email):
        if "@" not in email:
            raise ValueError("Invalid email format")
        return email
    @field_validator("otp")
    @classmethod
    def validate_otp_len(cls,otp):
        if len(otp) !=6:raise ValueError("Length of OTP must be 6")
        return otp