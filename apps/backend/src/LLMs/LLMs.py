import re
import json
from fastapi import HTTPException
from json_repair import repair_json

from langchain_ollama import OllamaLLM
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI  
from langchain_huggingface import HuggingFaceEndpoint

from ..config.config import settings


class LLMProviderManager:
    def __init__(self):
        # ---------------- Config ---------------- #
        self.provider = settings.LLM_PROVIDER

        # Gemini
        self.gemini_models = settings.LLM_MODELS or []
        self.gemini_keys = getattr(settings, "GEMINI_KEYS", []) or [settings.LLM_API_KEY]
        self.current_model_index = 0
        self.current_key_index = 0
        self.gemini_api_key = self.gemini_keys[0]

        # OpenRouter
        self.openrouter_key = getattr(settings, "OPENROUTER_KEY", None)
        self.openrouter_base_url = "https://openrouter.ai/api/v1"
        self.free_openrouter_models = [
            "google/gemma-7b-it:free",
            "mistralai/mistral-7b-instruct:free",
            "huggingfaceh4/zephyr-7b-beta:free",
            "meta-llama/llama-2-13b-chat:free",
            "gryphe/mythomax-l2-13b:free",
            "nousresearch/nous-hermes-llama2-13b:free",
            "deepseek/deepseek-chat-v3.1:free",
            "x-ai/grok-4-fast:free"
        ]
        self.current_openrouter_index = 0
        self.openrouter_model = self.free_openrouter_models[self.current_openrouter_index]

        # Ollama local
        self.ollama_model = getattr(settings, "OLLAMA_MODEL", "mistral:7b-instruct")
        self.ollama_url = getattr(settings, "OLLAMA_URL", "http://localhost:11434")

        # HuggingFace GPU
        self.hf_model = getattr(settings, "HF_MODEL", None)
        self.hf_key = getattr(settings, "HF_API_KEY", None)

        # Google Colab endpoint
        self.colab_mistral_url = getattr(settings, "COLAB_MISTRAL_URL", "http://localhost:5000/generate")

    # ---------------- JSON Helpers ---------------- #
    def _clean_json_output(self, raw_output: str) -> str:
        raw_output = raw_output.strip()
        raw_output = re.sub(r"^```(json)?", "", raw_output, flags=re.IGNORECASE).strip()
        raw_output = re.sub(r"```$", "", raw_output).strip()
        return raw_output

    def safe_json_parse(self, raw_output):
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
                raise HTTPException(status_code=500, detail=f"Failed to parse JSON: {e}")

    def normalize_exam_json(self, data: dict) -> dict:
        for section in data.get("sections", []):
            for q in section.get("questions", []):
                for sp in q.get("subparts", []):
                    if "text" in sp and "question_text" not in sp:
                        sp["question_text"] = sp.pop("text")
        return data

    # ---------------- Rotation ---------------- #
    def rotate_gemini_model(self):
        self.current_model_index = (self.current_model_index + 1) % len(self.gemini_models)

    def rotate_gemini_key(self):
        self.current_key_index = (self.current_key_index + 1) % len(self.gemini_keys)
        self.gemini_api_key = self.gemini_keys[self.current_key_index]

    def rotate_openrouter_model(self):
        self.current_openrouter_index = (self.current_openrouter_index + 1) % len(self.free_openrouter_models)
        self.openrouter_model = self.free_openrouter_models[self.current_openrouter_index]

    # ---------------- LLM Getters ---------------- #
    def get_gemini(self):
        if not self.gemini_models:
            raise HTTPException(status_code=500, detail="No Gemini models configured")
        model = self.gemini_models[self.current_model_index]
        return ChatGoogleGenerativeAI(model=model, google_api_key=self.gemini_api_key)

    def get_openrouter(self):
        return ChatOpenAI(
            model=self.openrouter_model,
            api_key=self.openrouter_key,
            base_url=self.openrouter_base_url
        )

    def get_ollama(self):
        return OllamaLLM(base_url=self.ollama_url, model=self.ollama_model)

    def get_colab_mistral(self):
        import requests
        class ColabMistralLLM:
            def __init__(self, endpoint):
                self.endpoint = endpoint
            def invoke(self, prompt):
                resp = requests.post(self.endpoint, json={"prompt": prompt, "max_tokens": 4000})
                if resp.status_code != 200:
                    raise HTTPException(status_code=500, detail=f"Colab Mistral error: {resp.text}")
                return resp.json().get("output")
            async def ainvoke(self, prompt):
                import asyncio
                return await asyncio.to_thread(self.invoke, prompt)
        return ColabMistralLLM(self.colab_mistral_url)

    def get_hf(self):
        if not self.hf_model:
            raise HTTPException(status_code=500, detail="No HuggingFace model configured")
        return HuggingFaceEndpoint(
            repo_id=self.hf_model,
            huggingfacehub_api_token=self.hf_key,
            task="text-generation"
        )

    # ---------------- Fallback Chain ---------------- #
    def get_llm_chain(self):
        chain = [
            ("gemini", self.get_gemini),
            ("openrouter", self.get_openrouter),
            ("colab_mistral", self.get_colab_mistral),  # Colab Mistral
            ("huggingface", self.get_hf),                # HF borrowed GPU
            ("ollama", self.get_ollama),
        ]
        if getattr(settings, "ALLOW_PAID_MODELS", False):
            chain.append(("gemini_paid", lambda: ChatGoogleGenerativeAI(
                model="gemini-2.5-pro", google_api_key=self.gemini_api_key)))
            chain.append(("openrouter_paid", lambda: ChatOpenAI(
                model="paid-model", api_key=self.openrouter_key, base_url=self.openrouter_base_url)))
        return chain

    # ---------------- Safe Async Generation ---------------- #
    async def safe_generate(self, prompt: str, **kwargs):
        for name, llm_func in self.get_llm_chain():
            try:
                llm = llm_func()
                if hasattr(llm, "ainvoke"):
                    return await llm.ainvoke(prompt)
                else:
                    return llm.invoke(prompt)
            except Exception as e:
                err = str(e).lower()
                if name.startswith("gemini") and ("429" in err or "quota" in err):
                    self.rotate_gemini_model()
                    self.rotate_gemini_key()
                    continue
                if name.startswith("openrouter") and ("429" in err or "rate" in err or "limit" in err):
                    self.rotate_openrouter_model()
                    continue
                continue
        raise HTTPException(status_code=500, detail="All LLM providers failed")
    
    def get_llm(self):
        """Return the default LLM based on configured provider"""
        if self.provider == "gemini":
            return self.get_gemini()
        elif self.provider == "openrouter":
            return self.get_openrouter()
        elif self.provider == "ollama":
            return self.get_ollama()
        elif self.provider == "colab_mistral":
            return self.get_colab_mistral()
        elif self.provider == "huggingface":
            return self.get_hf()
        else:
            raise HTTPException(status_code=500, detail=f"Unknown provider: {self.provider}")

