from fastapi import APIRouter,HTTPException, Depends, UploadFile, File
from ...storage.storage import upload_file
from ...database.database import get_DB
from sqlalchemy.orm import Session
from ...core.services.upload_service import UploadService
from ...core.entities.user_entities import User
from ..dependencies.dependencies import get_current_user
from ...infrastructure.repo.file_repo import SQLFileRepo
from ..schemas.response_schemas import APIResponseSchema

upload_router = APIRouter(prefix="/upload", tags=["upload"])



# this will accept PDF and TXT for now
# Later we need to chnage this to accept everything 🪅
@upload_router.post("/doc")
async def doc_upload(
    file : UploadFile = File(...),
    db: Session = Depends(get_DB),
    current_user: User = Depends(get_current_user)
    ):
    try:
        if not (file.filename.lower().endswith('.pdf') or file.filename.lower().endswith('.txt')):
            raise HTTPException(status_code=400, detail="Please uplaod only pdf or txt files")
    
        file_url = await upload_file(file)
        
        # If file is not uploaded successfully 
        if not file_url:
            return HTTPException(status_code=401, detail="File is not uploaded successfully")
        
        file_repo = SQLFileRepo(db)
        upload_service = UploadService(file_repo=file_repo)

        uploaded_file = await upload_service.uplaod_file(file_url=file_url, 
                                                         file_name=file.filename, 
                                                         file_type=file.content_type, 
                                                         file_size=file.size,
                                                         user_id=current_user.id)

        return APIResponseSchema(
            success=True,
            data={"file": uploaded_file},
            message="File uploaded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

    
    