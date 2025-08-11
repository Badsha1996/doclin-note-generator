from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.user_entities import OAuthUser, User, UserCreate, UserUpdate, InternalUser

class UserRepo(ABC):
    @abstractmethod
    async def create_user(self, user_data: UserCreate) -> User:
        ...

    @abstractmethod
    async def get_all_user(self,skip: int, limit: int = 100 )-> List[User]:
        ...
    
    @abstractmethod
    async def get_user_by_email(self, email: str) -> Optional[InternalUser]:
        ...
    
    @abstractmethod
    async def get_user_by_username(self, username: str) -> Optional[InternalUser]:
        ...

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> Optional[InternalUser]:
        ...

    @abstractmethod
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        ...
    
    @abstractmethod
    async def delete_user(self, user_id: str) -> bool:
        ...



class OAuthRepo(ABC):
    @abstractmethod
    async def create_or_update_oauth_user(self, oauth_user: OAuthUser) -> User:
        ...
    
    @abstractmethod
    async def get_user_by_oauth(self, provider: str, provider_id: str) -> Optional[User]:
        ...