from fastapi import FastAPI,Depends
from sqlalchemy.orm import Session
from .interfaces.routes.auth_routes import auth_router
from .interfaces.routes.upload_routes import upload_router
from .interfaces.routes.llm_routes import llm_router
from .interfaces.routes.otp_routes import otp_router
from .interfaces.routes.syllabus_routes import syllabus_router
from .database.database import Base, engine, SessionLocal
from .infrastructure.models.user_models import UserModel
from .utils.middleware import setup_middleware

# main APP initiation 🎌
app = FastAPI(
    title="Doclin Note Generator",
    description="Doclin note generator is an app which will make your notes and question making easy with advanced AI.",
    version="1.1.1"
)

# Setup middleware important for CORS error
setup_middleware(app)

# CREATE the actual table 🔢
Base.metadata.create_all(bind=engine)

# Parent route for prefix added
# all routes
app.include_router(auth_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(llm_router, prefix="/api")
app.include_router(otp_router,prefix="/api")
app.include_router(syllabus_router, prefix="/api")


# ROOT ROUTE
@app.get("/")
async def root():
    return {"message": "Doclin Note generator Backend running 👍"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}