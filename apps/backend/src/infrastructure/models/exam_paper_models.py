from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import (
    Column, String, Integer, DateTime, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector  

from ...database.database import Base


class ExamPaperModel(Base):
    __tablename__ = "exam_papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    board = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    paper = Column(String, nullable=False)
    code = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    max_marks = Column(Integer, nullable=False)
    time_allowed = Column(String, nullable=False)
    instructions = Column(ARRAY(String), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    sections = relationship(
        "SectionModel",
        back_populates="exam",
        cascade="all, delete-orphan"
    )

class SectionModel(Base):
    __tablename__ = "sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exam_papers.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    marks = Column(Integer, nullable=False)

    exam = relationship("ExamPaperModel", back_populates="sections")
    questions = relationship(
        "QuestionModel",
        back_populates="section",
        cascade="all, delete-orphan"
    )

   


class QuestionModel(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"))
    number = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  
    marks = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=True)

    section = relationship("SectionModel", back_populates="questions")
    subparts = relationship(
        "SubpartModel",
        back_populates="question",
        cascade="all, delete-orphan"
    )

    


class SubpartModel(Base):
    __tablename__ = "subparts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"))
    sub_id = Column(String, nullable=False)  
    question_text = Column(Text, nullable=False)
    options = Column(ARRAY(String))  
    tags = Column(ARRAY(String))  
    difficulty = Column(String, nullable=True)
    embedding = Column(Vector(768))

    question = relationship("QuestionModel", back_populates="subparts")

