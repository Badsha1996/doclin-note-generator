from string import Template

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
            ] * 15,  # 15 MCQ parts
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
            ] * 5,  # 5 parts of 3 marks each
            "question_text": None,
            "options": [],
            "diagram": None
        },
        {
            "number": 3,
            "title": None,
            "type": "short_answer",  # FIXED: Was multiple_choice, should be short_answer
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "short_answer",  # FIXED: Changed from multiple_choice
                    "marks": 2,
                    "question_text": "Sample question",
                    "description": None,
                    "sub_parts": [],
                    "options": [],  # No options for short answer
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
            ] * 5,  # 5 parts of 2 marks each
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
        # Question 4
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
                    "sub_parts": [],
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
            ] * 3,
            "question_text": None,
            "options": [],
            "diagram": None
        },
        # Question 5
        {
            "number": 5,
            "title": None,
            "type": "long_answer",
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "calculation",
                    "marks": 3,
                    "question_text": "Calculation problem",
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
            ] * 3,
            "question_text": None,
            "options": [],
            "diagram": None
        },
        # Question 6
        {
            "number": 6,
            "title": None,
            "type": "long_answer",
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "short_answer",
                    "marks": 3,
                    "question_text": "Theory question",
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
            ] * 3,
            "question_text": None,
            "options": [],
            "diagram": None
        },
        # Question 7
        {
            "number": 7,
            "title": None,
            "type": "long_answer",
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "diagram_based",
                    "marks": 3,
                    "question_text": "Question with circuit diagram",
                    "description": "Description of circuit",
                    "sub_parts": [],
                    "options": [],
                    "diagram": {
                        "type": "circuit_diagram",
                        "description": "Circuit diagram description",
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
            ] * 3,
            "question_text": None,
            "options": [],
            "diagram": None
        },
        # Question 8
        {
            "number": 8,
            "title": None,
            "type": "long_answer",
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "calculation",
                    "marks": 4,
                    "question_text": "Complex calculation",
                    "description": None,
                    "sub_parts": [],
                    "options": [],
                    "diagram": None,
                    "formula_given": None,
                    "constants_given": {"g": "10 m/s²"},
                    "column_a": None,
                    "column_b": None,
                    "items_to_arrange": None,
                    "sequence_type": None,
                    "statement_with_blanks": None,
                    "choices_for_blanks": None,
                    "equation_template": None,
                    "missing_parts": None
                }
            ] * 3,
            "question_text": None,
            "options": [],
            "diagram": None
        },
        # Question 9
        {
            "number": 9,
            "title": None,
            "type": "long_answer",
            "total_marks": 10,
            "instruction": None,
            "parts": [
                {
                    "number": "i",
                    "type": "short_answer",
                    "marks": 3,
                    "question_text": "Conceptual question",
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
            ] * 3,
            "question_text": None,
            "options": [],
            "diagram": None
        }
    ]
}

SECTION_A_PROMPT = Template("""You are generating a REAL ${board} ${subject} exam paper for year ${year}.

====== CRITICAL: GENERATE ACTUAL QUESTIONS, NOT PLACEHOLDERS ======

FORBIDDEN WORDS/PHRASES (DO NOT USE):
❌ "Sample MCQ question"
❌ "Sample question" 
❌ "Question with diagram"
❌ "Sub-question text"
❌ "Option A", "Option B", "Option C", "Option D"
❌ Any generic placeholder text

REQUIRED: 
✅ Real ${subject} exam questions
✅ Specific physics/chemistry/biology concepts
✅ Actual numerical values in calculations
✅ Proper scientific terminology
✅ Contextual, exam-realistic content

====== SECTION A STRUCTURE (40 MARKS TOTAL) ======

QUESTION 1: Multiple Choice (15 marks)
- 15 parts (i through xv), 1 mark each
- MUST generate 15 COMPLETE, UNIQUE physics questions
- Each with 4 plausible options labeled (a), (b), (c), (d)
- Cover topics like: mechanics, optics, electricity, magnetism, heat, sound, nuclear physics

Example of what I expect (based on context):
{
  "number": "i",
  "type": "multiple_choice", 
  "marks": 1,
  "question_text": "Which of the following is a scalar quantity?",
  "options": [
    {"option_letter": "(a)", "text": "Velocity"},
    {"option_letter": "(b)", "text": "Force"},
    {"option_letter": "(c)", "text": "Mass"},
    {"option_letter": "(d)", "text": "Acceleration"}
  ]
}

QUESTION 2: Short Answer (15 marks)
- 5 parts (i through v), 3 marks each
- Can have sub-parts (a), (b), (c)
- MUST be real questions about ${subject} concepts
- Examples: define terms, explain phenomena, state laws, describe processes

QUESTION 3: Short Answer (10 marks)  
- 5 parts (i through v), 2 marks each
- Can have sub-parts (a), (b)
- MUST be real questions requiring brief answers
- Examples: identify components, state differences, name instruments

====== YOUR REFERENCE CONTEXT ======
Use these ACTUAL exam questions as inspiration and guidance:
${retrieval_context}

====== EXACT JSON SCHEMA TO FOLLOW ======
${perfect_schema}

====== INSTRUCTIONS ======
1. Study the retrieval context carefully - these are REAL exam questions
2. Generate similar quality questions on ${subject} topics
3. Use proper ${subject} terminology and concepts
4. Ensure variety across different topics
5. Make MCQ distractors plausible but clearly wrong
6. Use "question_text" field for questions (not "question")
7. Return ONLY valid JSON, no markdown fences

BEGIN GENERATION NOW:
""")

SECTION_B_PROMPT = Template("""You are generating a REAL ${board} ${subject} exam paper for year ${year}.

====== CRITICAL: GENERATE ACTUAL QUESTIONS, NOT PLACEHOLDERS ======

FORBIDDEN WORDS/PHRASES (DO NOT USE):
❌ "Question with diagram"
❌ "Description of diagram"  
❌ "Sub-question text"
❌ "Sample question"
❌ "Ray diagram description"
❌ "element1", "element2"
❌ Any generic placeholder text

REQUIRED:
✅ Real ${subject} exam questions  
✅ Specific problem scenarios
✅ Actual numerical values and units
✅ Detailed diagram descriptions
✅ Physics formulas and constants where appropriate

====== SECTION B STRUCTURE (40 MARKS, ATTEMPT ANY 4) ======

Generate 6 COMPLETE questions (Q4 through Q9), each 10 marks:
- Each question has 3 parts: (i), (ii), (iii)
- Mark distribution: 3+3+4 or 2+3+5 or 4+3+3
- MUST include variety of question types

QUESTION TYPES TO USE:

1. DIAGRAM-BASED QUESTIONS
Example of what I expect:
{
  "question_text": "The diagram shows a ray of light PQ incident on a glass prism at angle 40°.",
  "description": "A triangular glass prism ABC with ray PQ incident at face AB",
  "diagram": {
    "type": "ray_diagram",
    "description": "Equilateral glass prism with incident ray at 40° to normal",
    "elements": ["glass prism ABC", "incident ray PQ", "normal at point of incidence"],
    "labels": ["P", "Q", "A", "B", "C", "40°"],
    "angles": {"incident_angle": "40°"}
  },
  "sub_parts": [
    {
      "letter": "(a)",
      "question_text": "Calculate the angle of refraction if refractive index of glass is 1.5",
      "marks": null
    }
  ]
}

2. CALCULATION PROBLEMS
Must include:
- Specific given values
- Required constants (g=10 m/s², c=3×10⁸ m/s, etc.)
- Clear what to calculate
- Proper units

Example:
{
  "question_text": "A body of mass 5 kg is moving with velocity 10 m/s.",
  "constants_given": {"g": "10 m/s²"},
  "sub_parts": [
    {
      "letter": "(a)", 
      "question_text": "Calculate its kinetic energy"
    },
    {
      "letter": "(b)",
      "question_text": "Find the height from which it must fall to acquire this velocity"
    }
  ]
}

3. THEORY/CONCEPTUAL QUESTIONS
Examples:
- "State and explain Ohm's law"
- "Define specific heat capacity and give its SI unit"
- "Explain total internal reflection with two conditions"

====== YOUR REFERENCE CONTEXT ======
Use these ACTUAL exam questions as examples:
${retrieval_context}

====== EXACT JSON SCHEMA TO FOLLOW ======
${perfect_schema}

====== GENERATION REQUIREMENTS ======

For each of 6 questions (Q4-Q9):
1. Choose a SPECIFIC physics topic from: optics, electricity, mechanics, heat, sound, nuclear physics, magnetism
2. Create a realistic problem scenario
3. Generate 3 related parts that build on each other
4. If using diagrams, describe them in detail
5. Include actual numbers, units, constants
6. Write clear, unambiguous question text
7. Use "question_text" field (not "question")

IMPORTANT: Study the retrieval context - those are REAL questions. Generate questions of similar quality and specificity.

Return ONLY valid JSON, no markdown fences.

BEGIN GENERATION NOW:
""")