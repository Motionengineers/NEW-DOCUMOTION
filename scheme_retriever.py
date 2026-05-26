"""
RAG Retriever for Government Schemes
Based on PDF Pages 113-119 (Workflow of a RAG system)
"""

import time
import numpy as np
from typing import List, Dict, Any, Optional

try:
    from sentence_transformers import SentenceTransformer
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False
    print("⚠️ sentence-transformers not installed")

class SchemeRetriever:
    """
    RAG retriever for government schemes
    Workflow based on PDF Pages 113-119:
    1. Embed query
    2. Retrieve similar chunks
    3. Re-rank (optional)
    4. Return context
    """
    
    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.embedding_model = None
        
        if EMBEDDINGS_AVAILABLE:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def _embed_query(self, query: str) -> List[float]:
        """Step 5: Embed the query (PDF Page 117)"""
        start_time = time.time()
        try:
            if self.embedding_model:
                embedding = self.embedding_model.encode(query).tolist()
                latency_ms = (time.time() - start_time) * 1000
                from backend.scrapers.rag_monitor import rag_monitor
                rag_monitor.record_embedding(len(query), latency_ms)
                return embedding
            else:
                raise RuntimeError("Embedding model is not available. Please install sentence-transformers.")
        except Exception as e:
            raise e
    
    def retrieve(self, query: str, top_k: int = 10) -> Dict:
        """
        Complete retrieval pipeline based on PDF Pages 113-119
        
        Steps:
        1. User inputs query
        2. Embed the query (Step 5)
        3. Retrieve similar chunks (Step 6)
        4. Re-rank (Step 7)
        5. Return context (Step 8)
        """
        start_time = time.time()
        success = False
        chunks_count = 0
        try:
            # Step 5: Embed the query (PDF Page 117)
            query_embedding = self._embed_query(query)
            
            # Step 6: Retrieve similar chunks (PDF Page 117-118)
            chunks = self.vector_store.search(query_embedding, limit=top_k * 2) # Retrieve more for re-ranking
            
            # Step 7: Re-rank chunks (PDF Page 118)
            reranked_chunks = self._rerank_chunks(query, chunks)
            
            # Step 8: Prepare context for LLM (PDF Page 118-119)
            selected_chunks = reranked_chunks[:top_k]
            chunks_count = len(selected_chunks)
            context = self._prepare_context(selected_chunks)
            
            success = True
            return {
                "query": query,
                "chunks": selected_chunks,
                "context": context,
                "total_retrieved": len(chunks)
            }
        except Exception as e:
            success = False
            raise e
        finally:
            latency_ms = (time.time() - start_time) * 1000
            from backend.scrapers.rag_monitor import rag_monitor
            rag_monitor.record_retrieval(query, latency_ms, chunks_count, success)
    
    def _rerank_chunks(self, query: str, chunks: List[Dict]) -> List[Dict]:
        """
        Re-rank chunks based on relevance (PDF Page 118)
        Uses simple keyword matching; can be enhanced with cross-encoder
        """
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        for chunk in chunks:
            content_lower = chunk.get('content', '').lower()
            
            # Calculate relevance score
            score = 0
            for word in query_words:
                if word in content_lower:
                    score += 1
            
            # Boost for chunk type (eligibility more important than basic_info)
            chunk_type = chunk.get('chunk_type', '')
            if chunk_type == 'eligibility':
                score += 3
            elif chunk_type == 'benefits':
                score += 2
            elif chunk_type == 'documents':
                score += 1
            
            chunk['relevance_score'] = score
        
        # Sort by relevance score primarily, and vector search score secondarily
        # This ensures metadata boosts are respected without ignoring vector similarity
        chunks.sort(
            key=lambda x: (x.get('relevance_score', 0), x.get('score', 0)), 
            reverse=True
        )
        
        return chunks
    
    def _prepare_context(self, chunks: List[Dict]) -> str:
        """
        Prepare context for LLM (PDF Page 118-119)
        Combines retrieved chunks into a single prompt context
        """
        if not chunks:
            return "No relevant schemes found."
        
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            context_parts.append(f"[Source {i}]: {chunk.get('content', '')}")
        
        return "\n\n".join(context_parts)
    
    def retrieve_by_type(self, chunk_type: str, limit: int = 20) -> Dict:
        """Retrieve chunks by type (eligibility, documents, benefits)"""
        all_chunks = self.vector_store.filter_by_type(chunk_type)
        
        return {
            "chunk_type": chunk_type,
            "chunks": all_chunks[:limit],
            "count": len(all_chunks)
        }