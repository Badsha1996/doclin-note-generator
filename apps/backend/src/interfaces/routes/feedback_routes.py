from ...interfaces.dependencies.dependencies import admin_or_super_admin_only
from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

feedback_router=APIRouter(prefix="/feedback", tags=["otp"])


@feedback_router.post("/add")
async def add_feedback():
    ...
@feedback_router.get("/all",dependencies=[Depends(admin_or_super_admin_only)])
async def get_all_feedback():
    ...