"""
Complete RAG Pipeline
Integrates all components: chunking, embedding, retrieval, reranking
Based on PDF Pages 113-119 (Workflow of a RAG system)
"""

from typing import List, Dict, Any, Optional
from datetime import datetime

from .embeddings import get_embedding_generator
from .vector_store import get_vector_store
from .chunking import get_chunker
from .reranker import CrossEncoderReranker
from .cache import QueryCache


class RAGPipeline:
    """
    Complete RAG pipeline for government scheme retrieval
    
    Workflow (PDF Pages 113-119):
    1. User inputs query
    2. Embed query
    3. Retrieve similar chunks
    4. Re-rank chunks
    5. Return context
    """

    def __init__(self):
        self.embedding_generator = get_embedding_generator()
        self.vector_store = get_vector_store()
        self.chunker = get_chunker()
        self.reranker = CrossEncoderReranker()
        self.cache = QueryCache()

    def index_document(self, text: str, metadata: Dict[str, Any], chunk_strategy: str = "semantic") -> List[str]:
        """
        Index a document for RAG
        Steps 1-4: Create chunks, generate embeddings, store
        """
        # Step 1: Create chunks (PDF Page 115)
        chunks = self.chunker.chunk_document(text, strategy=chunk_strategy)
        
        # Prepare texts and metadata for each chunk
        texts = []
        metadata_list = []
        
        for chunk in chunks:
            chunk_text = chunk["content"]
            chunk_metadata = {
                **metadata,
                "chunk_type": chunk["chunk_type"],
                "chunk_index": chunk["chunk_index"],
                "original_length": chunk["length"],
                "indexed_at": datetime.now().isoformat()
            }
            texts.append(chunk_text)
            metadata_list.append(chunk_metadata)
        
        # Step 2 & 3: Generate embeddings and store (PDF Page 115-117)
        point_ids = self.vector_store.add_documents_batch(texts, metadata_list)
        
        return point_ids

    def search(
        self,
        query: str,
        limit: int = 10,
        use_reranker: bool = True,
        use_cache: bool = True,
        filters: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Search using RAG pipeline
        Steps 5-8: Embed query, retrieve, rerank, return context
        """
        start_time = datetime.now()
        
        # Check cache (PDF Page 141-143 - RAG vs CAG)
        if use_cache:
            cached_result = self.cache.get(query)
            if cached_result:
                cached_result["from_cache"] = True
                return cached_result
        
        # Step 5: Embed the query (PDF Page 117)
        query_vector = self.embedding_generator.encode_query(query)
        
        # Step 6: Retrieve similar chunks (PDF Page 117-118)
        # Note: vector_store search expects the list format for vectors
        retrieved_chunks = self.vector_store.search(
            vector=query_vector.tolist(),
            limit=limit * 2 if use_reranker else limit
        )
        
        # Step 7: Re-rank chunks (PDF Page 118)
        if use_reranker and retrieved_chunks:
            # Prepare pairs for reranking
            pairs = [(query, chunk["content"]) for chunk in retrieved_chunks]
            scores = self.reranker.predict(pairs)
            
            # Add scores and sort
            for chunk, score in zip(retrieved_chunks, scores):
                chunk["rerank_score"] = score
                chunk["final_score"] = score
            
            # Sort by rerank score
            retrieved_chunks.sort(key=lambda x: x.get("rerank_score", 0), reverse=True)
            retrieved_chunks = retrieved_chunks[:limit]
        else:
            # Use original similarity score
            for chunk in retrieved_chunks:
                chunk["final_score"] = chunk["score"]
        
        # Step 8: Prepare context for LLM (PDF Page 118-119)
        context = self._prepare_context(retrieved_chunks)
        
        result = {
            "query": query,
            "chunks": retrieved_chunks,
            "context": context,
            "total_retrieved": len(retrieved_chunks),
            "latency_ms": (datetime.now() - start_time).total_seconds() * 1000,
            "from_cache": False
        }
        
        # Cache result
        if use_cache:
            self.cache.set(query, result)
        
        return result

    def _prepare_context(self, chunks: List[Dict]) -> str:
        """
        Prepare context for LLM
        Combines retrieved chunks with metadata
        """
        if not chunks:
            return "No relevant information found."
        
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            chunk_text = chunk.get("content", "")
            metadata = chunk.get("metadata", {})
            scheme_name = metadata.get("scheme_name", "Unknown Scheme")
            chunk_type = metadata.get("chunk_type", "information")
            
            context_parts.append(f"[Source {i}] {scheme_name} - {chunk_type.replace('_', ' ').title()}:\n{chunk_text}")
        
        return "\n\n".join(context_parts)

rag_pipeline = RAGPipeline()

# Singleton instance helper
_pipeline_instance = None

def get_rag_pipeline() -> RAGPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = RAGPipeline()
    return _pipeline_instance