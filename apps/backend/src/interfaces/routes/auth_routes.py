from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response,RedirectResponse
from sqlalchemy.orm import Session

from ..schemas.auth_schemas import RegisterSchema, LoginSchema, VerifySchema
from ..schemas.response_schemas import APIResponseSchema
from ...config.config import settings
from ...utils.security import SecurityManager
from ...infrastructure.providers.auth_provider import get_oauth_manager, get_security_manager
from ...database.database import get_DB
from ...infrastructure.repo.user_repo import SQLOAuthRepo, SQLUserRepo
from ...core.services.auth_service import AuthService
from ...utils.oauth import OAuthManager


auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
async def register_user(
    user_data : RegisterSchema,
    db: Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)
):
    try:
        '''REGSITER POINT'''
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
    response:Response,
    user_data : LoginSchema,
    db : Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    try:
        ''' LOG IN POINT'''
        
        user_repo = SQLUserRepo(db)
        auth_service = AuthService(user_repo=user_repo,
                                   security=security_manager)
        
        access_token, refresh_token, user = await auth_service.login_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,   
            samesite="None", 
            domain=settings.BACKEND_DOMAIN, 
            max_age=3600
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
            domain=settings.BACKEND_DOMAIN,
            max_age=60*60*24*7
        )

        return APIResponseSchema(
            success=True,
                data={
                    "user": user,
                    "access_token": access_token,
                    "refresh_token": refresh_token
                },
                message="User logged in successfully"
            )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@auth_router.get('/oauth/login')
async def oauthLogin(
    code: str,
    state: str,
    db: Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager),
    oauth_manager: OAuthManager = Depends(get_oauth_manager)
):
    ''' OAUTH END POINT'''
    try:
        user_repo = SQLUserRepo(db)
        oauth_repo = SQLOAuthRepo(db)
        auth_service = AuthService(user_repo, security_manager,oauth_repo)

        oauth_user = await oauth_manager.get_oauth_user(
            provider=state,
            code=code,
            redirect_uri='http://localhost:8000/api/auth/oauth/login'
        )
        access_token, refresh_token, user = await auth_service.oauth_login(oauth_user)

        response = RedirectResponse(url=settings.FRONTEND_URL)


        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,   
            samesite="None", 
            domain=settings.BACKEND_DOMAIN, 
            max_age=3600
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
            domain=settings.BACKEND_DOMAIN,
            max_age=60*60*24*7
        )

        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))   


@auth_router.post("/verify")
async def verify_user(
    user_data:VerifySchema,
    db : Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo=SQLUserRepo(db)
        auth_service=AuthService(user_repo=user_repo,security=security_manager)
        verified=await auth_service.verify_user(user_data.id)
        if verified:
            return APIResponseSchema(success=True,
                data = {"id":user_data.id},
                message="User verified succesfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))