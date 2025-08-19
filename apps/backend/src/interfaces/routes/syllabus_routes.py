from fastapi import APIRouter,Depends, HTTPException
from ..dependencies.dependencies import admin_only, get_current_user
from ...core.entities.user_entities import User
from ..schemas.syllabus_schemas import SyllabusSchema, GetSyllabusSchema
from sqlalchemy.orm import Session
from ...database.database import get_DB
from ...infrastructure.repo.syllabus_repo import SQLSyllabusRepo
from ...core.services.syllabus_service import SyllabusService
from ..schemas.base_schemas import APIResponseSchema

syllabus_router = APIRouter(prefix="/syllabus", tags=["syllabus"])

@syllabus_router.post("/save")
async def save_syllabus(syllabus_data: SyllabusSchema, 
                        db : Session = Depends(get_DB),
                        current_user: User = Depends(admin_only)):
    try:
        syllabus_repo = SQLSyllabusRepo(db)
        syllabus_service = SyllabusService(service_repo=syllabus_repo)

        is_saved = await syllabus_service.save_syllabus(subject=syllabus_data.subject,
                                                  version_date=syllabus_data.version_date,
                                                  units=syllabus_data.units)

        return APIResponseSchema(success=is_saved
                                 ,message="Syllabus has been saved to data base")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@syllabus_router.post("/get-syllabus")    
async def get_syllabus(subject_data: GetSyllabusSchema,
                    db : Session = Depends(get_DB),
                    current_user: User = Depends(get_current_user)):
    try:
        syllabus_repo = SQLSyllabusRepo(db)
        syllabus_service = SyllabusService(service_repo=syllabus_repo)

        syllabus_data = await syllabus_service.get_syllabus(subject=subject_data.subject)
        return APIResponseSchema(
            success=True,
            data={f"syllabus":syllabus_data},
            message="Syllabus has been fetched"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 