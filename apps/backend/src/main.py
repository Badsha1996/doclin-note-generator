from fastapi import FastAPI,Depends
from sqlalchemy.orm import Session
from .interfaces.routes.auth_routes import auth_router
from .database.database import Base, engine, SessionLocal
from .infrastructure.user_models import UserModel

# main APP initiation 🎌
app = FastAPI(
    title="Doclin Note Generator",
    description="Doclin note generator is an app which will make your notes and question making easy with advanced AI.",
    version="1.1.1"
)

# CREATE the actual table 🔢
Base.metadata.create_all(bind=engine)

# Parent route for prefix added
# auth routes
app.include_router(auth_router, prefix="/api")


# ROOT ROUTE
@app.get("/")
async def root():
    return {"message": "Doclin Note generator Backend running 👍"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}