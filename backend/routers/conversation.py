from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from utils.ollama_utils import ollama_response
from utils.tinydb_utils import TinyDB_Utils, TinyDB_Utils_Global, Tiny_DB_Global_Prompt
import os
from utils.rag_utils import query_chroma_ranked, query_context_ranked, reciprocal_rank_fusion
import chromadb
from sentence_transformers import SentenceTransformer
import uuid

router = APIRouter(
    prefix="/conversation",
    tags=["conversations"]
)

DEFAULT_TEMPLATE = """Use the following pieces of context to answer the user's question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Context:
{context}
---
Question: {question}
"""

prompt_template_store = {"template": DEFAULT_TEMPLATE}

class PromptTemplate(BaseModel):
    template_name: str
    template: str

class UserPrompt(BaseModel):
    modelName: str
    prompt: str
    conversation_id: str
    collectionName: str

class GetConversation(BaseModel):
    conversation_id: str


def generate_rag_prompt(context: str, question: str) -> str:
    """Generates a prompt using stored template."""
    template = prompt_template_store.get("template", DEFAULT_TEMPLATE)
    if not context:
        context = ""
    try:
        return template.format(context=context.strip(), question=question.strip())
    except KeyError as e:
        return DEFAULT_TEMPLATE.format(context=context.strip(), question=question.strip())

def save_previous_context(context:str, collection_name, conversation_id, model="BAAI/bge-large-en-v1.5"):
    embedding_model = SentenceTransformer(model)
    client = chromadb.PersistentClient(path=os.path.join("./collections/",collection_name,"context"))
    collection = client.get_or_create_collection(
        name=conversation_id,
        metadata={"hnsw:space": "cosine"}
    )
    collection.add(
        ids=str(uuid.uuid4()),
        embeddings=embedding_model.encode(context, normalize_embeddings=True),
        documents=context
    )

@router.post("/get_response")
def get_response(prompt: UserPrompt):
    global_db = TinyDB_Utils_Global()
    if not global_db.get_uid_history(prompt.conversation_id):
        summary = prompt.prompt[:50] + "..." if len(prompt.prompt) > 50 else prompt.prompt
        global_db.save_history(
            summary=summary, 
            conversation_id=prompt.conversation_id, 
            modelName=prompt.modelName, 
            collectionName=prompt.collectionName
        )
    db_path = os.path.join("./collections", prompt.collectionName, "db", f"{prompt.conversation_id}.json")
    db = TinyDB_Utils(db_path)
    db.save_conversation(user=prompt.prompt)
    fused_context = ""
    if prompt.collectionName:
        chroma_ranked = query_chroma_ranked(
            collection_name=prompt.collectionName,
            query_text=prompt.prompt,
            n_results=5
        )
        context_ranked = query_context_ranked(
            collection_name=prompt.collectionName,
            conversation_id=prompt.conversation_id,
            query_text=prompt.prompt,
            n_results=5
        )
        top_docs = reciprocal_rank_fusion([chroma_ranked, context_ranked], k=60, top_k=5)
        fused_context = "\n".join(top_docs)
    augmented_prompt = generate_rag_prompt(fused_context, prompt.prompt)
    try:
        response = ollama_response(prompt.modelName, augmented_prompt).strip()
        db.save_conversation(model=response)
        save_previous_context(prompt.prompt.strip() + "\n" + response.strip(), prompt.collectionName, prompt.conversation_id)
        return {"status": "success", "model_response": response}
    except Exception as e:
        return {"status": "failed"}

@router.get("/get_conversation/{uid}")
def get_conversation(uid: str):
    global_db = TinyDB_Utils_Global()
    conversation_history_meta = global_db.get_uid_history(uid)
    if not conversation_history_meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    conversation_info = conversation_history_meta[0]
    collectionName = conversation_info["collectionName"]
    modelName = conversation_info["modelName"]
    db_path = os.path.join("./collections", conversation_info["collectionName"], "db", f"{conversation_info['conversation_id']}.json")
    if not os.path.exists(db_path):
        return {"status": "success", "collection_conversation": []}
    try:
        db = TinyDB_Utils(db_path)
        collection_conversation = db.get_collection_conversation_history()
        return {"status": "success", "collection_conversation": collection_conversation, "collectionName": collectionName, "modelName": modelName}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation: {str(e)}"
        )

@router.get("/get_history")
def get_history():
    global_db = TinyDB_Utils_Global()
    return global_db.get_history()

@router.post("/new_prompt_template")
def new_prompt_template(template: PromptTemplate):
    """Update global/custom RAG prompt template"""
    if "{context" not in template.template or "{question" not in template.template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template must include {context} and {question}"
        )
    prompt_template_store["template"] = template.template
    global_db_prompt = Tiny_DB_Global_Prompt()
    global_db_prompt.save_prompt_template(template.template_name, template.template)
    return {"status": "success", "template": template.template}

@router.post("/use_default_prompt")
def use_default_prompt():
    """Revert to the built-in DEFAULT_TEMPLATE for RAG."""
    prompt_template_store["template"] = DEFAULT_TEMPLATE
    return {"status": "success", "mode": "default"}

@router.get("/get_active_prompt_mode")
def get_active_prompt_mode():
    """Check if the current in-memory template equals the DEFAULT_TEMPLATE."""
    try:
        current = prompt_template_store.get("template", DEFAULT_TEMPLATE)
        mode = "default" if current == DEFAULT_TEMPLATE else "custom"
        return {"status": "success", "mode": mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_prompt_template/{template_name}")
def get_prompt_template(template_name: str):
    global_db_prompt = Tiny_DB_Global_Prompt()
    return {"status": "success", "template":global_db_prompt.get_name_template(template_name)}

@router.get("/get_all_prompt_templates")
def get_all_prompt_templates():
    global_db_prompt = Tiny_DB_Global_Prompt()
    return {"status":"success", "templates":global_db_prompt.get_all_templates()}

@router.delete("/delete_conversation/{uid}")
def delete_conversation(uid: str):
    global_db = TinyDB_Utils_Global()
    try:
        conversation_info = global_db.get_uid_history(uid)
        if not conversation_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        conversation_info = conversation_info[0]
        deleted = global_db.delete_conversation(uid)
        if deleted:
            db_path = os.path.join(
                "./collections",
                conversation_info["collectionName"],
                "db",
                f"{conversation_info['conversation_id']}.json"
            )
            if os.path.exists(db_path):
                os.remove(db_path)
            return {"status": "success"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )
