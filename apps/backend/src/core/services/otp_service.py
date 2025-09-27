from ...core.entities.otp_entities import OTP, OTPCreate
from ...infrastructure.models.otp_models import OTPModel
from ...utils.exceptions import InternelServerException, NotFoundExceptionError,ValidationExceptionError
from ...utils.security import SecurityManager
from ..repo.otp_repo import OTPRepo
import string
import secrets
from typing import Tuple,Optional
from datetime import datetime, timezone


class OTPService:
    def __init__(self,otp_repo=OTPRepo, security = SecurityManager):
        self.otp_repo = otp_repo
        self.security = security

    async def generate_otp(self,email:str)->Tuple[str, OTP]:
        try:
            characters = string.ascii_letters + string.digits
        
            otp = ''.join(secrets.choice(characters) for i in range(6))
            otp_hash= self.security.hash_password(password=otp)
            otp_=OTPCreate(
                otp_hash=otp_hash,
                email=email
            )
            otp_entry:OTP=  await self.otp_repo.create_or_update_otp( otp=otp_)
            return otp,otp_entry
        except Exception as e:
            raise InternelServerException()
        
    async def get_otp_entry(self,email:str)->Optional[OTP]:
        otp_data=await self.otp_repo.get_otp_by_email(email)
        if not otp_data:
                raise NotFoundExceptionError()
        return OTP.model_validate(otp_data) 
    

    async def verify_otp(self,email:str,otp:str)->bool:

        otp_data = await self.get_otp_entry(email)
        
        if not otp_data:
            raise NotFoundExceptionError()
        expires_at = otp_data.expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise ValidationExceptionError(error="OTP has expired")
        verified=self.security.verify_password(otp_data.otp_hash,otp)
        if not verified:
            raise ValidationExceptionError(error="Invalid OTP")
        await self.otp_repo.delete_otp(email)
        return verified
    