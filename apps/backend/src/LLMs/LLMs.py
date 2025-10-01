import re
import json
import logging
from typing import Dict, List, Tuple, Callable, Any
from fastapi import HTTPException
from json_repair import repair_json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEndpoint

from ..config.config import settings

logger = logging.getLogger(__name__)

# Optional Ollama import
try:
    from langchain_ollama import OllamaLLM
    _OLLAMA_AVAILABLE = True
except ImportError:
    _OLLAMA_AVAILABLE = False


class LLMProviderManager:
    def __init__(self):
        # ---------------- Gemini ---------------- #
        self.gemini_models: List[str] = self._parse_array_env(settings.LLM_MODELS, "LLM_MODELS")
        self.gemini_keys: List[str] = self._parse_array_env(getattr(settings, "GEMINI_KEYS", []), "GEMINI_KEYS")
        self.current_gemini_model_index = 0
        self.current_gemini_key_index = 0
        self.failed_gemini_combinations = set()

        # ---------------- OpenRouter ---------------- #
        self.openrouter_keys: List[str] = self._parse_array_env(getattr(settings, "OPENROUTER_KEY", []), "OPENROUTER_KEY")
        self.current_openrouter_key_index = 0
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
        self.current_openrouter_model_index = 0
        self.failed_openrouter_combinations = set()

        # ---------------- Ollama ---------------- #
        self.ollama_models: List[str] = self._parse_array_env(getattr(settings, "OLLAMA_MODEL", ["mistral:7b-instruct"]), "OLLAMA_MODEL")
        self.ollama_urls: List[str] = self._parse_array_env(getattr(settings, "OLLAMA_URL", ["http://localhost:11434"]), "OLLAMA_URL")
        self.current_ollama_index = 0

        # ---------------- HuggingFace ---------------- #
        self.hf_models: List[str] = self._parse_array_env(getattr(settings, "HF_MODEL", []), "HF_MODEL")
        self.hf_keys: List[str] = self._parse_array_env(getattr(settings, "HF_API_KEY", []), "HF_API_KEY")
        self.current_hf_model_index = 0
        self.current_hf_key_index = 0

        # ---------------- Google Colab ---------------- #
        self.colab_urls: List[str] = self._parse_array_env(getattr(settings, "COLAB_MISTRAL_URL", ["http://localhost:5000/generate"]), "COLAB_MISTRAL_URL")
        self.current_colab_index = 0

        # ---------------- Provider Config ---------------- #
        self.provider = getattr(settings, "LLM_PROVIDER", "auto")
        self.allow_paid_models = getattr(settings, "ALLOW_PAID_MODELS", False)
        self.provider_success_count = {}
        self.provider_failure_count = {}

    # ---------------- Helper Methods ---------------- #
    def _parse_array_env(self, value: Any, name: str) -> List[str]:
        if not value:
            return []
        if isinstance(value, list):
            return [str(v).strip() for v in value if v]
        if isinstance(value, str):
            value = value.strip()
            if value.startswith('[') and value.endswith(']'):
                try:
                    parsed = json.loads(value)
                    return [str(v).strip() for v in parsed if v]
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse {name} as JSON array, treating as single value")
            return [value] if value else []
        return []

    def _clean_json_output(self, raw_output: str) -> str:
        raw_output = raw_output.strip()
        raw_output = re.sub(r"^```(json)?", "", raw_output, flags=re.IGNORECASE).strip()
        raw_output = re.sub(r"```$", "", raw_output).strip()
        return raw_output

    def safe_json_parse(self, raw_output: Any) -> Dict:
        if hasattr(raw_output, "content"):
            raw_output = raw_output.content
        if not isinstance(raw_output, str):
            raise HTTPException(status_code=500, detail=f"Expected string output, got {type(raw_output)}")
        cleaned = self._clean_json_output(raw_output)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            try:
                fixed = repair_json(cleaned)
                return json.loads(fixed)
            except Exception as e:
                logger.error(f"Failed to parse JSON: {e}\nRaw output: {cleaned[:500]}")
                raise HTTPException(status_code=500, detail=f"Failed to parse JSON: {str(e)}")

    # ---------------- Rotation Methods ---------------- #
    def _rotate_gemini(self):
        self.current_gemini_key_index = (self.current_gemini_key_index + 1) % len(self.gemini_keys)
        if self.current_gemini_key_index == 0:
            self.current_gemini_model_index = (self.current_gemini_model_index + 1) % len(self.gemini_models)

    def _rotate_openrouter(self):
        self.current_openrouter_key_index = (self.current_openrouter_key_index + 1) % max(len(self.openrouter_keys), 1)
        if self.current_openrouter_key_index == 0:
            self.current_openrouter_model_index = (self.current_openrouter_model_index + 1) % len(self.free_openrouter_models)

    def _rotate_ollama(self):
        self.current_ollama_index = (self.current_ollama_index + 1) % max(len(self.ollama_models), len(self.ollama_urls))

    def _rotate_hf(self):
        self.current_hf_key_index = (self.current_hf_key_index + 1) % len(self.hf_keys)
        if self.current_hf_key_index == 0:
            self.current_hf_model_index = (self.current_hf_model_index + 1) % len(self.hf_models)

    def _rotate_colab(self):
        self.current_colab_index = (self.current_colab_index + 1) % len(self.colab_urls)

    # ---------------- LLM Getters ---------------- #
    def get_gemini(self) -> ChatGoogleGenerativeAI:
        if not self.gemini_models or not self.gemini_keys:
            raise HTTPException(status_code=500, detail="No Gemini models or API keys configured")
        model = self.gemini_models[self.current_gemini_model_index]
        api_key = self.gemini_keys[self.current_gemini_key_index]
        logger.info(f"Using Gemini model: {model} (key index: {self.current_gemini_key_index})")
        return ChatGoogleGenerativeAI(model=model, google_api_key=api_key, temperature=0.7, max_output_tokens=8192)

    def get_openrouter(self) -> ChatOpenAI:
        model = self.free_openrouter_models[self.current_openrouter_model_index]
        api_key = self.openrouter_keys[self.current_openrouter_key_index] if self.openrouter_keys else None
        logger.info(f"Using OpenRouter model: {model}")
        return ChatOpenAI(model=model, api_key=api_key, base_url=self.openrouter_base_url, temperature=0.7, max_tokens=4096)

    def get_ollama(self):
        if not _OLLAMA_AVAILABLE:
            raise HTTPException(status_code=500, detail="Ollama is not installed in this environment.")
        model_idx = min(self.current_ollama_index, len(self.ollama_models) - 1)
        url_idx = min(self.current_ollama_index, len(self.ollama_urls) - 1)
        model = self.ollama_models[model_idx] if self.ollama_models else "mistral:7b-instruct"
        url = self.ollama_urls[url_idx] if self.ollama_urls else "http://localhost:11434"
        logger.info(f"Using Ollama model: {model} at {url}")
        return OllamaLLM(base_url=url, model=model)

    def get_colab_mistral(self):
        import requests
        class ColabMistralLLM:
            def __init__(self, endpoint: str):
                self.endpoint = endpoint
            def invoke(self, prompt: str):
                try:
                    resp = requests.post(self.endpoint, json={"prompt": prompt, "max_tokens": 4000}, timeout=120)
                    resp.raise_for_status()
                    return resp.json().get("output")
                except requests.RequestException as e:
                    raise HTTPException(status_code=500, detail=f"Colab Mistral error: {str(e)}")
            async def ainvoke(self, prompt: str):
                import asyncio
                return await asyncio.to_thread(self.invoke, prompt)
        endpoint = self.colab_urls[self.current_colab_index] if self.colab_urls else "http://localhost:5000/generate"
        logger.info(f"Using Colab endpoint: {endpoint}")
        return ColabMistralLLM(endpoint)

    def get_hf(self) -> HuggingFaceEndpoint:
        if not self.hf_models or not self.hf_keys:
            raise HTTPException(status_code=500, detail="No HuggingFace models or API keys configured")
        model = self.hf_models[self.current_hf_model_index]
        api_key = self.hf_keys[self.current_hf_key_index]
        logger.info(f"Using HuggingFace model: {model}")
        return HuggingFaceEndpoint(repo_id=model, huggingfacehub_api_token=api_key, task="text-generation", max_new_tokens=4096)

    # ---------------- Fallback Chain ---------------- #
    def get_llm_chain(self) -> List[Tuple[str, Callable]]:
        chain = []
        if self.gemini_models and self.gemini_keys:
            chain.append(("gemini", self.get_gemini))
        if self.openrouter_keys or True:
            chain.append(("openrouter", self.get_openrouter))
        if self.colab_urls:
            chain.append(("colab_mistral", self.get_colab_mistral))
        if self.hf_models and self.hf_keys:
            chain.append(("huggingface", self.get_hf))
        if _OLLAMA_AVAILABLE and (self.ollama_models or self.ollama_urls):
            chain.append(("ollama", self.get_ollama))
        if self.allow_paid_models:
            if self.gemini_keys:
                chain.append(("gemini_paid", lambda: ChatGoogleGenerativeAI(
                    model="gemini-2.5-pro", google_api_key=self.gemini_keys[self.current_gemini_key_index])))
            if self.openrouter_keys:
                chain.append(("openrouter_paid", lambda: ChatOpenAI(
                    model="anthropic/claude-3-5-sonnet",
                    api_key=self.openrouter_keys[self.current_openrouter_key_index],
                    base_url=self.openrouter_base_url)))
        return chain

    # ---------------- Error Handling ---------------- #
    def _is_rate_limit_error(self, error: Exception) -> bool:
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in ["429","rate limit","quota","too many requests","resource exhausted"])

    def _is_auth_error(self, error: Exception) -> bool:
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in ["401","403","unauthorized","forbidden","invalid api key","authentication"])

    def _handle_provider_error(self, provider_name: str, error: Exception):
        logger.warning(f"{provider_name} error: {str(error)}")
        self.provider_failure_count[provider_name] = self.provider_failure_count.get(provider_name, 0) + 1
        if provider_name.startswith("gemini"):
            self._rotate_gemini()
        elif provider_name.startswith("openrouter"):
            self._rotate_openrouter()
        elif provider_name == "ollama":
            self._rotate_ollama()
        elif provider_name == "huggingface":
            self._rotate_hf()
        elif provider_name == "colab_mistral":
            self._rotate_colab()
