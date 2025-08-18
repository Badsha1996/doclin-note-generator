import re
import json
from datetime import date
from google import genai
from ..config.config import settings
import requests


LLM_PROVIDER = settings.LLM_PROVIDER.lower()

if LLM_PROVIDER == "gemini":
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
elif LLM_PROVIDER == "ollama":
    OLLAMA_URL = settings.OLLAMA_URL.rstrip("/")
    OLLAMA_MODEL = settings.OLLAMA_MODEL
else:
    raise ValueError(f"Unknown LLM provider: {LLM_PROVIDER}")


SCHEMA = {
    "subject": "string",
    "version_date": "YYYY-MM-DD",
    "units": [
        {
            "unit_id": "string",
            "title": "string",
            "topics": [
                {
                    "topic_id": "string",
                    "title": "string",
                    "subtopics": ["string", "..."],
                    "sources": ["string", "..."],
                    "learning_objectives": ["string", "..."],
                    "key_terms": ["string", "..."]
                }
            ]
        }
    ]
}

PROMPT_TEMPLATE = """
You are a precise syllabus-to-JSON parser.

GOAL
- Convert the provided syllabus text into valid JSON according to the schema.
- Detect and extract:
  - Subject name
  - Units
  - Topics within units
  - Subtopics
  - Sources/references
  - Learning objectives
  - Key terms
  - Internal assessment/project work
  - Notes

RULES
- If information is missing, use empty arrays.
- IDs: unit_id = "<SUBJECT>-<NUMBER>", topic_id = "<UNIT_ID>-T<NUMBER>".
- Preserve exact wording for titles and sources.
- Only output JSON. No explanations, comments, or extra text.

Schema:
{schema}

INPUT:
{chunk}
"""


# -------------------
# HELPERS
# -------------------
def clean_text(text: str) -> str:
    """Remove junk patterns, normalize whitespace/bullets."""
    # Remove standalone page numbers
    text = re.sub(r'(?m)^\s*\d+\s*$', '', text)
    # Remove known admin text
    text = re.sub(r'Award of Marks.*', '', text, flags=re.S)
    text = re.sub(r'The Head of the school.*', '', text, flags=re.S)
    # Normalize bullets
    text = re.sub(r'[•]', '-', text)
    # Normalize blank lines
    text = re.sub(r'\n{2,}', '\n\n', text)
    return text.strip()

def chunk_text(text: str, max_chars=8000):
    """Split text into logical chunks at unit/chapter markers if possible."""
    markers = re.split(r'\n(?=UNIT\s+\d+|CHAPTER\s+\d+|TOPIC\s+\d+)', text)
    chunks, current = [], ""
    for m in markers:
        if len(current) + len(m) < max_chars:
            current += m
        else:
            if current.strip():  # Only append non-empty chunks
                chunks.append(current.strip())
            current = m
    if current.strip():
        chunks.append(current.strip())
    return chunks

def generate_content(prompt: str) -> str:
    """Unified interface for LLM calls."""
    if LLM_PROVIDER == "gemini":
        resp = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return resp.text

    elif LLM_PROVIDER == "ollama":
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Lower temperature for more consistent JSON output
                "top_p": 0.9,
                "num_predict": 4096  # Ensure enough tokens for complete JSON
            }
        }
        
        try:
            # Correct Ollama API endpoint
            response = requests.post(
                f"{OLLAMA_URL}/api/generate", 
                json=payload, 
                timeout=300,
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            
            # Handle Ollama response format
            result = response.json()
            if 'response' in result:
                return result['response']
            else:
                raise ValueError(f"Unexpected Ollama response format: {result}")
                
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Ollama API request failed: {e}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response from Ollama: {e}")


def safe_json_parse(raw: str):
    """Ensure clean JSON output, strip Markdown/code fences if present."""
    raw = raw.strip()
    
    # Remove code fences if present
    if raw.startswith("```"):
        lines = raw.split('\n')
        # Remove first line if it's just ```json or ```
        if lines[0].strip() in ['```', '```json', '```JSON']:
            lines = lines[1:]
        # Remove last line if it's just ```
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        raw = '\n'.join(lines)
    
    # Try to find JSON content within the response
    json_start = raw.find('{')
    json_end = raw.rfind('}') + 1
    
    if json_start != -1 and json_end > json_start:
        raw = raw[json_start:json_end]
    
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        # Try to fix common JSON issues
        try:
            # Remove trailing commas
            fixed_json = re.sub(r',(\s*[}\]])', r'\1', raw)
            return json.loads(fixed_json)
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON from LLM: {e}\nRaw content: {raw[:500]}...")

def parse_chunk(chunk: str, max_retries=2):
    """Parse a chunk with retry logic for better reliability."""
    prompt = PROMPT_TEMPLATE.format(schema=json.dumps(SCHEMA, indent=2), chunk=chunk)
    
    for attempt in range(max_retries + 1):
        try:
            raw_output = generate_content(prompt)
            return safe_json_parse(raw_output)
        except Exception as e:
            if attempt == max_retries:
                print(f"[ERROR] Failed to parse chunk after {max_retries + 1} attempts: {e}")
                # Return minimal valid structure to avoid breaking the pipeline
                return {
                    "subject": "Unknown",
                    "version_date": date.today().isoformat(),
                    "units": []
                }
            else:
                print(f"[WARNING] Parse attempt {attempt + 1} failed, retrying: {e}")


def merge_results(json_list):
    """Merge multiple JSON outputs without duplicates."""
    if not json_list:
        return {
            "subject": "Unknown",
            "version_date": date.today().isoformat(),
            "units": []
        }

    # Filter out empty results
    valid_results = [j for j in json_list if j.get("units")]
    
    if not valid_results:
        return json_list[0] if json_list else {
            "subject": "Unknown", 
            "version_date": date.today().isoformat(),
            "units": []
        }

    final = valid_results[0].copy()
    seen_units = set(u["unit_id"] for u in final.get("units", []))

    for j in valid_results[1:]:
        # Update subject if current one is "Unknown" but new one isn't
        if final.get("subject") == "Unknown" and j.get("subject", "Unknown") != "Unknown":
            final["subject"] = j["subject"]
            
        # Merge units without duplicates
        for u in j.get("units", []):
            if u["unit_id"] not in seen_units:
                final["units"].append(u)
                seen_units.add(u["unit_id"])
            else:
                # Merge topics within existing units
                existing_unit = next(eu for eu in final["units"] if eu["unit_id"] == u["unit_id"])
                existing_topics = set(t["topic_id"] for t in existing_unit.get("topics", []))
                
                for topic in u.get("topics", []):
                    if topic["topic_id"] not in existing_topics:
                        existing_unit["topics"].append(topic)
                        existing_topics.add(topic["topic_id"])

    final["version_date"] = date.today().isoformat()
    return final

# -------------------
# MAIN PIPELINE
# -------------------
def syllabus_to_json(raw_text: str):
    """Full pipeline: clean, chunk, parse with LLM, merge into final JSON."""
    if not raw_text or not raw_text.strip():
        return {
            "subject": "Unknown",
            "version_date": date.today().isoformat(),
            "units": []
        }
    
    cleaned = clean_text(raw_text)
    if not cleaned:
        return {
            "subject": "Unknown",
            "version_date": date.today().isoformat(),
            "units": []
        }
    
    chunks = chunk_text(cleaned)
    parsed_chunks = []

    print(f"[INFO] Processing {len(chunks)} chunks with {LLM_PROVIDER}")
    
    for i, chunk in enumerate(chunks):
        print(f"[INFO] Processing chunk {i + 1}/{len(chunks)}")
        try:
            result = parse_chunk(chunk)
            if result and result.get("units"):  # Only add chunks with actual content
                parsed_chunks.append(result)
        except Exception as e:
            print(f"[ERROR] Failed to parse chunk {i + 1}: {e}")

    final_result = merge_results(parsed_chunks)
    print(f"[INFO] Successfully parsed syllabus: {len(final_result.get('units', []))} units found")
    
    return final_result