from typing import Optional, Tuple
from ..repo.user_repo import UserRepo
from ...utils.security import SecurityManager
from ..entities.user_entities import UserRole, UserCreate, User
from ...utils.exceptions import ConflictException, AuthExceptionError,ValidationExceptionError

class AuthService:
    def __init__(self, user_repo = UserRepo,security = SecurityManager, oauth_repo = None):
        self.user_repo = user_repo
        self.oauth_repo = oauth_repo
        self.security = security

    async def register_user(self, email: str, username: str, password: str, user_role = UserRole.USER)->User:
        # IF email OR username already taken 😋
        existing_email = await self.user_repo.get_user_by_email(email)

        if existing_email:
            raise ConflictException("Email already taken")
        
        existing_username = await self.user_repo.get_user_by_username(username)

        if existing_username:
            raise ConflictException("Username already taken")
        
        # PASSWORD validation check :+1: 
        if len(password) < 6:
            raise ValidationExceptionError({"password":["Password must be at least 6 characters long"]})
        
        # hashing the possword 
        hashed_password = self.security.hash_password(password=password)

        user_data = UserCreate(
            username=username,
            password=hashed_password,
            email=email,
            role=user_role
        )
        return await self.user_repo.create_user(user_data=user_data) 

    # HELPER function for authentication / login
    async def authenticate_user(self, email: str, password: str, username: str) -> Optional[User]:
        existing_user = None
        if email:
            existing_user = await self.user_repo.get_user_by_email(email=email)

        if username:
            existing_user =await self.user_repo.get_user_by_username(username=username)

        if not existing_user:
            return None
        
        if not self.security.verify_password(entered_password=password, hashed_password=existing_user.hash_password):
            return None
        
        if not existing_user.is_active:
            raise AuthExceptionError("Account is deactivated")
        
        return User.model_validate(existing_user) 
    
    async def login_user(self, email : str, username: str, password: str)->Tuple[str, str, User]:
        # check if the user exist by email or username 
        user = await self.authenticate_user(email=email, password=password, username=username)
        if not user:
            raise AuthExceptionError("Invalid credentials")
        
        access_token = self.security.create_access_token(
            data={"user_id": str(user.id), "email": user.email, "role": user.role, "username": user.username}
        )
        
        refresh_token = self.security.create_refresh_token(
            data={"user_id": str(user.id), "email": user.email, "role": user.role, "username": user.username}
        )
        
        return access_token, refresh_token, user