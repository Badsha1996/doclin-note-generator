from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..schemas.response_schemas import APIResponseSchema
from ..schemas.llm_schemas import LLMGenQuestionSchema
from ..dependencies.dependencies import get_current_user,admin_or_super_admin_only

from ...database.database import get_DB
from ...infrastructure.repo.user_repo import SQLUserRepo
from ...infrastructure.repo.ICSE_exam_paper_llm_repo import SQLLMRepo
from ...infrastructure.repo.exam_paper_repo import SQLExamPaperRepo
from ...infrastructure.providers.auth_provider import get_security_manager
from ...utils.security import SecurityManager
from ...core.services.ICSE_exam_paper_llm_service import LLMService
from ...core.entities.user_entities import User, UserUpdate
from ...core.services.user_service import UserService

from ...config.config import settings

llm_router = APIRouter(prefix="/llm", tags=["llm"])


@llm_router.post('/gen-question-paper',dependencies=[Depends(get_current_user)])
async def generate_question_paper(
    llm_gen_data : LLMGenQuestionSchema,
    db: Session = Depends(get_DB),
    current_user: User = Depends(get_current_user),
    security_manager:SecurityManager = Depends(get_security_manager)
):
    try:
        llm_repo = SQLLMRepo(db=db)
        exam_paper_repo = SQLExamPaperRepo(db=db)
        user_repo = SQLUserRepo(db=db)
        user_service = UserService(user_repo, security_manager)
        
        if current_user.role in ["admin", "superAdmin"]:
            limit = settings.MAX_COUNT_FOR_PREVILEGED
        else:
            limit = settings.MAX_COUNT_FOR_USER

        max_limit_reached = current_user.model_hit_count >= limit

        if max_limit_reached:
            raise HTTPException(status_code=400, detail="Maximum usage limit reached")

        llm_service = LLMService(
            llm_repo=llm_repo, 
            subject=llm_gen_data.subject, 
            exam_paper_repo=exam_paper_repo
        )

        exam_paper = await llm_service.gen_question_paper(
            subject=llm_gen_data.subject,
            board=llm_gen_data.board,
            paper=llm_gen_data.paper,
            code=llm_gen_data.code,
            year=llm_gen_data.year
        )
        
        # Debug the exam_paper before serialization
        print(f"DEBUG: exam_paper type: {type(exam_paper)}")
        print(f"DEBUG: exam_paper sections count: {len(exam_paper.sections)}")
        print(f"DEBUG: Section 0 questions: {len(exam_paper.sections[0].questions)}")
        print(f"DEBUG: Section 1 questions: {len(exam_paper.sections[1].questions)}")
        
        # Convert to dict explicitly to ensure proper serialization
        exam_paper_dict = exam_paper.model_dump()
        
        # Debug the dict version
        print(f"DEBUG: exam_paper_dict sections count: {len(exam_paper_dict['sections'])}")
        print(f"DEBUG: Dict Section 0 questions: {len(exam_paper_dict['sections'][0]['questions'])}")
        
        await user_service.update_user(
            current_user.id,
            UserUpdate(model_hit_count=current_user.model_hit_count + 1)
        )
        
        return APIResponseSchema(
            success=True,
            data={"exam_paper": exam_paper_dict},  # Use the dict version
            message="Exam Paper has been generated"
        )
        
    except Exception as e:
        import traceback
        print("GEN PAPER ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    

@llm_router.post("model-change",dependencies=[Depends(admin_or_super_admin_only)])   
async def change_model():
    return True