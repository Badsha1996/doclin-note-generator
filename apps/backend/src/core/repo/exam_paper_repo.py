from abc import ABC, abstractmethod
from ..entities.exam_paper_entities import ExamPaperCreate, ExamPaper

class ExamPaperRepo(ABC):
    @abstractmethod
    async def create_exam_paper(self, exam_paper_data : ExamPaperCreate) -> bool:
        ...

    @abstractmethod
    async def create_exam_paper_json(self, subject : str, year: int) -> ExamPaper:
        ...