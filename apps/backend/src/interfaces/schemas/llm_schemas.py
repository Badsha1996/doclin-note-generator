from pydantic import BaseModel
from typing import Union

class FileSchema(BaseModel):
    url : str

class LLMGenQuestionSchema(BaseModel):
    subject: str
    board: str
    paper: str
    code: str
    year: int