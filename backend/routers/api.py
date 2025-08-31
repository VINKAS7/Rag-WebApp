import os
import shutil
import json
import asyncio
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from utils.ollama_utils import models_available
from utils.pipeline import run_pipeline
import httpx

router = APIRouter(
    prefix="/api",
    tags=["apis"]
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../collections"))


@router.get("/get_ollama_models")
async def get_ollama_models():
    return await asyncio.to_thread(models_available)


@router.get("/get_collections")
async def get_collections():
    return await asyncio.to_thread(os.listdir, BASE_DIR)


@router.post("/create_collection/{collection_name}")
async def create_collection(
    collection_name: str,
    files: list[UploadFile] = File(default=[]),
    urls: Optional[str] = Form(None)
):
    url_list = []
    if urls:
        try:
            url_list = json.loads(urls)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid URLs format")
    if not files and not url_list:
        raise HTTPException(status_code=400, detail="No files or URLs provided")

    target_dir = os.path.abspath(os.path.join(BASE_DIR, collection_name, "files"))
    if not target_dir.startswith(BASE_DIR):
        raise HTTPException(status_code=403, detail="Invalid collection path")

    await asyncio.to_thread(os.makedirs, target_dir, True)

    saved_files = []
    processed_urls = []

    try:
        async def save_file(file: UploadFile):
            file_path = os.path.join(target_dir, file.filename)
            try:
                def _write_file():
                    with open(file_path, "wb") as buffer:
                        shutil.copyfileobj(file.file, buffer)
                await asyncio.to_thread(_write_file)
                return file.filename
            finally:
                await file.close()

        saved_files_from_uploads = await asyncio.gather(*[save_file(file) for file in files])
        saved_files.extend(saved_files_from_uploads)

        async def fetch_url(idx: int, url: str):
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    response = await client.get(url)
                url_filename = f"url_{idx}_{url.split('/')[-1] or 'page'}.html"
                if not url_filename.endswith(".html"):
                    url_filename += ".html"
                url_file_path = os.path.join(target_dir, url_filename)
                await asyncio.to_thread(
                    open(url_file_path, "w", encoding="utf-8").write, response.text
                )
                return url_filename, url
            except Exception as e:
                print(f"Failed to fetch {url}: {str(e)}")
                return None, None

        url_tasks = [fetch_url(i, u) for i, u in enumerate(url_list)]
        results = await asyncio.gather(*url_tasks)

        for filename, url in results:
            if filename and url:
                saved_files.append(filename)
                processed_urls.append(url)

        await asyncio.to_thread(
            run_pipeline,
            target_dir,
            os.path.join(BASE_DIR, collection_name),
            collection_name,
        )

        await asyncio.to_thread(shutil.rmtree, target_dir)

    except Exception as e:
        if await asyncio.to_thread(os.path.exists, target_dir):
            await asyncio.to_thread(shutil.rmtree, target_dir)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing: {str(e)}"
        )

    return {
        "status": "success",
        "collection": collection_name,
        "files": [f for f in saved_files if not f.startswith("url_")],
        "urls": processed_urls,
    }