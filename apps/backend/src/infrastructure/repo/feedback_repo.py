from sqlalchemy.orm import Session
from ...core.repo.feedback_repo import FeedbackRepo


class SQLFeedbackRepo(FeedbackRepo):
    def __init__(self, db: Session):
        self.db = db
    async def add_feedback(self):
        return await super().add_feedback()