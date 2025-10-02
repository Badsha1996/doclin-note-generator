from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from ...utils.security import SecurityManager
from ...database.database import get_DB
from ...interfaces.schemas.feedback_schemas import AddFeedbackSchema
from ...core.entities.user_entities import User
from ...core.services.feedback_service import FeedbackService
from ...infrastructure.repo.feedback_repo import SQLFeedbackRepo
from ...interfaces.schemas.response_schemas import APIResponseSchema
from ...infrastructure.providers.auth_provider import get_security_manager
from ...interfaces.dependencies.dependencies import admin_or_super_admin_only, get_current_user


feedback_router=APIRouter(prefix="/feedback", tags=["feedback"])


@feedback_router.post("/add")
async def add_feedback(
    feedback_data:AddFeedbackSchema,
    db: Session = Depends(get_DB),
    security_manager: SecurityManager = Depends(get_security_manager),
    current_user: User = Depends(get_current_user),
):
    try:
        feedback_repo=SQLFeedbackRepo(db)
        feedback_service=FeedbackService(feedback_repo=feedback_repo,security=security_manager)
        feedback= await feedback_service.add_feedback(user_id=current_user.id,feedback=feedback_data.feedback_text,rating=feedback_data.rating)
        return APIResponseSchema(
            success=True,
            data={"feedback": feedback},
            message="feedback submitted successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))




@feedback_router.get("/all",dependencies=[])
async def get_all_feedback(
    skip:int=0,
    limit:int=10,
    db: Session = Depends(get_DB),
    security_manager:SecurityManager = Depends(get_security_manager)):

    try:
        feedback_repo=SQLFeedbackRepo(db)
        feedback_service=FeedbackService(feedback_repo=feedback_repo,security=security_manager)
        feedbacks=await feedback_service.get_all_feedbacks(skip,limit)
        return APIResponseSchema(
            success=True,
            data={"feedbacks": feedbacks},
            message="feedbacks fetched successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))