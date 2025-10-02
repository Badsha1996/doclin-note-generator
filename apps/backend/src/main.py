import os

from fastapi.responses import JSONResponse
from fastapi import FastAPI

from .database.database import Base, engine
from .utils.middleware import setup_middleware

from .interfaces.routes.auth_routes import auth_router
from .interfaces.routes.llm_routes import llm_router
from .interfaces.routes.exam_paper_routes import exam_paper_router
from .interfaces.routes.otp_routes import otp_router
from .interfaces.routes.user_routes import user_router
from .interfaces.routes.feedback_routes import feedback_router
from .interfaces.routes.issues_routes import issue_router
from .config.config import settings


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
app.include_router(llm_router, prefix="/api")
app.include_router(exam_paper_router, prefix="/api")
app.include_router(otp_router,prefix="/api") 
app.include_router(user_router,prefix="/api")
app.include_router(feedback_router,prefix="/api")
app.include_router(issue_router,prefix="/api")

# ROOT ROUTE
@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return JSONResponse(content={"status": "healthy"})

@app.get("/", dependencies=[])
async def root():
    print(get_security_manager().hash_password("Robin@930"))
    return {"message": "Doclin Note generator Backend running 👍"}

# --- Only enable for PRODUCTION 😄 ---
if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", settings.PORT or 8000))
    print(f"Starting server on port {port}")
    uvicorn.run("src.main:app", host="0.0.0.0", port=port)
