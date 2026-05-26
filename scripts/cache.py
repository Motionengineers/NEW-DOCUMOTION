import json
import os
import hashlib
from typing import Optional, Dict, Any

class QueryCache:
    """
    Simple file-based cache for RAG queries.
    """
    def __init__(self, cache_dir: str = "./backend/data/cache/rag"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def _get_key(self, query: str) -> str:
        return hashlib.md5(query.encode()).hexdigest()

    def get(self, query: str) -> Optional[Dict[str, Any]]:
        key = self._get_key(query)
        path = os.path.join(self.cache_dir, f"{key}.json")
        
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def set(self, query: str, result: Dict[str, Any]):
        key = self._get_key(query)
        path = os.path.join(self.cache_dir, f"{key}.json")
        
        try:
            # Remove non-serializable objects if any (like datetime)
            result_copy = result.copy()
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(result_copy, f, indent=2, ensure_ascii=False)
        except Exception:
            pass