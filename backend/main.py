from fastapi import FastAPI
from routers import conversation

app = FastAPI()
app.include_router(conversation.router)


@app.get("/")
def home():
    pass