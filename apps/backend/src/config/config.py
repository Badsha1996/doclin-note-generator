from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ALL the environment TYPE defination 🚒
    DATABASE_URL: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
