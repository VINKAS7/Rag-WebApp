from functools import lru_cache
from sentence_transformers import SentenceTransformer
import chromadb
import os

@lru_cache(maxsize=1)
def get_embedding_model(model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    return SentenceTransformer(model_name)

_chroma_clients = {}
_chroma_collections = {}

def get_chroma_client(path: str) -> chromadb.PersistentClient:
    abs_path = os.path.abspath(path)
    if abs_path not in _chroma_clients:
        os.makedirs(abs_path, exist_ok=True)
        _chroma_clients[abs_path] = chromadb.PersistentClient(path=abs_path)
    return _chroma_clients[abs_path]


def get_chroma_collection(client: chromadb.PersistentClient, name: str, metadata: dict = None):
    key = (id(client), name)
    if key not in _chroma_collections:
        _chroma_collections[key] = client.get_or_create_collection(
            name=name,
            metadata=metadata or {"hnsw:space": "cosine"}
        )
    return _chroma_collections[key]