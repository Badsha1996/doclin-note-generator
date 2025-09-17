from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from ...core.repo.otp_repo import OTPRepo
from ...core.entities.otp_entities import OTP
from ...infrastructure.models.otp_models import OTPModel
from ...utils.exceptions import NotFoundExceptionError

class SQLOTPRepo(OTPRepo):
    def __init__(self, db: Session):
        self.db = db

    async def get_otp_by_email(self,email:str)->OTP:
        return self.db.query(OTPModel).filter(OTPModel.email== email).first()
    
    async def create_or_update_otp(self, otp)->OTP:
        existing_otp_entry=self.db.query(OTPModel).filter(OTPModel.email==otp.email).first()
        if not existing_otp_entry:
            otp_entry=OTPModel(
                email=otp.email,
                otp_hash=otp.otp_hash
            )
            self.db.add(otp_entry)
            self.db.commit()
            self.db.refresh(otp_entry)

            return OTP.model_validate(otp_entry)

        existing_otp_entry.otp_hash=otp.otp_hash
        existing_otp_entry.expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        self.db.add(existing_otp_entry)
        self.db.commit()
        self.db.refresh(existing_otp_entry)

        return OTP.model_validate(existing_otp_entry)
        
    async def delete_otp(self, email)->bool:
        existing_otp_entry=self.db.query(OTPModel).filter(OTPModel.email==email).first()
        if not existing_otp_entry:
            raise NotFoundExceptionError(detail="OTP entry not found for this email")
        self.db.delete(existing_otp_entry)
        self.db.commit()
        return True


        
