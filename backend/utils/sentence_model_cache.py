from functools import lru_cache
from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=4)
def get_embedding_model(model_name: str = "BAAI/bge-large-en-v1.5") -> SentenceTransformer:
    """Return a cached SentenceTransformer instance for the given model name.

    LRU cache avoids reloading the same embedding model repeatedly across calls.
    """
    return SentenceTransformer(model_name)


