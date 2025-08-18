from functools import lru_cache
from sqlalchemy.orm import Session
from ...utils.security import SecurityManager
from ...config.config import settings
from ...utils.oauth import OAuthManager

@lru_cache()
def get_security_manager() -> SecurityManager:
    return SecurityManager(
        secret_key=settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

@lru_cache()
def get_oauth_manager()->OAuthManager:
    return OAuthManager()
