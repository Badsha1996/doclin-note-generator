from datetime import datetime, timezone
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy import Column, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from ...database.database import Base
from pgvector.sqlalchemy import Vector


class SyllabusModel(Base):
    __tablename__ = "syllabus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject = Column(String, nullable=False)
    version_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    units = relationship(
        "UnitModel",
        back_populates="syllabus",
        cascade="all, delete-orphan"
    )


class UnitModel(Base):
    __tablename__ = "units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    syllabus_id = Column(UUID(as_uuid=True), ForeignKey("syllabus.id", ondelete="CASCADE"))
    syllabus = relationship("SyllabusModel", back_populates="units")
    topics = relationship(
        "TopicModel",
        back_populates="unit",
        cascade="all, delete-orphan"
    )



class TopicModel(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    embedding = Column(Vector(768)) # This if for all-mpnet-base-v2
    subtopics = Column(ARRAY(String))
    sources = Column(ARRAY(String))
    learning_objectives = Column(ARRAY(String))
    key_terms = Column(ARRAY(String))
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"))
    unit = relationship("UnitModel", back_populates="topics")

