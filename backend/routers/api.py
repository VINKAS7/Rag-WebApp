from fastapi import APIRouter, status, HTTPException, UploadFile, File
import os
import shutil
from utils.ollama_utils import models_avaliable

router = APIRouter(
    prefix="/api",
    tags=["api"]
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../collections"))

@router.get("/get_ollama_models")
def get_ollama_models():
    return models_avaliable()

@router.get("/get_collections")
def get_collections():
    return os.listdir(BASE_DIR)

@router.delete("/delete_collection/{collection_name}")
def delete_collection(collection_name: str):
    target_path = os.path.abspath(os.path.join(BASE_DIR, collection_name))
    if not target_path.startswith(BASE_DIR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Deletion outside collections folder is not allowed"
        )
    if os.path.exists(target_path) and os.path.isdir(target_path):
        shutil.rmtree(target_path)
        return {"status": "success", "message": f"Deleted folder: {collection_name}"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )

@router.post("/create_collection/{collection_name}")
def create_collection(collection_name: str, files: list[UploadFile] = File(...)):
    target_dir = os.path.abspath(os.path.join(BASE_DIR, collection_name, "files"))
    if not target_dir.startswith(BASE_DIR):
        raise HTTPException(status_code=403, detail="Invalid collection path")
    os.makedirs(target_dir, exist_ok=True)
    saved_files = []
    for file in files:
        file_path = os.path.join(target_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file.filename)
    return {"status": "success", "collection": collection_name, "files": saved_files}