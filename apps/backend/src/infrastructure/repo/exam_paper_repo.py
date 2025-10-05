from sqlalchemy.orm import Session, joinedload
import numpy as np

from ..models.exam_paper_models import ExamPaperModel, QuestionPartModel, SubPartModel, QuestionModel, SectionModel
from ...core.entities.exam_paper_entities import ExamPaperCreate, ExamPaper
from ...config.model import get_embedding_model


class SQLExamPaperRepo:
    def __init__(self, db: Session):
        self.db = db
        self.model = get_embedding_model()
    
    async def create_exam_paper(self, exam_paper_data: ExamPaperCreate) -> bool:
        try:
            exam = ExamPaperModel(
                board=exam_paper_data.exam.board,
                subject=exam_paper_data.exam.subject,
                paper_name=exam_paper_data.exam.paper_name,
                paper_code=exam_paper_data.exam.paper_code,
                year=exam_paper_data.exam.year,
                maximum_marks=exam_paper_data.exam.maximum_marks,
                time_allowed=exam_paper_data.exam.time_allowed,
                reading_time=getattr(exam_paper_data.exam, "reading_time", "15 minutes"),
                additional_instructions=exam_paper_data.exam.additional_instructions,
                ai_generated=getattr(exam_paper_data.exam, "ai_generated", False),
            )

            subpart_texts = []
            subpart_refs = []

            for sec_data in exam_paper_data.sections:
                section = SectionModel(
                    name=sec_data.name,
                    marks=sec_data.marks,
                    instruction=sec_data.instruction,
                    is_compulsory=sec_data.is_compulsory,
                )

                for q_data in sec_data.questions:
                    question = QuestionModel(
                        number=q_data.number,
                        title=q_data.title,
                        type=q_data.type,
                        total_marks=q_data.total_marks,
                        instruction=q_data.instruction,
                        question_text=q_data.question_text,
                        options=[opt.dict() for opt in getattr(q_data, "options", [])],
                        diagram=q_data.diagram.dict() if q_data.diagram else None,
                    )

                    for part_data in getattr(q_data, "parts", []):
                        part = QuestionPartModel(
                            number=part_data.number,
                            type=part_data.type,
                            marks=part_data.marks,
                            question_text=part_data.question,
                            description=part_data.description,
                            options=[opt.dict() for opt in part_data.options],
                            diagram=part_data.diagram.dict() if part_data.diagram else None,
                            formula_given=part_data.formula_given,
                            constants_given=part_data.constants_given,
                            column_a=part_data.column_a,
                            column_b=part_data.column_b,
                            items_to_arrange=part_data.items_to_arrange,
                            sequence_type=part_data.sequence_type,
                            statement_with_blanks=part_data.statement_with_blanks,
                            choices_for_blanks=part_data.choices_for_blanks,
                            equation_template=part_data.equation_template,
                            missing_parts=part_data.missing_parts,
                        )

                        # collect subparts for embedding
                        for sp_data in part_data.sub_parts:
                            text_to_embed = sp_data.question or ""
                            if sp_data.choices_given:
                                text_to_embed += " " + " ".join(sp_data.choices_given)

                            subpart_refs.append((part, sp_data))
                            subpart_texts.append(text_to_embed)

                        question.parts.append(part)

                    section.questions.append(question)

                exam.sections.append(section)

            # generate embeddings for subparts
            if subpart_texts:
                embeddings = self.model.encode(subpart_texts, batch_size=32)
                embeddings = [(e / np.linalg.norm(e)).tolist() for e in embeddings]

                for (part, sp_data), emb in zip(subpart_refs, embeddings):
                    subpart = SubPartModel(
                        letter=sp_data.letter,
                        question_text=sp_data.question,
                        marks=sp_data.marks,
                        diagram=sp_data.diagram.dict() if sp_data.diagram else None,
                        formula_given=sp_data.formula_given,
                        constants_given=sp_data.constants_given,
                        equation_template=sp_data.equation_template,
                        choices_given=sp_data.choices_given,
                        embedding=emb,
                    )
                    part.sub_parts.append(subpart)

            self.db.add(exam)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            raise e

    async def get_exam_paper_json(self, subject: str, year: int) -> ExamPaper | None:
        exam = (
            self.db.query(ExamPaperModel)
            .options(
                joinedload(ExamPaperModel.sections)
                .joinedload(SectionModel.questions)
                .joinedload(QuestionModel.parts)
                .joinedload(QuestionPartModel.sub_parts)
            )
            .filter(
                ExamPaperModel.subject == subject,
                ExamPaperModel.year == year
            )
            .first()
        )

        if not exam:
            return None

        return ExamPaper.model_validate(exam,from_attributes = True)
    
    async def get_exam_paper_boards(self) -> list[str]:
        boards = self.db.query(ExamPaperModel.board).distinct().all()
        return [b[0] for b in boards]

    async def get_exam_paper_subjects(self) -> list[str]:
        subjects = self.db.query(ExamPaperModel.subject).distinct().all()
        return [s[0] for s in subjects]

    async def get_exam_paper_prev_years(self, subject: str) -> list[int]:
        years = (
            self.db.query(ExamPaperModel.year)
            .filter(ExamPaperModel.subject == subject, ExamPaperModel.ai_generated.is_(False))
            .all()
        )
        return [y[0] for y in years]

    async def get_prev_year_exam_paper(self, subject: str, year: int) -> ExamPaper | None:
        exam = (
            self.db.query(ExamPaperModel)
            .options(
                joinedload(ExamPaperModel.sections)
                .joinedload(SectionModel.questions)
                .joinedload(QuestionModel.parts)
                .joinedload(QuestionPartModel.sub_parts)
            )
            .filter(
                ExamPaperModel.subject == subject,
                ExamPaperModel.year == year,
                ExamPaperModel.ai_generated.is_(False)
            )
            .first()
        )

        if not exam:
            return None

        return ExamPaper.model_validate(exam)
