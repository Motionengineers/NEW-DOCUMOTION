"""
Test script for RAG pipeline
"""

import sys
import os
import json

# Add project root to sys.path to resolve package imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.rag.pipeline import get_rag_pipeline
from backend.rag.vector_store import get_vector_store
from backend.rag.chunking import get_chunker

def test_rag_pipeline():
    """Test complete RAG pipeline"""
    
    print("=" * 60)
    print("🚀 Testing RAG Pipeline (Standalone Script)")
    print("=" * 60)
    
    # Initialize components
    pipeline = get_rag_pipeline()
    vector_store = get_vector_store()
    chunker = get_chunker()
    
    # Check connectivity before starting tests
    if not vector_store.check_health():
        print("❌ Error: Qdrant service is not healthy or reachable. Check your Docker container.")
        return
    
    # Sample document
    sample_doc = """
    Startup India Seed Fund Scheme
    
    ELIGIBILITY:
    - The startup must be recognized by DPIIT
    - Age of startup should be less than 2 years
    - Should have a scalable business model
    
    BENEFITS:
    - Up to ₹50 Lakhs funding support
    - Proof of concept development
    - Prototype development assistance
    
    DOCUMENTS REQUIRED:
    - DPIIT Recognition Certificate
    - Pitch Deck
    - Financial Projections
    
    APPLICATION DEADLINE: Rolling
    """
    
    # Index document
    print("\n📄 Indexing document...")
    point_ids = pipeline.index_document(
        text=sample_doc,
        metadata={
            "scheme_name": "Startup India Seed Fund",
            "source": "test",
            "document_type": "SCHEME"
        },
        chunk_strategy="semantic"
    )
    print(f"✅ Indexed {len(point_ids)} chunks")
    
    # Search
    print("\n🔍 Testing search...")
    queries = [
        "funding for early stage startups",
        "DPIIT registration requirements",
        "documents needed for seed fund"
    ]
    
    for query in queries:
        print(f"\n📝 Query: {query}")
        result = pipeline.search(
            query=query,
            limit=3,
            use_reranker=True,
            use_cache=False
        )
        
        print(f"⏱️  Latency: {result['latency_ms']:.2f}ms")
        print(f"📊 Total retrieved: {result['total_retrieved']}")
        
        print("\n🎯 Top Match Chunks:")
        for i, chunk in enumerate(result['chunks'], 1):
            score = chunk.get('final_score', 0)
            content = chunk.get('content', '')[:120].replace('\n', ' ')
            print(f"   {i}. [Score: {score:.4f}] {content}...")

        print("\n💡 Generated Context Preview:")
        print("-" * 50)
        print(result['context'][:400] + "...")
        print("-" * 50)

if __name__ == "__main__":
    test_rag_pipeline()