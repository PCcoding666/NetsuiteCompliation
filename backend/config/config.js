// backend/config/config.js

require('dotenv').config();

module.exports = {
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    AZURE_BLOB_STORAGE_CONNECTION_STRING: process.env.AZURE_BLOB_STORAGE_CONNECTION_STRING,
    AZURE_BLOB_CONTAINER_NAME: process.env.AZURE_BLOB_CONTAINER_NAME,
    COLLECTION_NAME: process.env.COLLECTION_NAME || 'company_policies',
    PERSIST_DIRECTORY: process.env.PERSIST_DIRECTORY || './rag_system/data/policies/chroma_data',
    TOP_K: parseInt(process.env.TOP_K) || 10,
    DOC_ID_KEY: process.env.DOC_ID_KEY || 'policy_id',
    DATABASE_PATH: process.env.DATABASE_PATH || './rag_system/database/real_estates.db',
};