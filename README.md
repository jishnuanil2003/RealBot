# 🤖 WebRAG — Web-Augmented Retrieval QA Chatbot

> A full-stack AI chatbot that lets you paste any URLs, indexes them into a vector database in real time, and answers your questions with source attribution — powered by LLaMA 3.3, LangChain, ChromaDB, and a React + Tailwind frontend.

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Tech Stack](#-tech-stack)
- [System Design & Architecture](#-system-design--architecture)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Sample Code](#-sample-code)
- [Running Locally](#-running-locally)
- [Screenshots](#-screenshots)
- [Environment Variables](#-environment-variables)
- [Known Limitations](#-known-limitations)

---

## 🧩 Problem Statement

Traditional LLMs are limited to their training data and cannot answer questions about:

- **Private or niche web pages** not in their training corpus
- **Recent articles or live news** beyond their knowledge cutoff
- **Domain-specific content** like real estate listings, product pages, or documentation

Users need a way to bring their own knowledge sources into a conversation — without fine-tuning a model or managing complex infrastructure.

---

## ✅ Solution

**WebRAG** solves this with a **Retrieval-Augmented Generation (RAG)** pipeline:

1. The user pastes one or more URLs into the interface
2. The backend scrapes, chunks, and embeds the content into a local vector store (ChromaDB)
3. When the user asks a question, relevant chunks are retrieved and injected into the LLM prompt
4. The LLM (LLaMA 3.3 70B via Groq) generates a grounded answer with the source URL cited

This means the chatbot always answers **from the content you provide**, not from hallucinated memory.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Axios |
| **Backend** | FastAPI, Python 3.10+ |
| **LLM** | LLaMA 3.3 70B Versatile (via Groq API) |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` (HuggingFace) |
| **Vector Store** | ChromaDB (local persistent store) |
| **RAG Chain** | LangChain `RetrievalQAWithSourcesChain` |
| **Document Loader** | LangChain `UnstructuredURLLoader` |
| **Text Splitter** | `RecursiveCharacterTextSplitter` |

---

## 🏗 System Design & Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                                                                 │
│   ┌──────────────────┐          ┌──────────────────────────┐   │
│   │   URL Panel      │          │      Chat Window         │   │
│   │                  │          │                          │   │
│   │  + URL inputs    │          │  [Assistant bubble]      │   │
│   │  [Process URLs]  │          │  [User bubble]           │   │
│   │                  │          │  [Source chip link]      │   │
│   └────────┬─────────┘          └────────────┬─────────────┘   │
│            │                                 │                  │
└────────────┼─────────────────────────────────┼──────────────────┘
             │ POST /process-urls              │ POST /ask
             │ { urls: [...] }                 │ { query: "..." }
             ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                   /process-urls                         │  │
│   │                                                         │  │
│   │  UnstructuredURLLoader → RecursiveCharacterTextSplitter │  │
│   │        → HuggingFaceEmbeddings → ChromaDB.add()        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                      /ask                               │  │
│   │                                                         │  │
│   │   ChromaDB.as_retriever() → RetrievalQAWithSources     │  │
│   │          → ChatGroq (LLaMA 3.3) → { answer, source }   │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
             │                                 │
             ▼                                 ▼
┌────────────────────────┐   ┌─────────────────────────────────┐
│      ChromaDB          │   │         Groq Cloud API           │
│  (local vector store)  │   │   LLaMA 3.3 70B Versatile       │
│  /resources/vectorstore│   │   (inference endpoint)           │
└────────────────────────┘   └─────────────────────────────────┘
```

### RAG Pipeline (Step by Step)

```
URL Input
   │
   ▼
UnstructuredURLLoader          ← scrapes raw HTML, strips boilerplate
   │
   ▼
RecursiveCharacterTextSplitter ← splits into 1000-char chunks
   │  separators: ["\n\n", "\n", ".", " "]
   ▼
HuggingFaceEmbeddings          ← all-MiniLM-L6-v2 (384-dim vectors)
   │
   ▼
ChromaDB.add_documents()       ← stores chunks + embeddings locally
   │
   ▼
  [User asks question]
   │
   ▼
ChromaDB.as_retriever()        ← semantic similarity search
   │  returns top-k relevant chunks
   ▼
RetrievalQAWithSourcesChain    ← injects chunks into LLM prompt
   │
   ▼
ChatGroq / LLaMA 3.3 70B      ← generates answer + cites sources
   │
   ▼
{ answer: "...", Source: "https://..." }
```

---

## 📁 Project Structure

```
webrag/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, route definitions
│   ├── prediction.py            # Core RAG logic (load, split, embed, query)
│   ├── resources/
│   │   └── vectorstore/         # ChromaDB persisted data (auto-created)
│   ├── .env                     # API keys (not committed)
│   └── requirements.txt
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── ChatbotUI.jsx        # Main UI component (URL panel + chat)
    │   ├── App.js               # Mounts ChatbotUI
    │   └── index.css            # Tailwind directives
    ├── tailwind.config.js
    └── package.json
```

---

## 📡 API Reference

### `POST /process-urls`

Scrapes the provided URLs, splits content into chunks, embeds them, and stores in ChromaDB. Resets the collection on each call.

**Request**
```json
{
  "urls": [
    "https://example.com/article-1",
    "https://example.com/article-2"
  ]
}
```

**Response**
```json
{
  "status": "success",
  "message": "URLs processed successfully"
}
```

**Error (422)** — returned if `urls` field is missing or not a list.

---

### `POST /ask`

Runs a retrieval-augmented query against the indexed content.

**Request**
```json
{
  "query": "What is the price of the property on MG Road?"
}
```

**Response**
```json
{
  "status": "success",
  "answer": "The property on MG Road is listed at ₹1.2 Cr with 3 BHK configuration.",
  "Source": "https://example.com/article-1"
}
```

---

## 💻 Sample Code

### Backend — Core RAG Logic (`prediction.py`)

```python
from langchain_community.document_loaders import UnstructuredURLLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_classic.chains import RetrievalQAWithSourcesChain

def process_urls(urls: list[str]):
    """Scrape URLs, chunk content, embed and store in ChromaDB."""
    loader = UnstructuredURLLoader(urls=urls)
    data = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ".", " "],
        chunk_size=1000
    )
    docs = splitter.split_documents(data)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectordb = Chroma(
        collection_name="webrag",
        embedding_function=embeddings,
        persist_directory="./resources/vectorstore"
    )
    vectordb.reset_collection()
    vectordb.add_documents(docs)

def generate_answers(query: str) -> tuple[str, str]:
    """Retrieve relevant chunks and generate a grounded answer."""
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.9, max_tokens=500)
    chain = RetrievalQAWithSourcesChain.from_llm(
        llm=llm,
        retriever=vectordb.as_retriever()
    )
    result = chain.invoke({"question": query}, return_only_outputs=True)
    return result["answer"], result.get("sources", "")
```

### Backend — FastAPI Routes (`main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    urls: List[str]

class QueryRequest(BaseModel):
    query: str

@app.post("/process-urls")
def process_urls_api(request: URLRequest):
    for status in process_urls(request.urls):
        print(status)
    return {"status": "success", "message": "URLs processed successfully"}

@app.post("/ask")
def ask_api(request: QueryRequest):
    answer, sources = generate_answers(request.query)
    return {"status": "success", "answer": answer, "Source": sources}
```

### Frontend — Calling Both APIs (`ChatbotUI.jsx`)

```jsx
import axios from "axios";

const PROCESS_URLS_API = "http://127.0.0.1:8000/process-urls";
const ASK_API          = "http://127.0.0.1:8000/ask";

// 1. Process URLs — called when user clicks "Process URLs"
const handleProcessUrls = async (urls) => {
  await axios.post(PROCESS_URLS_API, { urls });
};

// 2. Ask a question — called on Enter or send button
const sendMessage = async (text) => {
  const res = await axios.post(ASK_API, { query: text });
  const answer = res.data?.answer;
  const source = res.data?.Source;   // capital S — matches backend
  return { answer, source };
};
```

---

## 🚀 Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/webrag.git
cd webrag
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# → Add your GROQ_API_KEY inside .env

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

Backend will be live at: `http://127.0.0.1:8000`
Interactive API docs at: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start          # Create React App  (http://localhost:3000)
# or
npm run dev        # Vite             (http://localhost:5173)
```

---

### 4. `requirements.txt`

```txt
fastapi
uvicorn[standard]
python-dotenv
langchain
langchain-community
langchain-text-splitters
langchain-chroma
langchain-groq
langchain-huggingface
langchain-classic
chromadb
sentence-transformers
unstructured
```

---

### 5. `package.json` (key dependencies)

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🖼 Screenshots

### Main Interface — URL Panel + Chat Window

<img width="1279" height="656" alt="Screenshot 2026-05-21 004034" src="https://github.com/user-attachments/assets/a8384b1c-b245-4642-b4e6-6d6edab91ed3" />


### Processing State

```
┌──────────────────────────┐
│  [⟳ Processing URLs… ]   │  ← button shows spinner
│                          │
│  🤖 ⏳ Processing 2 URLs… │  ← optimistic chat message
│     This may take a      │
│     moment.              │
└──────────────────────────┘
```

### Ready State — Green Indicator

```
  ● Model Chat    Ready     ← dot turns green when URLs are indexed
```

---

## 🔑 Environment Variables

Create a `.env` file in your `backend/` directory:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Get your key for free at [console.groq.com](https://console.groq.com).

---

## ⚠️ Known Limitations

| Limitation | Detail |
|---|---|
| **Single collection** | All URLs share one ChromaDB collection — processing new URLs wipes the previous ones |
| **No auth** | The API is open; add API key middleware before deploying to production |
| **Scraping limits** | `UnstructuredURLLoader` may fail on JS-rendered pages (SPAs); use a headless browser for those |
| **Groq rate limits** | Free tier has token-per-minute limits; heavy usage may hit 429 errors |
| **Local vector store** | ChromaDB persists to disk locally; not suitable for multi-user or cloud deployments without a server instance |
| **CORS** | Currently configured for `localhost` only — update `allow_origins` before deploying |

---


---

<div align="center">
  Built with LangChain · ChromaDB · Groq · FastAPI · React · Tailwind CSS
</div>
