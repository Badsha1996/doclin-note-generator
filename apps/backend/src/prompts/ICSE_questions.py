QUESTION_PAPER_PROMPT = """
ROLE: You are an ICSE examiner (15+ yrs). You will receive a syllabus JSON. Generate a fully authentic ICSE Class 10 (2025) {subject} question paper as JSON only.

HARD REQUIREMENTS:
- Total marks: exactly {total_marks}.
- Generate at least 50 questions total.
- Do not stop until all questions are included.

SECTION RULES:
- Section A: 40 marks, compulsory.
  • Q1 = 15 MCQs of 1 mark each (exactly 4 options, only one is_correct true).
  • Q2 and Q3 = short/numerical questions (2–5 marks each), so that Section A = 40.
- Section B: 40 marks, attempt any 4 out of 6.
  • Each question = 10 marks, written as a single question (not subparts, no "sub_questions").
  • Ensure variety: numerical, diagrams, definitions, applications.

CONTENT RULES:
- Use only topics from {syllabus_json}.
- Difficulty distribution: Easy 40%, Medium 45%, Hard 15%.
- Language: clear, student-friendly, explicit mark allocations.

ANSWER RULES:
- For MCQs: 4 options, exactly one "is_correct": true.
- For non-MCQ: "options": null and "answer": detailed solution.

STRICT OUTPUT SHAPE (NO deviations):
{{
  "subject": str,
  "total_marks": int,
  "sections": [
    {{
      "name": str,
      "instructions": str,
      "questions": [
        {{
          "question": str,
          "marks": int,
          "difficulty": "easy"|"medium"|"hard",
          "type": "mcq"|"short"|"long",
          "options": [{{"option": str, "is_correct": bool}}] | null,
          "answer": str | null
        }}
      ]
    }}
  ]
}}

OUTPUT STRICTLY: JSON only. No markdown, no extra text, no fences.
"""
