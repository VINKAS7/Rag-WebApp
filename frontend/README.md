# RAG WebApp – Frontend (React + TypeScript + Vite)

A responsive, modern UI for chatting with your Retrieval-Augmented Generation backend. Built with React, TypeScript, Redux Toolkit, and Vite.

## Features

- Chat UI with user/model bubbles and conversation history
- Collection management: upload files to create vector collections
- Model and collection selection (locked during active conversation)
- Route hydration: direct link to `/conversation/{id}` loads history automatically
- Prompt Template Editor: select default or custom prompts; drag placeholders; save/apply templates

## Tech Stack

- React + TypeScript + Vite
- Redux Toolkit (global state)
- Tailwind CSS (utility styles)

## Getting Started

1) Install dependencies:

```bash
npm install
```

2) Start the dev server:

```bash
npm run dev
```

- App runs at `http://localhost:5173`
- Expects backend running at `http://localhost:3000`

## Environment / Configuration

- CORS in backend allows `http://localhost:5173`
- API endpoints used by the frontend:
  - `GET /api/get_ollama_models`
  - `GET /api/get_collections`
  - `POST /api/create_collection/{collectionName}` (multipart files)
  - `POST /conversation/get_response`
  - `GET /conversation/get_conversation/{id}`
  - `GET /conversation/get_history`
  - `DELETE /conversation/delete_conversation/{id}`
  - `GET /conversation/get_all_prompt_templates`
  - `POST /conversation/new_prompt_template`
  - `POST /conversation/use_default_prompt`
  - `GET /conversation/get_active_prompt_mode`

## Key UI Flows

- Start a new chat
  1. Select Model and Collection on Home
  2. Enter prompt and Send → navigates to `/conversation/{id}`
  3. First model response persists history; sidebar updates automatically

- Continue a chat
  1. Type a new prompt and Send
  2. Chat bubbles update in place

- Manage collections
  1. Click Upload button in footer
  2. Pick files, name a collection, submit
  3. On success, new collection is auto-selected

- Prompt templates
  1. Open Prompt Settings in sidebar
  2. Choose “Default prompt” or a custom template (checkboxes)
  3. Save new templates with placeholders `{context}` and `{question}`

## Project Structure

- `src/components` – UI components (Chat, Footer, SideBar, PromptTemplateModal, UploadModal)
- `src/features` – Redux slices (`chatSlice`, `footerSlice`)
- `src/pages` – Routes (`Home`, `Conversation`)
- `src/app/store.ts` – Redux store setup

## Notes

- Model/Collection dropdowns are disabled during an active conversation to prevent conflicts.
- Direct navigation to `/conversation/{id}` hydrates chat state and footer selections.

## Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## Troubleshooting

- Blank chat on direct route: ensure backend is running and the conversation id exists
- Missing models/collections: verify backend endpoints return data
- File upload fails: ensure backend has write permissions to `collections` directory
