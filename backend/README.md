# RAG WebApp – Backend (FastAPI)

FastAPI backend that powers an advanced **Retrieval-Augmented Generation (RAG)** workflow:  
File & URL ingestion → Chunking & Embedding → ChromaDB storage → Hybrid RAG querying → Model inference via Ollama.

---

## 🚀 Features

- **Ingestion Pipeline**: Upload files or scrape URLs, convert to text, chunk, embed with SentenceTransformers, and store in ChromaDB.
- **Advanced RAG Querying**: Combines context from:
  - **Document Store** (collection-specific ChromaDB)
  - **Conversational Context** (conversation-specific ChromaDB)  
  Results are merged via **Reciprocal Rank Fusion (RRF)** for robust retrieval.
- **Conversational Memory**:  
  Stores past Q&A in TinyDB + ChromaDB for contextual follow-ups.
- **Model Inference**:  
  Responses generated via **Ollama** models.
- **Custom Prompt Templates**:  
  Manage default/custom templates for flexible RAG prompt construction.
- **Error Handling**:  
  Safe path validation, fallback handling for missing templates/contexts.

---

## 🔬 Extensibility: Advanced Ingestion

- The ingestion pipeline can be extended with powerful docling enrichments for more specialized data extraction, such as code understanding and formula extraction.

## ⚠️ A Note on Resource Usage

- These advanced features are not enabled by default as they are extremely memory-heavy. Running them locally requires a high-end machine with a powerful GPU and a large amount of VRAM.

- If you have the necessary hardware and wish to implement these capabilities, you can modify the ingestion pipeline. For more details, please refer to the official [Docling Enrichments Documentation]("https://docling-project.github.io/docling/usage/enrichments/").

---

## 🛠 Requirements

- **Python 3.10+**
- Install dependencies:

```bash
# Using uv (recommended for speed)
uv pip install -r requirements.txt
```

---

## ▶️ Run

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 3000
```

CORS is configured for `*` (all origins) by default.

---

## 📌 API Endpoints

### 📂 Collections / Pipeline
- `GET /api/get_ollama_models` → List available Ollama models  
- `GET /api/get_collections` → List collection names  
- `POST /api/create_collection/{collection_name}`  
  - **Body**: `multipart/form-data`  
    - `files`: List of uploaded files  
    - `urls`: JSON string of URLs (e.g., `["http://example.com"]`)  
  - **Action**: Ingests files/URLs and builds ChromaDB for the collection  

---

### 💬 Conversation
- `POST /conversation/get_response`  
  **Body**:  
  ```json
  {
    "modelName": "llama2",
    "prompt": "What is RAG?",
    "conversation_id": "uuid",
    "collectionName": "my_docs"
  }
  ```  
  Saves user message → retrieves context → builds RAG prompt → calls Ollama → saves response  

- `GET /conversation/get_conversation/{uid}`  
  → Returns `{ collection_conversation, collectionName, modelName }`

- `GET /conversation/get_history`  
  → Returns all `{ conversation_summary, conversation_id, modelName, collectionName }`

- `DELETE /conversation/delete_conversation/{uid}`  
  → Deletes conversation metadata & TinyDB file  

---

### 📝 Prompt Templates
- `GET /conversation/get_all_prompt_templates` → List all templates  
- `GET /conversation/get_prompt_template/{template_name}` → Get template by name  
- `POST /conversation/new_prompt_template`  
  - **Body**: `{ "template_name": "...", "template": "..." }`  
  - Must include `{context}` and `{question}` placeholders  
- `DELETE /conversation/delete_prompt_template/{template_name}`  
- `POST /conversation/use_default_prompt` → Switch back to built-in default  
- `GET /conversation/get_active_prompt_mode` → `{ mode: 'default' | 'custom' }`

---

## 📂 Data Locations

- **Collections (Documents)**: `./collections/{collectionName}/chromadb`  
- **Collections (Conversational Context)**: `./collections/{collectionName}/context`  
- **Per-Conversation TinyDB**: `./collections/{collectionName}/db/{conversation_id}.json`  
- **Global TinyDB**:  
  - Conversations history → `./db/conversations_history.json`  
  - Prompt templates → `./db/prompt_templates.json`  

---

## ⚠️ Notes

- The RAG prompt is built from the current **in-memory template**.  
- Use prompt endpoints to switch between **default** and **custom** templates.  
- Ensure:
  - SentenceTransformers model (`all-MiniLM-L6-v2` by default) is available.  
  - Necessary **Ollama models** are installed on the host machine.  

---

## 📸 Example Workflow

1. Upload PDFs or scrape URLs into a **collection**.  
2. Start a **conversation** with a query.  
3. System retrieves context from both:
   - Your uploaded docs
   - Past conversation history  
4. Combines results (RRF), builds RAG prompt, and queries an Ollama model.  
5. Answer is saved + contextually available for follow-ups.  