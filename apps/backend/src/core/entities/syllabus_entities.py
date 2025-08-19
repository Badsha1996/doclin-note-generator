from pydantic import BaseModel
from typing import List
from datetime import date, datetime
from uuid import UUID

class Topic(BaseModel):
    topic_id: str
    title: str
    subtopics: List[str]
    sources: List[str]
    learning_objectives: List[str]
    key_terms: List[str]
    class Config:
        from_attributes = True

class Unit(BaseModel):
    unit_id: str
    title: str
    topics: List[Topic]
    class Config:
        from_attributes = True

class SyllabusCreate(BaseModel):
    subject: str
    version_date: date
    units: List[Unit]

class Syllabus(BaseModel):
    id: UUID
    subject: str
    version_date: date
    units: List[Unit]
    created_at : datetime
    updated_at : datetime
    class Config:
        from_attributes = True


