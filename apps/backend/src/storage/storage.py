from datetime import timedelta
from fastapi import UploadFile, File
from ..utils.exceptions import InternelServerException
from fastapi.responses import JSONResponse
from minio import Minio
from minio.error import S3Error
from ..config.config import settings
import mimetypes
import os

# THIS WILL BE MOVED LATER 
minio_client = Minio(  
    endpoint=settings.S3_ENDPOINT,  
    access_key=settings.S3_ACCESS_KEY,
    secret_key=settings.S3_SECRET_KEY,
    secure=False
)

BUCKET_NAME = settings.S3_BUCKET
UPLOAD_DIR = "/temp_uploaded_files"

if not minio_client.bucket_exists(BUCKET_NAME):
    minio_client.make_bucket(BUCKET_NAME)

# If the temp_upload_files does not exist then make one
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_file(file : UploadFile = File(...)):
    try:
        temp_file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(await file.read())

        # Guess content type
        content_type, _ = mimetypes.guess_type(file.filename)

        # Upload to MinIO
        minio_client.fput_object(
            BUCKET_NAME,
            file.filename,
            temp_file_path,
            content_type=content_type or "application/octet-stream"
        )

        file_url = minio_client.presigned_get_object(
            BUCKET_NAME,
            file.filename,
            expires=timedelta(days=7)
        )

        os.remove(temp_file_path)  # Clean up temp file

        return file_url
    except S3Error as e:
        raise InternelServerException(detail=str(e))