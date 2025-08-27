This folder contains helper modules and utility functions that support the main application logic, encapsulating complex operations and promoting code reuse.

ollama_utils.py

    Functionality: Acts as an interface to the Ollama service.

    Working:

        models_available(): Connects to Ollama to get a list of all locally available language models.

        ollama_response(): Takes a model name and a formatted prompt, sends it to the Ollama chat API, and returns the model's generated response.

pipeline.py

    Functionality: This module is the heart of the document processing (ingestion) pipeline for the RAG system.

    Working: The run_pipeline function orchestrates a series of steps:

        Load Models: It loads a sentence-transformer model for creating embeddings and a tokenizer for chunking.

        Convert Documents: It iterates through files in a specified input directory and uses the docling library to convert various file formats (like .pdf, .docx) into a standardized text format.

        Chunk Text: It breaks the extracted text into smaller, semantically meaningful chunks using a HybridChunker.

        Embed Chunks: For each chunk, it generates a vector embedding using the sentence-transformer model.

        Store in Vector DB: It generates a unique ID for each chunk to prevent data overwrites and stores the chunk's text, its embedding, and its ID in a persistent ChromaDB collection.

rag_utils.py

    Functionality: Handles the retrieval part of the Retrieval-Augmented Generation (RAG) process.

    Working:

        query_chroma(): This is the core function. It takes a user's query text and a collection name. It first generates an embedding for the query text using the same model from the pipeline. Then, it uses this query embedding to search the specified ChromaDB collection for the most similar (i.e., most relevant) document chunks and returns their text content to be used as context.

tinydb_utils.py

    Functionality: A data access layer that abstracts all interactions with the TinyDB JSON databases.

    Working: It defines three classes for managing different databases:

        TinyDB_Utils: Manages the database for a single conversation's history. It has methods to save user and model messages.

        TinyDB_Utils_Global: Manages the global database that stores metadata about all conversations (like summaries and IDs).

        Tiny_DB_Global_Prompt: Manages the database for storing and retrieving user-defined RAG prompt templates.