# RAG WebApp

A full-stack Retrieval-Augmented Generation application. The frontend (React + TypeScript + Vite) provides a clean chat interface, collection management, and a prompt template editor. The backend (FastAPI) ingests documents, builds a ChromaDB vector store, retrieves relevant context for user prompts, and generates responses using Ollama.

## Highlights

- Modern, responsive chat UI with conversation history
- Upload documents to build per-collection vector stores (ChromaDB)
- Choose a model and collection, then chat with RAG-augmented answers
- Prompt Template Editor: toggle default vs custom templates, drag placeholders, save and apply templates instantly
- Route hydration: direct navigation to `/conversation/{id}` loads state automatically

## Architecture

- Frontend: React + TypeScript + Vite
  - State: Redux Toolkit
  - Styling: Tailwind CSS utilities (configured in Vite)
- Backend: FastAPI
  - Ingestion: `docling` + `sentence-transformers` (embeddings) + `ChromaDB`
  - Storage: Chroma persistent store per collection, TinyDB for conversation history and prompt templates
  - LLM Inference: Ollama

```
User → Frontend (React) → Backend (FastAPI) →
  ↳ Query: ChromaDB (retrieve context) + Ollama (generate) → Response → Frontend
  ↳ Ingest: Files → Chunk + Embed → ChromaDB (Persistent)
  ↳ Persist: TinyDB (history, templates)
```

## Repository Structure

- `frontend/`
  - React app (components, pages, Redux slices, assets)
  - See `frontend/README.md` for detailed UI usage
- `backend/`
  - FastAPI app, routers, utils, ingestion and RAG helpers
  - See `backend/README.md` for endpoints and data flow
- `collections/`
  - Created at runtime. Each collection stores its ChromaDB and per-conversation TinyDB files
- `backend/db/`
  - Global TinyDB stores for conversation history and prompt templates

## Prerequisites

- Node.js 18+
- Python 3.10+
- Ollama installed with desired models available locally

## Setup and Run

1) Backend

- Install Python dependencies as defined in `backend/pyproject.toml` (e.g., with `uv` or `pip`)
- Start FastAPI

```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 3000
```

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3000`

## Core Flows

- Create a collection
  - Click Upload in the footer, select files, name the collection, submit
  - The backend chunks, embeds, and stores vectors in Chroma; the new collection appears in the list

- Start a conversation
  - On Home, select a model and a collection
  - Enter your prompt and Send → app navigates to `/conversation/{id}` and persists history

- Continue a conversation
  - Type another prompt and Send; messages render immediately and the model response follows

- Manage templates
  - Open the Prompt Settings (sidebar)
  - Select "Default prompt" to use the built-in template, or choose a saved template to apply it
  - Create new templates (must include `{context}` and `{question}`)

## Backend API (summary)

- Collections
  - `GET /api/get_ollama_models` → list Ollama models
  - `GET /api/get_collections` → list collections
  - `POST /api/create_collection/{collectionName}` → ingest files (multipart: `files`)
- Conversation
  - `POST /conversation/get_response` → RAG + Ollama response
  - `GET /conversation/get_conversation/{id}` → conversation history and metadata
  - `GET /conversation/get_history` → global conversation history
  - `DELETE /conversation/delete_conversation/{id}` → delete a conversation
- Prompt templates
  - `GET /conversation/get_all_prompt_templates`
  - `GET /conversation/get_prompt_template/{name}`
  - `POST /conversation/new_prompt_template` → save/apply custom template
  - `POST /conversation/use_default_prompt` → switch to built-in default
  - `GET /conversation/get_active_prompt_mode` → `default` or `custom`

Refer to `backend/README.md` for details and request bodies.

## Storage Layout

- `collections/{collectionName}/chromadb` → Chroma persistent client
- `collections/{collectionName}/db/{conversation_id}.json` → per-conversation TinyDB
- `backend/db/conversations_history.json` → global history TinyDB
- `backend/db/prompt_templates.json` → global prompt templates TinyDB

## Troubleshooting

- Blank chat on direct route
  - Ensure the backend is running and the conversation id exists
- No models/collections
  - Verify Ollama and ingestion pipeline are correctly installed and the endpoints return data
- Upload errors
  - Check backend write permissions and validate file types are supported by the ingestion pipeline
- Slow responses
  - Embedding and retrieval may be compute-heavy; verify model availability and consider lighter embedding models

## License

This repository is provided as-is for educational and prototyping purposes.
