from typing import Optional, List
from ...core.repo.user_repo import UserRepo
from ...core.entities.user_entities import User, UserCreate, UserUpdate

class SQLUserRepo(UserRepo):
    async def create_user(self, user_data: UserCreate) -> User:
        ...

    async def get_all_user(self,skip: int, limit: int = 100 )-> List[User]:
        ...
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        ...
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        ...

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        ...
    
    async def delete_user(self, user_id: str) -> bool:
        ...