import chromadb
import os
from typing import List, Tuple, Dict
from .sentence_model_cache import get_embedding_model

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../collections"))

def query_chroma_ranked(collection_name: str, query_text: str, n_results: int = 5, model: str = "BAAI/bge-large-en-v1.5") -> List[Tuple[str, float]]:
    try:
        chroma_path = os.path.join(BASE_DIR, collection_name, "chromadb")
        if not os.path.exists(chroma_path):
            return []
        client = chromadb.PersistentClient(path=chroma_path)
        collection = client.get_collection(name=collection_name)
        embedding_model = get_embedding_model(model)
        prompt_embedding = embedding_model.encode(query_text, normalize_embeddings=True)
        results = collection.query(
            query_embeddings=[prompt_embedding],
            n_results=n_results,
            include=["documents", "distances"]
        )
        documents = results.get("documents", [[]])[0]
        ranked: List[Tuple[str, float]] = []
        for idx, doc in enumerate(documents):
            ranked.append((doc, float(idx)))
        return ranked
    except Exception as e:
        print(f"Error querying ranked ChromaDB: {e}")
        return []


def query_context_ranked(collection_name: str, conversation_id: str, query_text: str, n_results: int = 5, model: str = "BAAI/bge-large-en-v1.5") -> List[Tuple[str, float]]:
    try:
        context_path = os.path.join(BASE_DIR, collection_name, "context")
        if not os.path.exists(context_path):
            return []
        client = chromadb.PersistentClient(path=context_path)
        collection = client.get_or_create_collection(name=conversation_id, metadata={"hnsw:space": "cosine"})
        embedding_model = get_embedding_model(model)
        prompt_embedding = embedding_model.encode(query_text, normalize_embeddings=True)
        results = collection.query(
            query_embeddings=[prompt_embedding],
            n_results=n_results,
            include=["documents", "distances"]
        )
        documents = results.get("documents", [[]])[0]
        ranked: List[Tuple[str, float]] = []
        for idx, doc in enumerate(documents):
            ranked.append((doc, float(idx)))
        return ranked
    except Exception as e:
        print(f"Error querying context store: {e}")
        return []


def reciprocal_rank_fusion(lists: List[List[Tuple[str, float]]], k: int = 60, top_k: int = 5) -> List[str]:
    scores: Dict[str, float] = {}
    for ranked_list in lists:
        for doc, rank_index in ranked_list:
            score = 1.0 / (k + 1.0 + float(rank_index))
            scores[doc] = scores.get(doc, 0.0) + score
    sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_docs = [doc for doc, _ in sorted_docs[:top_k]]
    return top_docs