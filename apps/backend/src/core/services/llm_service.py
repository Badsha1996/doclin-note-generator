import re
from fastapi import HTTPException

from ..repo.llm_repo import LLMRepo

from ...LLMs.LLMs import LLMProviderManager
from ...prompts.ICSE_questions import QUESTION_PAPER_PROMPT


class LLMService:
    def __init__(self, subject: str, syllabus_data=None, llm_repo=LLMRepo, LLMProvider=LLMProviderManager):
        self.llm_repo = llm_repo
        self.subject = subject
        self.LLMProvider = LLMProvider
        self.syllabus_data = syllabus_data

    

    def extract_json_block(self, text: str) -> str | None:
        pattern = re.compile(r"```json(.*?)```", re.DOTALL | re.IGNORECASE)
        match = pattern.search(text)
        if match:
            content = match.group(1).strip()
        else:
            # Fallback: try with generic triple backticks
            pattern = re.compile(r"```(.*?)```", re.DOTALL)
            match = pattern.search(text)
            if match:
                content = match.group(1).strip()
            else:
                # If no fences, assume whole text is JSON
                content = text.strip()

        # Ensure it ends properly at the last }
        if "}" in content:
            content = content[: content.rfind("}") + 1]

        return content if content else None

    
    async def generate_questions(self):
        if not self.syllabus_data:
            raise HTTPException(status_code=400, detail="Syllabus data is required")

        syllabus_json = self.syllabus_data.model_dump_json() 

        prompt = QUESTION_PAPER_PROMPT.replace("{total_marks}", "80").replace("{subject}", self.subject).replace("{syllabus_json}", syllabus_json)

        llm = self.LLMProvider().get_llm()
        raw_output = llm.invoke(prompt)
        print(raw_output)
        parsed_output = self.LLMProvider().safe_json_parse(self.extract_json_block(raw_output))

        
        return parsed_output
