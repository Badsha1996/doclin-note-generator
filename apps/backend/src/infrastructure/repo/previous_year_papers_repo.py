from typing import List
from sqlalchemy.orm import Session
from ...utils.exceptions import NotFoundExceptionError
from ...infrastructure.models.previous_year_papers_model import PreviousYearPaperModel
from ...core.entities.previous_year_paper_entities import PreviousYearPaper, PreviousYearPaperAdd
from ...core.repo.previous_year_paper_repo import PreviousYearPaperRepo


class SQLPreviousYearPaperRepo(PreviousYearPaperRepo):
    def __init__(self, db: Session):
        self.db = db

    async def add_pdf_url(self, info: PreviousYearPaperAdd) -> PreviousYearPaper:
        db_paper = PreviousYearPaperModel(
            board=info.board,
            subject=info.subject,
            paper_code=info.paper_code,
            paper_name=info.paper_name,
            year=info.year,
            file_url=info.file_url,
            public_id=info.public_id,
            uploaded_by=info.uploaded_by
        )
        self.db.add(db_paper)
        self.db.commit()
        self.db.refresh(db_paper)

        return PreviousYearPaper.model_validate(db_paper)

    async def get_all_pdf(self, skip: int, limit: int = 100) -> List[PreviousYearPaper]:
        return self.db.query(PreviousYearPaperModel).offset(skip).limit(limit).all()
    
    async def delete_pdf(self, id):
        existing_file=self.db.query(PreviousYearPaperModel).filter(PreviousYearPaperModel.id==id).first()
        if not existing_file:
            raise NotFoundExceptionError(detail="PDF entry not found")
        self.db.delete(existing_file)
        self.db.commit()
        return True