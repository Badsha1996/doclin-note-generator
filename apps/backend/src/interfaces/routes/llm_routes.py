from fastapi import APIRouter, Depends, HTTPException, status
from typing import Union
from ..schemas.llm_schemas import FileSchema,ParsedSchema
from ..schemas.base_schemas import APIResponseSchema
from ..dependencies.dependencies import get_current_user
from ...core.entities.user_entities import User
from ...utils.helpers import clean_text, chunk_text, parse_chunk, merge_results, syllabus_to_json
from google import genai
from google.genai import types
import requests
import pdfplumber
import io
import re

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
    
@llm_router.post('/doc-topics')
async def doc_topics(
    parsed_text : ParsedSchema,
    current_user: User = Depends(get_current_user)
):
    try:
        if isinstance(parsed_text, list):
            # this when user is giving hand written list
            # Sorry future you i do not want to do this right now 😢
            pass

        text = syllabus_to_json(parsed_text.parsed_text)
        return APIResponseSchema(success=True,
                                 data={"topic_text":text},
                                 message="Syllabus topic has been generated")


    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@llm_router.post('/gen-question-paper')
async def genrate_question_paper():
    try:
        return {"test": "test"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))    