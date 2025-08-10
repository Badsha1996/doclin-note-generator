from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ALL the environment TYPE defination 🚒
    DATABASE_URL: str
    SECRET_KEY : str
    ALGORITHM : str
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    FRONTEND_URL:str
    GOOGLE_CLIENT_ID:str
    GOOGLE_CLIENT_SECRET:str
    REDIRECT_URI:str
    META_ID:str
    META_SECRET:str

    S3_ENDPOINT : str
    S3_ACCESS_KEY : str
    S3_SECRET_KEY : str
    S3_BUCKET : str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
