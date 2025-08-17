from email.mime.text import MIMEText
import smtplib
from ...config.config import settings
from typing import Literal,Dict,Any
from ...core.templates.verify_template import get_verify_email_template
from ...utils.exceptions import AuthExceptionError,InternelServerException

class EmailService:
    def __init__(self):
        self.sender=settings.EMAIL
        self.password=settings.GOOGLE_APP_PASSWORD
    async def send_email(self,receiver:str,type: Literal["verify", "forget"],data: Dict[str, Any]):
        try:
            print(self.password)  
            html_content=get_verify_email_template(username=data["username"],otp=data["otp"])if type=="verify" else "<div>Not implemented</div>"

            message = MIMEText(html_content, "html")
            message["Subject"] = "Your One-Time Secret Code ⚔️"
            message["From"] = self.sender
            message["To"] = receiver
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(self.sender, self.password)
                server.sendmail(self.sender, receiver, message.as_string())
                return True

        except smtplib.SMTPAuthenticationError:
            raise AuthExceptionError(detail="Invalid credentials for SMTP")
        except Exception as e:
            raise InternelServerException()
