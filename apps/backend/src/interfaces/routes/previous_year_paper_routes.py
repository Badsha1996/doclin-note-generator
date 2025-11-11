from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException,Depends
from ...core.entities.previous_year_paper_entities import PreviousYearPaperAdd
from ...core.entities.user_entities import User
from ...core.services.file_uplaod_service import FileUploadService
from ...core.services.previous_year_paper_service import previousYearPaperService
from ...database.database import get_DB
from ...infrastructure.repo.previous_year_papers_repo import SQLPreviousYearPaperRepo
from ...interfaces.schemas.previous_years_schemas import UploadPDFSchema
from ...interfaces.schemas.response_schemas import APIResponseSchema
from ...interfaces.dependencies.dependencies import admin_or_super_admin_only

prev_year_paper_router = APIRouter(prefix="/prev-year-pdf", tags=[""])

@prev_year_paper_router.post("/upload",dependencies=[Depends(admin_or_super_admin_only)])
async def upload_prev_year_pdf(
    payload:UploadPDFSchema = Depends(UploadPDFSchema.as_form),
    db: Session = Depends(get_DB),
    ):
    try:
        if not payload.file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")


        upload_service=FileUploadService()
        prev_year_repo=SQLPreviousYearPaperRepo(db)
        prev_year_service=previousYearPaperService(prev_year_repo)


        file_url= await upload_service.upload_file(payload.file)
        await prev_year_service.add_pdf_url(PreviousYearPaperAdd(
            board=payload.board,
            subject=payload.subject,
            paper_code=payload.paper_code,
            paper_name=payload.paper_name,
            year=payload.year,
            file_url=file_url
        ))
        return APIResponseSchema(
            success=True,
            data={"file_url": file_url},
            message="PDF uploaded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@prev_year_paper_router.get("/all",dependencies=[Depends(admin_or_super_admin_only)])
async def get_all_prev_year_pdfs(
    skip:int=0,
    limit:int=100,
    db: Session = Depends(get_DB),
    ):
    try:
        prev_year_repo=SQLPreviousYearPaperRepo(db)
        prev_year_service=previousYearPaperService(prev_year_repo)
        pdfs= await prev_year_service.get_all_pdf(skip,limit)
        return APIResponseSchema(
            success=True,
            data={"pdfs": pdfs},
            message="PDFs fetched successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))