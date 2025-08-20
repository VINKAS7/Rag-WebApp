from fastapi import APIRouter
from pydantic import BaseModel
from utils.ollama_utils import ollama_response
from utils.tinydb_utils import TinyDB_Utils, TinyDB_Utils_Global
import os

router = APIRouter(
    prefix="/conversation",
    tags=["conversations"]
)

class UserPrompt(BaseModel):
    provider: str
    modelName: str
    prompt: str
    conversation_id: str
    collectionName: str

class GetConversation(BaseModel):
    conversation_id: str
    

@router.post("/get_response")
def get_response(prompt: UserPrompt):
    db = TinyDB_Utils(os.path.join("../collections",prompt.collectionName,"db",f"{prompt.conversation_id}.json"))
    if prompt.provider == "Ollama":
        try:
            response = ollama_response(prompt.modelName, prompt.prompt).strip() 
            db.save_conversation(prompt.prompt, response, prompt.conversation_id)
            return {"status":"sucess", "model_response": response}
        except:
            return {"status":"failed"}
    elif prompt.provider == "ChatGPT":
        try:
            response = ollama_response(prompt.modelName, prompt.prompt).strip() 
            db.save_conversation(prompt.prompt, response)
            return {"status":"sucess", "model_response": response}
        except:
            return {"status":"failed"}
    elif prompt.provider == "Claude":
        try:
            response = ollama_response(prompt.modelName, prompt.prompt).strip() 
            db.save_conversation(prompt.prompt, response)
            return {"status":"sucess", "model_response": response}
        except:
            return {"status":"failed"}
    elif prompt.provider == "Gemini":
        try:
            response = ollama_response(prompt.modelName, prompt.prompt).strip() 
            db.save_conversation(prompt.prompt, response)
            return {"status":"sucess", "model_response": response}
        except:
            return {"status":"failed"}

@router.post("/get_conversation/{uid}")
def get_conversation(uid: str):
    global_db = TinyDB_Utils_Global()
    conversation_info = global_db.get_uid_history(uid.conversation_id)
    db = TinyDB_Utils(os.path.join("../collections/",conversation_info.collectionName,f"{conversation_info.collection_id}.json"))
    try:
        collection_conversation = db.get_collection_conversation_history()
        return {"status":"success","collection_conversation":collection_conversation}
    except:
        return {"status":"failed"}

@router.get("/get_history")
def get_history():
    global_db = TinyDB_Utils_Global()
    return global_db.get_history()