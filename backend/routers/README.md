This folder contains the API endpoint definitions for the application, separating concerns into logical groups.

api.py

    Functionality: Defines endpoints related to managing data collections and interacting with the underlying AI models.

    Working: It provides the following API routes:

        GET /api/get_ollama_models: Fetches and returns a list of all available models from the Ollama instance.

        GET /api/get_collections: Lists all the data collections (vector stores) that have been created.

        POST /api/create_collection/{collection_name}: A critical endpoint that handles file uploads. It securely receives files, sanitizes the collection name to prevent security vulnerabilities like Path Traversal, saves the files to a temporary location, invokes the processing pipeline (run_pipeline) to chunk and embed the documents into a ChromaDB vector store, and finally, cleans up the temporary files.

conversation.py

    Functionality: Manages all endpoints related to user conversations, including getting AI responses, retrieving chat history, and managing prompt templates.

    Working: It provides the following API routes:

        POST /conversation/get_response: The core RAG endpoint. It receives a user's prompt, collection name, and conversation ID. It then queries the ChromaDB vector store for relevant context, combines the context with the user's question using a prompt template, sends the final prompt to the Ollama model, and saves the conversation turn to a database. All inputs are sanitized for security.

        GET /conversation/get_conversation/{uid}: Retrieves the full chat history for a specific conversation ID (uid).

        GET /conversation/get_history: Fetches metadata for all past conversations (summary, model used, etc.).

        DELETE /conversation/delete_conversation/{uid}: Securely deletes a conversation's metadata and its corresponding chat history file.

        Endpoints for prompt templates (/new_prompt_template, /get_prompt_template/..., /get_all_prompt_templates): Allows creating, retrieving, and listing all RAG prompt templates stored in the database.