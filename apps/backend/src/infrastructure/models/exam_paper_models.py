from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import (
    Column, String, Integer, DateTime, ForeignKey, Text, Boolean, JSON
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector  

from ...database.database import Base


class ExamPaperModel(Base):
    __tablename__ = "exam_papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    board = Column(String, nullable=False, default="ICSE")
    subject = Column(String, nullable=False)
    paper_name = Column(String, nullable=False)
    paper_code = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    maximum_marks = Column(Integer, nullable=False)
    time_allowed = Column(String, nullable=False)
    reading_time = Column(String, nullable=False, default="15 minutes")
    additional_instructions = Column(ARRAY(String), nullable=False, default=[])

    ai_generated = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

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
    instruction = Column(Text, nullable=False)
    is_compulsory = Column(Boolean, nullable=False, default=True)

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
    title = Column(String, nullable=True)
    type = Column(String, nullable=False)
    total_marks = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=True)
    question_text = Column(Text, nullable=True)
    options = Column(JSON, nullable=False, default=[])  
    diagram = Column(JSON, nullable=True)  

    section = relationship("SectionModel", back_populates="questions")
    parts = relationship(
        "QuestionPartModel",
        back_populates="question",
        cascade="all, delete-orphan"
    )


class QuestionPartModel(Base):
    __tablename__ = "question_parts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"))
    number = Column(String, nullable=False)
    type = Column(String, nullable=False)
    marks = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    options = Column(JSON, nullable=False, default=[])
    diagram = Column(JSON, nullable=True)
    formula_given = Column(String, nullable=True)
    constants_given = Column(JSON, nullable=True)
    column_a = Column(ARRAY(String), nullable=True)
    column_b = Column(ARRAY(String), nullable=True)
    items_to_arrange = Column(ARRAY(String), nullable=True)
    sequence_type = Column(String, nullable=True)
    statement_with_blanks = Column(Text, nullable=True)
    choices_for_blanks = Column(JSON, nullable=True)
    equation_template = Column(String, nullable=True)
    missing_parts = Column(JSON, nullable=True)

    question = relationship("QuestionModel", back_populates="parts")
    sub_parts = relationship(
        "SubPartModel",
        back_populates="part",
        cascade="all, delete-orphan"
    )


class SubPartModel(Base):
    __tablename__ = "sub_parts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    part_id = Column(UUID(as_uuid=True), ForeignKey("question_parts.id", ondelete="CASCADE"))
    letter = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    marks = Column(Integer, nullable=True)
    diagram = Column(JSON, nullable=True)
    formula_given = Column(String, nullable=True)
    constants_given = Column(JSON, nullable=True)
    equation_template = Column(String, nullable=True)
    choices_given = Column(ARRAY(String), nullable=True)
    embedding = Column(Vector(384))

    part = relationship("QuestionPartModel", back_populates="sub_parts")
