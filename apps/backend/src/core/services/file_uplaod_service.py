
import os
import shutil
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, File
from ...utils.exceptions import InternelServerException, LargePayloadException
from ...config.config import settings
class FileUploadService:
    def __init__(self):
        self.cloud_name = settings.CLOUDINARY_CLOUD_NAME
        self.api_key = settings.CLOUDINARY_API_KEY
        self.api_secret = settings.CLOUDINARY_API_SECRET
        self.upload_dir = "temp_uploads"
        self.MAX_FILE_SIZE_MB = 5
        self.MAX_FILE_SIZE = self.MAX_FILE_SIZE_MB * 1024 * 1024
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
            contents = await file.read()
            if len(contents) > self.MAX_FILE_SIZE:
                raise LargePayloadException(
                    detail=f"File size exceeds {self.MAX_FILE_SIZE_MB} MB limit"
                )

            with open(temp_file_path, "wb") as buffer:
                buffer.write(contents)
        finally:
            file.file.close()
        try:
            upload_result = cloudinary.uploader.upload(temp_file_path,resource_type="image", 
            folder="pdf_uploads",
            use_filename=True,
            unique_filename=True,
            eager=[{"format": "jpg", "page": 1, "width": 500}], 
            eager_async=False,)
            file_url = upload_result.get("secure_url")
            return file_url
        except Exception as e:
            raise InternelServerException(f"File upload failed: {str(e)}")
        finally:
            os.remove(temp_file_path)
