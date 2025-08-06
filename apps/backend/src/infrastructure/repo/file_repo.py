from ...core.repo.file_repo import FileRepo
from sqlalchemy.orm import Session 
from ...core.entities.file_entities import File, FileUpload
from ..models.file_models import FileModel


class SQLFileRepo(FileRepo):
    def __init__(self, db : Session):
        self.db = db
    async def uplaod_file(self, file_data : FileUpload ) -> File:
        # first create a model for it 
        db_file = FileModel(
            url = file_data.url,
            user_id = file_data.user_id,
            file_name = file_data.file_name,
            file_type = file_data.file_type,
            file_size = file_data.file_size
        ) 

        self.db.add(db_file)
        self.db.commit()
        self.db.refresh(db_file)

        return File.model_validate(db_file)

