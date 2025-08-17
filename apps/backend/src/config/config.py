from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ALL the environment TYPE defination 🚒
    DATABASE_URL: str
    SECRET_KEY : str
    ALGORITHM : str
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]

    GOOGLE_CLIENT_ID:str
    GOOGLE_CLIENT_SECRET:str
    GOOLE_REDIRECT:str
    GOOGLE_TOKEN_URL:str
    GOOGLE_USER_URL:str


    META_ID:str
    META_SECRET:str
    META_REDIRECT:str
    META_TOKEN_URL:str
    META_USER_URL:str

    S3_ENDPOINT : str
    S3_ACCESS_KEY : str
    S3_SECRET_KEY : str
    S3_BUCKET : str
    EMAIL:str
    GOOGLE_APP_PASSWORD:str


    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
