from pydantic import BaseModel
from typing import Union

class FileSchema(BaseModel):
    url : str

class ParsedSchema(BaseModel):
    parsed_text : Union[str, list[str]]

class LLMUnitTopicSchema(BaseModel):
    topic_id: str
    title: str
    subtopics: list[str]
    sources: list[str]
    learning_objectives: list[str]
    key_terms: list[str]

class LLMUnitSchema(BaseModel):
    unit_id: str
    title: str
    topics: list[LLMUnitTopicSchema]

class LLMSchema(BaseModel):
    subject: str
    version_date: str
    units: list[LLMUnitSchema]