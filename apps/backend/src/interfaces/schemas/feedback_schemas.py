from typing import Optional
from pydantic import BaseModel,  field_validator, model_validator

class AddFeedbackSchema(BaseModel):
    feedback_text:Optional[str]=None
    rating:float
    @field_validator('rating')
    @classmethod
    def password_strength(cls, rating):
        if not 0 <= rating <= 5:
            raise ValueError('Rating must be in range of 0-5')
        return rating