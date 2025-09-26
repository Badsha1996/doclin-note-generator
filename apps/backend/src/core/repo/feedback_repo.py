from abc import ABC, abstractmethod
from typing import List
from ...core.entities.feedback_entities import AddFeedback, Feedback

class FeedbackRepo(ABC):
    @abstractmethod
    async def add_feedback(self, feedback:AddFeedback)->Feedback :
        ...
    @abstractmethod
    async def get_all_feedback(self,skip:int,limit:int)->List[Feedback]:
        ...