'''
Service is also agnostic so we will not have actual DATABASE call but we can pretend to call it by calling 
agnostic repo class methods in CORE floder
this is actual core logic of the methods / controller 

IMPORTANT!
* This is an abstract service where you will pass SQL or Mongo REPO to this class to get actual implementaion
'''
from typing import Tuple
from ..repo.user_repo import UserRepo
from ...utils.security import SecurityManager
from ..entities.user_entities import UserRole, UserCreate, User
from ...utils.exceptions import ConflictException, AuthExceptionError,NotFoundExceptionError,ValidationExceptionError

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
    
    async def login_user()->Tuple[str, str, User]:
        ...


heloooo