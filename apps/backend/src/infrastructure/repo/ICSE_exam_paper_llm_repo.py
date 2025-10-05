import numpy as np
from sqlalchemy.orm import Session
from typing import List, Dict, Optional, Any
import asyncio
import json
from uuid import uuid4
import logging
from string import Template

from ..models.exam_paper_models import SubPartModel, QuestionPartModel, QuestionModel, SectionModel, ExamPaperModel
from ...LLMs.LLMs import LLMProviderManager
from ...core.entities.exam_paper_entities import ExamInfo, ExamPaperCreate, Section
from ...prompts.ICSE_questions import PERFECT_DIAGRAM, PERFECT_QUESTION, PERFECT_SECTION_A, PERFECT_SECTION_B, ULTRA_STRICT_SECTION_A_PROMPT, ULTRA_STRICT_SECTION_B_PROMPT
from ...config.embedding_api_client import EmbeddingAPIClient

ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"]


class SQLLMRepo:
    def __init__(self, db: Session, model=None, embedding_api_url=None):
        self.db = db
        self.model = model
        self.embedding_client = EmbeddingAPIClient(embedding_api_url) if embedding_api_url else None
        self.llm_manager = LLMProviderManager()
        self.max_retrieval_limit = 300
        self.context_per_section = 50
        
    def _get_query_embedding(self, query: str) -> List[float]:
        if not query or not query.strip():
            raise ValueError("Query string cannot be empty")
        
        if self.model is not None:
            # Using local SentenceTransformer model
            embedding = self.model.encode(query)
            # Normalize the embedding
            embedding = embedding / np.linalg.norm(embedding)
            return embedding.tolist()
            
        elif self.embedding_client is not None:
            # Using API client
            # Note: API client returns normalized embeddings when normalize=True
            embedding = self.embedding_client.encode(query, normalize=True)
            
            # embedding is a 1D numpy array for single text
            if isinstance(embedding, np.ndarray):
                return embedding.tolist()
            elif isinstance(embedding, list):
                return embedding
            else:
                # Fallback conversion
                return list(embedding)
                
        else:
            raise Exception("No embedding model or API client available")

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

    def _enforce_perfect_schema(self, section_json: Dict, is_section_a: bool = True) -> Dict:
        """Enforce perfect schema compliance with zero tolerance."""
        template = PERFECT_SECTION_A.copy() if is_section_a else PERFECT_SECTION_B.copy()
        
        # Force exact structure match
        if not isinstance(section_json, dict) or "questions" not in section_json:
            return template
            
        # Validate section fields
        result = {
            "name": section_json.get("name", template["name"]),
            "marks": int(section_json.get("marks", template["marks"])),
            "instruction": section_json.get("instruction", template["instruction"]),
            "is_compulsory": bool(section_json.get("is_compulsory", template["is_compulsory"])),
            "questions": []
        }
        
        # Process questions with strict validation
        questions = section_json.get("questions", [])
        expected_count = 3 if is_section_a else 6
        
        for i in range(expected_count):
            if i < len(questions) and isinstance(questions[i], dict):
                q = questions[i]
            else:
                q = template["questions"][0].copy() if template["questions"] else PERFECT_QUESTION.copy()
            
            # Force question structure
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
            
                            # Process parts
            parts = q.get("parts", [])
            for p_idx, part in enumerate(parts):
                if not isinstance(part, dict):
                    continue
                
                # Handle missing_parts field - convert list to dict if needed
                missing_parts = part.get("missing_parts")
                if isinstance(missing_parts, list):
                    # Convert list to dict with indexed keys
                    missing_parts = {f"item_{i+1}": str(item) for i, item in enumerate(missing_parts)}
                elif missing_parts is not None and not isinstance(missing_parts, dict):
                    missing_parts = None
                
                # Handle choices_for_blanks - ensure it's list of lists
                choices_for_blanks = part.get("choices_for_blanks")
                if choices_for_blanks is not None and not isinstance(choices_for_blanks, list):
                    choices_for_blanks = None
                elif isinstance(choices_for_blanks, list):
                    # Ensure each item is a list
                    fixed_choices = []
                    for choice in choices_for_blanks:
                        if isinstance(choice, list):
                            fixed_choices.append(choice)
                        else:
                            fixed_choices.append([str(choice)])
                    choices_for_blanks = fixed_choices
                
                # Handle constants_given - ensure it's dict
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
                        # Handle constants_given in sub-parts
                        sub_constants = sub.get("constants_given")
                        if isinstance(sub_constants, list):
                            sub_constants = {f"constant_{i+1}": str(item) for i, item in enumerate(sub_constants)}
                        elif sub_constants is not None and not isinstance(sub_constants, dict):
                            sub_constants = None
                        
                        # Handle choices_given - should be list
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
                                       paper: str, code: str, year: int, is_section_a: bool = True) -> Dict:
        """Generate section with perfect schema enforcement."""
        template = PERFECT_SECTION_A if is_section_a else PERFECT_SECTION_B
        prompt_template = ULTRA_STRICT_SECTION_A_PROMPT if is_section_a else ULTRA_STRICT_SECTION_B_PROMPT
        
        prompt = prompt_template.safe_substitute(
            board=board,
            subject=subject,
            paper=paper,
            code=code,
            year=year,
            perfect_schema=json.dumps(template, indent=2),
            retrieval_context=json.dumps(context_items[:50], indent=2)
        )
        
        llm_response = await self.llm_manager.safe_generate(prompt=prompt)
        raw_output = getattr(llm_response, 'content', getattr(llm_response, 'text', str(llm_response)))
        
        try:
            # Parse the raw JSON output
            section_json = self.llm_manager.safe_json_parse(raw_output)
            
            # The LLM is already returning the correct format, so use it directly
            if isinstance(section_json, dict) and "name" in section_json and "questions" in section_json:
                # Apply minimal schema enforcement to handle type mismatches
                return self._enforce_perfect_schema(section_json, is_section_a)
            else:
                return self._enforce_perfect_schema(template, is_section_a)
                
        except Exception as e:
            return self._enforce_perfect_schema(template, is_section_a)

    async def gen_new_exam_paper(self, subject: str, board: str, paper: str, code: str, year: int) -> ExamPaperCreate:
        """Generate perfect exam paper with 100% schema compliance."""
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
        
        # Convert to Pydantic with detailed error handling
        try:
            validated_section_a = Section.model_validate(section_a)
        except Exception as e:
            # Use a minimal template as fallback
            fallback_a = self._enforce_perfect_schema(PERFECT_SECTION_A, True)
            validated_section_a = Section.model_validate(fallback_a)
        
        try:
            validated_section_b = Section.model_validate(section_b)
            
        except Exception as e:
            # Use a minimal template as fallback
            fallback_b = self._enforce_perfect_schema(PERFECT_SECTION_B, False)
            validated_section_b = Section.model_validate(fallback_b)

        # Add this right before the return statement in gen_new_exam_paper
        exam_paper = ExamPaperCreate(
            exam=self._create_exam_info(subject, board, paper, code, year),
            sections=[validated_section_a, validated_section_b]
        )

        return exam_paper
        
        