import os
from typing import List, Tuple, Dict
from utils.cache import get_embedding_model, get_chroma_client, get_chroma_collection

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../collections"))

def query_chroma_ranked(collection_name: str, query_text: str, n_results: int = 5) -> List[Tuple[str, float]]:
    try:
        chroma_path = os.path.join(BASE_DIR, collection_name, "chromadb")
        if not os.path.exists(chroma_path):
            return []
        client = get_chroma_client(chroma_path)
        collection = get_chroma_collection(client, collection_name)
        embedding_model = get_embedding_model()
        prompt_embedding = embedding_model.encode([query_text], normalize_embeddings=True)[0]
        results = collection.query(
            query_embeddings=[prompt_embedding],
            n_results=n_results,
            include=["documents", "distances"]
        )
        documents = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]
        ranked = [(doc, 1 - dist) for doc, dist in zip(documents, distances)]
        return ranked
    except Exception as e:
        print(f"Error querying ranked ChromaDB: {e}")
        return []


def query_context_ranked(collection_name: str, conversation_id: str, query_text: str, n_results: int = 5) -> List[Tuple[str, float]]:
    try:
        context_path = os.path.join(BASE_DIR, collection_name, "context")
        if not os.path.exists(context_path):
            return []
        client = get_chroma_client(context_path)
        collection = get_chroma_collection(client, conversation_id)
        embedding_model = get_embedding_model()
        prompt_embedding = embedding_model.encode([query_text], normalize_embeddings=True)[0]
        results = collection.query(
            query_embeddings=[prompt_embedding],
            n_results=n_results,
            include=["documents", "distances"]
        )
        documents = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]
        ranked = [(doc, 1 - dist) for doc, dist in zip(documents, distances)]
        return ranked
    except Exception as e:
        print(f"Error querying context store: {e}")
        return []


def reciprocal_rank_fusion(lists: List[List[Tuple[str, float]]], k: int = 60, top_k: int = 5) -> List[str]:
    scores: Dict[str, float] = {}
    for ranked_list in lists:
        for rank_index, (doc, score) in enumerate(ranked_list):
            fusion_score = (1.0 / (k + rank_index + 1)) + score
            scores[doc] = scores.get(doc, 0.0) + fusion_score
    sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in sorted_docs[:top_k]]