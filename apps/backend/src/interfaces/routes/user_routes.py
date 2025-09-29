from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from ...database.database import get_DB
from ...utils.security import SecurityManager
from ...interfaces.schemas.user_schemas import UserDeleteSchema, UserRoleChangeSchema
from ...core.entities.user_entities import User
from ...core.services.user_service import UserService
from ...infrastructure.repo.user_repo import SQLUserRepo
from ...interfaces.schemas.response_schemas import APIResponseSchema
from ...infrastructure.providers.auth_provider import get_security_manager
from ...interfaces.schemas.auth_schemas import RegisterSchema, VerifySchema
from ...interfaces.dependencies.dependencies import admin_or_super_admin_only, get_current_user

user_router = APIRouter(prefix="/user", tags=[""])


@user_router.get("/all",dependencies=[Depends(admin_or_super_admin_only)])
async def get_all_user(
    skip:int=0,
    limit:int=10,
    db: Session = Depends(get_DB),
    security_manager:SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo = SQLUserRepo(db)
        user_service= UserService(user_repo,security_manager)
        users =await user_service.get_all_user(skip=skip,limit=limit)
        return APIResponseSchema(
            success=True,
            message="users fetched  successfully",
            data={"users": users}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    
@user_router.get("/kpi",dependencies=[Depends(admin_or_super_admin_only)])
async def get_kpi(
    db: Session = Depends(get_DB),
    security_manager:SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo = SQLUserRepo(db)
        user_service= UserService(user_repo,security_manager)
        kpi=await user_service.get_kpi()
        return APIResponseSchema(
            success=True,
            message="KPIs fetched successfully",
            data={"totalUsers":kpi.total_users,"newUsers":kpi.new_users,"blockedUsers":kpi.blocked_users,"paidUsers":kpi.paid_users,"trend":kpi.trend}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    

@user_router.patch("/role-change",dependencies=[Depends(admin_or_super_admin_only)])
async def change_role(
    data:UserRoleChangeSchema,
    db: Session = Depends(get_DB),
    current_user: User = Depends(get_current_user),
    security_manager:SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo = SQLUserRepo(db)
        user_service= UserService(user_repo,security_manager)
        await user_service.change_role(data,current_user)
        return APIResponseSchema(
            success=True,
            message="role changed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@user_router.patch("/verify",dependencies=[Depends(admin_or_super_admin_only)])
async def verify_user(
    user_data:VerifySchema,
    db : Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo=SQLUserRepo(db)
        user_service=UserService(user_repo=user_repo,security=security_manager)
        verified=await user_service.verify_user(user_data.id)
        if verified:
            return APIResponseSchema(success=True,
                data = {"id":user_data.id},
                message="User verified succesfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@user_router.post("/create",dependencies=[Depends(admin_or_super_admin_only)])
async def create_user(
    user_data : RegisterSchema,
    db: Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager)):
    try:
        user_repo = SQLUserRepo(db)
        user_service= UserService(user_repo,security_manager)
        user =await user_service.create_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
        )

        return APIResponseSchema(
            success=True,
            data={"user": user},
            message="User registered successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@user_router.delete("/delete",dependencies=[Depends(admin_or_super_admin_only)])
async def delete_user(
    data:UserDeleteSchema,
    db: Session = Depends(get_DB),
    security_manager:SecurityManager = Depends(get_security_manager)
):
    try:
        user_repo = SQLUserRepo(db)
        user_service= UserService(user_repo,security_manager)
        await user_service.delete_user(data.user_id)
        return APIResponseSchema(
            success=True,
            message="User deleted successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
