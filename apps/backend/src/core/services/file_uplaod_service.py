from http.client import HTTPException
import os
import shutil
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, File
from ...config.config import settings
class FileUploadService:
    def __init__(self):
        self.cloud_name = settings.CLOUDINARY_CLOUD_NAME
        self.api_key = settings.CLOUDINARY_API_KEY
        self.api_secret = settings.CLOUDINARY_API_SECRET
        self.upload_dir = "temp_uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
        cloudinary.config(
            cloud_name=self.cloud_name,
            api_key=self.api_key,
            api_secret=self.api_secret,
            secure=True
        )   
    async def upload_file(self, file: UploadFile = File(...)) -> str:
        temp_file_path = os.path.join(self.upload_dir, file.filename)
        try:
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            file.file.close()
        try:
            upload_result = cloudinary.uploader.upload(temp_file_path,resource_type="image", 
            folder="pdf_uploads",
            public_id=os.path.splitext(file.filename)[0],
            eager=[{"format": "jpg", "page": 1, "width": 500}], 
            eager_async=False,)
            file_url = upload_result.get("secure_url")
            return file_url
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            os.remove(temp_file_path)
