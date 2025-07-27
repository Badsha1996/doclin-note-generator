import logging
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

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
