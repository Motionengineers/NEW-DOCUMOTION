"""
Performance monitoring for RAG pipeline
Based on PDF Pages 331-357 (LLM Evaluation & Observability)
"""

import time
from typing import Dict, List, Optional
from datetime import datetime
import json
import os

class RAGMonitor:
    """
    Monitors RAG pipeline performance
    Tracks:
    - Retrieval latency
    - Chunking performance
    - API response times
    - Error rates
    """
    
    def __init__(self, log_dir: str = "backend/logs/rag"):
        self.log_dir = log_dir
        os.makedirs(log_dir, exist_ok=True)
        self.metrics = []
    
    def record_retrieval(self, query: str, latency_ms: float, chunks_retrieved: int, success: bool):
        """Record retrieval performance"""
        self.metrics.append({
            "timestamp": datetime.utcnow().isoformat(),
            "type": "retrieval",
            "query": query[:100],
            "latency_ms": latency_ms,
            "chunks_retrieved": chunks_retrieved,
            "success": success
        })
        
        if len(self.metrics) > 1000:
            self._flush_logs()
    
    def record_embedding(self, text_length: int, latency_ms: float):
        """Record embedding generation performance"""
        self.metrics.append({
            "timestamp": datetime.utcnow().isoformat(),
            "type": "embedding",
            "text_length": text_length,
            "latency_ms": latency_ms
        })
    
    def _flush_logs(self):
        """Flush metrics to disk"""
        filename = f"{self.log_dir}/metrics_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        self.metrics = []
    
    def get_summary(self) -> Dict:
        """Get performance summary"""
        if not self.metrics:
            return {"error": "No metrics collected"}
        
        retrievals = [m for m in self.metrics if m.get('type') == 'retrieval']
        if not retrievals:
            return {"error": "No retrieval metrics"}
        
        latencies = [m['latency_ms'] for m in retrievals if m.get('latency_ms')]
        
        return {
            "total_retrievals": len(retrievals),
            "avg_latency_ms": sum(latencies) / len(latencies) if latencies else 0,
            "min_latency_ms": min(latencies) if latencies else 0,
            "max_latency_ms": max(latencies) if latencies else 0,
            "success_rate": sum(1 for m in retrievals if m.get('success')) / len(retrievals) * 100
        }

rag_monitor = RAGMonitor()