"""
HyDE (Hypothetical Document Embeddings) for Scheme Matching
Based on PDF Pages 131-134 (Traditional RAG vs HyDE)

HyDE solves the problem where questions are not semantically similar to answers.
Instead of embedding the query, it generates a hypothetical answer first.
"""

import json
import os
import time
from typing import List, Dict, Any, Optional

# For Gemini API (free)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ google-generativeai not installed. Run: pip install google-generativeai")

class HyDERetriever:
    """
    HyDE-based retriever for government schemes
    Based on PDF Pages 131-134
    
    Workflow (PDF Page 133):
    1. Generate hypothetical answer H for query Q
    2. Embed H using contrastive model
    3. Use embedding to retrieve relevant schemes
    4. Combine H + retrieved context + Q for final answer
    """
    
    def __init__(self, vector_store, retriever):
        self.vector_store = vector_store
        self.retriever = retriever
        self.embedding_model = retriever.embedding_model
        
        # Initialize Gemini for hypothetical answer generation
        if GEMINI_AVAILABLE:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            else:
                print("⚠️ GEMINI_API_KEY environment variable not set. HyDE generation disabled.")
                self.gemini_model = None
    
    def _generate_hypothetical_answer(self, query: str) -> str:
        """
        Step 1: Generate hypothetical answer (PDF Page 133)
        Uses LLM to create a fake but relevant answer
        """
        if not GEMINI_AVAILABLE or not self.gemini_model:
            # Fallback: return query as is
            return query
        
        prompt = f"""
        You are a government scheme expert. Based on this query, generate a hypothetical answer 
        that describes what a relevant scheme would look like.
        
        Query: {query}
        
        Generate a hypothetical scheme description that would answer this query.
        Include: scheme name, benefits, eligibility, and funding amount.
        Be specific even if hypothetical.
        """
        
        try:
            response = self.gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating hypothetical answer: {e}")
            return query
    
    def _embed_hypothetical(self, hypothetical: str) -> List[float]:
        """
        Step 2: Embed the hypothetical answer (PDF Page 133)
        Uses contrastive model (sentence-transformer)
        """
        if self.embedding_model:
            return self.embedding_model.encode(hypothetical).tolist()
        return [0] * 384
    
    def _combine_results(self, query: str, hypothetical: str, chunks: List[Dict]) -> Dict:
        """
        Step 4: Combine hypothetical answer + retrieved context (PDF Page 133-134)
        """
        context = self.retriever._prepare_context(chunks)
        
        combined_prompt = f"""
        QUERY: {query}
        
        HYPOTHETICAL ANSWER (for reference only):
        {hypothetical}
        
        RETRIEVED SCHEMES:
        {context}
        
        Based on the retrieved schemes above, answer the original query accurately.
        """
        
        return {
            "query": query,
            "hypothetical_answer": hypothetical,
            "retrieved_chunks": chunks,
            "context": context,
            "combined_prompt": combined_prompt
        }
    
    def retrieve(self, query: str, top_k: int = 10) -> Dict:
        """
        Full HyDE retrieval pipeline (PDF Page 133)
        """
        start_time = time.time()
        success = False
        chunks_count = 0
        try:
            print("📝 Generating hypothetical answer...")
            hypothetical = self._generate_hypothetical_answer(query)
            
            print("🔢 Embedding hypothetical answer...")
            hypo_embedding = self._embed_hypothetical(hypothetical)
            
            print("🔍 Retrieving similar schemes...")
            chunks = self.vector_store.search(hypo_embedding, limit=top_k)
            chunks_count = len(chunks)
            
            print("🔗 Combining results...")
            result = self._combine_results(query, hypothetical, chunks)
            success = True
            return result
        except Exception as e:
            success = False
            raise e
        finally:
            latency_ms = (time.time() - start_time) * 1000
            from backend.scrapers.rag_monitor import rag_monitor
            rag_monitor.record_retrieval(f"[HyDE] {query}", latency_ms, chunks_count, success)