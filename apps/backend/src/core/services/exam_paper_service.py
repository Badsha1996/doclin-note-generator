from ..repo.exam_paper_repo import ExamPaperRepo
from ..entities.exam_paper_entities import ExamPaperCreate, ExamPaper

class ExamPaperService:
    def __init__(self, exam_paper_repo = ExamPaperRepo):
        self.exam_paper_repo = exam_paper_repo
    
    async def save_exam_paper(self, exam_paper_data : ExamPaperCreate) -> bool:
        exam_paper_data = ExamPaperCreate(exam=exam_paper_data.exam,
                                          sections=exam_paper_data.sections
                                          )
        return await self.exam_paper_repo.create_exam_paper(exam_paper_data=exam_paper_data)

    async def get_exam_paper(self, subject: str, year: int) -> ExamPaper:
        return await self.exam_paper_repo.get_exam_paper_json(subject=subject, year=year)
    
    async def get_boards(self) -> list[str]:
        return await self.exam_paper_repo.get_exam_paper_boards()

    async def get_subjects(self) -> list[str]:
        return await self.exam_paper_repo.get_exam_paper_subjects()

    async def get_prev_years(self, subject: str,) -> list[int]:
        return await self.exam_paper_repo.get_exam_paper_prev_years(subject=subject)

    async def get_prev_year_paper(self, subject: str, year: int) -> ExamPaper:
        return await self.exam_paper_repo.get_prev_year_exam_paper(subject=subject, year=year)
