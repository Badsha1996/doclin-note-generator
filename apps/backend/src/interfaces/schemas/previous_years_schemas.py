from typing import Optional
from fastapi import UploadFile, File, Form
from pydantic import BaseModel

class UploadPDFSchema(BaseModel):
    board: str
    subject: str
    paper_name: str
    paper_code: str
    year: int
    file: Optional[UploadFile] = None 
    @classmethod
    def as_form(
        cls,
        board: str = Form(...),
        subject: str = Form(...),
        paper_name: str = Form(...),
        paper_code: str = Form(...),
        year: int = Form(...),
        file: Optional[UploadFile] = File(None)
    ):
        return cls(
            board=board,
            subject=subject,
            paper_name=paper_name,
            paper_code=paper_code,
            year=year,
            file=file
        )
