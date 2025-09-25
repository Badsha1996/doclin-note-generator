from string import Template

SECTION_A_PROMPT = Template("""
You are an expert exam paper generator for ${board} ${subject} examinations.

Generate Section A (compulsory section) for ${board} ${subject} exam paper ${code} for year ${year}.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY the JSON structure shown in the demo. No extra or missing fields.
2. Every 'parts' object MUST have 'type' and 'marks' fields.
3. Use the exact field names from the demo JSON.
4. Question 1: 15 multiple choice parts (i-xv), each with 4 options.
5. Question 2: 5-7 parts (i-vii) with 2-4 marks each, totaling 15 marks.
6. Question 3: 4-5 parts (i-v) with 2-3 marks each, totaling 10 marks.

MULTIPLE CHOICE RULES:
- Use type = "multiple_choice" (never "mcq")
- Each option must be an object: {"option_text": "...", "is_correct": true/false}
- Only one option can have "is_correct": true

VALID TYPES FOR PARTS:
"multiple_choice", "short_answer", "long_answer", "diagram_based",
"calculation", "matching", "fill_blanks", "arrange_sequence",
"complete_equation", "identify_structure"
Default to "short_answer" if unsure.

SUB-PARTS AND PARTS:
- Parts must be labeled with roman numerals: i, ii, iii...
- Sub-parts (if any) must be labeled with letters: a, b, c...
- Each question must total exactly the marks specified.

DEMO JSON STRUCTURE (FOLLOW EXACTLY):
${demo_json}

AVAILABLE CONTEXT:
${retrieval_context}

INSTRUCTIONS:
- Use context to create relevant physics questions.
- Multiple choice options should be plausible but only one correct.
- Short answer parts can have sub_parts or direct question_text.
- Ensure all marks add up exactly.
- Return ONLY the valid JSON structure. No extra text.
""")

SECTION_B_PROMPT = Template("""
You are an expert exam paper generator for ${board} ${subject} examinations.

Generate Section B (optional section) for ${board} ${subject} exam paper ${code} for year ${year}.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY the JSON structure shown in the demo. No extra or missing fields.
2. Every 'parts' object MUST have 'type' and 'marks' fields.
3. Use the exact field names from the demo JSON.
4. Generate 6 questions (4-9), each worth exactly 10 marks.
5. Each question should have 3 parts (i, ii, iii) with varying marks (e.g., 3+3+4).

VALID TYPES FOR PARTS:
"multiple_choice", "short_answer", "long_answer", "diagram_based",
"calculation", "matching", "fill_blanks", "arrange_sequence",
"complete_equation", "identify_structure"
Default to "short_answer" if unsure.

MULTIPLE CHOICE RULES:
- type = "multiple_choice"
- Each option must be an object: {"option_text": "...", "is_correct": true/false}
- Only one option may have "is_correct": true

DIAGRAM BASED RULES:
- diagram.type MUST be one of: "circuit_diagram", "ray_diagram", "force_diagram",
  "molecular_structure", "apparatus_setup", "anatomical_diagram", "cell_diagram",
  "system_diagram", "graph", "flowchart", "Others"
- If unsure, use "Others"

SUB-PARTS AND PARTS:
- Parts must be labeled with roman numerals: i, ii, iii...
- Sub-parts (if any) must be labeled with letters: a, b, c...
- Each question must total exactly 10 marks.

DEMO JSON STRUCTURE (FOLLOW EXACTLY):
${demo_json}

AVAILABLE CONTEXT:
${retrieval_context}

INSTRUCTIONS:
- Use context to create relevant physics questions.
- Include variety: calculations, diagrams, explanations.
- Return ONLY the valid JSON structure. No extra text.
""")
