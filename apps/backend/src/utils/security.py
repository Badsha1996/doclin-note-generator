from passlib.context import CryptContext

class SecurityManager:
    def __init__(self, secret_key:str, algorithm: str = "ES256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def verify_password(self,hashed_password, entered_password) -> bool:
        return self.pwd_context.verify(entered_password, hashed_password)