from abc import ABC, abstractmethod

class FeedbackRepo(ABC):
    @abstractmethod
    async def add_feedback(self, ) :
        ...