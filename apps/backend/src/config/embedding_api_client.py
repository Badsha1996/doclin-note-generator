# embedding_api_client.py
import httpx
import numpy as np
import time
import logging
from typing import List, Union
from .config import settings

logger = logging.getLogger(__name__)

class EmbeddingAPIClient:
    def __init__(self, embedding_api_url):
        self.api_base_url = settings.EMBEDDING_API_URL or embedding_api_url
        self.endpoint = f"{self.api_base_url}/api/v1/embeddings"
        self.timeout = 180.0  # 3 minutes for cold starts + model loading
        self.max_retries = 3
        self.retry_delay = 30  # seconds
    
    def encode(
        self, 
        texts: Union[str, List[str]], 
        batch_size: int = 32,
        normalize: bool = False
    ) -> np.ndarray:
        """
        Encode texts into embeddings using the API.
        Handles cold starts and retries automatically.
        """
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
                            wait_time = self.retry_delay * (attempt + 1)
                            logger.warning(
                                f"API cold-starting (HTTP {response.status_code}), "
                                f"waiting {wait_time}s... (attempt {attempt + 1}/{self.max_retries})"
                            )
                            time.sleep(wait_time)
                            continue
                        else:
                            raise Exception(
                                f"API unavailable after {self.max_retries} attempts. "
                                f"Status: {response.status_code}"
                            )
                    
                    # Check for non-JSON responses (HTML error pages)
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' not in content_type:
                        if attempt < self.max_retries - 1:
                            logger.warning(
                                f"Received non-JSON response (status {response.status_code}), "
                                f"retrying... (attempt {attempt + 1}/{self.max_retries})"
                            )
                            time.sleep(self.retry_delay)
                            continue
                        raise Exception(
                            f"API returned HTML instead of JSON (status: {response.status_code}). "
                            f"The service may be down or misconfigured."
                        )
                    
                    # Raise for other HTTP errors
                    response.raise_for_status()
                    
                    # Parse response
                    data = response.json()
                    
                    if "embeddings" not in data:
                        raise Exception(f"Invalid API response: missing 'embeddings' field")
                    
                    embeddings = np.array(data["embeddings"])
                    
                    # Validate embeddings
                    if embeddings.size == 0:
                        raise Exception("API returned empty embeddings")
                    
                    # Return single embedding if single text was provided
                    if isinstance(texts, str):
                        return embeddings[0]
                    return embeddings
                    
            except httpx.TimeoutException as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    logger.warning(
                        f"Request timeout after {self.timeout}s, "
                        f"retrying... (attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(self.retry_delay)
                    continue
                raise Exception(
                    f"API timeout after {self.timeout}s. "
                    f"The service may be overloaded or cold-starting: {str(e)}"
                )
                
            except httpx.HTTPStatusError as e:
                last_error = e
                # Don't retry on 4xx client errors (except 429)
                if 400 <= e.response.status_code < 500 and e.response.status_code != 429:
                    raise Exception(f"API client error {e.response.status_code}: {e.response.text[:500]}")
                
                # Retry on 5xx server errors
                if attempt < self.max_retries - 1:
                    logger.warning(
                        f"API error {e.response.status_code}, "
                        f"retrying... (attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(self.retry_delay)
                    continue
                raise Exception(f"API error {e.response.status_code}: {e.response.text[:500]}")
                
            except httpx.RequestError as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    logger.warning(
                        f"Connection error, retrying... (attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(self.retry_delay)
                    continue
                raise Exception(f"Failed to connect to embedding API: {str(e)}")
                
            except Exception as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    logger.warning(
                        f"Unexpected error, retrying... (attempt {attempt + 1}/{self.max_retries}): {str(e)}"
                    )
                    time.sleep(self.retry_delay)
                    continue
                raise Exception(f"Embedding API error: {str(e)}")
        
        # If we've exhausted all retries
        raise Exception(
            f"Failed after {self.max_retries} attempts. Last error: {str(last_error)}"
        )
    
    async def encode_async(
        self, 
        texts: Union[str, List[str]], 
        batch_size: int = 32,
        normalize: bool = False
    ) -> np.ndarray:
        """
        Async version of encode with retry logic.
        """
        import asyncio
        
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
                            wait_time = self.retry_delay * (attempt + 1)
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
                            logger.warning(
                                f"Received non-JSON response, retrying... "
                                f"(attempt {attempt + 1}/{self.max_retries})"
                            )
                            await asyncio.sleep(self.retry_delay)
                            continue
                        raise Exception(
                            f"API returned HTML instead of JSON (status: {response.status_code})"
                        )
                    
                    response.raise_for_status()
                    
                    data = response.json()
                    
                    if "embeddings" not in data:
                        raise Exception(f"Invalid API response: missing 'embeddings' field")
                    
                    embeddings = np.array(data["embeddings"])
                    
                    if embeddings.size == 0:
                        raise Exception("API returned empty embeddings")
                    
                    if isinstance(texts, str):
                        return embeddings[0]
                    return embeddings
                    
            except httpx.TimeoutException as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    logger.warning(f"Timeout, retrying... (attempt {attempt + 1}/{self.max_retries})")
                    await asyncio.sleep(self.retry_delay)
                    continue
                raise Exception(f"API timeout after {self.timeout}s: {str(e)}")
                
            except httpx.HTTPStatusError as e:
                last_error = e
                if 400 <= e.response.status_code < 500 and e.response.status_code != 429:
                    raise Exception(f"API client error {e.response.status_code}: {e.response.text[:500]}")
                
                if attempt < self.max_retries - 1:
                    logger.warning(f"API error, retrying... (attempt {attempt + 1}/{self.max_retries})")
                    await asyncio.sleep(self.retry_delay)
                    continue
                raise Exception(f"API error {e.response.status_code}: {e.response.text[:500]}")
                
            except httpx.RequestError as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    logger.warning(f"Connection error, retrying... (attempt {attempt + 1}/{self.max_retries})")
                    await asyncio.sleep(self.retry_delay)
                    continue
                raise Exception(f"Failed to connect to embedding API: {str(e)}")
                
            except Exception as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    logger.warning(f"Error, retrying... (attempt {attempt + 1}/{self.max_retries}): {str(e)}")
                    await asyncio.sleep(self.retry_delay)
                    continue
                raise Exception(f"Embedding API error: {str(e)}")
        
        raise Exception(
            f"Failed after {self.max_retries} attempts. Last error: {str(last_error)}"
        )
    
    def health_check(self) -> bool:
        """Check if the API is available"""
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(f"{self.api_base_url}/health")
                return response.status_code == 200
        except Exception:
            return False