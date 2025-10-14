from fastapi import HTTPException

from typing import List, Optional
from ...core.repo.user_repo import UserRepo
from ...interfaces.schemas.user_schemas import UserRoleChangeSchema
from ...utils.security import SecurityManager
from ...utils.exceptions import ConflictException, NotFoundExceptionError, ValidationExceptionError
from ...core.entities.user_entities import User, UserCreate, UserCreateByAdmin, UserKPI, UserRole, UserUpdate


class UserService:
    def __init__(self, user_repo = UserRepo,security = SecurityManager):
        self.user_repo = user_repo
        self.security = security

    async def get_all_user(self,skip=0,limit=100)->List[User]:
        users = await self.user_repo.get_all_user(skip=skip,limit=limit)
        return [User.model_validate(user) for user in users]
    

    async def get_user_by_email(self,email)->Optional[User]:
        existing_email = await self.user_repo.get_user_by_email(email)
        if not existing_email:
            return None
        return User.model_validate(existing_email)


    async def create_user(self, email: str, username: str, password: str, user_role = UserRole.USER)->User:
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

        user_data = UserCreateByAdmin(
            username=username,
            password=hashed_password,
            email=email,
            role=user_role,
            is_verified=True
        )
        return await self.user_repo.create_user_by_admin(user_data=user_data) 
    
    async def update_user(self,user_id: str,user_data: UserUpdate)->Optional[User]:
        updated_user= await self.user_repo.update_user(user_id=user_id,user_data=user_data)
        if updated_user is None:
            raise NotFoundExceptionError("User not found")
        return updated_user
        
    async def change_role(self,data:UserRoleChangeSchema,current_user:User)->User:
        user = await self.user_repo.get_user_by_id(data.user_id)
        if not user:
            raise NotFoundExceptionError(detail="User not found")
        if user.id == current_user.id:
            raise  ConflictException(detail="You cannot change your own role")
        
        if current_user.role == "admin":
            if user.role != "user" or data.role != "admin":
                raise ConflictException(
                    detail="Admins can only promote a user to admin"
                )

        elif current_user.role == "superAdmin":
            if data.role not in ["user", "admin", "superAdmin"]:
                raise HTTPException(status_code=400, detail="Invalid role")
        updated_user= await self.user_repo.update_user(data.user_id,UserUpdate(role=data.role))
        if updated_user is None:
            raise NotFoundExceptionError("User not found")
        return updated_user

    async def delete_user(self,user_id:str)->bool:
        user=await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise NotFoundExceptionError(detail="User not found")
        if user.role != "user":
            raise HTTPException(
                status_code=403,
                detail="Only users with role 'user' can be deleted."
            )

        await self.user_repo.delete_user(user_id)
        return True


    async def get_kpi(self)->UserKPI:
        return await self.user_repo.get_kpi()
        

    async def verify_user(self,id:str)->bool:

        updated_user=UserUpdate(is_verified=True)

        user = await self.user_repo.update_user(id,updated_user)
        
        if user is None:
            raise NotFoundExceptionError("User not found")
        return True