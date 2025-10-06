# embedding_api_client.py
import httpx
import numpy as np
import time
import logging
from typing import List, Union, Optional
from .config import settings

logger = logging.getLogger(__name__)

class EmbeddingAPIClient:
    def __init__(self, embedding_api_url: Optional[str] = None):
        self.api_base_url = embedding_api_url or settings.EMBEDDING_API_URL
        
        if not self.api_base_url:
            raise ValueError("Embedding API URL must be provided either as parameter or in settings.EMBEDDING_API_URL")
        
        # Remove trailing slash if present
        self.api_base_url = self.api_base_url.rstrip('/')
        self.endpoint = f"{self.api_base_url}/api/v1/embeddings"
        self.health_endpoint = f"{self.api_base_url}/health"
        
        self.timeout = 180.0  # 3 minutes for cold starts
        self.max_retries = 3
        self.base_retry_delay = 15  # Start with 15s
        self.max_retry_delay = 60  # Cap at 60s
    
    def _get_retry_delay(self, attempt: int) -> int:
        """Calculate exponential backoff with jitter"""
        delay = min(self.base_retry_delay * (2 ** attempt), self.max_retry_delay)
        # Add jitter (±20%)
        import random
        jitter = delay * 0.2 * (random.random() - 0.5)
        return int(delay + jitter)
    
    def encode(
        self, 
        texts: Union[str, List[str]], 
        batch_size: int = 16,  # Reduced from 32 for memory safety
        normalize: bool = False
    ) -> np.ndarray:
        """
        Encode texts into embeddings using the API.
        Handles cold starts and retries automatically.
        
        Returns:
            np.ndarray: Single embedding (1D) for single text, or batch of embeddings (2D) for list
        """
        is_single_text = isinstance(texts, str)
        
        payload = {
            "texts": texts,
            "batch_size": batch_size,
            "normalize": normalize
        }
        
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(self.endpoint, json=payload)
                    
                    # Handle cold start - 502/503 means service is waking up
                    if response.status_code in [502, 503]:
                        if attempt < self.max_retries - 1:
                            wait_time = self._get_retry_delay(attempt)
                            logger.warning(
                                f"API cold-starting (HTTP {response.status_code}), "
                                f"waiting {wait_time}s... (attempt {attempt + 1}/{self.max_retries})"
                            )
                            time.sleep(wait_time)
                            continue
                        else:
                            raise Exception(
                                f"API unavailable after {self.max_retries} attempts. "
                                f"Status: {response.status_code}. The service may need manual restart."
                            )
                    
                    # Check for non-JSON responses (HTML error pages)
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' not in content_type:
                        if attempt < self.max_retries - 1:
                            wait_time = self._get_retry_delay(attempt)
                            logger.warning(
                                f"Received non-JSON response (status {response.status_code}), "
                                f"retrying in {wait_time}s... (attempt {attempt + 1}/{self.max_retries})"
                            )
                            time.sleep(wait_time)
                            continue
                        raise Exception(
                            f"API returned HTML instead of JSON (status: {response.status_code}). "
                            f"The service may be down or misconfigured. Response: {response.text[:200]}"
                        )
                    
                    # Raise for other HTTP errors
                    response.raise_for_status()
                    
                    # Parse response
                    data = response.json()
                    
                    if "embeddings" not in data:
                        raise Exception(f"Invalid API response: missing 'embeddings' field. Got: {list(data.keys())}")
                    
                    embeddings = np.array(data["embeddings"], dtype=np.float32)
                    
                    # Validate embeddings
                    if embeddings.size == 0:
                        raise Exception("API returned empty embeddings")
                    
                    # Validate dimensions match expected (384 for your models)
                    expected_dim = 384
                    actual_dim = embeddings.shape[-1] if embeddings.ndim > 1 else len(embeddings)
                    if actual_dim != expected_dim:
                        logger.warning(
                            f"Embedding dimension mismatch: expected {expected_dim}, got {actual_dim}"
                        )
                    
                    # Return single embedding if single text was provided
                    if is_single_text:
                        return embeddings[0]
                    return embeddings
                    
            except httpx.TimeoutException as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"Request timeout after {self.timeout}s, "
                        f"retrying in {wait_time}s... (attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(wait_time)
                    continue
                raise Exception(
                    f"API timeout after {self.timeout}s and {self.max_retries} attempts. "
                    f"The service may be overloaded or unresponsive: {str(e)}"
                )
                
            except httpx.HTTPStatusError as e:
                last_error = e
                # Don't retry on 4xx client errors (except 429 rate limit)
                if 400 <= e.response.status_code < 500 and e.response.status_code != 429:
                    error_detail = e.response.text[:500] if e.response.text else "No error detail"
                    raise Exception(
                        f"API client error {e.response.status_code}: {error_detail}"
                    )
                
                # Retry on 5xx server errors and 429
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"API error {e.response.status_code}, "
                        f"retrying in {wait_time}s... (attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(wait_time)
                    continue
                    
                error_detail = e.response.text[:500] if e.response.text else "No error detail"
                raise Exception(f"API error {e.response.status_code}: {error_detail}")
                
            except httpx.RequestError as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"Connection error, retrying in {wait_time}s... "
                        f"(attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(wait_time)
                    continue
                raise Exception(
                    f"Failed to connect to embedding API at {self.api_base_url}: {str(e)}"
                )
                
            except (ValueError, KeyError) as e:
                # Don't retry on data parsing errors
                raise Exception(f"Failed to parse API response: {str(e)}")
                
            except Exception as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"Unexpected error, retrying in {wait_time}s... "
                        f"(attempt {attempt + 1}/{self.max_retries}): {str(e)}"
                    )
                    time.sleep(wait_time)
                    continue
                raise Exception(f"Embedding API error: {str(e)}")
        
        # If we've exhausted all retries
        raise Exception(
            f"Failed after {self.max_retries} attempts. Last error: {str(last_error)}"
        )
    
    async def encode_async(
        self, 
        texts: Union[str, List[str]], 
        batch_size: int = 16,
        normalize: bool = False
    ) -> np.ndarray:
        """
        Async version of encode with retry logic.
        """
        import asyncio
        
        is_single_text = isinstance(texts, str)
        
        payload = {
            "texts": texts,
            "batch_size": batch_size,
            "normalize": normalize
        }
        
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(self.endpoint, json=payload)
                    
                    # Handle cold start
                    if response.status_code in [502, 503]:
                        if attempt < self.max_retries - 1:
                            wait_time = self._get_retry_delay(attempt)
                            logger.warning(
                                f"API cold-starting (HTTP {response.status_code}), "
                                f"waiting {wait_time}s... (attempt {attempt + 1}/{self.max_retries})"
                            )
                            await asyncio.sleep(wait_time)
                            continue
                    
                    # Check content type
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' not in content_type:
                        if attempt < self.max_retries - 1:
                            wait_time = self._get_retry_delay(attempt)
                            logger.warning(
                                f"Received non-JSON response, retrying in {wait_time}s... "
                                f"(attempt {attempt + 1}/{self.max_retries})"
                            )
                            await asyncio.sleep(wait_time)
                            continue
                        raise Exception(
                            f"API returned HTML instead of JSON (status: {response.status_code})"
                        )
                    
                    response.raise_for_status()
                    
                    data = response.json()
                    
                    if "embeddings" not in data:
                        raise Exception(f"Invalid API response: missing 'embeddings' field")
                    
                    embeddings = np.array(data["embeddings"], dtype=np.float32)
                    
                    if embeddings.size == 0:
                        raise Exception("API returned empty embeddings")
                    
                    if is_single_text:
                        return embeddings[0]
                    return embeddings
                    
            except httpx.TimeoutException as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"Timeout, retrying in {wait_time}s... "
                        f"(attempt {attempt + 1}/{self.max_retries})"
                    )
                    await asyncio.sleep(wait_time)
                    continue
                raise Exception(f"API timeout after {self.timeout}s: {str(e)}")
                
            except httpx.HTTPStatusError as e:
                last_error = e
                if 400 <= e.response.status_code < 500 and e.response.status_code != 429:
                    raise Exception(
                        f"API client error {e.response.status_code}: {e.response.text[:500]}"
                    )
                
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"API error, retrying in {wait_time}s... "
                        f"(attempt {attempt + 1}/{self.max_retries})"
                    )
                    await asyncio.sleep(wait_time)
                    continue
                raise Exception(f"API error {e.response.status_code}: {e.response.text[:500]}")
                
            except httpx.RequestError as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"Connection error, retrying in {wait_time}s... "
                        f"(attempt {attempt + 1}/{self.max_retries})"
                    )
                    await asyncio.sleep(wait_time)
                    continue
                raise Exception(f"Failed to connect to embedding API: {str(e)}")
                
            except (ValueError, KeyError) as e:
                raise Exception(f"Failed to parse API response: {str(e)}")
                
            except Exception as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    wait_time = self._get_retry_delay(attempt)
                    logger.warning(
                        f"Error, retrying in {wait_time}s... "
                        f"(attempt {attempt + 1}/{self.max_retries}): {str(e)}"
                    )
                    await asyncio.sleep(wait_time)
                    continue
                raise Exception(f"Embedding API error: {str(e)}")
        
        raise Exception(
            f"Failed after {self.max_retries} attempts. Last error: {str(last_error)}"
        )
    
    def health_check(self) -> dict:
        """
        Check if the API is available and get its status.
        
        Returns:
            dict with status info or error details
        """
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(self.health_endpoint)
                
                if response.status_code == 200:
                    try:
                        return {
                            "available": True,
                            "status": response.json()
                        }
                    except Exception:
                        return {
                            "available": True,
                            "status": "healthy"
                        }
                else:
                    return {
                        "available": False,
                        "status_code": response.status_code,
                        "error": response.text[:200]
                    }
        except Exception as e:
            return {
                "available": False,
                "error": str(e)
            }