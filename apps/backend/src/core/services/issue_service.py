from ...core.entities.user_entities import User
from ...core.services.email_service import EmailService
from ...config.config import settings

class IssueService:
    def __init__(self, email_service:EmailService):
        self.email_service=email_service
    async def report_issue(
            self,
            description:str,
            user:User,
            file_bytes: bytes = None,
            filename: str = None,
            content_type: str = None
        )->bool:
        issue_mailed=await self.email_service.send_email(settings.SUPER_ADMIN_EMAIL,'report',{
            'username':user.username,
            "email":user.email,
            "description":description
        },file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,)
        ack_mailed=await self.email_service.send_email(user.email,'ack',{"username":user.username})
        return issue_mailed and ack_mailed