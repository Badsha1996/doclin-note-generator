from fastapi import APIRouter, HTTPException, status
from ..schemas.upload_schemas import FileSchema
from ..schemas.base_schemas import APIResponseSchema
import requests
import pdfplumber
import io

llm_router = APIRouter(prefix="/llm", tags=["llm"])


@llm_router.post('/doc-parse')
async def doc_parse(
    upload_data : FileSchema
):
    try:
        # Download the pdf by url 
        response = requests.get(upload_data.url)
      
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to download PDF")
        
        with pdfplumber.open(io.BytesIO(response.content)) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""

        return APIResponseSchema(success=True,
                                 data={"parsed_text":full_text},
                                 message="The pdf content has been extracted")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    