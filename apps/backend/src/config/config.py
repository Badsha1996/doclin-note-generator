import json
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ALL the environment TYPE defination 🚒
    DATABASE_URL: str
    SECRET_KEY : str
    ALGORITHM : str
    BACKEND_CORS_ORIGINS: list

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
    BREVO_API_KEY: str
    SUPER_ADMIN_EMAIL:str
    MAX_COUNT_FOR_PREVILEGED:int
    MAX_COUNT_FOR_USER:int 
    
    FRONTEND_URL:str
    BACKEND_URL:str

    LLM_MODELS : list[str]

    
    LLM_PROVIDER: str
    OLLAMA_URL: str
    OLLAMA_MODEL: str

    VECTOR_MODEL: str
    COHERE_API_KEY : Optional[str] = None

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

    PORT: int = 8000  

    @classmethod
    def _parse_list(cls, value):
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
