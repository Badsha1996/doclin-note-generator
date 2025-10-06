# cohere_embedding_client.py
import cohere
import numpy as np
import time
import logging
from typing import List, Union, Optional
from .config import settings

logger = logging.getLogger(__name__)

class CohereEmbeddingClient:
    def __init__(self, api_keys: Optional[List[str]] = None):
        self.api_keys = api_keys or settings.COHERE_API_KEY
        
        if not self.api_keys:
            raise ValueError("Cohere API keys must be provided either as parameter or in settings.COHERE_API_KEY")
        
        # Ensure it's a list
        if isinstance(self.api_keys, str):
            self.api_keys = [self.api_keys]
        
        if not self.api_keys:
            raise ValueError("At least one Cohere API key must be provided")
        
        # Initialize clients for all keys
        self.clients = [cohere.Client(key) for key in self.api_keys]
        self.current_key_index = 0
        
        # Fixed model
        self.model = "embed-english-light-v3.0"
        self.embedding_dim = 384
        
        # Retry settings
        self.max_retries = 3
        self.base_retry_delay = 2
        self.max_retry_delay = 30
        
        # Fallback: random embeddings when all else fails
        self.fallback_enabled = True
        
        logger.info(f"🔑 Initialized with {len(self.api_keys)} API key(s)")
    
    def _get_retry_delay(self, attempt: int) -> float:
        """Calculate exponential backoff with jitter"""
        delay = min(self.base_retry_delay * (2 ** attempt), self.max_retry_delay)
        import random
        jitter = delay * 0.2 * (random.random() - 0.5)
        return delay + jitter
    
    def _get_next_client(self) -> cohere.Client:
        """Get next client in rotation"""
        client = self.clients[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.clients)
        return client
    
    def _rotate_to_next_key(self):
        """Rotate to next API key"""
        old_index = self.current_key_index
        self.current_key_index = (self.current_key_index + 1) % len(self.clients)
        logger.info(f"🔄 Rotating from key {old_index + 1} to key {self.current_key_index + 1}")
    
    def _generate_fallback_embedding(self, text: str) -> np.ndarray:
        """
        Generate a deterministic fallback embedding based on text hash.
        This ensures same text always gets same embedding.
        """
        import hashlib
        
        # Create deterministic seed from text
        text_hash = hashlib.md5(text.encode()).hexdigest()
        seed = int(text_hash[:8], 16)
        
        # Generate deterministic random embedding
        rng = np.random.RandomState(seed)
        embedding = rng.randn(self.embedding_dim).astype(np.float32)
        
        # Normalize to unit length (like real embeddings)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        
        return embedding
    
    def _generate_fallback_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate fallback embeddings for a batch of texts"""
        return np.array([self._generate_fallback_embedding(text) for text in texts])
    
    def encode(
        self, 
        texts: Union[str, List[str]], 
        input_type: str = "search_document",
        normalize: bool = True
    ) -> np.ndarray:
        """
        Encode texts into embeddings using Cohere API with key rotation.
        ALWAYS returns embeddings - uses fallback if all API keys fail.
        
        Args:
            texts: Single text or list of texts
            input_type: Type of input for optimization
                - "search_document": For documents to search over
                - "search_query": For search queries
                - "classification": For classification tasks
                - "clustering": For clustering tasks
            normalize: Whether to normalize embeddings (recommended)
        
        Returns:
            np.ndarray: Single embedding (1D) for single text, or batch (2D) for list
        """
        is_single_text = isinstance(texts, str)
        text_list = [texts] if is_single_text else texts
        
        # Handle empty input
        if not text_list or all(not t.strip() for t in text_list):
            logger.warning("Empty texts provided, returning zero embeddings")
            if is_single_text:
                return np.zeros(self.embedding_dim, dtype=np.float32)
            return np.zeros((len(text_list), self.embedding_dim), dtype=np.float32)
        
        last_error = None
        keys_tried = set()
        
        # Try all available keys
        for key_attempt in range(len(self.api_keys)):
            client = self._get_next_client()
            current_key_num = (self.current_key_index - 1) % len(self.clients) + 1
            keys_tried.add(current_key_num)
            
            # For each key, try with retries
            for attempt in range(self.max_retries):
                try:
                    # Call Cohere API
                    response = client.embed(
                        texts=text_list,
                        model=self.model,
                        input_type=input_type
                    )
                    
                    # Extract embeddings
                    embeddings = np.array(response.embeddings, dtype=np.float32)
                    
                    # Normalize if requested
                    if normalize:
                        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
                        norms = np.where(norms > 0, norms, 1)  # Avoid division by zero
                        embeddings = embeddings / norms
                    
                    # Validate embeddings
                    if embeddings.size == 0:
                        raise Exception("API returned empty embeddings")
                    
                    # Success! Log if we had to switch keys
                    if len(keys_tried) > 1 or attempt > 0:
                        logger.info(
                            f"✅ Success using key {current_key_num} "
                            f"(attempt {attempt + 1}, tried keys: {sorted(keys_tried)})"
                        )
                    
                    # Return single embedding if single text
                    if is_single_text:
                        return embeddings[0]
                    return embeddings
                    
                except cohere.error.CohereAPIError as e:
                    last_error = e
                    error_msg = str(e).lower()
                    
                    # Handle rate limit - try next key immediately
                    if "rate limit" in error_msg or "429" in error_msg:
                        logger.warning(
                            f"⚠️ Key {current_key_num} rate limited. "
                            f"Trying next key..."
                        )
                        break  # Break retry loop, try next key
                    
                    # Handle quota exceeded - try next key immediately
                    if "quota" in error_msg or "limit exceeded" in error_msg:
                        logger.warning(
                            f"⚠️ Key {current_key_num} quota exceeded. "
                            f"Trying next key..."
                        )
                        break  # Break retry loop, try next key
                    
                    # Handle invalid API key - try next key immediately
                    if "invalid" in error_msg or "unauthorized" in error_msg or "401" in error_msg:
                        logger.warning(
                            f"⚠️ Key {current_key_num} invalid. "
                            f"Trying next key..."
                        )
                        break  # Break retry loop, try next key
                    
                    # Handle other API errors with retry
                    if attempt < self.max_retries - 1:
                        wait_time = self._get_retry_delay(attempt)
                        logger.warning(
                            f"⚠️ Key {current_key_num} error: {str(e)[:100]}, "
                            f"retrying in {wait_time:.1f}s... (attempt {attempt + 1}/{self.max_retries})"
                        )
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.warning(
                            f"⚠️ Key {current_key_num} failed after {self.max_retries} attempts. "
                            f"Trying next key..."
                        )
                        break  # Try next key
                
                except cohere.error.CohereConnectionError as e:
                    last_error = e
                    if attempt < self.max_retries - 1:
                        wait_time = self._get_retry_delay(attempt)
                        logger.warning(
                            f"⚠️ Connection error with key {current_key_num}, "
                            f"retrying in {wait_time:.1f}s... (attempt {attempt + 1}/{self.max_retries})"
                        )
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.warning(
                            f"⚠️ Key {current_key_num} connection failed. "
                            f"Trying next key..."
                        )
                        break  # Try next key
                
                except Exception as e:
                    last_error = e
                    if attempt < self.max_retries - 1:
                        wait_time = self._get_retry_delay(attempt)
                        logger.warning(
                            f"⚠️ Unexpected error with key {current_key_num}: {str(e)[:100]}, "
                            f"retrying in {wait_time:.1f}s... (attempt {attempt + 1}/{self.max_retries})"
                        )
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.warning(
                            f"⚠️ Key {current_key_num} failed: {str(e)[:100]}. "
                            f"Trying next key..."
                        )
                        break  # Try next key
        
        # If we reach here, all keys failed - use fallback
        if self.fallback_enabled:
            logger.error(
                f"❌ All {len(self.api_keys)} API key(s) exhausted. "
                f"Using fallback embeddings (hash-based, deterministic) for {len(text_list)} texts"
            )
            embeddings = self._generate_fallback_embeddings(text_list)
            
            if is_single_text:
                return embeddings[0]
            return embeddings
        else:
            # If fallback disabled, raise the error
            raise Exception(
                f"All {len(self.api_keys)} Cohere API key(s) failed. "
                f"Last error: {str(last_error)}"
            )
    
    async def encode_async(
        self, 
        texts: Union[str, List[str]], 
        input_type: str = "search_document",
        normalize: bool = True
    ) -> np.ndarray:
        """
        Async version with same key rotation and fallback guarantees.
        """
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            return await loop.run_in_executor(
                executor,
                lambda: self.encode(texts, input_type, normalize)
            )
    
    def health_check(self) -> dict:
        """
        Check health of all API keys.
        """
        key_statuses = []
        
        for idx, client in enumerate(self.clients):
            key_num = idx + 1
            try:
                # Test with a simple embedding
                response = client.embed(
                    texts=["test"],
                    model=self.model,
                    input_type="search_document"
                )
                
                key_statuses.append({
                    "key": key_num,
                    "available": True,
                    "status": "healthy"
                })
                
            except cohere.error.CohereAPIError as e:
                error_msg = str(e).lower()
                
                if "rate limit" in error_msg or "429" in error_msg:
                    status = "rate_limited"
                    error = "API rate limit reached"
                elif "quota" in error_msg:
                    status = "quota_exceeded"
                    error = "Monthly API quota exceeded"
                elif "invalid" in error_msg or "unauthorized" in error_msg:
                    status = "invalid_key"
                    error = "Invalid API key"
                else:
                    status = "error"
                    error = str(e)[:100]
                
                key_statuses.append({
                    "key": key_num,
                    "available": False,
                    "status": status,
                    "error": error
                })
                
            except Exception as e:
                key_statuses.append({
                    "key": key_num,
                    "available": False,
                    "status": "error",
                    "error": str(e)[:100]
                })
        
        # Overall status
        healthy_keys = sum(1 for k in key_statuses if k["available"])
        
        return {
            "total_keys": len(self.api_keys),
            "healthy_keys": healthy_keys,
            "overall_status": "healthy" if healthy_keys > 0 else "all_keys_failed",
            "keys": key_statuses,
            "model": self.model,
            "embedding_dim": self.embedding_dim,
            "fallback_available": self.fallback_enabled
        }
    
    def get_usage_info(self) -> dict:
        """
        Get information about API usage and limits.
        """
        return {
            "total_keys": len(self.api_keys),
            "current_key": self.current_key_index + 1,
            "model": self.model,
            "embedding_dim": self.embedding_dim,
            "plan": "trial (per key)",
            "limits_per_key": {
                "calls_per_minute": 100,
                "calls_per_month": 1000
            },
            "theoretical_total_monthly_calls": len(self.api_keys) * 1000,
            "fallback_enabled": self.fallback_enabled,
            "recommendation": "Keys rotate automatically on rate limits/quota exhaustion"
        }