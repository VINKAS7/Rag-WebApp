# RAG WebApp – Backend (FastAPI)

FastAPI backend that powers the Retrieval-Augmented Generation workflow: file ingestion → chunking/embedding → ChromaDB storage → RAG querying → model inference via Ollama.

## Requirements

- Python 3.10+
- Dependencies from `pyproject.toml`

## Run

```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 3000
```

CORS is configured for `http://localhost:5173` by default.

## Overview

- Ingestion pipeline (`utils/pipeline.py`) converts uploaded docs to chunks, encodes with SentenceTransformers, and stores in ChromaDB per collection
- Query pipeline (`utils/rag_utils.py`) embeds a user query and retrieves relevant documents from the selected collection
- Conversations persisted in TinyDB per conversation id; global history and prompt templates saved in `./db`
- Model responses produced via Ollama (`utils/ollama_utils.py`)

## Endpoints

### Collections / Pipeline
- `GET /api/get_ollama_models` → list available Ollama models
- `GET /api/get_collections` → list collection names
- `POST /api/create_collection/{collectionName}` (multipart files: `files`) → ingest files and build ChromaDB for the collection

### Conversation
- `POST /conversation/get_response`
  - body: `{ modelName, prompt, conversation_id, collectionName }`
  - action: saves user message, retrieves context from Chroma, builds RAG prompt, calls Ollama, saves model response
- `GET /conversation/get_conversation/{id}` → returns `{ collection_conversation, collectionName, modelName }`
- `GET /conversation/get_history` → list of `{ conversation_summary, conversation_id, modelName, collectionName }`
- `DELETE /conversation/delete_conversation/{id}` → deletes conversation metadata and its TinyDB file

### Prompt Templates
- `GET /conversation/get_all_prompt_templates`
- `GET /conversation/get_prompt_template/{name}`
- `POST /conversation/new_prompt_template`
  - body: `{ template_name, template }` (must include `{context}` and `{question}`)
  - action: updates in-memory template and persists to TinyDB
- `POST /conversation/use_default_prompt`
  - action: switch back to built-in default prompt
- `GET /conversation/get_active_prompt_mode`
  - returns `{ mode: 'default' | 'custom' }`

## Data Locations

- Collections: `./collections/{collectionName}/chromadb` (Chroma persistent client)
- Per-conversation TinyDB: `./collections/{collectionName}/db/{conversation_id}.json`
- Global TinyDB:
  - History: `./db/conversations_history.json`
  - Prompt templates: `./db/prompt_templates.json`

## Error Handling

- Safe path handling in uploads (rejects paths escaping base dir)
- Chroma query failures fall back to empty context
- Template formatting falls back to default if keys are missing

## Notes

- The RAG prompt is built from the current in-memory template; use the prompt endpoints to switch between default and custom modes.
- Ensure SentenceTransformers model and Ollama models are available on the host.