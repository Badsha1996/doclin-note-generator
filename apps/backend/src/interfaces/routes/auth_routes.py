from fastapi import APIRouter, HTTPException


auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
async def register_user():
    return {"register":"done"}
    # try:
    #     yield "Regitser user"
    # except Exception as e:
    #     raise HTTPException(status_code=400, detail=str(e))
