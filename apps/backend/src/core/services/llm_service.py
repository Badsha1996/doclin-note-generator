from fastapi import HTTPException
from ..repo.llm_repo import LLMRepo
from ..repo.exam_paper_repo import ExamPaperRepo

from ...LLMs.LLMs import LLMProviderManager



class LLMService:
    def __init__(self, subject: str, llm_repo: LLMRepo, exam_paper_repo: ExamPaperRepo, LLMProvider=LLMProviderManager):
        self.subject = subject
        self.llm_repo = llm_repo
        self.exam_paper_repo = exam_paper_repo
        self.LLMProvider = LLMProvider

    async def gen_question_paper(self, subject:str,board:str,paper:str,code:str,year:int):
        llm = self.LLMProvider().get_llm()
        query_embedding = self.exam_paper_repo.model.encode(self.subject).tolist()

        try:
            exam_paper_create = await self.llm_repo.gen_new_exam_paper(llm = llm, query_embedding=query_embedding, subject=subject,board=board,
                                                            paper=paper,code=code,year=year)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Invalid Exam Paper JSON: {e}")
        
        saved = await self.exam_paper_repo.create_exam_paper(exam_paper_create)
        if not saved:
            raise HTTPException(status_code=500, detail="Failed to save exam paper")

        exam_paper = await self.exam_paper_repo.get_exam_paper_json(subject=subject, year=year)

        return exam_paper.model_dump()

        