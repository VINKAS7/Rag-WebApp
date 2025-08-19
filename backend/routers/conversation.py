from fastapi import APIRouter

router = APIRouter(
    prefix="/conversation",
    tags=["conversations"]
)

@router.get("/")
def get_collections():
    pass