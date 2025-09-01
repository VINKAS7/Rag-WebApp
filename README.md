# RAG WebApp

A full-stack Retrieval-Augmented Generation application. The frontend (React + TypeScript) provides a clean chat interface, collection management, and a prompt editor. The backend (FastAPI) ingests documents and URLs, builds a ChromaDB vector store, and uses an advanced RAG pipeline with conversational memory to generate responses using Ollama.

---

▶️ [Watch Demo Video](media/demo.mp4)

---

## ✨ Highlights

- **Advanced RAG Pipeline**: Combines context from uploaded documents and past conversation history using Reciprocal Rank Fusion (RRF) for highly relevant answers.
- **Flexible Data Ingestion**: Create vector collections by uploading files (PDF, DOCX, PPTX, XLSX, WAV, MP3, images (PNG, TIFF, JPEG, ...)) or scraping content directly from URLs.
- **Conversational Memory**: Each chat maintains its own context, allowing for meaningful follow-up questions.
- **Modern Chat UI**: Responsive interface with conversation history, model/collection selection, and real-time updates.
- **Prompt Template Editor**: Easily switch between a default prompt and custom-built templates. Save new templates with required placeholders.
- **Route Hydration**: Direct navigation to a conversation URL (`/conversation/{id}`) automatically loads its chat history and state.

---

## 🏛️ Architecture

The application consists of a **React frontend** and a **FastAPI backend**.  
The backend's core is its advanced RAG pipeline.

- **Frontend: React + TypeScript + Vite**
  - State Management: Redux Toolkit
  - Styling: Tailwind CSS

- **Backend: FastAPI**
  - Ingestion: docling (document parsing), sentence-transformers (embeddings), httpx (URL scraping).
  - Vector Storage: ChromaDB (separate persistent stores for documents and conversational context).
  - Metadata Storage: TinyDB (conversation history and prompt templates).
  - LLM Inference: Ollama.

### 🔄 How It Works

When a user sends a prompt, the backend executes a hybrid retrieval strategy:

1. **Dual Retrieval**:  
   - Queries the **Document Store** (ChromaDB for the selected collection).  
   - Queries the **Conversational Context** (ChromaDB for the current chat session).  

2. **Fusion & Ranking (RRF)**:  
   - Merges results from both retrievals and re-ranks using Reciprocal Rank Fusion.  

3. **Generation**:  
   - Injects top-ranked context into a prompt template.  
   - Sends the final prompt to an Ollama model for response generation.  

```
User → Frontend (React) → Backend (FastAPI)
  ↳ Query:  ChromaDB (Docs) + ChromaDB (Conv. Context) → RRF → Ollama → Response
  ↳ Ingest: Files/URLs → Chunk + Embed → ChromaDB (Persistent)
  ↳ Persist: TinyDB (History, Templates)
```

---

## 📁 Repository Structure

- **frontend/** → React application (see `frontend/README.md` for UI docs).  
- **backend/** → FastAPI application (see `backend/README.md` for API docs).  
- **collections/** → Created at runtime; holds:  
  - Document vector store (`chromadb`)  
  - Conversational context (`context`)  
  - Per-conversation logs (`db`)  
- **backend/db/** → Global TinyDB stores for:  
  - `conversations_history.json` (conversation metadata)  
  - `prompt_templates.json` (saved templates)  

---

## ⚙️ Prerequisites

- Node.js **v18+**
- Python **v3.10+**
- [Ollama](https://ollama.ai/) installed with desired models (e.g., `ollama pull llama3`)

---

## 🚀 Setup and Run

### 1. Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
# Using uv (recommended for speed)
pip install uv
uv pip install -r requirements.txt

# Start FastAPI server
python main.py
```

Backend runs at → [http://localhost:3000](http://localhost:3000)

---

### 2. Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at → [http://localhost:5173](http://localhost:5173)

---

## ▶️ Core Flows

### 🔹 Create a Collection
- Click **Upload** → Select files or paste URLs → Name the collection → Submit.  
- Backend processes data → Collection becomes available.

### 🔹 Start a Conversation
- Select **Model** + **Collection** → Enter a prompt.  
- App navigates to unique conversation URL.

### 🔹 Continue a Conversation
- Context retrieved from documents + conversation history.  
- Follow-up questions remain contextual.

### 🔹 Manage Prompt Templates
- Open **Prompt Settings** → Choose default/custom template.  
- Create/edit templates in the editor (`{context}` and `{question}` required).

---

## 🔌 Backend API Summary

### Collections
- `GET /api/get_ollama_models` → List available Ollama models.  
- `GET /api/get_collections` → List all collections.  
- `POST /api/create_collection/{collection_name}` → Ingest files/URLs.  

### Conversation
- `POST /conversation/get_response` → Get a RAG-powered response.  
- `GET /conversation/get_conversation/{uid}` → Get a conversation’s history.  
- `GET /conversation/get_history` → Get all conversations.  
- `DELETE /conversation/delete_conversation/{uid}` → Delete a conversation.  

### Prompt Templates
- `GET /conversation/get_all_prompt_templates`  
- `POST /conversation/new_prompt_template`  
- `DELETE /conversation/delete_prompt_template/{template_name}`  
- `POST /conversation/use_default_prompt`  
- `GET /conversation/get_active_prompt_mode`  

(See `backend/README.md` for detailed request/response examples.)

---

## 💾 Storage Layout

- `collections/{collectionName}/chromadb` → Vector store (documents).  
- `collections/{collectionName}/context` → Vector store (conversational memory).  
- `collections/{collectionName}/db/{conversation_id}.json` → TinyDB log (per conversation).  
- `backend/db/conversations_history.json` → Global conversation metadata.  
- `backend/db/prompt_templates.json` → Global saved templates.  