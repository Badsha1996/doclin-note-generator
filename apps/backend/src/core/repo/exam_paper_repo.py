from abc import ABC, abstractmethod
from ..entities.exam_paper_entities import ExamPaperCreate, ExamPaper

class ExamPaperRepo(ABC):
    @abstractmethod
    async def create_exam_paper(self, exam_paper_data : ExamPaperCreate) -> bool:
        ...

    @abstractmethod
    async def get_exam_paper_json(self, subject : str, year: int) -> ExamPaper:
        ...

    @abstractmethod
    async def get_exam_paper_boards(self) -> list[str]:
        ...

    @abstractmethod
    async def get_exam_paper_subjects(self) -> list[str]:
        ...

    @abstractmethod
    async def get_exam_paper_prev_years(self, subject: str) -> list[int]:
        ...

    @abstractmethod
    async def get_prev_year_exam_paper(self, subject: str, year: int) -> ExamPaper:
        ...