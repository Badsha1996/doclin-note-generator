import json
from typing import List, Optional
from pydantic import ConfigDict
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

    EMAIL:str
    GOOGLE_APP_PASSWORD:str
    SUPER_ADMIN_EMAIL:str
    MAX_COUNT_FOR_PREVILEGED:int
    MAX_COUNT_FOR_USER:int 
    
    FRONTEND_DOMAIN:str
    BACKEND_DOMAIN:str
    FRONTEND_URL:str

    LLM_MODELS : list[str]
    
    LLM_PROVIDER: str
    OLLAMA_URL: str
    OLLAMA_MODEL: str

    VECTOR_MODEL: str

    # Gemini
    GEMINI_KEYS: Optional[List[str]] = None

    # OpenRouter
    OPENROUTER_KEY: Optional[str] = None

    # Colab Mistral
    COLAB_MISTRAL_URL: Optional[str] = "http://localhost:5000/generate"

    # HuggingFace
    HF_MODEL: Optional[str] = None
    HF_API_KEY: Optional[str] = None

    # Paid model toggle
    ALLOW_PAID_MODELS: bool = False

    model_config = SettingsConfigDict(env_file=".env")

    PORT: int = 8000  

    model_config = ConfigDict(extra="ignore")

    # ---------------- Custom Parsers ---------------- #
    @classmethod
    def _parse_list(cls, value):
        # parse JSON string lists from .env
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return value.split(",")
        return value

    def __init__(self, **values):
        if "LLM_MODELS" in values:
            values["LLM_MODELS"] = self._parse_list(values["LLM_MODELS"])
        if "GEMINI_KEYS" in values:
            values["GEMINI_KEYS"] = self._parse_list(values["GEMINI_KEYS"])
        super().__init__(**values)

    

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
