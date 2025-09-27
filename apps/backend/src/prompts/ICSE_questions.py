from string import Template


PERFECT_DIAGRAM = {
    "type": "Others",
    "description": "",
    "elements": [],
    "labels": [],
    "measurements": {},
    "angles": {},
    "instructions": None
}

PERFECT_SUBPART = {
    "letter": "(a)",
    "question_text": "",
    "marks": None,
    "diagram": None,
    "formula_given": None,
    "constants_given": None,
    "equation_template": None,
    "choices_given": None
}

PERFECT_MCQ_OPTION = {
    "option_letter": "(a)",
    "text": ""
}

PERFECT_QUESTION_PART = {
    "number": "i",
    "type": "short_answer",
    "marks": 1,
    "question_text": None,
    "description": None,
    "sub_parts": [],
    "options": [],
    "diagram": None,
    "formula_given": None,
    "constants_given": None,
    "column_a": None,
    "column_b": None,
    "items_to_arrange": None,
    "sequence_type": None,
    "statement_with_blanks": None,
    "choices_for_blanks": None,
    "equation_template": None,
    "missing_parts": None
}

PERFECT_QUESTION = {
    "number": 1,
    "title": None,
    "type": "short_answer",
    "total_marks": 1,
    "instruction": None,
    "parts": [],
    "question_text": None,
    "options": [],
    "diagram": None
}

PERFECT_SECTION_A = {
    "name": "Section A",
    "marks": 40,
    "instruction": "Attempt all questions from this Section",
    "is_compulsory": True,
    "questions": [
        {
            "number": 1,
            "title": None,
            "type": "multiple_choice",
            "total_marks": 15,
            "instruction": "Choose the correct answers to the questions from the given options. (Do not copy the questions, write the correct answers only.)",
            "parts": [
                {
                    "number": "i",
                    "type": "multiple_choice",
                    "marks": 1,
                    "question_text": "Sample MCQ question?",
                    "description": None,
                    "sub_parts": [],
                    "options": [
                        {"option_letter": "(a)", "text": "Option A"},
                        {"option_letter": "(b)", "text": "Option B"},
                        {"option_letter": "(c)", "text": "Option C"},
                        {"option_letter": "(d)", "text": "Option D"}
                    ],
                    "diagram": None,
                    "formula_given": None,
                    "constants_given": None,
                    "column_a": None,
                    "column_b": None,
                    "items_to_arrange": None,
                    "sequence_type": None,
                    "statement_with_blanks": None,
                    "choices_for_blanks": None,
                    "equation_template": None,
                    "missing_parts": None
                }
            ],
            "question_text": None,
            "options": [],
            "diagram": None
        },
        {
            "number": 2,
            "title": None,
            "type": "short_answer",
            "total_marks": 15,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "short_answer",
                    "marks": 3,
                    "question_text": "Sample question",
                    "description": None,
                    "sub_parts": [],
                    "options": [],
                    "diagram": None,
                    "formula_given": None,
                    "constants_given": None,
                    "column_a": None,
                    "column_b": None,
                    "items_to_arrange": None,
                    "sequence_type": None,
                    "statement_with_blanks": None,
                    "choices_for_blanks": None,
                    "equation_template": None,
                    "missing_parts": None
                }
            ],
            "question_text": None,
            "options": [],
            "diagram": None
        },
        {
            "number": 3,
            "title": None,
            "type": "short_answer",
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "short_answer",
                    "marks": 2,
                    "question_text": "Sample question",
                    "description": None,
                    "sub_parts": [],
                    "options": [],
                    "diagram": None,
                    "formula_given": None,
                    "constants_given": None,
                    "column_a": None,
                    "column_b": None,
                    "items_to_arrange": None,
                    "sequence_type": None,
                    "statement_with_blanks": None,
                    "choices_for_blanks": None,
                    "equation_template": None,
                    "missing_parts": None
                }
            ],
            "question_text": None,
            "options": [],
            "diagram": None
        }
    ]
}

PERFECT_SECTION_B = {
    "name": "Section B",
    "marks": 40,
    "instruction": "Attempt any four questions from this Section",
    "is_compulsory": False,
    "questions": [
        {
            "number": 4,
            "title": None,
            "type": "long_answer",
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "diagram_based",
                    "marks": 3,
                    "question_text": "Question with diagram",
                    "description": "Description of diagram",
                    "sub_parts": [
                        {
                            "letter": "(a)",
                            "question_text": "Sub-question text",
                            "marks": None,
                            "diagram": None,
                            "formula_given": None,
                            "constants_given": None,
                            "equation_template": None,
                            "choices_given": None
                        }
                    ],
                    "options": [],
                    "diagram": {
                        "type": "ray_diagram",
                        "description": "Ray diagram description",
                        "elements": ["element1", "element2"],
                        "labels": ["A", "B"],
                        "measurements": {},
                        "angles": {},
                        "instructions": None
                    },
                    "formula_given": None,
                    "constants_given": None,
                    "column_a": None,
                    "column_b": None,
                    "items_to_arrange": None,
                    "sequence_type": None,
                    "statement_with_blanks": None,
                    "choices_for_blanks": None,
                    "equation_template": None,
                    "missing_parts": None
                }
            ],
            "question_text": None,
            "options": [],
            "diagram": None
        }
    ]
}

ULTRA_STRICT_SECTION_A_PROMPT = Template("""CRITICAL: Generate EXACTLY matching JSON for ${board} ${subject} Section A, Year ${year}.

MANDATORY STRUCTURE (NO DEVIATIONS ALLOWED):
Q1: 15 MCQ parts (i-xv), 1 mark each = 15 total
Q2: 5 parts, 3 marks each = 15 total  
Q3: 5 parts, 2 marks each = 10 total

SCHEMA ENFORCEMENT RULES:
1. Every field in PERFECT_JSON must exist with correct type
2. null values ONLY where specified in schema
3. Empty arrays [] not null
4. Empty objects {} not null
5. String fields: "" or content, never null unless schema allows
6. Boolean: true/false only
7. MCQ options: exactly [{"option_letter": "(a)", "text": "..."}, ...]
8. Roman numerals: i, ii, iii, iv, v, etc.
9. Sub-part letters: (a), (b), (c), etc.
10. missing_parts: MUST be object/dict, never array: {"key1": "value1"}
11. constants_given: MUST be object/dict: {"constant_name": "value"}
12. choices_for_blanks: MUST be array of arrays: [["choice1", "choice2"], ["choice3"]]
13. choices_given: MUST be simple array: ["choice1", "choice2"]

PERFECT JSON SCHEMA TO MATCH EXACTLY:
${perfect_schema}

CONTEXT REFERENCE:
${retrieval_context}

GENERATE: Return ONLY the JSON object matching the schema exactly. Zero tolerance for schema deviations.""")

ULTRA_STRICT_SECTION_B_PROMPT = Template("""CRITICAL: Generate EXACTLY matching JSON for ${board} ${subject} Section B, Year ${year}.

MANDATORY STRUCTURE (NO DEVIATIONS ALLOWED):
6 questions (Q4-Q9), each 10 marks, 3 parts each (i, ii, iii)
Mark distribution: 3+3+4 or 2+3+5 or 4+3+3

SCHEMA ENFORCEMENT RULES:
1. Every field in PERFECT_JSON must exist with correct type
2. null values ONLY where specified in schema  
3. Empty arrays [] not null
4. Empty objects {} not null
5. String fields: "" or content, never null unless schema allows
6. Boolean: true/false only
7. Roman numerals: i, ii, iii for parts
8. Sub-part letters: (a), (b), (c), etc.
9. Valid diagram types: ray_diagram, circuit_diagram, force_diagram, molecular_structure, apparatus_setup, anatomical_diagram, cell_diagram, system_diagram, graph, flowchart, Others

PERFECT JSON SCHEMA TO MATCH EXACTLY:
${perfect_schema}

CONTEXT REFERENCE:
${retrieval_context}

GENERATE: Return ONLY the JSON object matching the schema exactly. Zero tolerance for schema deviations.""")
