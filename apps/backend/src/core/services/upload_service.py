from ..entities.file_entities import File
from ..repo.file_repo import FileRepo
from fastapi import UploadFile

class UploadService:
    def __init__(self, file_repo : FileRepo):
        self.file_repo = file_repo
    
    async def uplaod_file(self, file : UploadFile):
        ...