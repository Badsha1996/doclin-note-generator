from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
class Feedback(BaseModel):
    id:UUID
    user_id:UUID
    rating:float
    feedback_text:Optional[str]
    created_at:datetime

    class Config:
        from_attributes = True


class AddFeedback(BaseModel):
    user_id:UUID
    rating:float
    feedback_text:Optional[str]=None