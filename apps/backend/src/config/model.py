try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

from .cohere_api_client import CohereEmbeddingClient
from .config import settings

_model = None

def get_embedding_model():
    global _model
    # UNCOMMMENT FOR PROD
    # if settings.COHERE_API_KEY:
    #     return CohereEmbeddingClient(api_keys=settings.COHERE_API_KEY)
    if SentenceTransformer is None:
        return None  
    if settings.VECTOR_MODEL == False:
        return None
    if _model is None:
        _model = SentenceTransformer(settings.VECTOR_MODEL)
    return _model
