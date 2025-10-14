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
        # FIX: Updated to valid Gemini model names
        self.gemini_models: List[str] = self._parse_array_env(
            settings.LLM_MODELS, "LLM_MODELS"
        )
        # Validate and update model names
        self.gemini_models = self._validate_gemini_models(self.gemini_models)
        
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
        
        # Updated with October 2025 working free models
        # Allow custom list from env, fallback to defaults
        self.free_openrouter_models: List[str] = self._parse_array_env(
            getattr(settings, "OPENROUTER_FREE_MODELS", []),
            "OPENROUTER_FREE_MODELS"
        ) or [
            "deepseek/deepseek-r1:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "deepseek/deepseek-r1-distill-llama-70b:free"
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

        # ---------------- Provider Configuration ---------------- #
        self.provider = getattr(settings, "LLM_PROVIDER", "auto")
        self.allow_paid_models = getattr(settings, "ALLOW_PAID_MODELS", False)
        
        # Performance tracking
        self.provider_success_count = {}
        self.provider_failure_count = {}

    def _validate_gemini_models(self, models: List[str]) -> List[str]:
        """Validate and correct Gemini model names"""
        # Map of potentially incorrect names to correct ones
        model_mapping = {
            "gemini-1.5-flash": "gemini-1.5-flash-latest",
            "gemini-1.5-flash-8b": "gemini-1.5-flash-8b-latest",
            "gemini-2.0-flash-exp": "gemini-2.0-flash-exp"
        }
        
        validated = []
        for model in models:
            corrected = model_mapping.get(model, model)
            if corrected != model:
                logger.info(f"Correcting model name: {model} -> {corrected}")
            validated.append(corrected)
        
        return validated or ["gemini-1.5-flash-latest"]  # Default fallback

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
        if self.gemini_keys:
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
            max_new_tokens=4096,
            temperature=0.7
        )

    def get_llm_chain(self) -> List[Tuple[str, Callable]]:
        """FIX: Properly capture variables in closures"""
        chain = []

        # ---------------- Gemini (priority 1) ---------------- #
        if self.gemini_models and self.gemini_keys:
            for model in self.gemini_models:
                for key in self.gemini_keys:
                    # FIX: Use functools.partial or default arguments for proper closure
                    chain.append((
                        f"gemini:{model}:{key[:10]}...",
                        lambda m=model, k=key: ChatGoogleGenerativeAI(
                            model=m,
                            google_api_key=k,
                            temperature=0.7,
                            max_output_tokens=8192
                        )
                    ))

        # ---------------- OpenRouter (priority 2 - before HF for better reliability) ---------------- #
        if self.openrouter_keys or True:  # has free tier
            for model in self.free_openrouter_models:
                for key in (self.openrouter_keys or [None]):
                    chain.append((
                        f"openrouter:{model}",
                        lambda m=model, k=key: ChatOpenAI(
                            model=m,
                            api_key=k,
                            base_url=self.openrouter_base_url,
                            temperature=0.7,
                            max_tokens=4096
                        )
                    ))

        # ---------------- HuggingFace (priority 3) ---------------- #
        if self.hf_models and self.hf_keys:
            for model in self.hf_models:
                for key in self.hf_keys:
                    chain.append((
                        f"huggingface:{model}",
                        lambda m=model, k=key: HuggingFaceEndpoint(
                            repo_id=m,
                            huggingfacehub_api_token=k,
                            task="text-generation",
                            max_new_tokens=4096,
                            temperature=0.7
                        )
                    ))

        # ---------------- Ollama (priority 4) ---------------- #
        if _OLLAMA_AVAILABLE and (self.ollama_models or self.ollama_urls):
            max_instances = max(len(self.ollama_models), len(self.ollama_urls))
            for i in range(max_instances):
                model_idx = min(i, len(self.ollama_models) - 1) if self.ollama_models else 0
                url_idx = min(i, len(self.ollama_urls) - 1) if self.ollama_urls else 0
                
                model = self.ollama_models[model_idx] if self.ollama_models else "mistral:7b-instruct"
                url = self.ollama_urls[url_idx] if self.ollama_urls else "http://localhost:11434"
                
                chain.append((
                    f"ollama:{model}@{url}",
                    lambda m=model, u=url: OllamaLLM(base_url=u, model=m)
                ))

        # ---------------- Paid models (optional) ---------------- #
        if self.allow_paid_models:
            if self.gemini_keys:
                for key in self.gemini_keys:
                    chain.append((
                        "gemini_paid:gemini-2.0-flash-thinking-exp",
                        lambda k=key: ChatGoogleGenerativeAI(
                            model="gemini-2.0-flash-thinking-exp",
                            google_api_key=k,
                            temperature=0.7
                        )
                    ))

            if self.openrouter_keys:
                for key in self.openrouter_keys:
                    chain.append((
                        "openrouter_paid:anthropic/claude-3-5-sonnet",
                        lambda k=key: ChatOpenAI(
                            model="anthropic/claude-3-5-sonnet",
                            api_key=k,
                            base_url=self.openrouter_base_url,
                            temperature=0.7
                        )
                    ))

        return chain

    # ---------------- Error Handling ---------------- #
    def _is_rate_limit_error(self, error: Exception) -> bool:
        """Check if error is a rate limit error"""
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in [
            "429", "rate limit", "quota", "too many requests", "resource exhausted",
            "temporarily rate-limited"
        ])

    def _is_auth_error(self, error: Exception) -> bool:
        """Check if error is an authentication error"""
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in [
            "401", "403", "unauthorized", "forbidden", "invalid api key", 
            "authentication", "invalid or unauthorized"
        ])

    def _is_model_not_found_error(self, error: Exception) -> bool:
        """Check if error is a model not found error"""
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in [
            "404", "not found", "model not found", "is not found for api version"
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
        elif provider_name.startswith("ollama"):
            self._rotate_ollama()
        elif provider_name.startswith("huggingface"):
            self._rotate_hf()

    # ---------------- Safe Generation ---------------- #
    async def safe_generate(self, prompt: str, **kwargs) -> Any:
        """Generate response with automatic fallback across providers"""
        chain = self.get_llm_chain()
        
        if not chain:
            raise HTTPException(
                status_code=500, 
                detail="No LLM providers configured"
            )
        
        last_error = None
        errors_by_type = {
            'rate_limit': [],
            'auth': [],
            'model_not_found': [],
            'other': []
        }
        
        for provider_name, llm_func in chain:
            try:
                logger.info(f"Attempting generation with {provider_name}")
                llm = llm_func()
                
                # Generate response
                if hasattr(llm, "ainvoke"):
                    result = await llm.ainvoke(prompt)
                elif hasattr(llm, "invoke"):
                    result = llm.invoke(prompt)
                else:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"LLM {provider_name} does not support invoke or ainvoke"
                    )
                
                # Track success
                self.provider_success_count[provider_name] = \
                    self.provider_success_count.get(provider_name, 0) + 1
                logger.info(f"✓ Successfully generated response using {provider_name}")
                
                return result
                
            except Exception as e:
                last_error = e
                error_msg = str(e)
                
                # Categorize error
                if self._is_rate_limit_error(e):
                    errors_by_type['rate_limit'].append(provider_name)
                    logger.warning(f"✗ Rate limit hit on {provider_name}")
                elif self._is_auth_error(e):
                    errors_by_type['auth'].append(provider_name)
                    logger.error(f"✗ Auth error on {provider_name}")
                elif self._is_model_not_found_error(e):
                    errors_by_type['model_not_found'].append(provider_name)
                    logger.error(f"✗ Model not found on {provider_name}")
                else:
                    errors_by_type['other'].append(provider_name)
                    logger.error(f"✗ Error on {provider_name}: {error_msg[:200]}")
                
                self._handle_provider_error(provider_name, e)
                
                # Continue to next provider
                continue
        
        # All providers failed - provide detailed error
        error_summary = []
        if errors_by_type['rate_limit']:
            error_summary.append(f"Rate limited: {', '.join(errors_by_type['rate_limit'])}")
        if errors_by_type['auth']:
            error_summary.append(f"Auth failed: {', '.join(errors_by_type['auth'])}")
        if errors_by_type['model_not_found']:
            error_summary.append(f"Model not found: {', '.join(errors_by_type['model_not_found'])}")
        if errors_by_type['other']:
            error_summary.append(f"Other errors: {', '.join(errors_by_type['other'])}")
        
        logger.error(f"All LLM providers failed. {' | '.join(error_summary)}")
        
        raise HTTPException(
            status_code=503,  # Service Unavailable
            detail=f"All LLM providers failed. {' | '.join(error_summary)}. Last error: {str(last_error)[:200]}"
        )

    def get_llm(self):
        """Get a single LLM instance"""
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
            "huggingface": self.get_hf,
        }
        
        # Only add ollama to provider map if available
        if _OLLAMA_AVAILABLE:
            provider_map["ollama"] = self.get_ollama
        
        if self.provider not in provider_map:
            available_providers = ", ".join(provider_map.keys())
            raise HTTPException(
                status_code=500, 
                detail=f"Unknown or unavailable provider: {self.provider}. Available: {available_providers}"
            )
        
        return provider_map[self.provider]()

    def get_stats(self) -> Dict[str, Any]:
        """Get provider usage statistics"""
        return {
            "success_count": self.provider_success_count,
            "failure_count": self.provider_failure_count,
            "ollama_available": _OLLAMA_AVAILABLE,
            "configured_providers": {
                "gemini_models": len(self.gemini_models),
                "gemini_keys": len(self.gemini_keys),
                "openrouter_keys": len(self.openrouter_keys),
                "hf_models": len(self.hf_models),
                "hf_keys": len(self.hf_keys),
                "ollama_instances": max(len(self.ollama_models), len(self.ollama_urls))
            },
            "current_indices": {
                "gemini_model": self.current_gemini_model_index,
                "gemini_key": self.current_gemini_key_index,
                "openrouter_model": self.current_openrouter_model_index,
                "openrouter_key": self.current_openrouter_key_index,
                "ollama": self.current_ollama_index,
                "hf_model": self.current_hf_model_index,
                "hf_key": self.current_hf_key_index
            }
        }