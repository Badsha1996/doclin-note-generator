from abc import ABC, abstractmethod
from ..entities.otp_entities import OTPCreate,OTP

class OTPRepo(ABC):
    @abstractmethod
    async def create_or_update_otp(self,otp:OTPCreate)->OTP:
        ...
        
    @abstractmethod
    async def delete_otp(self,email:str)->bool:
        ...
    
    @abstractmethod
    async def get_otp_by_email(self,email:str)->OTP:
        ...