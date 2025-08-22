from pydantic import BaseModel
from typing import List, Optional, Literal

class MCQOption(BaseModel):
    option: str
    is_correct: bool

class Question(BaseModel):
    question: str
    marks: int
    difficulty: Literal["easy", "medium", "hard"]
    type: Literal[
        "mcq", "short", "long",
        "composition", "letter", "notice",
        "email", "comprehension", "grammar", "literature"
    ]
    options: Optional[List[MCQOption]] = None
    answer: Optional[str] = None

class Section(BaseModel):
    name: str
    instructions: str
    questions: List[Question]

class QuestionPaperSchema(BaseModel):
    subject: str
    total_marks: int
    sections: List[Section]
