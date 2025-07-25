'''
Service is also agnostic so we will not have actual DATABASE call but we can pretend to call it by calling 
agnostic repo class methods in CORE floder
this is actual core logic of the methods / controller 
'''
from typing import Tuple
from ..repo.user_repo import UserRepo
from ...utils.security import SecurityManager
from ..entities.user_entities import UserRole, UserCreate, User, UserUpdate

class AuthService():
    def __init__(self, user_repo = UserRepo, oauth_repo = None, security = SecurityManager):
        self.user_repo = user_repo
        self.oauth_repo = oauth_repo
        self.security = security

    def register_user()->User:
        ...
    
    def login_user()->Tuple[str, str, User]:
        ...
