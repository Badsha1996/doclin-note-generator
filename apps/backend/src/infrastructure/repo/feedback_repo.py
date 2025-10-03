from sqlalchemy.orm import Session,joinedload
from ...core.repo.feedback_repo import FeedbackRepo
from ...core.entities.feedback_entities import AddFeedback, Feedback
from ...infrastructure.models.feedback_models import FeedbackModel


class SQLFeedbackRepo(FeedbackRepo):
    def __init__(self, db: Session):
        self.db = db
    async def add_feedback(self,feedback:AddFeedback)->Feedback:
        db_feedback = FeedbackModel(
            rating=feedback.rating,
            feedback_text=feedback.feedback_text,
            user_id=feedback.user_id
        ) 
        self.db.add(db_feedback)
        self.db.commit()
        self.db.refresh(db_feedback)

        return Feedback.model_validate(db_feedback)
    
    async def get_all_feedback(self, skip, limit):
        return (
        self.db.query(FeedbackModel)
        .options(joinedload(FeedbackModel.user))
        .offset(skip)
        .limit(limit)
        .all()
    )