import logging
import secrets
import string
from typing import Any, Dict, Optional
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from pydantic import BaseModel
from .exceptions import AuthExceptionError

logger = logging.getLogger(__name__)

class TokenData(BaseModel):
    user_id: str
    email: str
    role: str
    exp: int
    user_name:str

class SecurityManager:
    def __init__(self, secret_key: str, algorithm: str):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash_password(self, password: str) -> str:
        try:
            return self.pwd_context.hash(password)
        except Exception as e:
            logger.error("Password hashing failed", exc_info=True)
            raise ValueError("Password hashing failed") from e

    def verify_password(self, hashed_password: str, entered_password: str) -> bool:
        try:
            return self.pwd_context.verify(entered_password, hashed_password)
        except Exception as e:
            logger.error("Password verification failed", exc_info=True)
            raise ValueError("Password verification failed") from e
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(hours=1)
        
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: Dict[str, Any],expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(day=7)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> TokenData:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return TokenData(
                user_id=payload.get("user_id"),
                email=payload.get("email"),
                role=payload.get("role"),
                exp=payload.get("exp"),
                user_name=payload.get("username")
            )
        except JWTError:
            raise AuthExceptionError("Invalid or expired token")
    
    def generate_verification_code(self, length: int = 6) -> str:
        return ''.join(secrets.choice(string.digits) for _ in range(length))
