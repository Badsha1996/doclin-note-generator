from datetime import date
from typing import List, Optional
from pydantic import BaseModel,  field_validator, model_validator
from ...core.entities.syllabus_entities import Unit


class SyllabusSchema(BaseModel):
    subject: str
    version_date: str
    units: List[Unit]

class GetSyllabusSchema(BaseModel):
    subject: str