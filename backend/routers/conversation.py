from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from utils.ollama_utils import ollama_response

router = APIRouter(
    prefix="/conversation",
    tags=["conversations"]
)

class UserPrompt(BaseModel):
    provider: str
    modelName: str
    prompt: str

@router.post("/get_response")
def get_response(prompt: UserPrompt):
    if prompt.provider == "Ollama":
        return {"status":"sucess", "model_response": ollama_response(prompt.modelName, prompt.prompt).strip()}
    elif prompt.provider == "ChatGPT":
        return {"status":"sucess", "model_response": ollama_response(prompt.modelName, prompt.prompt).strip()}
    elif prompt.provider == "Claude":
        return {"status":"sucess", "model_response": ollama_response(prompt.modelName, prompt.prompt).strip()}
    elif prompt.provider == "Gemini":
        return {"status":"sucess", "model_response": ollama_response(prompt.modelName, prompt.prompt).strip()}

@router.post("/save_conversation")
def save_conversation():
    pass