from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class File(BaseModel):
    id: UUID
    url: str 
    user_id : UUID 
    file_name : str 
    file_type : str
    file_size : int
    analysis_status : bool
    created_at : datetime
    updated_at : datetime
    class Config:
        from_attributes = True

class FileUpload(BaseModel):
    url: str 
    user_id : UUID 
    file_name : str 
    file_type : str
    file_size : int
    analysis_status : bool = False