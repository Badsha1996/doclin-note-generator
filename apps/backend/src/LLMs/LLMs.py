from fastapi import HTTPException
from langchain_ollama import OllamaLLM
from langchain_google_genai import ChatGoogleGenerativeAI
from json_repair import repair_json  
import json
import re

from ..config.config import settings


class LLMProviderManager:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.ollama_url = settings.OLLAMA_URL
        self.ollama_model = settings.OLLAMA_MODEL
        self.gemini_api_key = settings.LLM_API_KEY
        self.gemini_models = settings.LLM_MODELS
        self.current_model_index = 0
    

    def _clean_json_output(self, raw_output: str) -> str:
        """Remove markdown fences and trim whitespace."""
        raw_output = raw_output.strip()
        raw_output = re.sub(r"^```(json)?", "", raw_output, flags=re.IGNORECASE).strip()
        raw_output = re.sub(r"```$", "", raw_output).strip()
        return raw_output
    
    def normalize_exam_json(self, data: dict) -> dict:
        for section in data.get("sections", []):
            for q in section.get("questions", []):
                for sp in q.get("subparts", []):
                    if "text" in sp and "question_text" not in sp:
                        sp["question_text"] = sp.pop("text")
        return data


    def safe_json_parse(self, raw_output):
        # Handle LangChain AIMessage objects
        if hasattr(raw_output, "content"):
            raw_output = raw_output.content

        if not isinstance(raw_output, str):
            raise HTTPException(status_code=500, detail=f"Expected string output, got {type(raw_output)}")

        cleaned = self._clean_json_output(raw_output)

        try:
            return json.loads(cleaned)
        except Exception:
            try:
                fixed = repair_json(cleaned)
                return json.loads(fixed)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to parse JSON from LLM: {e}")

    def get_ollama(self):
        try:
            return OllamaLLM(
                base_url=self.ollama_url,
                model=self.ollama_model,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")


    def get_gemini(self):
        if not self.gemini_models:
            raise HTTPException(status_code=500, detail="No Gemini models configured")

        attempts = len(self.gemini_models)
        for _ in range(attempts):
            model = self.gemini_models[self.current_model_index]
            try:
                return ChatGoogleGenerativeAI(
                    model=model,
                    google_api_key=self.gemini_api_key
                )
            except Exception:
                self.rotate_model()

        return self.get_ollama()

    def rotate_model(self):
        """Move to next Gemini model when quota/free tier is exceeded"""
        self.current_model_index = (self.current_model_index + 1) % len(self.gemini_models)

    def get_llm(self):
        if self.provider == "ollama":
            return self.get_ollama()
        elif self.provider == "gemini":
            return self.get_gemini()
        elif self.provider == "auto":
            try:
                return self.get_gemini()
            except Exception:
                return self.get_ollama()
        else:
            raise HTTPException(status_code=500, detail="Invalid LLM provider")
        
    async def safe_generate(self, llm, **kwargs):
        """
        Try to call LLM. If quota exceeded or other provider error, 
        auto-rotate Gemini model or fallback to Ollama.
        """
        try:
            return await llm.ainvoke(kwargs["prompt"])
        except Exception as e:
            err = str(e)
            # Gemini quota / 429 error
            if "429" in err or "quota" in err.lower():
                self.rotate_model()
                if self.provider in ["gemini", "auto"]:
                    new_llm = self.get_gemini()
                    return await new_llm.ainvoke(kwargs["prompt"])
                else:
                    return await self.get_ollama().ainvoke(kwargs["prompt"])
            # fallback to Ollama on any other Gemini errors
            if self.provider in ["gemini", "auto"]:
                return await self.get_ollama().ainvoke(kwargs["prompt"])
            raise

