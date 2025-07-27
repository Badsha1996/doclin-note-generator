from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ALL the environment TYPE defination 🚒
    DATABASE_URL: str
    SECRET_KEY : str
    ALGORITHM : str
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
