# rag_system/services/rag_service.py

import sys
import json
from services.chat_service import rag

def main():
    try:
        # 从标准输入读取结构化数据
        input_data = sys.stdin.read()
        structured_data = json.loads(input_data)

        # 确保 database_path 存在
        if 'database_path' not in structured_data:
            raise ValueError("Missing 'database_path' in structured_data")

        # 调用RAG逻辑
        result = rag(structured_data)

        # 输出结果为JSON
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
