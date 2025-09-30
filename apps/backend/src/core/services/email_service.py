import smtplib
from email import encoders
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from typing import Literal,Dict,Any


from ...config.config import settings
from ...core.templates.verify_template import get_verify_email_template
from ...core.templates.report_template import get_report_email_template
from ...core.templates.acknowledge_template import get_acknowledge_template
from ...utils.exceptions import AuthExceptionError,InternelServerException

class EmailService:
    def __init__(self):
        self.sender=settings.EMAIL
        self.password=settings.GOOGLE_APP_PASSWORD
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

            message = MIMEMultipart()
            message["Subject"] = subject
            message["From"] = self.sender
            message["To"] = receiver

            message.attach(MIMEText(html_content, "html"))
            if file_bytes and filename and content_type:
                maintype, subtype = content_type.split("/")
                part = MIMEBase(maintype, subtype)
                part.set_payload(file_bytes)
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f"attachment; filename={filename}")
                message.attach(part)

            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(self.sender, self.password)
                server.sendmail(self.sender, receiver, message.as_string())
                return True

        except smtplib.SMTPAuthenticationError:
            raise AuthExceptionError(detail="Invalid credentials for SMTP")
        except Exception as e:
            raise InternelServerException()
