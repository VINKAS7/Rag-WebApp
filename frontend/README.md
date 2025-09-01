# RAG WebApp – Frontend 🎨

A responsive, modern UI for chatting with your Retrieval-Augmented Generation backend.  
Built with **React, TypeScript, Redux Toolkit, and Vite**.

---

## ✨ Features

- 💬 **Dynamic Chat UI**: Clean user/model message bubbles and persistent conversation history.  
- 📚 **Collection Management**: Easily upload files to create and manage vector collections on the backend.  
- ⚙️ **Model & Collection Selection**: Choose your desired model and data source before starting a chat (selections lock during a conversation to ensure consistency).  
- 🔗 **Direct Conversation Linking**: Navigate directly to a conversation with its URL (`/conversation/{id}`) to automatically load its history.  
- 📝 **Prompt Template Editor**: Switch between a default RAG prompt and your own custom, saved templates.  

---

## 🛠️ Tech Stack

- **Framework**: React + TypeScript + Vite  
- **State Management**: Redux Toolkit  
- **Styling**: Tailwind CSS  

---

## 🚀 Getting Started

### Prerequisites

- **Node.js v18+**  
- A running instance of the **backend service** at `http://localhost:3000`  

### Installation & Launch

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at **http://localhost:5173**.

---

## ▶️ Usage

### Starting a New Chat

1. On the home page, select an **Ollama Model** and a **Collection** from the dropdown menus.  
2. Enter your first prompt in the input field and click **Send**.  
3. You’ll be redirected to a new conversation page (`/conversation/{id}`), and the sidebar will update with your new chat.  

### Managing Collections

1. Click the **Upload** button in the footer.  
2. In the modal, select your files, provide a name for the new collection, and click submit.  
3. Upon success, the new collection will be available in the dropdown menu.  

---

## 📁 Project Structure

```
src/
├── app/
│   └── store.ts          # Redux store configuration
├── components/           # Reusable UI components (Chat, Footer, Modals, etc.)
├── features/             # Redux Toolkit slices (chatSlice, footerSlice, etc.)
└── pages/                # Main application routes (Home, Conversation)
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.  
- `npm run build`: Bundles the application for production.  
- `npm run preview`: Serves the production build locally for preview.  

---

## 🔌 API & Configuration

This frontend expects the backend to be running at **http://localhost:3000** and have CORS configured to allow requests from **http://localhost:5173**.

### Backend Endpoints Used

- `GET /api/get_ollama_models`  
- `GET /api/get_collections`  
- `POST /api/create_collection/{collectionName}`  
- `POST /conversation/get_response`  
- `GET /conversation/get_conversation/{id}`  
- `GET /conversation/get_history`  
- `DELETE /conversation/delete_conversation/{id}`  
- `GET /conversation/get_all_prompt_templates`  
- `POST /conversation/new_prompt_template`  
- `POST /conversation/use_default_prompt`  
- `GET /conversation/get_active_prompt_mode`  

---

## 🤔 Troubleshooting

- **Blank chat on direct navigation to a conversation URL?**  
  - Ensure the backend service is running.  
  - Verify that the conversation ID in the URL is valid.  

- **Models or Collections lists are empty?**  
  - Check that the backend is connected to Ollama and can access the collections directory.  

- **File upload fails?**  
  - Confirm the backend has the necessary write permissions for the `./collections` directory.  

---