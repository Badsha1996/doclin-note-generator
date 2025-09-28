from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta,timezone
from jose import jwt, JWTError, ExpiredSignatureError
from starlette.middleware.sessions import SessionMiddleware

from ..config.config import settings
from ..utils.security import SecurityManager
from ..infrastructure.providers.auth_provider import get_security_manager


class TokenRefreshMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, excluded_paths: list[str] = None):
        super().__init__(app)
        self.excluded_paths = excluded_paths or []

    async def dispatch(self, request, call_next):
        if request.url.path in self.excluded_paths or request.method == "OPTIONS":
            return await call_next(request)

        security: SecurityManager = get_security_manager()
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")
        new_access_token = None

        if not access_token and not refresh_token:
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)
        if not access_token and refresh_token:
            try:
                refresh_payload = security.verify_token(refresh_token)
                refresh_exp = refresh_payload.exp
                refresh_exp_datetime = datetime.fromtimestamp(refresh_exp, tz=timezone.utc)
                if refresh_exp_datetime > datetime.now(timezone.utc):
                    # Issue new access token from refresh token
                    new_access_token = security.create_access_token(
                        data={
                            "user_id": refresh_payload.user_id,
                            "email": refresh_payload.email,
                            "role": refresh_payload.role,
                        },
                        expires_delta=timedelta(hours=1),
                    )
            except Exception as e:
                return JSONResponse({"detail": f"""{str(e)}"""}, status_code=401)
        elif access_token:
            try:
                payload = security.verify_token(access_token)
                exp = payload.exp

                if exp:
                    exp_datetime = datetime.fromtimestamp(exp, tz=timezone.utc)
                    # Refresh if expiring in less than 5 mins
                    if exp_datetime - datetime.now(timezone.utc) < timedelta(minutes=5):
                        if refresh_token:
                                refresh_payload = security.verify_token(refresh_token)
                                refresh_exp = refresh_payload.exp
                                refresh_exp_datetime = datetime.fromtimestamp(refresh_exp, tz=timezone.utc)
                                if refresh_exp_datetime > datetime.now(timezone.utc):
                                    new_access_token = security.create_access_token(
                                        data={
                                            "user_id": payload.user_id,
                                            "email": payload.email,
                                            "role": payload.role,
                                        },
                                        expires_delta=timedelta(hours=1),
                                    )
            except Exception as e:
                return JSONResponse({"detail": f"""{str(e)}"""}, status_code=401)

        response = await call_next(request)

        if new_access_token:
            response.set_cookie(
                key="access_token",
                value=new_access_token,
                httponly=True,
                secure=True,
                samesite="None",
                domain=settings.BACKEND_DOMAIN,
                max_age=3600,
            )

        return response        

def setup_middleware(app: FastAPI):
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Session middleware
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SECRET_KEY
    )
    
    # Trusted hosts
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
    )
    app.add_middleware(
        TokenRefreshMiddleware,
        excluded_paths=[
            "/api/auth/login",
            "/api/auth/register",
            "/docs",
            "/api/otp/verify",
            "/api/auth/oauth/login",
            "/health",
            "/api/auth/verify",
            "/api/otp/generate",
            "/openapi.json"
            ] 
    )