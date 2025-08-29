from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..dependencies.dependencies import admin_only, get_current_user
from ..schemas.exam_paper_schemas import ExamPaperSchema,GetExamPaperSchema
from ..schemas.response_schemas import APIResponseSchema
from ...core.services.exam_paper_service import ExamPaperService
from ...infrastructure.repo.exam_paper_repo import SQLExamPaperRepo
from ...database.database import get_DB


exam_paper_router = APIRouter(prefix="/exam-paper", tags=[""])

@exam_paper_router.post("/save",dependencies=[Depends(admin_only)])
async def save_exam_paper(
    exam_paper_data : ExamPaperSchema,
    db : Session = Depends(get_DB)
):
    try:
        exam_paper_repo = SQLExamPaperRepo(db)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        is_saved = await exam_paper_service.save_exam_paper(exam_paper_data=exam_paper_data)

        return APIResponseSchema(success=is_saved
                                 ,message="Exam Paper has been saved to data base")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@exam_paper_router.get("/get-exam-paper",dependencies=[Depends(get_current_user)])
async def get_exam_paper(
    exam_paper_details : GetExamPaperSchema,
    db : Session = Depends(get_DB),
):
    try:
        exam_paper_repo = SQLExamPaperRepo(db)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        exam_paper = await exam_paper_service.get_exam_paper(subject=exam_paper_details.subject, year=exam_paper_details.year)

        return APIResponseSchema(
            success=True,
            data={"exam_paper":exam_paper},
            message="Exam Paper has been fetched"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
