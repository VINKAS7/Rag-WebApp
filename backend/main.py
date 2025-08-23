from fastapi import FastAPI
from routers import conversation, api
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(conversation.router)
app.include_router(api.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == "__main__":
    print("Server Running at port 3000")
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)