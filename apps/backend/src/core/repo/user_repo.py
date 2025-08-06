from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.user_entities import User, UserCreate, UserUpdate, InternalUser

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
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        ...
    
    @abstractmethod
    async def delete_user(self, user_id: str) -> bool:
        ...