# rag_system/config/config.py

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Redis配置
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', '6379'))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)

# OpenAI配置
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Cohere配置
COHERE_API_KEY = os.getenv('COHERE_API_KEY')

# Azure Blob Storage配置
AZURE_BLOB_STORAGE_CONNECTION_STRING = os.getenv('AZURE_BLOB_STORAGE_CONNECTION_STRING')
AZURE_BLOB_CONTAINER_NAME = os.getenv('AZURE_BLOB_CONTAINER_NAME')

# Chroma配置
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "company_policies")
PERSIST_DIRECTORY = Path(os.getenv("PERSIST_DIRECTORY", "/home/azureuser/MyProject/NetsuiteCompliation/rag_system/data/policies/chroma_data"))

# 其他配置
TOP_K = int(os.getenv("TOP_K", 10))
DOC_ID_KEY = os.getenv("DOC_ID_KEY", "policy_id")
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", "/home/azureuser/MyProject/NetsuiteCompliation/rag_system/database/real_estates.db"))
