# rag_system/common.py

from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from rag_system.config.config import COLLECTION_NAME, PERSIST_DIRECTORY
import redis

def initialize_rag_system():
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(PERSIST_DIRECTORY),
    )
    return vectorstore

def initialize_redis():
    redis_host = 'localhost'  # 根据 config.py 可动态加载
    redis_port = 6379
    redis_password = None  # 根据 config.py 可动态加载
    redis_client = redis.Redis(
        host=redis_host,
        port=redis_port,
        password=redis_password,
        decode_responses=True
    )
    return redis_client