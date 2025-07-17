from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register_user():
    try:
        yield "Regitser user"
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
