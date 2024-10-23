# rag_system/database/generate_docs.py

import json
from pathlib import Path
from langchain.schema import Document
from rag_system.common import initialize_rag_system  # Updated import statement

def load_policies(json_path):
    with open(json_path, "r", encoding='utf-8') as f:
        data = json.load(f)
    return data["policies"]

def main():
    policies_json_path = Path(__file__).parent.parent / "data/policies/policies.json"
    policies = load_policies(policies_json_path)

    documents = []
    for policy in policies:
        # 根据需求，可以选择存储英文或中文内容，或者两者
        if "content_en" in policy:
            documents.append(
                Document(
                    page_content=json.dumps(policy["content_en"], ensure_ascii=False), 
                    metadata={"policy_id": policy["id"], "policy_name": policy["name_en"]}
                )
            )
        if "content_cn" in policy:
            documents.append(
                Document(
                    page_content=json.dumps(policy["content_cn"], ensure_ascii=False), 
                    metadata={"policy_id": policy["id"], "policy_name": policy["name_cn"]}
                )
            )

    # 初始化RAG系统组件
    vectorstore, docstore, blob_client, name2id = initialize_rag_system()

    # 添加文档到 Chroma
    vectorstore.add_documents(documents)

    # 持久化
    vectorstore.persist()
    print("Policies loaded into Chroma vector store.")

if __name__ == "__main__":
    main()
