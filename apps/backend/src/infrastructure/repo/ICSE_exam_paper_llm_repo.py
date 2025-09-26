from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Any
import asyncio
import json
from uuid import uuid4
import logging

from ...config.config import settings
from ...LLMs.LLMs import LLMProviderManager
from ...core.entities.exam_paper_entities import ExamInfo, ExamPaperCreate, Section
from ..models.exam_paper_models import SubPartModel, QuestionPartModel, QuestionModel, SectionModel, ExamPaperModel

# Set up logging
logger = logging.getLogger(__name__)

ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"]
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
        """Get roman numeral for given number."""
        return ROMAN_NUMERALS[num - 1] if 1 <= num <= len(ROMAN_NUMERALS) else str(num)

    def _create_exam_info(self, subject: str, board: str, paper: str, code: str, year: int) -> ExamInfo:
        """Create exam info with standard ICSE format."""
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
        """Create default section templates."""
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

    def _validate_json_structure(self, section_json: Dict) -> List[str]:
        """Validate the generated JSON matches expected structure."""
        errors = []
        
        if not isinstance(section_json, dict):
            return ["Section must be a dictionary"]
        
        # Check required section fields
        required_section_fields = ["name", "marks", "instruction", "is_compulsory", "questions"]
        for field in required_section_fields:
            if field not in section_json:
                errors.append(f"Missing section field: {field}")
        
        questions = section_json.get("questions", [])
        if not isinstance(questions, list):
            errors.append("Questions must be a list")
            return errors
        
        for q_idx, question in enumerate(questions):
            if not isinstance(question, dict):
                errors.append(f"Question {q_idx} must be a dictionary")
                continue
                
            # Check question fields
            required_q_fields = ["number", "type", "total_marks"]
            for field in required_q_fields:
                if field not in question:
                    errors.append(f"Question {q_idx} missing field: {field}")
            
            parts = question.get("parts", [])
            for p_idx, part in enumerate(parts):
                if not isinstance(part, dict):
                    errors.append(f"Question {q_idx} part {p_idx} must be a dictionary")
                    continue
                    
                # Check part fields
                required_p_fields = ["number", "type", "marks"]
                for field in required_p_fields:
                    if field not in part:
                        errors.append(f"Question {q_idx} part {p_idx} missing field: {field}")
                
                # Check options format for multiple choice
                if part.get("type") == "multiple_choice":
                    options = part.get("options", [])
                    for o_idx, option in enumerate(options):
                        if not isinstance(option, dict):
                            errors.append(f"Question {q_idx} part {p_idx} option {o_idx} must be a dictionary")
                            continue
                        if "text" not in option:
                            errors.append(f"Question {q_idx} part {p_idx} option {o_idx} missing 'text' field")
                        if "option_letter" not in option:
                            errors.append(f"Question {q_idx} part {p_idx} option {o_idx} missing 'option_letter' field")
                
                # Check sub_parts
                sub_parts = part.get("sub_parts", [])
                for s_idx, sub_part in enumerate(sub_parts):
                    if not isinstance(sub_part, dict):
                        errors.append(f"Question {q_idx} part {p_idx} sub_part {s_idx} must be a dictionary")
                        continue
                    if "letter" not in sub_part:
                        errors.append(f"Question {q_idx} part {p_idx} sub_part {s_idx} missing 'letter' field")
                    if "question_text" not in sub_part:
                        errors.append(f"Question {q_idx} part {p_idx} sub_part {s_idx} missing 'question_text' field")
        
        return errors

    def _fix_options_format(self, sections: List[Dict]) -> List[Dict]:
        """Fix option format to match expected structure."""
        for section in sections:
            for question in section.get("questions", []):
                for part in question.get("parts", []):
                    if part.get("type") == "multiple_choice":
                        options = part.get("options", [])
                        fixed_options = []
                        
                        for idx, option in enumerate(options):
                            if isinstance(option, dict):
                                # Fix option structure
                                fixed_option = {
                                    "option_letter": option.get("option_letter", f"({chr(97+idx)})"),
                                    "text": option.get("text", option.get("option_text", "Option text"))
                                }
                                # Remove unwanted fields
                                fixed_options.append(fixed_option)
                            else:
                                # Fallback for malformed options
                                fixed_options.append({
                                    "option_letter": f"({chr(97+idx)})",
                                    "text": str(option) if option else "Option text"
                                })
                        
                        part["options"] = fixed_options
        return sections

    def _normalize_diagram_types(self, sections: List[Dict]) -> List[Dict]:
        """Ensure diagram.type is always valid, default to 'Others', and add required fields."""
        for section in sections:
            for question in section.get("questions", []):
                # Question-level diagram
                diag = question.get("diagram")
                if diag and isinstance(diag, dict):
                    if diag.get("type") not in VALID_DIAGRAM_TYPES:
                        diag["type"] = "Others"
                    diag.setdefault("description", "Diagram description")
                    diag.setdefault("elements", [])
                    diag.setdefault("labels", [])
                
                # Parts-level diagram
                for part in question.get("parts", []):
                    diag = part.get("diagram")
                    if diag and isinstance(diag, dict):
                        if diag.get("type") not in VALID_DIAGRAM_TYPES:
                            diag["type"] = "Others"
                        diag.setdefault("description", "Diagram description")
                        diag.setdefault("elements", [])
                        diag.setdefault("labels", [])
                    
                    # Sub-parts level diagram
                    for sub in part.get("sub_parts", []):
                        diag = sub.get("diagram")
                        if diag and isinstance(diag, dict):
                            if diag.get("type") not in VALID_DIAGRAM_TYPES:
                                diag["type"] = "Others"
                            diag.setdefault("description", "Diagram description")
                            diag.setdefault("elements", [])
                            diag.setdefault("labels", [])
        return sections

    def _validate_structure(self, sections: List[Dict]) -> List[Dict]:
        """Validate and fix every question, part, sub-part, and diagram."""
        valid_sections = []
        
        for idx, section in enumerate(sections):
            if not isinstance(section, dict):
                section = {}
            
            section.setdefault("name", f"Section {chr(65+idx)}")
            section.setdefault("marks", 40)
            section.setdefault("instruction", "Attempt all questions")
            section.setdefault("is_compulsory", idx == 0)
            section.setdefault("questions", [])

            valid_questions = []
            for q_idx, q in enumerate(section.get("questions", [])):
                if not isinstance(q, dict):
                    continue
                    
                q.setdefault("number", q_idx + 1)
                q.setdefault("type", "short_answer")
                q.setdefault("total_marks", 1)
                q.setdefault("parts", [])
                
                # Validate parts
                valid_parts = []
                for pidx, part in enumerate(q.get("parts", [])):
                    if not isinstance(part, dict):
                        continue
                        
                    part.setdefault("type", "short_answer")
                    part.setdefault("marks", 1)
                    part.setdefault("number", self._get_roman_numeral(pidx + 1))
                    part.setdefault("sub_parts", [])
                    
                    # Fix multiple choice options
                    if part.get("type") == "multiple_choice":
                        options = part.get("options", [])
                        fixed_options = []
                        for oidx, option in enumerate(options):
                            if isinstance(option, dict):
                                fixed_option = {
                                    "option_letter": option.get("option_letter", f"({chr(97+oidx)})"),
                                    "text": option.get("text", option.get("option_text", f"Option {chr(65+oidx)}"))
                                }
                                fixed_options.append(fixed_option)
                        part["options"] = fixed_options
                    
                    # Validate sub-parts
                    valid_sub_parts = []
                    for sidx, sub in enumerate(part.get("sub_parts", [])):
                        if not isinstance(sub, dict):
                            continue
                        sub.setdefault("letter", f"({chr(97+sidx)})")
                        sub.setdefault("question_text", "Sub-part question text")
                        
                        # Validate diagram
                        diag = sub.get("diagram")
                        if diag and isinstance(diag, dict) and diag.get("type") not in VALID_DIAGRAM_TYPES:
                            diag["type"] = "Others"
                        
                        valid_sub_parts.append(sub)
                    
                    part["sub_parts"] = valid_sub_parts
                    valid_parts.append(part)
                
                q["parts"] = valid_parts
                valid_questions.append(q)
            
            section["questions"] = valid_questions
            valid_sections.append(section)

        return self._normalize_diagram_types(valid_sections)

    def _prepare_retrieval_context(self, similar_subparts) -> List[Dict]:
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
                logger.warning(f"Error processing subpart {getattr(sp, 'id', 'unknown')}: {e}")
                continue
                
        return retrieval_context
    def _normalize_constants_and_formulas(self, sections: List[Dict]) -> List[Dict]:
        for section in sections:
            for question in section.get("questions", []):
                # question-level constants/formulas (if you store them there)
                q_consts = question.get("constants_given")
                if q_consts is not None:
                    if isinstance(q_consts, dict):
                        pass
                    elif isinstance(q_consts, list):
                        question["constants_given"] = {
                            f"constant_{i+1}": str(v) for i, v in enumerate(q_consts)
                        }
                    else:
                        question["constants_given"] = {"value": str(q_consts)}

                q_forms = question.get("formula_given")
                if q_forms is not None:
                    if isinstance(q_forms, dict):
                        pass
                    elif isinstance(q_forms, list):
                        question["formula_given"] = {
                            f"formula_{i+1}": str(v) for i, v in enumerate(q_forms)
                        }
                    else:
                        question["formula_given"] = {"value": str(q_forms)}

                # part-level normalization
                for part in question.get("parts", []):
                    # constants_given
                    consts = part.get("constants_given")
                    if consts is not None:
                        if isinstance(consts, dict):
                            pass
                        elif isinstance(consts, list):
                            part["constants_given"] = {
                                f"constant_{i+1}": str(v) for i, v in enumerate(consts)
                            }
                        else:
                            part["constants_given"] = {"value": str(consts)}

                    # formula_given
                    forms = part.get("formula_given")
                    if forms is not None:
                        if isinstance(forms, dict):
                            pass
                        elif isinstance(forms, list):
                            part["formula_given"] = {
                                f"formula_{i+1}": str(v) for i, v in enumerate(forms)
                            }
                        else:
                            part["formula_given"] = {"value": str(forms)}

                    # also normalize inside sub_parts if they contain constants/formula
                    for sub in part.get("sub_parts", []):
                        s_consts = sub.get("constants_given")
                        if s_consts is not None:
                            if isinstance(s_consts, dict):
                                pass
                            elif isinstance(s_consts, list):
                                sub["constants_given"] = {
                                    f"constant_{i+1}": str(v) for i, v in enumerate(s_consts)
                                }
                            else:
                                sub["constants_given"] = {"value": str(s_consts)}

                        s_forms = sub.get("formula_given")
                        if s_forms is not None:
                            if isinstance(s_forms, dict):
                                pass
                            elif isinstance(s_forms, list):
                                sub["formula_given"] = {
                                    f"formula_{i+1}": str(v) for i, v in enumerate(s_forms)
                                }
                            else:
                                sub["formula_given"] = {"value": str(s_forms)}

        return sections

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
            logger.error(f"Error retrieving subparts: {e}")
            return []

    async def _generate_section(self, context_items: List[Dict], subject: str, board: str,
                                paper: str, code: str, year: int, section_template: Dict,
                                prompt_template: str) -> Dict:
        """Generic section generator for Section A/B with enhanced error handling."""
        try:
            prompt = prompt_template.safe_substitute(
                board=board,
                subject=subject,
                paper=paper,
                code=code,
                year=year,
                demo_json=json.dumps(section_template, indent=2),
                retrieval_context=json.dumps(context_items[:50], indent=2)  # Limit context size
            )
            
            llm_response = await self.llm_manager.safe_generate(prompt=prompt)
            raw_output = getattr(llm_response, 'content', getattr(llm_response, 'text', str(llm_response)))

            try:
                section_json = self.llm_manager.safe_json_parse(raw_output)
                
                # Extract section from different possible structures
                if "sections" in section_json and isinstance(section_json["sections"], list) and section_json["sections"]:
                    section = section_json["sections"][0]
                elif isinstance(section_json, dict) and "name" in section_json:
                    section = section_json
                else:
                    logger.warning("Invalid JSON structure from LLM, using template")
                    section = section_template
                    
            except Exception as json_error:
                logger.error(f"JSON parsing error: {json_error}")
                logger.error(f"Raw LLM output: {raw_output[:500]}...")
                section = section_template

            # Apply fixes and validation FIRST (before validation check)
            validated_sections = self._validate_structure([section])
            fixed_section = validated_sections[0]
            
            # Now validate the fixed structure for logging purposes only
            validation_errors = self._validate_json_structure(fixed_section)
            if validation_errors:
                logger.warning(f"Remaining validation errors after fixing: {validation_errors}")
            
            return fixed_section
            
        except Exception as e:
            logger.error(f"Error in section generation: {e}")
            return self._validate_structure([section_template])[0]

    async def gen_new_exam_paper(self, subject: str, board: str, paper: str, code: str, year: int) -> ExamPaperCreate:
        """Generate a full exam paper with validated sections and comprehensive error handling."""
        try:
            # Generate embedding for subject
            query_embedding = self.model.encode(f"{subject} exam questions").tolist()
            
            # Retrieve similar subparts
            similar_subparts = self._get_subparts_by_subject(subject, query_embedding)
            context_items = self._prepare_retrieval_context(similar_subparts)
            
            logger.info(f"Retrieved {len(context_items)} context items for {subject}")

            # Split context between sections
            mid = min(self.context_per_section, len(context_items) // 2) if context_items else 0
            sec_a_ctx = context_items[:mid] if context_items else []
            sec_b_ctx = context_items[mid:mid+self.context_per_section] if context_items else []

            # Import prompts
            from ...prompts.ICSE_questions import SECTION_A_PROMPT, SECTION_B_PROMPT
            
            # Create section templates
            default_sections = self._create_default_sections()
            sec_a_demo = default_sections[0]
            sec_b_demo = default_sections[1]

            # Generate sections concurrently
            section_a_task = self._generate_section(
                sec_a_ctx, subject, board, paper, code, year, sec_a_demo, SECTION_A_PROMPT
            )
            section_b_task = self._generate_section(
                sec_b_ctx, subject, board, paper, code, year, sec_b_demo, SECTION_B_PROMPT
            )
            
            section_a, section_b = await asyncio.gather(section_a_task, section_b_task)

            # Combine and validate sections
            sections = [section_a, section_b]
            sections = self._validate_structure(sections)
            sections = self._fix_options_format(sections)  # Additional fix for options
            sections = self._normalize_constants_and_formulas(sections) 
            # Renumber questions globally
            q_num = 1
            for sec in sections:
                for q in sec["questions"]:
                    q["number"] = q_num
                    q_num += 1
                    
                    # Ensure proper part numbering
                    for idx, part in enumerate(q.get("parts", [])):
                        part["number"] = self._get_roman_numeral(idx + 1)
                        
                        # Ensure proper sub-part lettering
                        for sidx, sub in enumerate(part.get("sub_parts", [])):
                            sub["letter"] = f"({chr(97+sidx)})"

            # Convert to Pydantic models with error handling
            final_sections = []
            for section in sections:
                try:
                    validated_section = Section.model_validate(section)
                    final_sections.append(validated_section)
                except Exception as validation_error:
                    logger.error(f"Section validation error: {validation_error}")
                    logger.error(f"Section data: {json.dumps(section, indent=2)}")
                    # Use default section if validation fails
                    default_section = Section.model_validate(self._create_default_sections()[len(final_sections)])
                    final_sections.append(default_section)

            return ExamPaperCreate(
                exam=self._create_exam_info(subject, board, paper, code, year),
                sections=final_sections
            )

        except Exception as e:
            logger.error(f"Critical error generating exam paper: {e}")
            # Return safe fallback
            default_sections = self._create_default_sections()
            validated_defaults = self._validate_structure(default_sections)
            safe_sections = [Section.model_validate(s) for s in validated_defaults]
            
            return ExamPaperCreate(
                exam=self._create_exam_info(subject, board, paper, code, year),
                sections=safe_sections
            )