from typing import Optional, List
from sqlalchemy.orm import Session
from ...core.repo.user_repo import UserRepo
from ...core.entities.user_entities import User, UserCreate, UserUpdate, InternalUser
from ..models.user_models import UserModel, UserRole

class SQLUserRepo(UserRepo):
    def __init__(self, db: Session):
        self.db = db
    async def create_user(self, user_data: UserCreate) -> User:
        # Database user 
        db_user = UserModel(
            email = user_data.email,
            username = user_data.username,
            hash_password = user_data.password,
            role = user_data.role
        ) 
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)

        return User.model_validate(db_user)

    async def get_all_user(self,skip: int, limit: int = 100 )-> List[User]:
        ...
    
    async def get_user_by_email(self, email: str) -> Optional[InternalUser]:
        return self.db.query(UserModel).filter(UserModel.email == email).first()
    
    async def get_user_by_username(self, username: str) -> Optional[InternalUser]:
        return self.db.query(UserModel).filter(UserModel.username == username).first()
    
    async def get_user_by_id(self, user_id: str) -> Optional[InternalUser]:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        ...
    
    async def delete_user(self, user_id: str) -> bool:
        ...