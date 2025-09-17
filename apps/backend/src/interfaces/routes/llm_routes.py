from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..schemas.response_schemas import APIResponseSchema
from ..schemas.llm_schemas import LLMGenQuestionSchema
from ..dependencies.dependencies import get_current_user

from ...database.database import get_DB
from ...infrastructure.repo.llm_repo import SQLLMRepo
from ...infrastructure.repo.exam_paper_repo import SQLExamPaperRepo
from ...core.services.llm_service import LLMService


llm_router = APIRouter(prefix="/llm", tags=["llm"])


@llm_router.post('/gen-question-paper',dependencies=[Depends(get_current_user)])
async def generate_question_paper(
    llm_gen_data : LLMGenQuestionSchema,
    db: Session = Depends(get_DB)
):
    try:
        llm_repo = SQLLMRepo(db=db)
        exam_paper_repo = SQLExamPaperRepo(db=db)
        llm_service = LLMService(llm_repo=llm_repo, subject=llm_gen_data.subject, exam_paper_repo=exam_paper_repo)

        exam_paper = await llm_service.gen_question_paper(subject=llm_gen_data.subject,board=llm_gen_data.board,
                                                        paper=llm_gen_data.paper,code=llm_gen_data.code,year=llm_gen_data.year)
        return APIResponseSchema(
            success=True,
            data={"exam_paper":exam_paper},
            message="Exam Paper has been generated"
        )
    except Exception as e:
        import traceback
        print("GEN PAPER ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    

        
