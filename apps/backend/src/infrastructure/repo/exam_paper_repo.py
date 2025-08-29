from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import joinedload

from ...core.entities.exam_paper_entities import ExamPaperCreate, ExamPaper

from ..models.exam_paper_models import ExamPaperModel,SubpartModel, QuestionModel,SectionModel

from ...config.config import settings


class SQLExamPaperRepo:
    def __init__(self, db: Session):
        self.db = db
        self.model = SentenceTransformer(settings.VECTOR_MODEL) 
    
    async def create_exam_paper(self, exam_paper_data: ExamPaperCreate) -> bool:
        try:
            exam = ExamPaperModel(
                board=exam_paper_data.exam.board,
                subject=exam_paper_data.exam.subject,
                paper=exam_paper_data.exam.paper,
                code=exam_paper_data.exam.code,
                year=exam_paper_data.exam.year,
                max_marks=exam_paper_data.exam.max_marks,
                time_allowed=exam_paper_data.exam.time_allowed,
                instructions=exam_paper_data.exam.instructions,
            )

           
            subpart_texts = []
            subpart_refs = [] 

            for sec in exam_paper_data.sections:
                section = SectionModel(name=sec.name, marks=sec.marks)

                for q in sec.questions:
                    question = QuestionModel(
                        number=q.number,
                        type=q.type,
                        marks=q.marks,
                        instruction=q.instruction,
                    )

                    for sp in q.subparts:
                        text_to_embed = sp.question
                        if getattr(sp, "options", None):
                            text_to_embed += " " + " ".join(sp.options)

                        subpart_refs.append((question, sp))
                        subpart_texts.append(text_to_embed)

                    section.questions.append(question)
                exam.sections.append(section)

            
            if subpart_texts:
                embeddings = self.model.encode(subpart_texts, batch_size=32)
                import numpy as np
                embeddings = [ (e / np.linalg.norm(e)).tolist() for e in embeddings ]  # normalize

                # Map embeddings back to subparts
                for (question, sp), emb in zip(subpart_refs, embeddings):
                    subpart = SubpartModel(
                        sub_id=sp.id,
                        question_text=sp.question,
                        options=getattr(sp, "options", None),
                        tags=getattr(sp, "tags", None),
                        difficulty=getattr(sp, "difficulty", None),
                        embedding=emb
                    )
                    question.subparts.append(subpart)

            self.db.add(exam)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            raise e

    async def create_exam_paper_json(self, subject: str, year: int) -> ExamPaper:
        exam = (
            self.db.query(ExamPaperModel)
            .options(
                joinedload(ExamPaperModel.sections)
                .joinedload(SectionModel.questions)
                .joinedload(QuestionModel.subparts)
            )
            .filter(
                ExamPaperModel.subject == subject,
                ExamPaperModel.year == year
            )
            .first()
        )

        if not exam:
            return None

        return ExamPaper.model_validate(exam)