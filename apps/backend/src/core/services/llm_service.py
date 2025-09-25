from fastapi import HTTPException
from ..repo.llm_repo import LLMRepo
from ..repo.exam_paper_repo import ExamPaperRepo

class LLMService:
    def __init__(self, subject: str, llm_repo: LLMRepo, exam_paper_repo: ExamPaperRepo):
        self.subject = subject
        self.llm_repo = llm_repo
        self.exam_paper_repo = exam_paper_repo

    async def gen_question_paper(self, subject:str, board:str, paper:str, code:str, year:int):
        try:
            # The repo will handle LLM generation internally using fallback chain
            exam_paper_create = await self.llm_repo.gen_new_exam_paper(
                subject=subject,
                board=board,
                paper=paper,
                code=code,
                year=year
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Invalid Exam Paper JSON: {e}")

        saved = await self.exam_paper_repo.create_exam_paper(exam_paper_create)
        if not saved:
            raise HTTPException(status_code=500, detail="Failed to save exam paper")

        exam_paper = await self.exam_paper_repo.get_exam_paper_json(subject=subject, year=year)
        return exam_paper.model_dump()
