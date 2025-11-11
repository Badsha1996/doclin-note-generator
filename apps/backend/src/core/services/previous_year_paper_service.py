from typing import List
from ...core.entities.previous_year_paper_entities import PreviousYearPaper, PreviousYearPaperAdd
from ...core.repo.previous_year_paper_repo import PreviousYearPaperRepo


class previousYearPaperService:
    def __init__(self,prev_year_paper_repo=PreviousYearPaperRepo):
        self.prev_year_paper_repo = prev_year_paper_repo
    async def add_pdf_url(self,info:PreviousYearPaperAdd)->PreviousYearPaper:
        return await self.prev_year_paper_repo.add_pdf_url(info)
    async def get_all_pdf(self,skip:int,limit:int=100)->List[PreviousYearPaper]:
        files= await self.prev_year_paper_repo.get_all_pdf(skip,limit)
        return [PreviousYearPaper.model_validate(file) for file in files]
    