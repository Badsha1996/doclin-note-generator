from fastapi import HTTPException
from ..repo.ICSE_exam_paper_llm_repo import LLMRepo
from ..repo.exam_paper_repo import ExamPaperRepo

class LLMService:
    def __init__(self, subject: str, llm_repo: LLMRepo, exam_paper_repo: ExamPaperRepo):
        self.subject = subject
        self.llm_repo = llm_repo
        self.exam_paper_repo = exam_paper_repo

    async def gen_question_paper(self, subject:str, board:str, paper:str, code:str, year:int):
        try:
            exam_paper_create = await self.llm_repo.gen_new_exam_paper(
                subject=subject,
                board=board,
                paper=paper,
                code=code,
                year=year
            )
            return exam_paper_create
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Invalid Exam Paper JSON: {e}")
