from fastapi import FastAPI,Depends
from sqlalchemy.orm import Session
from .auth.infrastructure.database import Base, engine, SessionLocal
from .auth.infrastructure.models import UserModel


app = FastAPI(
    title="Doclin Note Generator",
    description="Doclin note generator is an app which will make your notes and question making easy with advanced AI.",
    version="1.1.1"
)

# CREATE the actual table :accordion:
Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Authentication API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}