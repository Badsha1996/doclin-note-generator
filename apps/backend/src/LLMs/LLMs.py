from fastapi import HTTPException
from langchain_ollama import OllamaLLM
from langchain_google_genai import ChatGoogleGenerativeAI
from json_repair import repair_json  
import json
import re
import aiohttp

from ..config.config import settings


class LLMProviderManager:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.ollama_url = settings.OLLAMA_URL
        self.ollama_model = settings.OLLAMA_MODEL
        self.gemini_api_key = settings.LLM_API_KEY
        self.gemini_models = settings.LLM_MODELS
        self.current_model_index = 0

    async def stream_ollama(self, prompt: str):
            """Stream output from Ollama in chunks."""
            url = f"{self.ollama_url}/api/generate"
            headers = {"Content-Type": "application/json"}
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": True
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as resp:
                    async for line in resp.content:
                        if not line:
                            continue
                        try:
                            data = json.loads(line.decode("utf-8"))
                            if "response" in data:
                                yield data["response"]  # stream token chunk
                            if data.get("done", False):
                                break
                        except Exception:
                            continue      

    def _clean_json_output(self, raw_output: str) -> str:
        """Remove markdown fences and trim whitespace."""
        raw_output = raw_output.strip()
        raw_output = re.sub(r"^```(json)?", "", raw_output, flags=re.IGNORECASE).strip()
        raw_output = re.sub(r"```$", "", raw_output).strip()
        return raw_output

    def safe_json_parse(self, raw_output: str):
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
            try:
                return self.get_gemini()
            except Exception:
                return self.get_ollama()
        elif self.provider == "auto":
            try:
                return self.get_gemini()
            except Exception:
                return self.get_ollama()
        else:
            raise HTTPException(status_code=500, detail="Invalid LLM provider")

