from docling.document_converter import DocumentConverter
from docling_core.transforms.chunker.tokenizer.huggingface import HuggingFaceTokenizer
from docling.chunking import HybridChunker
from transformers import AutoTokenizer
from pathlib import Path
from utils.cache import get_embedding_model, get_chroma_client, get_chroma_collection
import os
import uuid

def run_pipeline(input_dir, output_dir, collection_name, model="sentence-transformers/all-MiniLM-L6-v2", batch_size=32):
    huggingface_tokenizer = AutoTokenizer.from_pretrained(model)
    embedding_model = get_embedding_model()
    converter = DocumentConverter()
    tokenizer = HuggingFaceTokenizer(
        tokenizer=huggingface_tokenizer,
        max_tokens=huggingface_tokenizer.model_max_length
    )
    chunker = HybridChunker(
        tokenizer=tokenizer,
        max_tokens=tokenizer.max_tokens
    )
    
    client = get_chroma_client(os.path.join(output_dir, "chromadb"))
    collection = get_chroma_collection(client, collection_name)
    
    folder_path = Path(input_dir)
    files_to_process = list(folder_path.rglob('*.*'))
    
    for file_path in files_to_process:
        try:
            result = converter.convert(str(file_path))
            chunks_iter = chunker.chunk(dl_doc=result.document)
            processed_chunks = list(chunks_iter)
            
            if not processed_chunks:
                continue
            source_type = "url" if file_path.name.startswith("url_") else "file"
            original_name = file_path.name
            chunk_texts = [chunk.text for chunk in processed_chunks]
            embeddings = embedding_model.encode(
                chunk_texts,
                batch_size=batch_size,
                normalize_embeddings=True,
            )
            ids = [str(uuid.uuid4()) for _ in chunk_texts]
            metadatas = [
                {
                    "source": original_name,
                    "source_type": source_type,
                    "collection": collection_name
                }
                for _ in chunk_texts
            ]
            collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=chunk_texts,
                metadatas=metadatas
            )
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue