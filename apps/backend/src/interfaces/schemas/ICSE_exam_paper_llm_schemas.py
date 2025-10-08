from pydantic import BaseModel
from typing import Union

class FileSchema(BaseModel):
    url : str

class LLMGenICSEQuestionSchema(BaseModel):
    subject: str
    board: str
    paper: str
    code: str
    year: int