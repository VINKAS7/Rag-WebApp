import os
import uuid
import asyncio
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from utils.ollama_utils import ollama_response_stream
from utils.tinydb_utils import TinyDB_Utils, TinyDB_Utils_Global, Tiny_DB_Global_Prompt
from utils.rag_utils import query_chroma_ranked, query_context_ranked, reciprocal_rank_fusion
from utils.cache import get_embedding_model, get_chroma_client, get_chroma_collection
import json
from fastapi.responses import StreamingResponse

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
    template = prompt_template_store.get("template", DEFAULT_TEMPLATE)
    if not context:
        context = ""
    try:
        return template.format(context=context.strip(), question=question.strip())
    except KeyError:
        return DEFAULT_TEMPLATE.format(context=context.strip(), question=question.strip())

def save_previous_context(context: str, collection_name: str, conversation_id: str):
    embedding_model = get_embedding_model()
    client = get_chroma_client(os.path.join("./collections/", collection_name, "context"))
    collection = get_chroma_collection(client, conversation_id)
    collection.add(
        ids=str(uuid.uuid4()),
        embeddings=embedding_model.encode(context, normalize_embeddings=True),
        documents=context
    )

async def generate_stream_response(modelName, user_prompt, conversation_id, collectionName, db):
    """Async generator for FastAPI streaming"""
    full_response = ""
    
    try:
        # Generate the stream
        for chunk in ollama_response_stream(modelName, user_prompt):
            full_response += chunk
            # Send each chunk as JSON
            yield f"data: {json.dumps({'chunk': chunk, 'status': 'streaming'})}\n\n"
        
        # Save the complete response to database
        await asyncio.to_thread(db.save_conversation, model=full_response)
        await asyncio.to_thread(
            save_previous_context,
            user_prompt.strip() + "\n" + full_response.strip(),
            collectionName,
            conversation_id
        )
        
        # Send completion signal
        yield f"data: {json.dumps({'status': 'complete', 'full_response': full_response})}\n\n"
        
    except Exception as e:
        yield f"data: {json.dumps({'status': 'error', 'error': str(e)})}\n\n"

@router.post("/get_response_stream")
async def get_response_stream(prompt: UserPrompt):
    """Streaming endpoint using Server-Sent Events"""
    global_db = TinyDB_Utils_Global()
    history = await asyncio.to_thread(global_db.get_uid_history, prompt.conversation_id)

    if not history:
        summary = prompt.prompt[:50] + "..." if len(prompt.prompt) > 50 else prompt.prompt
        await asyncio.to_thread(
            global_db.save_history,
            summary,
            prompt.conversation_id,
            prompt.modelName,
            prompt.collectionName
        )

    db_path = os.path.join("./collections", prompt.collectionName, "db", f"{prompt.conversation_id}.json")
    db = TinyDB_Utils(db_path)
    await asyncio.to_thread(db.save_conversation, user=prompt.prompt)

    fused_context = ""
    if prompt.collectionName:
        chroma_task = asyncio.to_thread(
            query_chroma_ranked,
            prompt.collectionName,
            prompt.prompt,
            5
        )
        context_task = asyncio.to_thread(
            query_context_ranked,
            prompt.collectionName,
            prompt.conversation_id,
            prompt.prompt,
            5
        )

        chroma_ranked, context_ranked = await asyncio.gather(chroma_task, context_task)
        top_docs = reciprocal_rank_fusion([chroma_ranked, context_ranked], k=60, top_k=5)
        fused_context = "\n".join(top_docs)

    augmented_prompt = generate_rag_prompt(fused_context, prompt.prompt)

    return StreamingResponse(
        generate_stream_response(prompt.modelName, augmented_prompt, prompt.conversation_id, prompt.collectionName, db),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

@router.get("/get_conversation/{uid}")
async def get_conversation(uid: str):
    global_db = TinyDB_Utils_Global()
    conversation_history_meta = await asyncio.to_thread(global_db.get_uid_history, uid)
    if not conversation_history_meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    conversation_info = conversation_history_meta[0]
    db_path = os.path.join("./collections", conversation_info["collectionName"], "db", f"{conversation_info['conversation_id']}.json")

    exists = await asyncio.to_thread(os.path.exists, db_path)
    if not exists:
        return {"status": "success", "collection_conversation": []}

    try:
        db = TinyDB_Utils(db_path)
        collection_conversation = await asyncio.to_thread(db.get_collection_conversation_history)
        return {
            "status": "success",
            "collection_conversation": collection_conversation,
            "collectionName": conversation_info["collectionName"],
            "modelName": conversation_info["modelName"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation: {str(e)}"
        )


@router.get("/get_history")
async def get_history():
    global_db = TinyDB_Utils_Global()
    return await asyncio.to_thread(global_db.get_history)


@router.post("/new_prompt_template")
async def new_prompt_template(template: PromptTemplate):
    if "{context" not in template.template or "{question" not in template.template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template must include {context} and {question}"
        )
    prompt_template_store["template"] = template.template
    global_db_prompt = Tiny_DB_Global_Prompt()
    await asyncio.to_thread(global_db_prompt.save_prompt_template, template.template_name, template.template)
    return {"status": "success", "template": template.template}


@router.delete("/delete_prompt_template/{template_name}")
async def delete_prompt_template(template_name: str):
    db = Tiny_DB_Global_Prompt()
    deleted = await asyncio.to_thread(db.delete_prompt_template, template_name)
    return {"status": "success"} if deleted else {"status": "failed"}


@router.post("/use_default_prompt")
async def use_default_prompt():
    """Revert to the built-in DEFAULT_TEMPLATE for RAG."""
    prompt_template_store["template"] = DEFAULT_TEMPLATE
    return {"status": "success", "mode": "default"}


@router.get("/get_active_prompt_mode")
async def get_active_prompt_mode():
    try:
        current = prompt_template_store.get("template", DEFAULT_TEMPLATE)
        mode = "default" if current == DEFAULT_TEMPLATE else "custom"
        return {"status": "success", "mode": mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get_prompt_template/{template_name}")
async def get_prompt_template(template_name: str):
    global_db_prompt = Tiny_DB_Global_Prompt()
    template = await asyncio.to_thread(global_db_prompt.get_name_template, template_name)
    return {"status": "success", "template": template}


@router.get("/get_all_prompt_templates")
async def get_all_prompt_templates():
    global_db_prompt = Tiny_DB_Global_Prompt()
    templates = await asyncio.to_thread(global_db_prompt.get_all_templates)
    return {"status": "success", "templates": templates}


@router.delete("/delete_conversation/{uid}")
async def delete_conversation(uid: str):
    global_db = TinyDB_Utils_Global()
    try:
        conversation_info = await asyncio.to_thread(global_db.get_uid_history, uid)
        if not conversation_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        conversation_info = conversation_info[0]
        deleted = await asyncio.to_thread(global_db.delete_conversation, uid)
        if deleted:
            db_path = os.path.join(
                "./collections",
                conversation_info["collectionName"],
                "db",
                f"{conversation_info['conversation_id']}.json"
            )
            exists = await asyncio.to_thread(os.path.exists, db_path)
            if exists:
                await asyncio.to_thread(os.remove, db_path)
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