from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas.auth_schemas import RegisterSchema, APIResponseSchema, LoginSchema
from ...utils.security import SecurityManager
from ...infrastructure.providers.auth_provider import get_security_manager
from sqlalchemy.orm import Session
from ...database.database import get_DB
from ...infrastructure.repo.user_repo import SQLUserRepo
from ...core.services.auth_service import AuthService


auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
async def register_user(
    user_data : RegisterSchema,
    db: Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo = SQLUserRepo(db)
        auth_service = AuthService(user_repo=user_repo,
                                   security=security_manager)
        
        user =await auth_service.register_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
        )

        return APIResponseSchema(
            success=True,
            data={"user": user},
            message="User registered successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@auth_router.post("/login")
async def login_user(
    user_data : LoginSchema,
    db : Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo = SQLUserRepo(db)
        auth_service = AuthService(user_repo=user_repo,
                                   security=security_manager)
        
        user = await auth_service.login_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
        )

        return APIResponseSchema(
            success=True,
            data={"user": user},
            message="User logged in succesfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))