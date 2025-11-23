from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class PreviousYearPaper(BaseModel):
    id:UUID
    board:str
    subject:str
    paper_code:str
    paper_name:str
    year:int
    file_url:str
    public_id:str
    uploaded_by:UUID
    created_at:datetime
    updated_at:datetime
    class Config:
        from_attributes = True

class PreviousYearPaperAdd(BaseModel):
    board:str
    subject:str
    paper_code:str
    paper_name:str
    year:int
    file_url:str
    public_id:str
    uploaded_by:UUID