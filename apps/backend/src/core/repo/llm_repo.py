from abc import ABC, abstractmethod


class LLMRepo(ABC):
    @abstractmethod
    async def fetch_relevant_topics(query: str, top_k: int = 10):
        ...