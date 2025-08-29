from uuid import UUID

from ..entities.file_entities import File, FileUpload
from ..repo.file_repo import FileRepo

class UploadService:
    def __init__(self, file_repo = FileRepo):
        self.file_repo = file_repo
    
    async def uplaod_file(self, file_url: str, file_name : str,file_type: str, file_size : int, user_id : UUID) -> File:

        file_data = FileUpload(
            url = file_url,
            file_type=file_type,
            file_size=file_size,
            file_name=file_name,
            user_id=user_id,
            analysis_status=False
        )
        return await self.file_repo.uplaod_file(file_data=file_data)