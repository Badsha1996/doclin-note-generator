from ...core.repo.syllabus_repo import SyllabusRepo
from ...core.entities.syllabus_entities import SyllabusCreate, Syllabus
from ..models.syllabus_models import SyllabusModel, UnitModel, TopicModel
from sqlalchemy.orm import Session
from ...config.config import settings
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import joinedload
from typing import Optional

class SQLSyllabusRepo(SyllabusRepo):
    def __init__(self, db: Session):
        self.db = db
        self.model = SentenceTransformer(settings.VECTOR_MODEL)  

    async def create_syllabus(self, syllabus_data: SyllabusCreate) -> bool:
        db_syllabus = SyllabusModel(
            subject=syllabus_data.subject,
            version_date=syllabus_data.version_date,
            units=[]
        )

        for unit in syllabus_data.units:
            db_unit = UnitModel(
                unit_id=unit.unit_id,
                title=unit.title,
                syllabus=db_syllabus,
                topics=[]
            )

            for topic in unit.topics:
                # Embedding 
                text_for_embedding = " ".join(
                    [topic.title] 
                    + (topic.subtopics or []) 
                    + (topic.learning_objectives or [])
                )
                embedding_vector = self.model.encode(text_for_embedding).tolist()

                db_topic = TopicModel(
                    topic_id=topic.topic_id,
                    title=topic.title,
                    embedding=embedding_vector,
                    subtopics=topic.subtopics,
                    sources=topic.sources,
                    learning_objectives=topic.learning_objectives,
                    key_terms=topic.key_terms,
                    unit=db_unit
                )

                db_unit.topics.append(db_topic)

            db_syllabus.units.append(db_unit)

        self.db.add(db_syllabus)
        self.db.commit()
        self.db.refresh(db_syllabus)

        return True
    
    # async def create_json(self, subject: str) -> Optional[Syllabus]:
    #     syllabus = (
    #         self.db.query(SyllabusModel)
    #         .options(joinedload(SyllabusModel.units).joinedload(UnitModel.topics))
    #         .filter(SyllabusModel.subject == subject)
    #         .first()
    #     )

    #     if not syllabus:
    #         return None

    #     return Syllabus(
    #         subject=syllabus.subject,
    #         version_date=syllabus.version_date,
    #         units=[
    #             {
    #                 "unit_id": unit.unit_id,
    #                 "title": unit.title,
    #                 "topics": [
    #                     {
    #                         "topic_id": topic.topic_id,
    #                         "title": topic.title,
    #                         "subtopics": topic.subtopics or [],
    #                         "sources": topic.sources or [],
    #                         "learning_objectives": topic.learning_objectives or [],
    #                         "key_terms": topic.key_terms or []
    #                     }
    #                     for topic in unit.topics
    #                 ]
    #             }
    #             for unit in syllabus.units
    #         ]
    #     )


    async def create_json(self, subject: str) -> Optional[Syllabus]:
        syllabus = (
            self.db.query(SyllabusModel)
            .options(joinedload(SyllabusModel.units).joinedload(UnitModel.topics))
            .filter(SyllabusModel.subject == subject)
            .first()
        )

        if not syllabus:
            return None

        return Syllabus.model_validate(syllabus)
