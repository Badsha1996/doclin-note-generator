from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Union, Annotated, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class MCQSubpart(BaseModel):
    id: str = Field(alias="sub_id")
    question: str = Field(alias="question_text")
    options: List[str]

    class Config:
        from_attributes = True
        populate_by_name = True


class FillReasonSubpart(BaseModel):
    id: str = Field(alias="sub_id")
    question: str = Field(alias="question_text")
    options: List[str]

    class Config:
        from_attributes = True
        populate_by_name = True


class DiagramNumericalSubpart(BaseModel):
    id: str = Field(alias="sub_id")
    question: str = Field(alias="question_text")
    options: Optional[List[str]] = None
    tikz: Optional[str] = Field(
        default=None,
        description="TikZ code for the diagram (include only when diagram is required)."
    )

    class Config:
        from_attributes = True
        populate_by_name = True


class MCQQuestion(BaseModel):
    number: int
    type: Literal["MCQ"]
    marks: int
    instruction: Optional[str] = None
    subparts: List[MCQSubpart]

    class Config:
        from_attributes = True


class FillReasonQuestion(BaseModel):
    number: int
    type: Literal["Fill in the blanks + reasoning"]
    marks: int
    instruction: Optional[str] = None
    subparts: List[FillReasonSubpart]

    class Config:
        from_attributes = True


class DiagramNumericalQuestion(BaseModel):
    number: int
    type: Literal["Diagram-based + Numericals"]
    marks: int
    instruction: Optional[str] = None
    subparts: List[DiagramNumericalSubpart]
    tikz: Optional[str] = Field(
        default=None,
        description="TikZ code for the diagram at question level (use when the same diagram applies to all subparts)."
    )

    class Config:
        from_attributes = True


Question = Annotated[
    Union[MCQQuestion, FillReasonQuestion, DiagramNumericalQuestion],
    Field(discriminator="type"),
]


class Section(BaseModel):
    name: str
    marks: int
    questions: List[Question]

    class Config:
        from_attributes = True


class ExamInfo(BaseModel):
    board: str
    subject: str
    paper: str
    code: str
    year: int
    max_marks: int
    time_allowed: str
    instructions: List[str]
    ai_generated: bool = Field(
        default=False,
        description="True if the exam was generated (or substantially produced) by an our AI"
    )

    class Config:
        from_attributes = True


class ExamPaperCreate(BaseModel):
    exam: ExamInfo
    sections: List[Section]

    class Config:
        from_attributes = True


class ExamPaper(BaseModel):
    id: UUID
    board: str
    subject: str
    paper: str
    code: str
    year: int
    max_marks: int
    time_allowed: str
    instructions: List[str]
    sections: List[Section]
    created_at: datetime
    updated_at: datetime
    ai_generated: bool

    class Config:
        from_attributes = True
