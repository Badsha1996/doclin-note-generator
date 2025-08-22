from fastapi import APIRouter, Depends, HTTPException, status

from ..schemas.llm_schemas import FileSchema
from ..schemas.response_schemas import APIResponseSchema
from ..dependencies.dependencies import get_current_user
from ...core.entities.user_entities import User

from ...core.entities.exam_paper_entities import ExamPaper


import requests
import pdfplumber
import io
import re

from sqlalchemy.orm import Session
from ...database.database import get_DB


llm_router = APIRouter(prefix="/llm", tags=["llm"])


@llm_router.post('/doc-parse')
async def doc_parse(
    upload_data : FileSchema,
    current_user: User = Depends(get_current_user)
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

@llm_router.post('/gen-question-paper')
async def generate_question_paper(
    exam_paper_data: ExamPaper,
    db: Session = Depends(get_DB),
    current_user: User = Depends(get_current_user),
):
    try:        
        return APIResponseSchema(success=True, 
                                data={"Questions": ""},
                                message="Questions has been generated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
