from ...core.repo.file_repo import FileRepo
from sqlalchemy.orm import Session 
from ...core.entities.file_entities import File, FileUpload
from ..models.file_models import FileModel


class SQLFileRepo(FileRepo):
    def __init__(self, db : Session):
        self.db = db
    async def uplaod_file(self, file_data : FileUpload) -> File:
        # first create a model for it 
        db_file = FileModel(
            
        ) 