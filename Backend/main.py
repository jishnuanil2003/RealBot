from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from prediction import (
    process_urls,
    generate_answers
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://realbot-2.onrender.com"
        "https://real-bot-five.vercel.app",   # ← add this
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    urls: List[str]


class QueryRequest(BaseModel):
    query: str


# API 1
@app.post("/process-urls")
def process_urls_api(request: URLRequest):

    for status in process_urls(request.urls):
        print(status)

    return {
        "status": "success",
        "message": "URLs processed successfully"
    }


# API 2
@app.post("/ask")
def ask_api(request: QueryRequest):

    answer,sources = generate_answers(request.query)

    return {
        "status": "success",
        "answer": answer,
        "Source": sources
    }
