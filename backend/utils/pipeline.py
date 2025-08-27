from docling.document_converter import DocumentConverter
from docling_core.transforms.chunker.tokenizer.huggingface import HuggingFaceTokenizer
from docling.chunking import HybridChunker
from transformers import AutoTokenizer
from pathlib import Path
import json
from sentence_transformers import SentenceTransformer
import chromadb
import os

def run_pipeline(input_dir, output_dir, collection_name, model="BAAI/bge-large-en-v1.5"):
    huggingface_tokenizer = AutoTokenizer.from_pretrained(model)
    embedding_model = SentenceTransformer(model)
    converter = DocumentConverter()
    tokenizer = HuggingFaceTokenizer(
        tokenizer=huggingface_tokenizer,
        max_tokens=huggingface_tokenizer.model_max_length
    )
    chunker = HybridChunker(
        tokenizer=tokenizer,
        max_tokens=tokenizer.max_tokens
    )
    data = {
        "ids": [],
        "embeddings": [],
        "documents":[]
    }
    client = chromadb.PersistentClient(path=os.path.join(output_dir,"chromadb"))
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )
    folder_path = Path(input_dir)
    files_to_process = list(folder_path.rglob('*.*'))
    for file_path in files_to_process:
        result = converter.convert(str(file_path))
        chunks_iter = chunker.chunk(dl_doc=result.document)
        processed_chunks = list(chunks_iter)
        for i, chunk in enumerate(processed_chunks):
            data["ids"].append(str(i))
            data["embeddings"].append(embedding_model.encode(chunk.text, normalize_embeddings=True))
            data["documents"].append(chunk.text)
    collection.add(
        ids=data["ids"],
        embeddings=data["embeddings"],
        documents=data["documents"]
    )