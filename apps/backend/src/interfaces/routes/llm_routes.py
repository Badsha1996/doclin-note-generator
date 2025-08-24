import json
from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException
import re
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from ...database.database import get_DB
from ...infrastructure.models.exam_paper_models import SubpartModel,ExamPaperModel,SectionModel,QuestionModel
from ...LLMs.LLMs import LLMProviderManager


llm_router = APIRouter(prefix="/llm", tags=["llm"])


@llm_router.post('/gen-question-paper')
async def generate_question_paper(
    db: Session = Depends(get_DB)
):
    try: 
        model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")       
        query_text = f"Physics exam questions"
        emb = model.encode(query_text).tolist()

        # Step 2: Retrieve most relevant old questions
        stmt = (
            select(SubpartModel)
            .join(QuestionModel)
            .join(SectionModel)
            .join(ExamPaperModel)
            .where(ExamPaperModel.subject == "Physics")
            .order_by(SubpartModel.embedding.cosine_distance(emb))
            .limit(20)
        )
        results = db.execute(stmt).scalars().all()

        old_questions = [
            {
                "id": str(sub.id),
                "text": sub.question_text,
                "options": sub.options or [],
                "tags": sub.tags or [],
                "difficulty": sub.difficulty or ""
            }
            for sub in results
        ]
        system_prompt = f"""
        You are an expert exam paper generator for board exams.
        Generate a NEW exam paper in JSON format.

        Requirements:
        - board: ICSE,
        - subject: Physics,
        - paper: Science Paper 1,
        - code: 521 SCI1,
        - year: 2023,
        - max_marks: 80,
        - time_allowed: Two hours,
        - instructions: [
        - Answers to this Paper must be written on the paper provided separately.,
        - You will not be allowed to write during first 15 minutes.,
        - This time is to be spent in reading the question paper.,
        - The time given at the head of this Paper is the time allowed for writing the answers.,
        - Section A is compulsory.,
        - Attempt any four questions from Section B.,
        - The intended marks for questions or parts of questions are given in brackets [ ].
        ]

        Old Questions (for inspiration, do not copy-paste):
        {json.dumps(old_questions, indent=2)}

        Rules:
        1. Use the same JSON schema as provided in the example:
        {{
            "exam": {{...}},
            "sections": [
            {{
                "name": "...",
                "marks": ...,
                "questions": [
                {{
                    "number": ...,
                    "type": "...",
                    "marks": ...,
                    "instruction": "...",
                    "subparts": [
                        {{"id": "x.i", "question": "...", "options": ["...", "..."]}}
                    ]
                }}
                ]
            }}
            ]
        }}
        2. Mix and match some old style questions (concepts from past exams) but rewrite them freshly.
        3. At least 30% of questions must be completely new.
        4. Output ONLY valid JSON. Do not include commentary.
            """

        llm = LLMProviderManager().get_llm()
        raw_output = llm.invoke(system_prompt)

        # Try to parse JSON
        try:
            match = re.search(r"\{.*\}", raw_output, re.DOTALL)
            if match:
                paper_json = json.loads(match.group(0))
            else:

                raise ValueError("No valid JSON found in model output")
        except json.JSONDecodeError:
            return {"error": "Model output was not valid JSON", "raw": raw_output}

        return paper_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
