from fastapi import APIRouter, Depends, HTTPException, status
import requests

from ..dependencies.dependencies import get_current_user
from ..schemas.llm_schemas import FileSchema
from ..schemas.response_schemas import APIResponseSchema

from ...core.services.doc_service import DocService

doc_router = APIRouter(prefix="/doc", tags=["doc"])


@doc_router.post('/doc-parse', dependencies=[Depends(get_current_user)])
async def doc_parse(
    upload_data : FileSchema
):
    try:
        doc_service = DocService()
        response = requests.get(upload_data.url)
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to download PDF")
        
        full_text = await doc_service.extract_text(response.content)

        return APIResponseSchema(success=True,
                                 data={"parsed_text":full_text},
                                 message="The pdf content has been extracted")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))