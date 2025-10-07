from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from ...database.database import get_DB
from ...utils.security import SecurityManager
from ...utils.exceptions import AuthExceptionError
from ...core.services.otp_service import OTPService
from ...core.services.user_service import UserService
from ...infrastructure.repo.otp_repo import SQLOTPRepo
from ...core.services.email_service import EmailService
from ...infrastructure.repo.user_repo import SQLUserRepo
from ...interfaces.schemas.response_schemas import APIResponseSchema
from ...infrastructure.providers.auth_provider import get_security_manager
from ...interfaces.schemas.otp_schemas import OTPGenerateSchema,OTPVerifySchema


otp_router=APIRouter(prefix="/otp", tags=["otp"])


@otp_router.post("/generate")
async def generate_otp(
    user_data:OTPGenerateSchema,
    db : Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)
):
    try:
        otp_repo=SQLOTPRepo(db)
        user_repo=SQLUserRepo(db)
        user_service=UserService(user_repo,security_manager)


        user= await user_service.get_user_by_email(user_data.email)
        if user:
            raise AuthExceptionError("User with this email already exists")


        otp_service=OTPService(otp_repo,security=security_manager)
        email_service=EmailService()
        otp,otp_entry=await otp_service.generate_otp(user_data.email)
        s=await email_service.send_email(user_data.email,"verify",data={
            "username": user_data.user_name or "Brave Soul",
            "otp":otp
        })
        if s:
            return APIResponseSchema(success=True,
                data = {"otp":otp_entry},
                message="OTP sent succesfully")
        else: raise HTTPException(status_code=500, detail="Can not send the email")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@otp_router.post("/verify")
async def verify_otp(
    user_credentials:OTPVerifySchema,
    db : Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)
) :
    try:
        otp_repo=SQLOTPRepo(db)
        otp_service=OTPService(otp_repo,security=security_manager)
        verified=await otp_service.verify_otp(email=user_credentials.email,otp=user_credentials.otp)
        if verified:
            return APIResponseSchema(success=True,
                data = {"email":user_credentials.email,"verified":verified},
                message="OTP verified succesfully")
        else: raise AuthExceptionError(detail="Invalid OTP")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
