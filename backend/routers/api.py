from fastapi import APIRouter, HTTPException, UploadFile, File
import os
import shutil
from utils.ollama_utils import models_available
from utils.pipeline import run_pipeline

router = APIRouter(
    prefix="/api",
    tags=["apis"]
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../collections"))

@router.get("/get_ollama_models")
def get_ollama_models():
    return models_available()

@router.get("/get_collections")
def get_collections():
    return os.listdir(BASE_DIR)

@router.post("/create_collection/{collection_name}")
def create_collection(collection_name: str, files: list[UploadFile] = File(...)):
    target_dir = os.path.abspath(os.path.join(BASE_DIR, collection_name, "files"))
    if not target_dir.startswith(BASE_DIR):
        raise HTTPException(status_code=403, detail="Invalid collection path")
    os.makedirs(target_dir, exist_ok=True)
    saved_files = []
    for file in files:
        file_path = os.path.join(target_dir, file.filename)
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(file.filename)
        finally:
            file.file.close()
    try:
        run_pipeline(
            input_dir=target_dir, 
            output_dir=os.path.join(BASE_DIR, collection_name),
            collection_name=collection_name,
        )
        shutil.rmtree(target_dir)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the files: {str(e)}"
        )
    return {"status": "success", "collection": collection_name, "files": saved_files}