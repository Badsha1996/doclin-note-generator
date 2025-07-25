'''
what exactly is REPO ?
this are basically abstarcted methods that can later be implemented using your choice of DATABASE i.e - Mongo
, SQL , postgress etc. 
this is important as even if u chnage DB the methods will not change so the APP will not break 
So that is why it is app agnostic 
'''
from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.user_entities import User, UserCreate, UserUpdate

class UserRepo(ABC):
    @abstractmethod
    async def create_user(self, user_data: UserCreate) -> User:
        ...

    @abstractmethod
    async def get_all_user(self,skip: int, limit: int = 100 )-> List[User]:
        ...
    
    @abstractmethod
    async def get_user_by_email(self, email: str) -> Optional[User]:
        ...

    @abstractmethod
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        ...
    
    @abstractmethod
    async def delete_user(self, user_id: str) -> bool:
        ...