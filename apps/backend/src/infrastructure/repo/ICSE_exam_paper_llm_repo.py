import numpy as np
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import asyncio
import json
from uuid import uuid4
import re

from ..models.exam_paper_models import SubPartModel, QuestionPartModel, QuestionModel, SectionModel, ExamPaperModel
from ...LLMs.LLMs import LLMProviderManager
from ...core.entities.exam_paper_entities import ExamInfo, ExamPaperCreate, Section
from ...prompts.ICSE_questions import PERFECT_SECTION_A, PERFECT_SECTION_B, SECTION_A_PROMPT, SECTION_B_PROMPT
from ...config.cohere_api_client import CohereEmbeddingClient

ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"]

PLACEHOLDER_PATTERNS = [
    r'sample\s+(mcq\s+)?question',
    r'option\s+[a-d](?!\s+\w{3,})',  
    r'question\s+with\s+diagram',
    r'sub-question\s+text',
    r'description\s+of\s+diagram',
    r'ray\s+diagram\s+description',
    r'element[12]',
    r'sample\s+\w+',
]


class SQLLMRepo:
    def __init__(self, db: Session, model=None, cohere_api_keys=None):
        self.db = db
        self.model = model
        self.cohere_client = None

        if model is None:
            self.cohere_client = CohereEmbeddingClient(api_keys=cohere_api_keys)

        self.llm_manager = LLMProviderManager()
        self.max_retrieval_limit = 300
        self.context_per_section = 50

    def _get_query_embedding(self, query: str) -> List[float]:
        if not query or not query.strip():
            raise ValueError("Query string cannot be empty")

        if self.model is not None:
            embedding = self.model.encode(query)
            embedding = embedding / np.linalg.norm(embedding)
            return embedding.tolist()
        elif self.cohere_client is not None:
            embedding = self.cohere_client.encode(query, input_type="search_document", normalize=True)
            if isinstance(embedding, np.ndarray):
                return embedding.tolist()
            elif isinstance(embedding, list):
                return embedding
            else:
                return list(embedding)
        else:
            raise Exception("No embedding model or Cohere client available")
        
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

    def _prepare_retrieval_context(self, similar_subparts) -> List[Dict]:
        retrieval_context = []
        for sp in similar_subparts:
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
            
            part = getattr(sp, "part", None)
            if part:
                context_item["part_type"] = getattr(part, "type", None)
                context_item["part_marks"] = getattr(part, "marks", None)
                question = getattr(part, "question", None)
                if question:
                    context_item["question_type"] = getattr(question, "type", None)
                    context_item["question_title"] = getattr(question, "title", None)
            
            retrieval_context.append(context_item)
        
        return retrieval_context

    def _get_subparts_by_subject(self, subject: str, query_embedding: List[float]):
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

    def _has_placeholder_content(self, data: Any, path: str = "root") -> tuple[bool, List[str]]:
        """
        Recursively check if data contains placeholder text.
        Returns (has_placeholder, list_of_placeholder_locations)
        """
        placeholders_found = []
        
        if isinstance(data, str):
            data_lower = data.lower()
            for pattern in PLACEHOLDER_PATTERNS:
                if re.search(pattern, data_lower, re.IGNORECASE):
                    placeholders_found.append(f"{path}: '{data}'")
                    return True, placeholders_found
        
        elif isinstance(data, dict):
            for key, value in data.items():
                has_ph, ph_list = self._has_placeholder_content(value, f"{path}.{key}")
                if has_ph:
                    placeholders_found.extend(ph_list)
        
        elif isinstance(data, list):
            for idx, item in enumerate(data):
                has_ph, ph_list = self._has_placeholder_content(item, f"{path}[{idx}]")
                if has_ph:
                    placeholders_found.extend(ph_list)
        
        return len(placeholders_found) > 0, placeholders_found

    def _enforce_perfect_schema(self, section_json: Dict, is_section_a: bool = True) -> Dict:
        """Enforce perfect schema compliance with zero tolerance."""
        template = PERFECT_SECTION_A.copy() if is_section_a else PERFECT_SECTION_B.copy()
        
        if not isinstance(section_json, dict) or "questions" not in section_json:
            return template
            
        result = {
            "name": section_json.get("name", template["name"]),
            "marks": int(section_json.get("marks", template["marks"])),
            "instruction": section_json.get("instruction", template["instruction"]),
            "is_compulsory": bool(section_json.get("is_compulsory", template["is_compulsory"])),
            "questions": []
        }
        
        questions = section_json.get("questions", [])
        expected_count = 3 if is_section_a else 6
        
        for i in range(expected_count):
            if i < len(questions) and isinstance(questions[i], dict):
                q = questions[i]
            else:
                q = template["questions"][min(i, len(template["questions"])-1)].copy()
            
            question = {
                "number": int(q.get("number", i + 1)),
                "title": q.get("title"),
                "type": str(q.get("type", "short_answer")),
                "total_marks": int(q.get("total_marks", 10)),
                "instruction": q.get("instruction"),
                "parts": [],
                "question_text": q.get("question_text"),
                "options": [],
                "diagram": q.get("diagram")
            }
            
            parts = q.get("parts", [])
            for p_idx, part in enumerate(parts):
                if not isinstance(part, dict):
                    continue
                
                # Handle missing_parts field
                missing_parts = part.get("missing_parts")
                if isinstance(missing_parts, list):
                    missing_parts = {f"item_{i+1}": str(item) for i, item in enumerate(missing_parts)}
                elif missing_parts is not None and not isinstance(missing_parts, dict):
                    missing_parts = None
                
                # Handle choices_for_blanks
                choices_for_blanks = part.get("choices_for_blanks")
                if choices_for_blanks is not None and not isinstance(choices_for_blanks, list):
                    choices_for_blanks = None
                elif isinstance(choices_for_blanks, list):
                    fixed_choices = []
                    for choice in choices_for_blanks:
                        if isinstance(choice, list):
                            fixed_choices.append(choice)
                        else:
                            fixed_choices.append([str(choice)])
                    choices_for_blanks = fixed_choices
                
                # Handle constants_given
                constants_given = part.get("constants_given")
                if isinstance(constants_given, list):
                    constants_given = {f"constant_{i+1}": str(item) for i, item in enumerate(constants_given)}
                elif constants_given is not None and not isinstance(constants_given, dict):
                    constants_given = None
                    
                validated_part = {
                    "number": self._get_roman_numeral(p_idx + 1),
                    "type": str(part.get("type", "short_answer")),
                    "marks": int(part.get("marks", 1)),
                    "question_text": part.get("question_text"),
                    "description": part.get("description"),
                    "sub_parts": [],
                    "options": [],
                    "diagram": part.get("diagram"),
                    "formula_given": part.get("formula_given"),
                    "constants_given": constants_given,
                    "column_a": part.get("column_a"),
                    "column_b": part.get("column_b"),
                    "items_to_arrange": part.get("items_to_arrange"),
                    "sequence_type": part.get("sequence_type"),
                    "statement_with_blanks": part.get("statement_with_blanks"),
                    "choices_for_blanks": choices_for_blanks,
                    "equation_template": part.get("equation_template"),
                    "missing_parts": missing_parts
                }
                
                # Process options for MCQ
                if part.get("type") == "multiple_choice":
                    options = part.get("options", [])
                    for o_idx, option in enumerate(options):
                        if isinstance(option, dict):
                            validated_part["options"].append({
                                "option_letter": option.get("option_letter", f"({chr(97+o_idx)})"),
                                "text": str(option.get("text", f"Option {chr(65+o_idx)}"))
                            })
                
                # Process sub-parts
                sub_parts = part.get("sub_parts", [])
                for s_idx, sub in enumerate(sub_parts):
                    if isinstance(sub, dict):
                        sub_constants = sub.get("constants_given")
                        if isinstance(sub_constants, list):
                            sub_constants = {f"constant_{i+1}": str(item) for i, item in enumerate(sub_constants)}
                        elif sub_constants is not None and not isinstance(sub_constants, dict):
                            sub_constants = None
                        
                        choices_given = sub.get("choices_given")
                        if choices_given is not None and not isinstance(choices_given, list):
                            choices_given = None
                            
                        validated_part["sub_parts"].append({
                            "letter": f"({chr(97+s_idx)})",
                            "question_text": str(sub.get("question_text", "")),
                            "marks": sub.get("marks"),
                            "diagram": sub.get("diagram"),
                            "formula_given": sub.get("formula_given"),
                            "constants_given": sub_constants,
                            "equation_template": sub.get("equation_template"),
                            "choices_given": choices_given
                        })
                
                question["parts"].append(validated_part)
            
            result["questions"].append(question)
        
        return result

    async def _generate_perfect_section(self, context_items: List[Dict], subject: str, board: str,
                                       paper: str, code: str, year: int, is_section_a: bool = True,
                                       max_retries: int = 3) -> Dict:
        """Generate section with placeholder detection and retry."""
        template = PERFECT_SECTION_A if is_section_a else PERFECT_SECTION_B
        prompt_template = SECTION_A_PROMPT if is_section_a else SECTION_B_PROMPT
        
        section_name = "Section A" if is_section_a else "Section B"
        
        for attempt in range(max_retries):
            prompt = prompt_template.safe_substitute(
                board=board,
                subject=subject,
                paper=paper,
                code=code,
                year=year,
                perfect_schema=json.dumps(template, indent=2),
                retrieval_context=json.dumps(context_items[:50], indent=2)
            )
            
            if attempt > 0:
                prompt += f"\n\n⚠️ RETRY ATTEMPT {attempt+1}: Previous generation contained placeholder text. Generate REAL {subject} questions with actual content!"
            
            llm_response = await self.llm_manager.safe_generate(prompt=prompt)
            raw_output = getattr(llm_response, 'content', getattr(llm_response, 'text', str(llm_response)))
            
            try:
                section_json = self.llm_manager.safe_json_parse(raw_output)
                
                if isinstance(section_json, dict) and "name" in section_json and "questions" in section_json:
                    # Check for placeholders
                    has_placeholders, placeholder_locations = self._has_placeholder_content(section_json)
                    
                    if has_placeholders:
                        for loc in placeholder_locations[:5]:  # Show first 5
                            pass
                        
                        if attempt < max_retries - 1:
                            continue
                        else:
                            ...
                    else:
                        ...
                    
                    return self._enforce_perfect_schema(section_json, is_section_a)
                else:
                    if attempt < max_retries - 1:
                        continue
                    return self._enforce_perfect_schema(template, is_section_a)
                    
            except Exception as e:
                if attempt < max_retries - 1:
                    continue
                return self._enforce_perfect_schema(template, is_section_a)
        
        return self._enforce_perfect_schema(template, is_section_a)

    async def gen_new_exam_paper(self, subject: str, board: str, paper: str, code: str, year: int) -> ExamPaperCreate:
        query_embedding = self._get_query_embedding(f"{subject} exam questions")
        similar_subparts = self._get_subparts_by_subject(subject, query_embedding)
        context_items = self._prepare_retrieval_context(similar_subparts)
        
        mid = min(self.context_per_section, len(context_items) // 2) if context_items else 0
        sec_a_ctx = context_items[:mid] if context_items else []
        sec_b_ctx = context_items[mid:mid+self.context_per_section] if context_items else []
        
        section_a_task = self._generate_perfect_section(sec_a_ctx, subject, board, paper, code, year, True)
        
        section_b_task = self._generate_perfect_section(sec_b_ctx, subject, board, paper, code, year, False)
        
        section_a, section_b = await asyncio.gather(section_a_task, section_b_task)
        
        # Ensure we have valid dictionaries
        if not isinstance(section_a, dict) or "questions" not in section_a:
            section_a = self._enforce_perfect_schema(PERFECT_SECTION_A, True)
            
        if not isinstance(section_b, dict) or "questions" not in section_b:
            section_b = self._enforce_perfect_schema(PERFECT_SECTION_B, False)
        
        # Final question renumbering
        q_num = 1
        for section in [section_a, section_b]:
            if "questions" in section:
                for question in section["questions"]:
                    question["number"] = q_num
                    q_num += 1
        try:
            validated_section_a = Section.model_validate(section_a)
        except Exception as e:
            fallback_a = self._enforce_perfect_schema(PERFECT_SECTION_A, True)
            validated_section_a = Section.model_validate(fallback_a)
        
        try:
            validated_section_b = Section.model_validate(section_b)
        except Exception as e:
            fallback_b = self._enforce_perfect_schema(PERFECT_SECTION_B, False)
            validated_section_b = Section.model_validate(fallback_b)

        exam_paper = ExamPaperCreate(
            exam=self._create_exam_info(subject, board, paper, code, year),
            sections=[validated_section_a, validated_section_b]
        )
        return exam_paper