from uuid import UUID
from typing import List
from ...utils.security import SecurityManager
from ...core.repo.feedback_repo import FeedbackRepo
from ...core.entities.feedback_entities import AddFeedback, Feedback
class FeedbackService:
    def __init__(self, feedback_repo = FeedbackRepo,security = SecurityManager):
        self.feedback_repo = feedback_repo
        self.security = security

    async def add_feedback(self,rating:float,user_id:UUID,feedback:str=None)->Feedback:
        feedback_data=AddFeedback(
            user_id=user_id,
            feedback_text=feedback,
            rating=rating
        )
        return await self.feedback_repo.add_feedback(feedback=feedback_data)
    

    async def get_all_feedbacks(self,skip:int=0,limit:int=0)->List[Feedback]:
        feedbacks=await self.feedback_repo.get_all_feedback(skip=skip,limit=limit)
        return [Feedback.model_validate(feedback) for feedback in feedbacks]