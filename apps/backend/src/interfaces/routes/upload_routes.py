from fastapi import APIRouter,HTTPException, Depends, UploadFile, File
from ...storage.storage import upload_file
from ...database.database import get_DB
from sqlalchemy.orm import Session
from ...core.services.upload_service import UploadService

upload_router = APIRouter(prefix="/upload", tags=["upload"])



# this will accept PDF and TXT for now
# Later we need to chnage this to accept everything 🪅
@upload_router.post("/doc")
async def doc_upload(
    file : UploadFile = File(...),
    db: Session = Depends(get_DB)
    ):
    try:
        if not (file.filename.lower().endswith('.pdf') or file.filename.lower().endswith('.txt')):
            raise HTTPException(status_code=400, detail="Please uplaod only pdf or txt files")
    
        file_data = await upload_file(file)
        
        # If file is not uploaded successfully 
        if not file_data:
            return HTTPException(status_code=401, detail="File is not uploaded successfully")
        # file_repo = SQLUserRepo(db)
        # auth_service = UploadService(file_repo=file_repo)
        
        # user =await auth_service.register_user(
        #     email=user_data.email,
        #     username=user_data.username,
        #     password=user_data.password,
        # )

        # return APIResponseSchema(
        #     success=True,
        #     data={"user": user},
        #     message="User registered successfully"
        # )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

    
    