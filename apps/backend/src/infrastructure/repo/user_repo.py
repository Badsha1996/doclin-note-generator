from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models.user_models import OAuthModel, UserModel, UserRole
from ...core.repo.user_repo import OAuthRepo, UserRepo
from ...core.entities.user_entities import OAuthUser, User, UserCreate, UserUpdate, InternalUser

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

    async def create_user_by_admin(self, user_data):
        db_user = UserModel(
            email = user_data.email,
            username = user_data.username,
            hash_password = user_data.password,
            role = user_data.role,
            is_verified=user_data.is_verified
        ) 
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)

        return User.model_validate(db_user)
    
    
    async def get_all_user(self,skip: int, limit: int = 100 )-> List[User]:
        return self.db.query(UserModel).offset(skip).limit(limit).all()
    
    async def get_user_by_email(self, email: str) -> Optional[InternalUser]:
        return self.db.query(UserModel).filter(UserModel.email == email).first()
    
    async def get_user_by_username(self, username: str) -> Optional[InternalUser]:
        return self.db.query(UserModel).filter(UserModel.username == username).first()
    
    async def get_user_by_id(self, user_id: str) -> Optional[InternalUser]:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            return None 

        for field, value in user_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return User.model_validate(user)

    
    async def delete_user(self, user_id: str) -> bool:
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            return False

        self.db.delete(user)
        self.db.commit()
        return True


class SQLOAuthRepo(OAuthRepo):
    def __init__(self, db: Session):
        self.db = db

    async def create_or_update_oauth_user(self, oauth_user: OAuthUser) -> User:
        #  Check if OAuth entry exists
        oauth_entry = (
            self.db.query(OAuthModel)
            .filter(
                and_(
                    OAuthModel.provider == oauth_user.provider,
                    OAuthModel.provider_id == oauth_user.provider_id,
                )
            )
            .first()
        )

        if oauth_entry:
            # OAuth entry exists → return associated user
            return User.model_validate(oauth_entry.user)

        #  Try finding an existing user with the same email
        user = self.db.query(UserModel).filter(UserModel.email == oauth_user.email).first()

        if not user:
            #  Create new user
            user = UserModel(
                email=oauth_user.email,
                username=oauth_user.username,
                hash_password="", 
                role=UserRole.user,
                is_verified=True 
            )
            self.db.add(user)
            self.db.flush()  # Ensure user ID is available for FK

        #  Create new OAuthModel entry linked to the user
        oauth_entry = OAuthModel(
            user_id=user.id,
            provider=oauth_user.provider,
            provider_id=oauth_user.provider_id
        )
        self.db.add(oauth_entry)
        self.db.commit()    
        self.db.refresh(user)

        return User.model_validate(user)

    async def get_user_by_oauth(self, provider: str, provider_id: str) -> Optional[User]:
        oauth_entry = (
            self.db.query(OAuthModel)
            .filter(
                and_(
                    OAuthModel.provider == provider,
                    OAuthModel.provider_id == provider_id
                )
            )
            .first()
        )

        if not oauth_entry:
            return None

        return User.model_validate(oauth_entry.user)