from fastapi import HTTPException, status
from typing import Any, Dict

class AuthExceptionError(HTTPException):
    def __init__(self, detail: str = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )

class ValidationExceptionError(HTTPException):
    def __init__(self, error : Dict[str, Any]):
        super().__init__(status_code = status.HTTP_422_UNPROCESSABLE_ENTITY, detail={"error": error})

class NotFoundExceptionError(HTTPException):
    def __init__(self, detail : str = "Resources not found"):
        super().__init__(status_code = status.HTTP_404_NOT_FOUND, detail=detail)

class ConflictException(HTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
    
class InternelServerException(HTTPException):
    def __init__(self, detail : str = "Internal server Error"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = detail)

class LargePayloadException(HTTPException):
    def __init__(self, detail : str = "Payload is too large"):
        super().__init__(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail = detail)