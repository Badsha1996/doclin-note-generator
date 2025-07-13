from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL : str = 'postgresql://postgres:postgres@postgres:5432/mydatabase'

settings = Settings()