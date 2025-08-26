from unstructured_ingest.interfaces.processor import ProcessorConfig
from unstructured_ingest.processes.connectors.local import (
    LocalIndexerConfig,
    LocalDownloaderConfig,
    LocalConnectionConfig,
)
from unstructured_ingest.processes.connectors.chroma import (
    ChromaUploaderConfig,
    ChromaConnectionConfig,
)
from unstructured_ingest.processes.partitioner import PartitionerConfig
from unstructured_ingest.processes.chunker import ChunkerConfig
from unstructured_ingest.processes.embedder import EmbedderConfig
from unstructured_ingest.pipeline.pipeline import Pipeline

def run_pipeline(input_dir, output_dir, collection_name, log_file_path):
    Pipeline.from_configs(
        context=ProcessorConfig(log_file=log_file_path),
        indexer_config=LocalIndexerConfig(
            input_path=input_dir,
            recursive=True,
            file_glob="**/*.*"
        ),
        downloader_config=LocalDownloaderConfig(),
        source_connection_config=LocalConnectionConfig(),
        partitioner_config=PartitionerConfig(
            strategy="hi_res",
            encoding="utf-8",
            ocr_languages=["eng"],
            pdf_infer_table_structure=True
            ),
        chunker_config=ChunkerConfig(
            chunking_strategy="by_title",
            chunk_max_characters=512,
            chunk_overlap=50
        ),
        embedder_config=EmbedderConfig(
            embedding_provider="huggingface",
            model_name="BAAI/bge-large-en-v1.5",
            model_kwargs={"device": "cpu"},
            normalize_embeddings=True
        ),
        uploader_config=ChromaUploaderConfig(
            collection_name=collection_name,
            batch_size=64
        ),
        destination_connection_config=ChromaConnectionConfig(
            path=output_dir+"/chromadb",
        ),
    ).run()