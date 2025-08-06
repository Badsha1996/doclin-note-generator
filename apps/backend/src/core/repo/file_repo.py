from abc import ABC, abstractmethod
from ..entities.file_entities import File, FileUpload

class FileRepo(ABC):
    @abstractmethod
    async def uplaod_file(self, file_data : FileUpload) -> File:
        ...