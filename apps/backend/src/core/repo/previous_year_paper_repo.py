from abc import ABC, abstractmethod
from typing import List
from ...core.entities.previous_year_paper_entities import PreviousYearPaperAdd,PreviousYearPaper

class PreviousYearPaperRepo(ABC):
    @abstractmethod
    async def add_pdf_url(self,info:PreviousYearPaperAdd)->PreviousYearPaper:
        ...
        
    @abstractmethod
    async def get_all_pdf(self,skip: int, limit: int = 100 )-> List[PreviousYearPaper]:
        ...