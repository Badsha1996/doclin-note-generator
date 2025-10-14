import shutil
import os
import tempfile
from fastapi import APIRouter, Depends,HTTPException
from ...interfaces.schemas.response_schemas import APIResponseSchema
from ...core.entities.user_entities import User
from ...core.services.email_service import EmailService
from ...core.services.issue_service import IssueService
from ...interfaces.schemas.issues_schemas import ReportIssueSchema
from ...interfaces.dependencies.dependencies import get_current_user

issue_router=APIRouter(prefix="/issue", tags=["issues","bugs"])
ALLOWED_FILE_TYPES = {"image/png", "image/jpeg", "application/pdf"}


@issue_router.post("/report")
async def report_issue(
    report_data:ReportIssueSchema = Depends(ReportIssueSchema.as_form),
    current_user: User = Depends(get_current_user)
):
    try:
        email_service=EmailService()
        issue_service=IssueService(email_service)
        
        file_bytes, filename, content_type = None, None, None

        if report_data.file:
            # Read file into memory
            file_bytes = await report_data.file.read()
            filename = report_data.file.filename
            content_type = report_data.file.content_type
            if content_type not in ALLOWED_FILE_TYPES:
                raise HTTPException(status_code=400, detail="Unsupported file type")
        reported= await issue_service.report_issue(
            description=report_data.description,
            user=current_user,
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type)
        

        # if temp_file_path and os.path.exists(temp_file_path):
        #     os.remove(temp_file_path)
        #     os.rmdir(temp_dir)

        if reported:
            return APIResponseSchema(success=True,
                data = {"issue":reported},
                message="issue reported, thanks for your contribution")
        else: raise HTTPException(status_code=500, detail="Issue is not reported ")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))