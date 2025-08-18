from abc import ABC, abstractmethod
from ..entities.syllabus_entities import SyllabusCreate, Syllabus

class SyllabusRepo(ABC):
    @abstractmethod
    async def create_syllabus(self, syllabus_data : SyllabusCreate) -> bool:
        ...

    @abstractmethod
    async def create_json(self, subject : str) -> Syllabus:
        ...