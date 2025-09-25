from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
from typing import List, Dict
import asyncio
import json
from uuid import uuid4

from ...config.config import settings
from ...LLMs.LLMs import LLMProviderManager
from ...core.entities.exam_paper_entities import ExamInfo, ExamPaperCreate, Section
from ...infrastructure.models.exam_paper_models import SubPartModel, QuestionPartModel, QuestionModel, SectionModel, ExamPaperModel

ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"]
VALID_DIAGRAM_TYPES = {
    "circuit_diagram", "ray_diagram", "force_diagram", "molecular_structure",
    "apparatus_setup", "anatomical_diagram", "cell_diagram", "system_diagram",
    "graph", "flowchart", "Others"
}

class SQLLMRepo:
    def __init__(self, db: Session):
        self.db = db
        self.model = SentenceTransformer(settings.VECTOR_MODEL)
        self.llm_manager = LLMProviderManager()
        self.max_retrieval_limit = 300
        self.context_per_section = 50

    def _get_roman_numeral(self, num: int) -> str:
        return ROMAN_NUMERALS[num - 1] if 1 <= num <= len(ROMAN_NUMERALS) else str(num)

    def _create_exam_info(self, subject: str, board: str, paper: str, code: str, year: int) -> ExamInfo:
        return ExamInfo(
            paper_code=code,
            subject=subject.lower(),
            paper_name=paper,
            year=year,
            board=board,
            maximum_marks=80,
            time_allowed="Two hours",
            reading_time="15 minutes",
            additional_instructions=[
                "Answers to this Paper must be written on the paper provided separately",
                "You will not be allowed to write during first 15 minutes",
                "This time is to be spent in reading the question paper",
                "The time given at the head of this Paper is the time allowed for writing the answers",
                "Section A is compulsory",
                "Attempt any four questions from Section B",
                "The intended marks for questions or parts of questions are given in brackets [ ]"
            ],
        )

    def _create_default_sections(self) -> List[Dict]:
        return [
            {
                "name": "Section A",
                "marks": 40,
                "instruction": "Attempt all questions from this Section",
                "is_compulsory": True,
                "questions": []
            },
            {
                "name": "Section B",
                "marks": 40,
                "instruction": "Attempt any four questions from this Section",
                "is_compulsory": False,
                "questions": []
            }
        ]

    def _normalize_diagram_types(self, sections: List[Dict]) -> List[Dict]:
        """Ensure diagram.type is always valid, default to 'Others'."""
        for section in sections:
            for question in section.get("questions", []):
                # Question-level diagram
                diag = question.get("diagram")
                if diag and diag.get("type") not in VALID_DIAGRAM_TYPES:
                    diag["type"] = "Others"
                # Parts-level diagram
                for part in question.get("parts", []):
                    diag = part.get("diagram")
                    if diag and diag.get("type") not in VALID_DIAGRAM_TYPES:
                        diag["type"] = "Others"
                    for sub in part.get("sub_parts", []):
                        diag = sub.get("diagram")
                        if diag and diag.get("type") not in VALID_DIAGRAM_TYPES:
                            diag["type"] = "Others"
        return sections

    def _validate_structure(self, sections: List[Dict]) -> List[Dict]:
        """Validate every question, part, sub-part, and diagram."""
        valid_sections = []
        for idx, section in enumerate(sections):
            section.setdefault("name", f"Section {chr(65+idx)}")
            section.setdefault("marks", 40)
            section.setdefault("instruction", "Attempt all questions")
            section.setdefault("is_compulsory", idx==0)
            section.setdefault("questions", [])

            valid_questions = []
            for q in section["questions"]:
                if not isinstance(q, dict):
                    continue
                q.setdefault("type", "short_answer")
                q.setdefault("total_marks", 1)
                q.setdefault("parts", [])
                q.setdefault("options", [])
                # Validate parts
                for pidx, part in enumerate(q.get("parts", [])):
                    if not isinstance(part, dict):
                        continue
                    part.setdefault("type", "short_answer")
                    part.setdefault("marks", 1)
                    part.setdefault("number", self._get_roman_numeral(pidx+1))
                    part.setdefault("sub_parts", [])
                    # Validate sub-parts
                    for sidx, sub in enumerate(part.get("sub_parts", [])):
                        if not isinstance(sub, dict):
                            continue
                        sub.setdefault("letter", chr(97+sidx))
                        sub.setdefault("question_text", "Sub-part question text")
                        diag = sub.get("diagram")
                        if diag and diag.get("type") not in VALID_DIAGRAM_TYPES:
                            diag["type"] = "Others"
                valid_questions.append(q)
            section["questions"] = valid_questions
            valid_sections.append(section)

        return self._normalize_diagram_types(valid_sections)


    def _prepare_retrieval_context(self, similar_subparts):
        """Prepare retrieval context from database subparts for LLM prompts."""
        retrieval_context = []
        for sp in similar_subparts:
            try:
                question_text = getattr(sp, "question_text", "").strip()
                if not question_text:
                    continue

                context_item = {
                    "sub_id": str(getattr(sp, "id", uuid4())),
                    "text": question_text,
                    "marks": getattr(sp, "marks", 1),
                    "choices_given": getattr(sp, "choices_given", []) or [],
                    "formula_given": getattr(sp, "formula_given", None),
                    "constants_given": getattr(sp, "constants_given", None),
                    "type": "subpart",
                }

                # Include parent part/question info if available
                part = getattr(sp, "part", None)
                if part:
                    context_item["part_type"] = getattr(part, "type", None)
                    context_item["part_marks"] = getattr(part, "marks", None)
                    question = getattr(part, "question", None)
                    if question:
                        context_item["question_type"] = getattr(question, "type", None)
                        context_item["question_title"] = getattr(question, "title", None)

                retrieval_context.append(context_item)
            except Exception as e:
                print(f"Error processing subpart {getattr(sp, 'id', 'unknown')}: {e}")
                continue
        return retrieval_context

    def _get_subparts_by_subject(self, subject: str, query_embedding: List[float]):
        """Fetch subparts filtered by subject with embedding ranking."""
        
        try:
            subparts = (
                self.db.query(SubPartModel)
                .join(QuestionPartModel, SubPartModel.part_id == QuestionPartModel.id)
                .join(QuestionModel, QuestionPartModel.question_id == QuestionModel.id)
                .join(SectionModel, QuestionModel.section_id == SectionModel.id)
                .join(ExamPaperModel, SectionModel.exam_id == ExamPaperModel.id)
                .filter(
                    SubPartModel.embedding.isnot(None),
                    SubPartModel.question_text.isnot(None),
                    SubPartModel.question_text != '',
                    ExamPaperModel.subject.ilike(f"%{subject.lower()}%")
                )
                .order_by(SubPartModel.embedding.cosine_distance(query_embedding))
                .limit(self.max_retrieval_limit)
                .all()
            )
            return subparts
        except Exception as e:
            print(f"Error retrieving subparts: {e}")
            return []
        

    async def _generate_section(self, context_items: List[Dict], subject: str, board: str,
                                paper: str, code: str, year: int, section_template: Dict,
                                prompt_template: str) -> Dict:
        """Generic section generator for Section A/B."""
        prompt = prompt_template.safe_substitute(
            board=board,
            subject=subject,
            paper=paper,
            code=code,
            year=year,
            demo_json=json.dumps(section_template, indent=2),
            retrieval_context=json.dumps(context_items, indent=2)
        )
        llm_response = await self.llm_manager.safe_generate(prompt=prompt)
        raw_output = getattr(llm_response, 'content', getattr(llm_response, 'text', str(llm_response)))

        try:
            section_json = self.llm_manager.safe_json_parse(raw_output)
            # Extract section
            if "sections" in section_json and section_json["sections"]:
                section = section_json["sections"][0]
            elif isinstance(section_json, dict) and "name" in section_json:
                section = section_json
            else:
                section = section_template
        except Exception:
            section = section_template

        return self._validate_structure([section])[0]

    async def gen_new_exam_paper(self, subject: str, board: str, paper: str, code: str, year: int) -> ExamPaperCreate:
        """Generate a full exam paper with validated sections."""
        try:
            query_embedding = self.model.encode(f"{subject} exam questions").tolist()
            # Retrieve subparts
            similar_subparts = self._get_subparts_by_subject(subject, query_embedding)
            context_items = self._prepare_retrieval_context(similar_subparts)

            # Split context
            mid = min(self.context_per_section, len(context_items)//2)
            sec_a_ctx = context_items[:mid]
            sec_b_ctx = context_items[mid:mid+self.context_per_section]

            # Templates
            from ...prompts.ICSE_questions import SECTION_A_PROMPT, SECTION_B_PROMPT
            sec_a_demo = self._create_default_sections()[0]
            sec_b_demo = self._create_default_sections()[1]

            # Generate concurrently
            section_a, section_b = await asyncio.gather(
                self._generate_section(sec_a_ctx, subject, board, paper, code, year, sec_a_demo, SECTION_A_PROMPT),
                self._generate_section(sec_b_ctx, subject, board, paper, code, year, sec_b_demo, SECTION_B_PROMPT)
            )

            sections = [section_a, section_b]
            # Renumber questions
            sections = self._validate_structure(sections)
            q_num = 1
            for sec in sections:
                for q in sec["questions"]:
                    q["number"] = q_num
                    q_num += 1
                    for idx, part in enumerate(q.get("parts", [])):
                        part["number"] = self._get_roman_numeral(idx+1)
                        for sidx, sub in enumerate(part.get("sub_parts", [])):
                            sub["letter"] = chr(97+sidx)

            # Convert to Pydantic
            final_sections = [Section.model_validate(s) for s in sections]

            return ExamPaperCreate(
                exam=self._create_exam_info(subject, board, paper, code, year),
                sections=final_sections
            )

        except Exception as e:
            print(f"Critical error generating exam paper: {e}")
            return ExamPaperCreate(
                exam=self._create_exam_info(subject, board, paper, code, year),
                sections=[Section.model_validate(s) for s in self._create_default_sections()]
            )
