from typing import List

from ...utils.exceptions import InternelServerException
from ...core.entities.previous_year_paper_entities import PreviousYearPaper, PreviousYearPaperAdd
from ...core.repo.previous_year_paper_repo import PreviousYearPaperRepo


class previousYearPaperService:
    def __init__(self,prev_year_paper_repo=PreviousYearPaperRepo):
        self.prev_year_paper_repo = prev_year_paper_repo
    async def add_pdf_url(self,info:PreviousYearPaperAdd)->PreviousYearPaper:
        try:
            return await self.prev_year_paper_repo.add_pdf_url(info)
        except Exception as e:
            raise InternelServerException(detail=str(e))
    
    
    async def get_all_pdf(self,skip:int,limit:int=100)->List[PreviousYearPaper]:  
        try:
            files= await self.prev_year_paper_repo.get_all_pdf(skip,limit)
            return [PreviousYearPaper.model_validate(file) for file in files]
        except Exception as e:
            raise InternelServerException(detail=str(e))
        

    async def delete_pdf(self,id: str)->bool:
        try:
            deleted= await self.prev_year_paper_repo.delete_pdf(id)
            if not deleted:
                raise InternelServerException('Unable to delete the entry from database')
            return True
        except Exception as e:
            raise InternelServerException(detail=str(e))
        