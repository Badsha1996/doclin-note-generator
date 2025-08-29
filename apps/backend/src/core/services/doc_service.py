from fastapi import Response
import pdfplumber
import io

class DocService:
    async def extract_text(self, content : Response):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""

        return full_text