
import base64
import sib_api_v3_sdk
from typing import Literal,Dict,Any
from sib_api_v3_sdk.rest import ApiException
from ...config.config import settings
from ...utils.exceptions import InternelServerException, LargePayloadException
from ...core.templates.acknowledge_template import get_acknowledge_template
from ...core.templates.report_template import get_report_email_template
from ...core.templates.verify_template import get_verify_email_template

class EmailService:
    def __init__(self):
        self.sender=settings.EMAIL
        self.sender_name = "Doclin Team"
        self.MAX_FILE_SIZE = 5 * 1024 * 1024
        self.configuration = sib_api_v3_sdk.Configuration()
        self.configuration.api_key['api-key'] = settings.BREVO_API_KEY
        self.mailer=sib_api_v3_sdk.TransactionalEmailsApi(
                sib_api_v3_sdk.ApiClient(self.configuration)
            )
    async def send_email(
            self,
            receiver:str,
            type: Literal["verify", "forget","report","ack"],
            data: Dict[str, Any],
            file_bytes: bytes = None,  
            filename: str = None,
            content_type: str = None
            ):
        try:
            templates = {
                "verify": (lambda d: get_verify_email_template(d["username"], d["otp"]), "Your verification OTP"),
                "report": (lambda d: get_report_email_template(d["username"], d["email"], d["description"]), "New Issue Reported"),
                "ack":    (lambda d: get_acknowledge_template(d["username"]), "We’ve received your issue report ✅"),
            }

            if type not in templates:
                html_content, subject = "<div>Type not implemented</div>", "Unknown"
            else:
                template_func, subject = templates[type]
                html_content = template_func(data)
            attachments = []
            if file_bytes and filename:
                if len(file_bytes) > self.MAX_FILE_SIZE:
                    raise LargePayloadException("Attachment size exceeds the maximum limit of 5MB.")
                encoded_file = base64.b64encode(file_bytes).decode("utf-8")
                attachments.append({
                    "content": encoded_file,
                    "name": filename
                })
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": receiver}],
                sender={"name": self.sender_name, "email": self.sender},
                subject=subject,
                html_content=html_content,
                attachment=attachments if attachments else None
            )
            
            response = self.mailer.send_transac_email(send_smtp_email)
            return True
        except ApiException as e:
            raise InternelServerException(str(e))

