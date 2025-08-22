from sqlalchemy.orm import Session
from sqlalchemy import select
from sentence_transformers import SentenceTransformer

from ..models.syllabus_models import TopicModel
from ...config.config import settings


class SQLLMRepo:
    def __init__(self, db: Session):
        self.db = db
        self.model = SentenceTransformer(settings.VECTOR_MODEL)

    async def fetch_relevant_topics(self, query: str, top_k: int = 10):
        query_embedding = self.model.encode(query).tolist()

        stmt = (
            select(TopicModel)
            .order_by(TopicModel.embedding.cosine_distance(query_embedding))
            .limit(top_k)
        )

        result = self.db.execute(stmt)
        return result.scalars().all()
