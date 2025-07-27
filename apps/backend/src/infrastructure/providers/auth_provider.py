from functools import lru_cache
from sqlalchemy.orm import Session
from ...utils.security import SecurityManager
from ...config.config import settings

@lru_cache()
def get_security_manager() -> SecurityManager:
    return SecurityManager(
        secret_key=settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )