from pydantic import BaseModel
from typing import List

from ...core.entities.exam_paper_entities import Section, ExamInfo


class ExamPaperSchema(BaseModel):
    exam: ExamInfo
    sections: List[Section]
    class Config:
        from_attributes = True

class GetExamPaperSchema(BaseModel):
    subject: str
    year : int
    class Config:
        from_attributes = True

class GetExamPaperYearsSchema(BaseModel):
    subject: str
    class Config:
        from_attributes = True

