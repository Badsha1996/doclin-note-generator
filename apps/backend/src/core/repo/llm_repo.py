from abc import ABC, abstractmethod


class LLMRepo(ABC):
    @abstractmethod
    async def gen_new_exam_paper(self,llm , query_embedding,subject:str,board:str,paper:str,code:str,year:int):
        ...