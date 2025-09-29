from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
from ...config.config import settings
from ...LLMs.LLMs import LLMProviderManager
from ...infrastructure.models.exam_paper_models import SubpartModel
from ...core.entities.exam_paper_entities import ExamInfo, ExamPaperCreate
from ...prompts.ICSE_questions import QUESTION_PAPER_PROMPT
from string import Template


embedding_model = SentenceTransformer(settings.VECTOR_MODEL)

class SQLLMRepo:
    def __init__(self, db: Session):
        self.db = db
        self.model = embedding_model
        self.llm_manager = LLMProviderManager()

    async def gen_new_exam_paper(
        self, llm, query_embedding, subject: str, board: str, paper: str, code: str, year: int
    ):
        similar_subparts = (
            self.db.query(SubpartModel)
            .filter(SubpartModel.embedding.isnot(None))
            .order_by(SubpartModel.embedding.cosine_distance(query_embedding))
            .limit(20)
            .all()
        )

        retrieval_context = [
            {
                "sub_id": sp.sub_id,
                "text": sp.question_text,
                "options": sp.options,
                "tags": sp.tags,
                "difficulty": sp.difficulty,
            }
            for sp in similar_subparts
        ]

        exampaper_schema = ExamPaperCreate.model_construct(
            exam=ExamInfo(
                board=board,
                subject=subject,
                paper=paper,
                code=code,
                year=year,
                max_marks= 80,
                time_allowed= "Two hours",
                instructions= [
                    "Answers to this Paper must be written on the paper provided separately.",
                    "You will not be allowed to write during first 15 minutes.",
                    "This time is to be spent in reading the question paper.",
                    "The time given at the head of this Paper is the time allowed for writing the answers.",
                    "Section A is compulsory.",
                    "Attempt any four questions from Section B.",
                    "The intended marks for questions or parts of questions are given in brackets [ ]."
                ],
            ),
            sections=[]
        ).model_dump_json(indent=2)


        prompt = QUESTION_PAPER_PROMPT.safe_substitute(
            board=board,
            subject=subject,
            paper=paper,
            code=code,
            year=year,
            exampaper_schema=exampaper_schema,
            retrieval_context=retrieval_context,
        )

        raw_output = await self.llm_manager.safe_generate(llm, prompt=prompt)
        
        exam_json = self.llm_manager.safe_json_parse(raw_output)
        exam_json = self.llm_manager.normalize_exam_json(exam_json)
        
        return ExamPaperCreate.model_validate(exam_json)
