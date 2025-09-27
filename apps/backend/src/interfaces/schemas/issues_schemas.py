from typing import Optional
from pydantic import BaseModel
from fastapi import UploadFile, File, Form
from pydantic import BaseModel
class ReportIssueSchema(BaseModel):
    description: str
    file: Optional[UploadFile] = None 

    @classmethod
    def as_form(
        cls,
        description: str = Form(...),
        file: Optional[UploadFile] = File(None)
    ):
        return cls(description=description, file=file)
