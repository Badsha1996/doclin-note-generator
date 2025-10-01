import re
import json
import logging
from typing import Dict, List, Tuple, Callable, Optional, Any
from fastapi import HTTPException
from json_repair import repair_json


from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI  
from langchain_huggingface import HuggingFaceEndpoint

from ..config.config import settings

logger = logging.getLogger(__name__)

# Try to import Ollama, but don't fail if it's not available
try:
    from langchain_ollama import OllamaLLM
    _OLLAMA_AVAILABLE = True
except ImportError:
    _OLLAMA_AVAILABLE = False
    logger.info("Ollama LLM not available - this is expected in production")

class LLMProviderManager:
    def __init__(self):
        # ---------------- Gemini Configuration ---------------- #
        self.gemini_models: List[str] = self._parse_array_env(
            settings.LLM_MODELS, "LLM_MODELS"
        )
        self.gemini_keys: List[str] = self._parse_array_env(
            getattr(settings, "GEMINI_KEYS", []), "GEMINI_KEYS"
        )
        self.current_gemini_model_index = 0
        self.current_gemini_key_index = 0
        
        # Track failed combinations to avoid repeated failures
        self.failed_gemini_combinations = set()

        # ---------------- OpenRouter Configuration ---------------- #
        self.openrouter_keys: List[str] = self._parse_array_env(
            getattr(settings, "OPENROUTER_KEY", []), "OPENROUTER_KEY"
        )
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

        # ---------------- Ollama Configuration ---------------- #
        self.ollama_models: List[str] = self._parse_array_env(
            getattr(settings, "OLLAMA_MODEL", ["mistral:7b-instruct"]), 
            "OLLAMA_MODEL"
        )
        self.ollama_urls: List[str] = self._parse_array_env(
            getattr(settings, "OLLAMA_URL", ["http://localhost:11434"]), 
            "OLLAMA_URL"
        )
        self.current_ollama_index = 0

        # ---------------- HuggingFace Configuration ---------------- #
        self.hf_models: List[str] = self._parse_array_env(
            getattr(settings, "HF_MODEL", []), "HF_MODEL"
        )
        self.hf_keys: List[str] = self._parse_array_env(
            getattr(settings, "HF_API_KEY", []), "HF_API_KEY"
        )
        self.current_hf_model_index = 0
        self.current_hf_key_index = 0

        # ---------------- Google Colab Configuration ---------------- #
        self.colab_urls: List[str] = self._parse_array_env(
            getattr(settings, "COLAB_MISTRAL_URL", ["http://localhost:5000/generate"]),
            "COLAB_MISTRAL_URL"
        )
        self.current_colab_index = 0

        # ---------------- Provider Configuration ---------------- #
        self.provider = getattr(settings, "LLM_PROVIDER", "auto")
        self.allow_paid_models = getattr(settings, "ALLOW_PAID_MODELS", False)
        
        # Performance tracking
        self.provider_success_count = {}
        self.provider_failure_count = {}

    def _parse_array_env(self, value: Any, name: str) -> List[str]:
        """Parse environment variable that can be string, list, or JSON array"""
        if not value:
            return []
        
        if isinstance(value, list):
            return [str(v).strip() for v in value if v]
        
        if isinstance(value, str):
            value = value.strip()
            # Try to parse as JSON array
            if value.startswith('[') and value.endswith(']'):
                try:
                    parsed = json.loads(value)
                    return [str(v).strip() for v in parsed if v]
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse {name} as JSON array, treating as single value")
            
            # Treat as single value
            return [value] if value else []
        
        return []

    # ---------------- JSON Helpers ---------------- #
    def _clean_json_output(self, raw_output: str) -> str:
        """Clean LLM output to extract valid JSON"""
        raw_output = raw_output.strip()
        raw_output = re.sub(r"^```(json)?", "", raw_output, flags=re.IGNORECASE).strip()
        raw_output = re.sub(r"```$", "", raw_output).strip()
        return raw_output

    def safe_json_parse(self, raw_output: Any) -> Dict:
        """Safely parse JSON from LLM output with repair fallback"""
        if hasattr(raw_output, "content"):
            raw_output = raw_output.content
        
        if not isinstance(raw_output, str):
            raise HTTPException(
                status_code=500, 
                detail=f"Expected string output, got {type(raw_output)}"
            )
        
        cleaned = self._clean_json_output(raw_output)
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            try:
                fixed = repair_json(cleaned)
                return json.loads(fixed)
            except Exception as e:
                logger.error(f"Failed to parse JSON: {e}\nRaw output: {cleaned[:500]}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to parse JSON: {str(e)}"
                )

    def normalize_exam_json(self, data: Dict) -> Dict:
        """Normalize exam JSON structure"""
        for section in data.get("sections", []):
            for q in section.get("questions", []):
                for sp in q.get("subparts", []):
                    if "text" in sp and "question_text" not in sp:
                        sp["question_text"] = sp.pop("text")
        return data

    # ---------------- Rotation Logic ---------------- #
    def _rotate_gemini(self):
        """Rotate to next Gemini model/key combination"""
        # Try next key with same model first
        self.current_gemini_key_index = (self.current_gemini_key_index + 1) % len(self.gemini_keys)
        
        # If we've cycled through all keys, try next model
        if self.current_gemini_key_index == 0:
            self.current_gemini_model_index = (self.current_gemini_model_index + 1) % len(self.gemini_models)

    def _rotate_openrouter(self):
        """Rotate to next OpenRouter model/key combination"""
        self.current_openrouter_key_index = (self.current_openrouter_key_index + 1) % max(len(self.openrouter_keys), 1)
        
        if self.current_openrouter_key_index == 0:
            self.current_openrouter_model_index = (self.current_openrouter_model_index + 1) % len(self.free_openrouter_models)

    def _rotate_ollama(self):
        """Rotate to next Ollama instance"""
        self.current_ollama_index = (self.current_ollama_index + 1) % max(len(self.ollama_models), len(self.ollama_urls))

    def _rotate_hf(self):
        """Rotate to next HuggingFace model/key combination"""
        self.current_hf_key_index = (self.current_hf_key_index + 1) % len(self.hf_keys)
        
        if self.current_hf_key_index == 0:
            self.current_hf_model_index = (self.current_hf_model_index + 1) % len(self.hf_models)

    def _rotate_colab(self):
        """Rotate to next Colab endpoint"""
        self.current_colab_index = (self.current_colab_index + 1) % len(self.colab_urls)

    # ---------------- LLM Getters ---------------- #
    def get_gemini(self) -> ChatGoogleGenerativeAI:
        """Get Gemini LLM instance with current model and key"""
        if not self.gemini_models or not self.gemini_keys:
            raise HTTPException(
                status_code=500, 
                detail="No Gemini models or API keys configured"
            )
        
        model = self.gemini_models[self.current_gemini_model_index]
        api_key = self.gemini_keys[self.current_gemini_key_index]
        
        logger.info(f"Using Gemini model: {model} (key index: {self.current_gemini_key_index})")
        
        return ChatGoogleGenerativeAI(
            model=model, 
            google_api_key=api_key,
            temperature=0.7,
            max_output_tokens=8192
        )

    def get_openrouter(self) -> ChatOpenAI:
        """Get OpenRouter LLM instance"""
        model = self.free_openrouter_models[self.current_openrouter_model_index]
        api_key = self.openrouter_keys[self.current_openrouter_key_index] if self.openrouter_keys else None
        
        logger.info(f"Using OpenRouter model: {model}")
        
        return ChatOpenAI(
            model=model,
            api_key=api_key,
            base_url=self.openrouter_base_url,
            temperature=0.7,
            max_tokens=4096
        )

    def get_ollama(self):
        """Get Ollama LLM instance"""
        if not _OLLAMA_AVAILABLE:
            raise HTTPException(
                status_code=500,
                detail="Ollama LLM is not available. Install langchain-ollama package to use Ollama."
            )
        
        model_idx = min(self.current_ollama_index, len(self.ollama_models) - 1)
        url_idx = min(self.current_ollama_index, len(self.ollama_urls) - 1)
        
        model = self.ollama_models[model_idx] if self.ollama_models else "mistral:7b-instruct"
        url = self.ollama_urls[url_idx] if self.ollama_urls else "http://localhost:11434"
        
        logger.info(f"Using Ollama model: {model} at {url}")
        
        return OllamaLLM(base_url=url, model=model)

    def get_colab_mistral(self):
        """Get Colab Mistral LLM instance"""
        import requests
        
        class ColabMistralLLM:
            def __init__(self, endpoint: str):
                self.endpoint = endpoint
            
            def invoke(self, prompt: str):
                try:
                    resp = requests.post(
                        self.endpoint, 
                        json={"prompt": prompt, "max_tokens": 4000},
                        timeout=120
                    )
                    resp.raise_for_status()
                    return resp.json().get("output")
                except requests.RequestException as e:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Colab Mistral error: {str(e)}"
                    )
            
            async def ainvoke(self, prompt: str):
                import asyncio
                return await asyncio.to_thread(self.invoke, prompt)
        
        endpoint = self.colab_urls[self.current_colab_index] if self.colab_urls else "http://localhost:5000/generate"
        logger.info(f"Using Colab endpoint: {endpoint}")
        
        return ColabMistralLLM(endpoint)

    def get_hf(self) -> HuggingFaceEndpoint:
        """Get HuggingFace LLM instance"""
        if not self.hf_models or not self.hf_keys:
            raise HTTPException(
                status_code=500, 
                detail="No HuggingFace models or API keys configured"
            )
        
        model = self.hf_models[self.current_hf_model_index]
        api_key = self.hf_keys[self.current_hf_key_index]
        
        logger.info(f"Using HuggingFace model: {model}")
        
        return HuggingFaceEndpoint(
            repo_id=model,
            huggingfacehub_api_token=api_key,
            task="text-generation",
            max_new_tokens=4096
        )

    # ---------------- Fallback Chain ---------------- #
    def get_llm_chain(self) -> List[Tuple[str, Callable]]:
        """Get prioritized list of LLM providers with fallback"""
        chain = []
        
        # Add providers based on configuration
        if self.gemini_models and self.gemini_keys:
            chain.append(("gemini", self.get_gemini))
        
        if self.openrouter_keys or True:  # OpenRouter has free tier
            chain.append(("openrouter", self.get_openrouter))
        
        if self.colab_urls:
            chain.append(("colab_mistral", self.get_colab_mistral))
        
        if self.hf_models and self.hf_keys:
            chain.append(("huggingface", self.get_hf))
        
        # Only add Ollama if the library is available
        if _OLLAMA_AVAILABLE and (self.ollama_models or self.ollama_urls):
            chain.append(("ollama", self.get_ollama))
        
        # Add paid models if allowed
        if self.allow_paid_models:
            if self.gemini_keys:
                chain.append(("gemini_paid", lambda: ChatGoogleGenerativeAI(
                    model="gemini-2.5-pro", 
                    google_api_key=self.gemini_keys[self.current_gemini_key_index]
                )))
            
            if self.openrouter_keys:
                chain.append(("openrouter_paid", lambda: ChatOpenAI(
                    model="anthropic/claude-3-5-sonnet",
                    api_key=self.openrouter_keys[self.current_openrouter_key_index],
                    base_url=self.openrouter_base_url
                )))
        
        return chain

    # ---------------- Error Handling ---------------- #
    def _is_rate_limit_error(self, error: Exception) -> bool:
        """Check if error is a rate limit error"""
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in [
            "429", "rate limit", "quota", "too many requests", "resource exhausted"
        ])

    def _is_auth_error(self, error: Exception) -> bool:
        """Check if error is an authentication error"""
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in [
            "401", "403", "unauthorized", "forbidden", "invalid api key", "authentication"
        ])

    def _handle_provider_error(self, provider_name: str, error: Exception):
        """Handle provider-specific errors and rotation"""
        logger.warning(f"{provider_name} error: {str(error)}")
        
        # Track failure
        self.provider_failure_count[provider_name] = self.provider_failure_count.get(provider_name, 0) + 1
        
        # Rotate based on provider
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

    # ---------------- Safe Generation ---------------- #
    async def safe_generate(self, prompt: str, **kwargs) -> Any:
        """
        Safely generate response with automatic fallback across providers.
        Tries all configured providers until one succeeds.
        """
        chain = self.get_llm_chain()
        
        if not chain:
            raise HTTPException(
                status_code=500, 
                detail="No LLM providers configured"
            )
        
        last_error = None
        
        for provider_name, llm_func in chain:
            try:
                logger.info(f"Attempting generation with {provider_name}")
                llm = llm_func()
                
                # Generate response
                if hasattr(llm, "ainvoke"):
                    result = await llm.ainvoke(prompt)
                else:
                    result = llm.invoke(prompt)
                
                # Track success
                self.provider_success_count[provider_name] = self.provider_success_count.get(provider_name, 0) + 1
                logger.info(f"Successfully generated response using {provider_name}")
                
                return result
                
            except Exception as e:
                last_error = e
                self._handle_provider_error(provider_name, e)
                
                # Don't retry if it's an auth error
                if self._is_auth_error(e):
                    logger.error(f"Authentication error with {provider_name}, skipping...")
                    continue
                
                # Continue to next provider
                logger.info(f"Falling back from {provider_name} to next provider...")
                continue
        
        # All providers failed
        logger.error("All LLM providers failed")
        raise HTTPException(
            status_code=500, 
            detail=f"All LLM providers failed. Last error: {str(last_error)}"
        )

    def get_llm(self):
        """
        Get LLM instance based on configured provider.
        If provider is 'auto', returns the first available provider.
        """
        if self.provider == "auto":
            chain = self.get_llm_chain()
            if not chain:
                raise HTTPException(
                    status_code=500, 
                    detail="No LLM providers configured"
                )
            _, llm_func = chain[0]
            return llm_func()
        
        provider_map = {
            "gemini": self.get_gemini,
            "openrouter": self.get_openrouter,
            "colab_mistral": self.get_colab_mistral,
            "huggingface": self.get_hf,
        }
        
        # Only add ollama to provider map if available
        if _OLLAMA_AVAILABLE:
            provider_map["ollama"] = self.get_ollama
        
        if self.provider not in provider_map:
            available_providers = ", ".join(provider_map.keys())
            raise HTTPException(
                status_code=500, 
                detail=f"Unknown or unavailable provider: {self.provider}. Available providers: {available_providers}"
            )
        
        return provider_map[self.provider]()

    def get_stats(self) -> Dict[str, Any]:
        """Get provider usage statistics"""
        return {
            "success_count": self.provider_success_count,
            "failure_count": self.provider_failure_count,
            "ollama_available": _OLLAMA_AVAILABLE,
            "current_indices": {
                "gemini_model": self.current_gemini_model_index,
                "gemini_key": self.current_gemini_key_index,
                "openrouter_model": self.current_openrouter_model_index,
                "openrouter_key": self.current_openrouter_key_index,
                "ollama": self.current_ollama_index,
                "hf_model": self.current_hf_model_index,
                "hf_key": self.current_hf_key_index,
                "colab": self.current_colab_index,
            }
        }