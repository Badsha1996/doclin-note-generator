from string import Template

QUESTION_PAPER_PROMPT = Template("""
You are generating a new ICSE exam paper.

Context:
- Board: $board
- Subject: $subject
- Paper: $paper
- Code: $code
- Year: $year

STRICT RULES:
1. Respond ONLY with valid JSON.
2. The JSON MUST strictly follow this schema:
$exampaper_schema

EXAM OBJECT RULES:
- "max_marks": must be an integer (e.g., 80).
- "time_allowed": must be a string (e.g., "90 minutes" or "2 hours").
- "instructions": must be a list of strings.

SECTION RULES:
- Each "section" must have: "name" (string), "marks" (integer), "questions" (list).

QUESTION RULES:
- Each "question" must include: "number" (integer), "type" (one of "MCQ", "Fill in the blanks + reasoning", "Diagram-based + Numericals"), "marks" (integer), and "subparts" (list).

SUBPART RULES:
- Each subpart must strictly include:
  {
    "sub_id": "a",
    "question_text": "..."   <-- use EXACTLY this key
    "options": [...]
  }
- ❌ Do NOT use "text", always use "question_text".
- "options" must always exist:
   - For "MCQ": provide 4 options.
   - For others: use [].

GENERAL:
- Allowed question "type" values: "MCQ", "Fill in the blanks + reasoning", "Diagram-based + Numericals".
- Output must be pure JSON with no explanations.
- Return MINIFIED JSON only.
- Ensure JSON parses correctly with `json.loads`.

Retrieved relevant past subparts:
$retrieval_context
""")
