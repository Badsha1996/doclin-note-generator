# embedding_api_client.py
import httpx
import numpy as np
from typing import List, Union
from .config import settings

class EmbeddingAPIClient:
    def __init__(self,embedding_api_url):
        self.api_base_url = settings.EMBEDDING_API_URL or embedding_api_url
        self.endpoint = f"{self.api_base_url}/api/v1/embeddings"
        self.timeout = 30.0
    
    def encode(
        self, 
        texts: Union[str, List[str]], 
        batch_size: int = 32,
        normalize: bool = False
    ) -> np.ndarray:
        payload = {
            "texts": texts,
            "batch_size": batch_size,
            "normalize": normalize
        }
        
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(self.endpoint, json=payload)
                response.raise_for_status()
                
                data = response.json()
                embeddings = np.array(data["embeddings"])
                
                # Return single embedding if single text was provided
                if isinstance(texts, str):
                    return embeddings[0]
                return embeddings
                
        except httpx.RequestError as e:
            raise Exception(f"Failed to connect to embedding API: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Embedding API error: {e.response.text}")
    
    async def encode_async(
        self, 
        texts: Union[str, List[str]], 
        batch_size: int = 32,
        normalize: bool = False
    ) -> np.ndarray:
        """Async version of encode"""
        payload = {
            "texts": texts,
            "batch_size": batch_size,
            "normalize": normalize
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.endpoint, json=payload)
                response.raise_for_status()
                
                data = response.json()
                embeddings = np.array(data["embeddings"])
                
                if isinstance(texts, str):
                    return embeddings[0]
                return embeddings
                
        except httpx.RequestError as e:
            raise Exception(f"Failed to connect to embedding API: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Embedding API error: {e.response.text}")