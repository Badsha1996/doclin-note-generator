from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..dependencies.dependencies import admin_only, get_current_user
from ..schemas.exam_paper_schemas import ExamPaperSchema,GetExamPaperSchema, GetExamPaperYearsSchema
from ..schemas.response_schemas import APIResponseSchema

from ...core.services.exam_paper_service import ExamPaperService
from ...core.entities.exam_paper_entities import ExamPaper
from ...infrastructure.repo.exam_paper_repo import SQLExamPaperRepo
from ...database.database import get_DB
from ...config.model import get_embedding_model
from ...config.config import settings

exam_paper_router = APIRouter(prefix="/exam-paper", tags=[""])

@exam_paper_router.post("/save",dependencies=[Depends(admin_only)])
async def save_exam_paper(
    exam_paper_data : ExamPaperSchema,
    db : Session = Depends(get_DB)
):
    try:
        exam_paper_repo = SQLExamPaperRepo(db, model=None, embedding_api_url=settings.EMBEDDING_API_URL)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        is_saved = await exam_paper_service.save_exam_paper(exam_paper_data=exam_paper_data)

        return APIResponseSchema(success=is_saved
                                 ,message="Exam Paper has been saved to data base")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_paper_router.post("/get",dependencies=[Depends(get_current_user)])
async def get_exam_paper(
    exam_paper_details : GetExamPaperSchema,
    db : Session = Depends(get_DB),
):
    try:
        # FOR LOCAL USE
        # model=get_embedding_model
        exam_paper_repo = SQLExamPaperRepo(db, model=None, embedding_api_url=settings.EMBEDDING_API_URL)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        exam_paper = await exam_paper_service.get_exam_paper(subject=exam_paper_details.subject, year=exam_paper_details.year)

        return APIResponseSchema(
            success=True,
            data={"exam_paper":exam_paper},
            message="Exam Paper has been fetched"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@exam_paper_router.get("/get/subjects",dependencies=[Depends(get_current_user)])
async def get_all_subjects(
    db : Session = Depends(get_DB),
):
    try:
        exam_paper_repo = SQLExamPaperRepo(db, model=None, embedding_api_url=settings.EMBEDDING_API_URL)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        exam_subjects = await exam_paper_service.get_subjects()

        return APIResponseSchema(
            success=True,
            data={"exam_subjects":exam_subjects},
            message="Exam Paper subjects has been fetched"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_paper_router.get("/get/boards",dependencies=[Depends(get_current_user)])
async def get_all_boards(
    db : Session = Depends(get_DB),
):
    try:
        exam_paper_repo = SQLExamPaperRepo(db, model=None, embedding_api_url=settings.EMBEDDING_API_URL)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        exam_boards = await exam_paper_service.get_boards()

        return APIResponseSchema(
            success=True,
            data={"exam_boards":exam_boards},
            message="Exam board has been fetched"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@exam_paper_router.post("/get/prev-years",dependencies=[Depends(get_current_user)])
async def get_prev_years(
    exam_paper_details : GetExamPaperYearsSchema,
    db : Session = Depends(get_DB),
):
    try:
        exam_paper_repo = SQLExamPaperRepo(db, model=None, embedding_api_url=settings.EMBEDDING_API_URL)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        years : list[int] = await exam_paper_service.get_prev_years(subject=exam_paper_details.subject)

        return APIResponseSchema(
            success=True,
            data={"prev_years":years},
            message=f"Available for previous years paper for {exam_paper_details.subject}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@exam_paper_router.post("/get/prev-exam-paper",dependencies=[Depends(get_current_user)])
async def get_prev_exam_paper(
    exam_paper_details : GetExamPaperSchema,
    db : Session = Depends(get_DB),
):
    try:
        exam_paper_repo = SQLExamPaperRepo(db, model=None, embedding_api_url=settings.EMBEDDING_API_URL)
        exam_paper_service = ExamPaperService(exam_paper_repo=exam_paper_repo)

        exam_paper = await exam_paper_service.get_prev_year_paper(subject=exam_paper_details.subject, year=exam_paper_details.year)
        
        if not exam_paper:
            return APIResponseSchema(
            success=False,
            data={"exam_paper":exam_paper},
            message=f'Previous paper is not available for {exam_paper_details.subject} {exam_paper_details.year}'
        )

        exam_dict = ExamPaper.model_validate(exam_paper).model_dump()

        # reformat exam_paper
        exam_paper = {
            "exam": {k: v for k, v in exam_dict.items() if k != "sections"},
            "sections": exam_dict.get("sections", [])
        }

        return APIResponseSchema(
            success=True,
            data={"exam_paper":exam_paper},
            message="Exam Paper has been fetched"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
