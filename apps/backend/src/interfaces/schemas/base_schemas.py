from typing import Optional
from pydantic import BaseModel

class APIResponseSchema(BaseModel):
    success : bool
    data: Optional[dict] = None
    message: str