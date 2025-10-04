import smtplib
# from email import encoders
# from email.mime.text import MIMEText
# from email.mime.base import MIMEBase
# from email.mime.multipart import MIMEMultipart
from typing import Literal,Dict,Any


from ...config.config import settings
# from ...core.templates.verify_template import get_verify_email_template
# from ...core.templates.report_template import get_report_email_template
# from ...core.templates.acknowledge_template import get_acknowledge_template
# from ...utils.exceptions import AuthExceptionError,InternelServerException

class EmailService:
    def __init__(self):
        self.sender=settings.EMAIL
        self.client = None
        self.sender_name = "Doclin Team"
        # self.password=settings.GOOGLE_APP_PASSWORD
    async def send_email(
            self,
            receiver:str,
            type: Literal["verify", "forget","report","ack"],
            data: Dict[str, Any],
            file_bytes: bytes = None,  
            filename: str = None,
            content_type: str = None
            ):
        # try:
        #     templates = {
        #         "verify": (lambda d: get_verify_email_template(d["username"], d["otp"]), "Your verification OTP"),
        #         "report": (lambda d: get_report_email_template(d["username"], d["email"], d["description"]), "New Issue Reported"),
        #         "ack":    (lambda d: get_acknowledge_template(d["username"]), "We’ve received your issue report ✅"),
        #     }

        #     if type not in templates:
        #         html_content, subject = "<div>Type not implemented</div>", "Unknown"
        #     else:
        #         template_func, subject = templates[type]
        #         html_content = template_func(data)

        #     # message.attach(MIMEText(html_content, "html"))
        #     # if file_bytes and filename and content_type:
        #         # message.attach(part)
 

        #     email = (EmailBuilder()
        #         .from_email(self.sender, "Doclin Team")
        #         .to_many([{"email": receiver, "name": "Recipient"}])
        #         .subject(subject)
        #         .html(html_content)
        #         .build())
        #     response = self.client.emails.send(email)

        #     if response.success:
        #         return True
        #     else:
        #         status_code = response.status_code
        #         error_details = response.data

        #         if response.status_code == 429 and response.retry_after:
        #             retry_seconds = response.retry_after
        #             raise AuthExceptionError(f"Rate limit exceeded. Retry after {retry_seconds} seconds.")
        #         else:
        #             raise InternelServerException(f"Failed to send email. Status code: {status_code}, Details: {error_details}")
        # except Exception as e:
        #     raise InternelServerException()
        pass
