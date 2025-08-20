import chromadb
from unstructured.embed.huggingface import HuggingFaceEmbeddingEncoder
import os

BASE_DIR_PATH = "../collections"

class ChromaDB_Utils:
    def __init__(self, collection_name):
        db_path = os.path.join(BASE_DIR_PATH, collection_name, "chromadb")
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"Database path does not exist: {db_path}")
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_collection(name=self.collection_name)
        self.encoder = HuggingFaceEmbeddingEncoder(
            model_name="BAAI/bge-large-en-v1.5",
            model_kwargs={"device": "cpu"},
            normalize_embeddings=True
        )
    def find_n_similar_chunks(self, user_prompt, n=3):
        prompt_embedding = self.embedding_model.encode(user_prompt, normalize_embeddings=True)
        results = self.collection.query(
            query_embeddings=[prompt_embedding.tolist()],
            n_results=n
        )
        return results['documents'][0]