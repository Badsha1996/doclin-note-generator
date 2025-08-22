from datetime import date
from typing import List
from ..repo.syllabus_repo import SyllabusRepo
from ..entities.syllabus_entities import SyllabusCreate, Unit, Syllabus

class SyllabusService:
    def __init__(self, service_repo = SyllabusRepo):
        self.service_repo = service_repo
    
    async def save_syllabus(self, subject: str, version_date: date, units: List[Unit]) -> bool:
        syllabus_data = SyllabusCreate(
            subject=subject,
            version_date=version_date,
            units=units
        )

        return await self.service_repo.create_syllabus(syllabus_data=syllabus_data)

    async def get_syllabus(self, subject : str) -> Syllabus:
        return await self.service_repo.create_json(subject=subject)