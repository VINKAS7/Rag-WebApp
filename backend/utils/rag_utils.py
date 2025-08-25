import chromadb
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../collections"))

def query_chroma(collection_name: str, query_text: str, n_results: int = 5):
    try:
        chroma_path = os.path.join(BASE_DIR, collection_name, "chromadb")
        if not os.path.exists(chroma_path):
            raise FileNotFoundError(f"ChromaDB path not found for collection: {collection_name}")
        client = chromadb.PersistentClient(path=chroma_path)
        collection = client.get_collection(name=collection_name)
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        context = "\n".join([doc for doc in results['documents'][0]])
        return context
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return ""