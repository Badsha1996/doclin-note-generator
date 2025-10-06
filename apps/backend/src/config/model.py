try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

from .config import settings

_model = None

def get_embedding_model():
    global _model
    if SentenceTransformer is None:
        return None  
    if settings.VECTOR_MODEL == "":
        return None
    if _model is None:
        _model = SentenceTransformer(settings.VECTOR_MODEL)
    return _model
