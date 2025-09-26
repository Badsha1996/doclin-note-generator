from string import Template

SECTION_A_PROMPT = Template("""
You are an expert exam paper generator for ${board} ${subject} examinations.

Generate Section A (compulsory section) for ${board} ${subject} exam paper ${code} for year ${year}.

RULE: For any list field (sub_parts, options, diagram.elements, labels, column_a, column_b, etc.),
never return null. If empty, return [].
                                                        
CRITICAL REQUIREMENTS (FOLLOW SCHEMA EXACTLY):
1. Follow the DEMO JSON structure exactly. No extra fields, no missing fields.
2. Every "parts" object MUST include "number", "type", and "marks".
3. Field names must match the demo JSON exactly.
4. Question 1: 15 multiple choice parts (i–xv), each worth 1 mark, each with 4 options.
5. Question 2: 5–7 parts (i–vii), 2–4 marks each, total = 15 marks.
6. Question 3: 4–5 parts (i–v), 2–3 marks each, total = 10 marks.

MULTIPLE CHOICE OPTIONS FORMAT (STRICT):
Each option must be an object with these exact fields:
{
  "option_letter": "(a)",
  "text": "Option text here"
}

DIAGRAM RULES:
- "diagram.elements" MUST be a list of plain strings only (no objects).
  Example: ["Battery: 12 V", "Resistor: 4 Ω"]
- "diagram.labels" MUST be a list of strings.
- "diagram.type" must be one of:
  "circuit_diagram", "ray_diagram", "force_diagram", "molecular_structure",
  "apparatus_setup", "anatomical_diagram", "cell_diagram", "system_diagram",
  "graph", "flowchart", "Others"

FORMULA AND CONSTANTS:
- If no formula is needed, either omit "formula_given" or set it to null.
- "formula_given" must always be a plain string (e.g. "P = V * I").
- "constants_given" must always be a dictionary with string key-value pairs:
  Example: { "g": "10 m/s²", "c": "3×10^8 m/s" }
- Do not wrap it in {"value": "..."}.


PART/QUESTION LABELING:
- Parts numbered in roman numerals ("i", "ii", "iii", ...).
- Sub-parts lettered ("(a)", "(b)", "(c)", ...).

DEMO JSON STRUCTURE (FOLLOW EXACTLY):
${demo_json}

AVAILABLE CONTEXT:
${retrieval_context}

INSTRUCTIONS:
- Use the provided context to generate relevant ${subject} questions.
- Ensure marks add up exactly as specified.
- Provide only valid JSON — no explanations, no prose.
- Validate that all fields conform strictly to the schema.
""")

SECTION_B_PROMPT = Template("""
You are an expert exam paper generator for ${board} ${subject} examinations.

Generate Section B (optional section) for ${board} ${subject} exam paper ${code} for year ${year}.

RULE: For any list field (sub_parts, options, diagram.elements, labels, column_a, column_b, etc.),
never return null. If empty, return [].
                            
CRITICAL REQUIREMENTS (FOLLOW SCHEMA EXACTLY):
1. Follow the DEMO JSON structure exactly. No extra fields, no missing fields.
2. Every "parts" object MUST include "number", "type", and "marks".
3. Field names must match the demo JSON exactly.
4. Generate 6 questions (numbers 4–9), each worth exactly 10 marks.
5. Each question has 3 parts (i, ii, iii), marks distribution = 3+3+4 or 2+3+5.

MULTIPLE CHOICE OPTIONS FORMAT (STRICT):
Each option must be an object with these exact fields:
{
  "option_letter": "(a)",
  "text": "Option text here"
}

DIAGRAM RULES:
- "diagram.elements" MUST be a list of plain strings only (no objects).
- "diagram.labels" MUST be a list of strings.
- "diagram.type" must be one of the allowed types:
  "circuit_diagram", "ray_diagram", "force_diagram", "molecular_structure",
  "apparatus_setup", "anatomical_diagram", "cell_diagram", "system_diagram",
  "graph", "flowchart", "Others"

FORMULA AND CONSTANTS:
- If no formula is needed, either omit "formula_given" or set it to null.
- "formula_given" must always be a plain string (e.g. "P = V * I").
- "constants_given" must always be a dictionary with string key-value pairs:
  Example: { "g": "10 m/s²", "c": "3×10^8 m/s" }
- Do not wrap it in {"value": "..."}.

LABELING RULES:
- Parts use roman numerals ("i", "ii", "iii").
- Sub-parts use letters ("(a)", "(b)", "(c)").

DEMO JSON STRUCTURE (FOLLOW EXACTLY):
${demo_json}

AVAILABLE CONTEXT:
${retrieval_context}

INSTRUCTIONS:
- Use context for realistic ${subject} questions.
- Include variety: calculations, diagrams, reasoning.
- Ensure scientific accuracy and difficulty level is appropriate.
- Ensure all marks add up to exactly 10 per question.
- Output ONLY valid JSON conforming to the schema.
                            

""")
