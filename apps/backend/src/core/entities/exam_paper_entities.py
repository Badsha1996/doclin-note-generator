from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any
from enum import Enum
from uuid import UUID
from datetime import datetime

class Subject(str, Enum):
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    BIOLOGY = "biology"
    MATHEMATICS = "mathematics"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    DIAGRAM_BASED = "diagram_based"
    CALCULATION = "calculation"
    MATCHING = "matching"
    FILL_BLANKS = "fill_blanks"
    ARRANGE_SEQUENCE = "arrange_sequence"
    COMPLETE_EQUATION = "complete_equation"
    IDENTIFY_STRUCTURE = "identify_structure"

class DiagramType(str, Enum):
    CIRCUIT_DIAGRAM = "circuit_diagram"
    RAY_DIAGRAM = "ray_diagram"
    FORCE_DIAGRAM = "force_diagram"
    MOLECULAR_STRUCTURE = "molecular_structure"
    APPARATUS_SETUP = "apparatus_setup"
    ANATOMICAL_DIAGRAM = "anatomical_diagram"
    CELL_DIAGRAM = "cell_diagram"
    SYSTEM_DIAGRAM = "system_diagram"
    GRAPH = "graph"
    FLOWCHART = "flowchart"
    OTHERS = "Others"

class Diagram(BaseModel):
    type: DiagramType
    description: str
    elements: List[str] = Field(default_factory=list)
    labels: List[str] = Field(default_factory=list)
    measurements: Dict[str, Any] = Field(default_factory=dict)
    angles: Dict[str, str] = Field(default_factory=dict)
    instructions: Optional[str] = None
    class Config:
        from_attributes = True

class MCQOption(BaseModel):
    option_letter: str 
    text: str
    class Config:
        from_attributes = True

class SubPart(BaseModel):
    letter: str  
    question: str = Field(alias="question_text")
    marks: Optional[int] = None
    diagram: Optional[Diagram] = None
    formula_given: Optional[str] = None
    constants_given: Optional[Dict[str, Any]] = None
    equation_template: Optional[str] = None  
    choices_given: Optional[List[str]] = None  
    class Config:
        from_attributes = True

class QuestionPart(BaseModel):
    number: str  
    type: QuestionType
    marks: int
    question: Optional[str] = Field(default=None, alias="question_text")
    description: Optional[str] = None
    sub_parts: List[SubPart] = Field(default_factory=list)
    options: List[MCQOption] = Field(default_factory=list)  
    diagram: Optional[Diagram] = None
    formula_given: Optional[str] = None
    constants_given: Optional[Dict[str, Any]] = None
    
    column_a: Optional[List[str]] = None
    column_b: Optional[List[str]] = None
    
    items_to_arrange: Optional[List[str]] = None
    sequence_type: Optional[str] = None
    
    statement_with_blanks: Optional[str] = None
    choices_for_blanks: Optional[List[List[str]]] = None
    
    equation_template: Optional[str] = None
    missing_parts: Optional[Dict[str, str]] = None
    class Config:
        from_attributes = True

class Question(BaseModel):
    number: int
    title: Optional[str] = None
    type: QuestionType
    total_marks: int
    instruction: Optional[str] = None
    parts: List[QuestionPart] = Field(default_factory=list)
    question_text: Optional[str] = None
    options: List[MCQOption] = Field(default_factory=list)
    diagram: Optional[Diagram] = None
    class Config:
        from_attributes = True

class Section(BaseModel):
    name: str  
    marks: int
    instruction: str
    is_compulsory: bool
    questions: List[Question]
    class Config:
        from_attributes = True

class ExamInfo(BaseModel):
    paper_code: str
    subject: Subject
    paper_name: str  
    year: int
    board: str = "ICSE"
    maximum_marks: int
    time_allowed: str
    reading_time: str = "15 minutes"
    additional_instructions: List[str] = Field(default_factory=list)
    class Config:
        from_attributes = True

class ExamPaperCreate(BaseModel):
    exam: ExamInfo
    sections: List[Section]

    class Config:
        from_attributes = True

class ExamPaper(BaseModel):
    id: UUID
    paper_code: str
    subject: Subject
    paper_name: str
    year: int
    board: str
    maximum_marks: int
    time_allowed: str
    reading_time: str
    additional_instructions: List[str] = Field(default_factory=list)
    
    sections: List[Section]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
