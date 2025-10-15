from datetime import timedelta
from typing import Optional, Tuple
from ..repo.user_repo import OAuthRepo, UserRepo
from ...utils.security import SecurityManager
from ..entities.user_entities import OAuthUser, UserRole, UserCreate, User, UserUpdate
from ...utils.exceptions import ConflictException, AuthExceptionError, NotFoundExceptionError,ValidationExceptionError

class AuthService:
    def __init__(self, user_repo = UserRepo,security = SecurityManager, oauth_repo = OAuthRepo):
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
        
        if  existing_user.blocked:
            raise AuthExceptionError("Account is blocked")
        
        return User.model_validate(existing_user) 
    
    async def login_user(self, email : str, username: str, password: str)->Tuple[str, str, User]:
        # check if the user exist by email or username 
        user = await self.authenticate_user(email=email, password=password, username=username)
        if not user:
            raise AuthExceptionError("Invalid credentials")
        
        access_token = self.security.create_access_token(
            data={"user_id": str(user.id), "email": user.email, "role": user.role, "username": user.username},
            expires_delta=timedelta(hours=1)
        )
        
        refresh_token = self.security.create_refresh_token(
            data={"user_id": str(user.id), "email": user.email, "role": user.role, "username": user.username},
            expires_delta=timedelta(days=7)
        )
        
        return access_token, refresh_token, user
    
    async def oauth_login(self,oauth_user:OAuthUser)->Tuple[str,  User]:
        user = await self.oauth_repo.create_or_update_oauth_user(oauth_user)
        if not user:
            raise AuthExceptionError("Invalid credentials")
        
        access_code = self.security.create_access_token(
            data={"user_id": str(user.id), "email": user.email, "role": user.role, "username": user.username},
            expires_delta=timedelta(minutes=1)
        )
        
        
        return access_code, user
    

    async def verify_user(self,id:str)->bool:

        updated_user=UserUpdate(is_verified=True)

        user = await self.user_repo.update_user(id,updated_user)
        
        if user is None:
            raise NotFoundExceptionError("User not found")
        return True