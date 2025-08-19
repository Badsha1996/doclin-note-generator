from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException,status
from sqlalchemy.orm import Session
from ...database.database import get_DB
from ...core.entities.user_entities import User
from ...utils.security import SecurityManager
from ...infrastructure.providers.auth_provider import get_security_manager 
from ...infrastructure.repo.user_repo import SQLUserRepo
from ...utils.exceptions import AuthExceptionError

# Bearer token
auth_header = HTTPBearer()

async def get_current_user(
        auth_cred : HTTPAuthorizationCredentials =  Depends(auth_header),
        db : Session = Depends(get_DB),
        security_manager: SecurityManager = Depends(get_security_manager)
) -> User:
    try:
        token_data = security_manager.verify_token(auth_cred.credentials)
        user_repo = SQLUserRepo(db=db)
        user = await user_repo.get_user_by_id(token_data.user_id)

        if not user:
            raise AuthExceptionError("Invalid token")
        
        return User.model_validate(user)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    
def admin_only(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only"
        )
    return current_user

    