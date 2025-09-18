from sqlalchemy.orm import Session, joinedload
from sentence_transformers import SentenceTransformer

from ..models.exam_paper_models import ExamPaperModel, SubpartModel, QuestionModel, SectionModel
from ...core.entities.exam_paper_entities import ExamPaperCreate, ExamPaper
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
                ai_generated=exam_paper_data.exam.ai_generated,  
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
                        figure=getattr(q, "figure", None),  
                    )

                    for sp in q.subparts:
                        text_to_embed = sp.question
                        if getattr(sp, "options", None):
                            text_to_embed += " " + " ".join(sp.options)

                        subpart_refs.append((question, sp))
                        subpart_texts.append(text_to_embed)

                    section.questions.append(question)
                exam.sections.append(section)

            # Generate embeddings for subparts
            if subpart_texts:
                embeddings = self.model.encode(subpart_texts, batch_size=32)
                import numpy as np
                embeddings = [(e / np.linalg.norm(e)).tolist() for e in embeddings]  

                for (question, sp), emb in zip(subpart_refs, embeddings):
                    subpart = SubpartModel(
                        sub_id=sp.id,
                        question_text=sp.question,
                        options=getattr(sp, "options", None),
                        tags=getattr(sp, "tags", None),
                        difficulty=getattr(sp, "difficulty", None),
                        figure=getattr(sp, "figure", None),  
                        embedding=emb
                    )
                    question.subparts.append(subpart)

            self.db.add(exam)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            raise e

    async def get_exam_paper_json(self, subject: str, year: int) -> ExamPaper:
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

    async def get_exam_paper_boards(self) -> list[str]:
        boards = self.db.query(ExamPaperModel.board).distinct().all()
        return [b[0] for b in boards]

    async def get_exam_paper_subjects(self) -> list[str]:
        subjects = self.db.query(ExamPaperModel.subject).distinct().all()
        return [s[0] for s in subjects]

    async def get_exam_paper_prev_years(self, subject: str) -> list[int]:
        years = (
            self.db.query(ExamPaperModel.year)
            .filter(ExamPaperModel.subject == subject, ExamPaperModel.ai_generated == False)
            .all()
        )
        return [y[0] for y in years]

    async def get_prev_year_exam_paper(self, subject: str, year: int) -> ExamPaper:
        exam = (
            self.db.query(ExamPaperModel)
            .options(
                joinedload(ExamPaperModel.sections)
                .joinedload(SectionModel.questions)
                .joinedload(QuestionModel.subparts)
            )
            .filter(
                ExamPaperModel.subject == subject,
                ExamPaperModel.year == year,
                ExamPaperModel.ai_generated == False
            )
            .first()
        )

        if not exam:
            return None

        return ExamPaper.model_validate(exam)