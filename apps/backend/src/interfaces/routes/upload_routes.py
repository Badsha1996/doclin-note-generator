from fastapi import APIRouter

upload_router = APIRouter(prefix="/upload", tags=["upload"])

@upload_router.post("/doc")
async def doc_upload():
    return {"upload": "done"}