from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import (
    Column, String, Integer, DateTime,
)
from sqlalchemy.dialects.postgresql import UUID
 

from ...database.database import Base


class PreviousYearPaperModel(Base):
    __tablename__ = "previous_year_papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    board = Column(String, nullable=False, default="ICSE")
    subject = Column(String, nullable=False)
    paper_name = Column(String, nullable=False)
    paper_code = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    file_url = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

