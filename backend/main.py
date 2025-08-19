from fastapi import FastAPI
from routers import conversation

app = FastAPI()

@app.get("/")
def home():
    pass