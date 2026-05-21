from uuid import uuid4
from dotenv import load_dotenv
from pathlib import Path
from langchain_classic.chains import RetrievalQAWithSourcesChain
from langchain_community.document_loaders import UnstructuredURLLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from datetime import datetime

load_dotenv()

CHUNK_SIZE = 1000
EMBEDDING_MODEL = "sentence-transformers/paraphrase-MiniLM-L3-v2"
LLM_MODEL = "llama-3.3-70b-versatile"
VECTORSTORE_DIR = Path(__file__).parent / "resources/vectorstore"
COLLECTION_NAME = "real_estate"

llm =None
vectordb = None

def initialize():
    global llm , vectordb

    if llm == None:
        llm = ChatGroq(model=LLM_MODEL,temperature=0.9,max_tokens=500)
    if vectordb == None:
        hf = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"trust_remote_code": True}
        )

        vectordb = Chroma(
            collection_name=COLLECTION_NAME,
            embedding_function=hf,
            persist_directory=str(VECTORSTORE_DIR)
        )

def process_urls(urls):

    yield "Initialize variables"
    initialize()

    yield "Resetting vector store...✅"
    vectordb.reset_collection()

    yield "Loading data...✅"
    loader = UnstructuredURLLoader(urls=urls)
    data = loader.load()

    yield "Splitting text into chunks...✅"
    text_splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ".", " "],
        chunk_size=CHUNK_SIZE
    )
    doc = text_splitter.split_documents(data)

    yield "Add chunks to vector database...✅"
    uuids = [str(uuid4()) for _ in range(len(doc))]
    vectordb.add_documents(doc, ids=uuids)

    yield "Done adding docs to vector database...✅"

def generate_answers(query):
    today = datetime.today().strftime("%Y-%m-%d")
    prompt=f"""
    Today's date is {today}.
    {query}
    """
    if not vectordb:
        raise Exception("vectordb not initialized")
    chain = RetrievalQAWithSourcesChain.from_llm(llm=llm, retriever=vectordb.as_retriever())
    result = chain.invoke({"question": prompt}, return_only_outputs=True)
    sources = result.get("sources", "")
    return result["answer"],sources


# if __name__ == "__main__":
#     urls = [
#          "https://www.espncricinfo.com/team/india-6?utm_source=chatgpt.com",
#         "https://www.bcci.tv/international/men/players/virat-kohli/2"
#     ]
#
#     for status in process_urls(urls):
#         print(status)
#     answer = generate_answers("Tell me what is the age of VIRAT KOHLI ?")
#     print(f"Answer: {answer}")
