# rag_system/database/load_policies.py

import json
import sqlite3
from pathlib import Path
from rag_system.config.config import DATABASE_PATH

def load_policies(json_path):
    with open(json_path, "r", encoding='utf-8') as f:
        policies = json.load(f)
    return policies

def create_database(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 创建表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reimbursement_policies (
        id TEXT PRIMARY KEY,
        name_en TEXT,
        name_cn TEXT,
        content_en TEXT,
        content_cn TEXT
    )
    """)
    
    conn.commit()
    conn.close()

def insert_policies_into_db(policies, db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    for policy in policies:
        cursor.execute("""
        INSERT OR REPLACE INTO reimbursement_policies (id, name_en, name_cn, content_en, content_cn)
        VALUES (?, ?, ?, ?, ?)
        """, (
            policy["id"],
            policy.get("name_en"),
            policy.get("name_cn"),
            json.dumps(policy.get("content_en"), ensure_ascii=False),
            json.dumps(policy.get("content_cn"), ensure_ascii=False)
        ))
    
    conn.commit()
    conn.close()

def main():
    policies_json_path = Path("rag_system/data/policies/policies.json")
    policies = load_policies(policies_json_path)
    
    db_path = Path(DATABASE_PATH)
    create_database(db_path)
    insert_policies_into_db(policies["policies"], db_path)
    print("Policies loaded into SQLite database.")

if __name__ == "__main__":
    main()
