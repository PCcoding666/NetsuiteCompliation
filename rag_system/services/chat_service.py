# rag_system/services/chat_service.py

import json
import sqlite3
from rag_system.common import initialize_rag_system, initialize_redis
from rag_system.config.config import DATABASE_PATH

def rag(structured_data):
    # 初始化RAG系统组件
    vectorstore = initialize_rag_system()
    redis_client = initialize_redis()

    # 生成查询字符串
    query = f"报销类别: {structured_data.get('category')}, 金额: {structured_data.get('amount')}, 日期: {structured_data.get('date')}, 描述: {structured_data.get('description')}"

    # 使用Chroma进行相似度检索
    similar_docs = vectorstore.similarity_search(query, k=10)

    # 假设所有相关政策都被检索到，进行合规性检查
    compliance = True
    violated_policies = []

    # 连接到SQLite数据库
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    for doc in similar_docs:
        policy_id = doc.metadata.get("policy_id")
        # 首先尝试从Redis缓存中获取政策
        policy_json = redis_client.get(f"policy:{policy_id}")
        if policy_json:
            policy = json.loads(policy_json)
        else:
            # 如果缓存中没有，则从SQLite查询并缓存
            cursor.execute("SELECT * FROM reimbursement_policies WHERE id = ?", (policy_id,))
            row = cursor.fetchone()
            if row:
                id, name_en, name_cn, content_en, content_cn = row
                policy = {
                    "id": id,
                    "name_en": name_en,
                    "name_cn": name_cn,
                    "content_en": json.loads(content_en),
                    "content_cn": json.loads(content_cn)
                }
                # 缓存到Redis
                redis_client.set(f"policy:{id}", json.dumps(policy, ensure_ascii=False), ex=3600)  # 缓存1小时
            else:
                continue  # 如果数据库中也没有，跳过

        # 检查报销类别
        allowed_categories = policy['content_en'].get('business_travel', {}).get('allowable_expenses', [])
        if structured_data.get('category') not in allowed_categories:
            compliance = False
            violated_policies.append(policy['name_en'])

        # 检查是否需要收据
        receipt_required = policy['content_en'].get('business_travel', {}).get('accommodation', {}).get('policy', False)
        if receipt_required and not structured_data.get('receipt_provided', False):
            compliance = False
            violated_policies.append(policy['name_en'])

    conn.close()

    result = {
        "compliance": compliance,
        "violated_policies": list(set(violated_policies))  # 去重
    }

    return result
