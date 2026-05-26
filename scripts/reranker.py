from typing import List, Dict

class Reranker:
    """
    Re-ranks retrieved chunks based on keyword relevance and metadata boosts.
    """
    @staticmethod
    def rerank(query: str, chunks: List[Dict]) -> List[Dict]:
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        for chunk in chunks:
            content_lower = chunk.get('content', '').lower()
            
            # Calculate keyword relevance score
            keyword_score = sum(1 for word in query_words if word in content_lower)
            
            # Metadata Boosts (Refactored from scheme_retriever.py)
            metadata = chunk.get('metadata', {})
            type_boost = 0
            chunk_type = metadata.get('chunk_type', '')
            
            if chunk_type == 'eligibility':
                type_boost = 3
            elif chunk_type == 'benefits':
                type_boost = 2
            
            # Hybrid score
            chunk['relevance_score'] = keyword_score + type_boost
        
        # Sort by relevance primarily, then by vector similarity score
        chunks.sort(
            key=lambda x: (x.get('relevance_score', 0), x.get('score', 0)), 
            reverse=True
        )
        return chunks

class CrossEncoderReranker:
    """
    Lightweight reranker. 
    Can be extended to use 'sentence-transformers/cross-encoder' models.
    """
    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name
        # In a production environment with GPU, you would initialize:
        # self.model = CrossEncoder(model_name)

    def predict(self, pairs: List[tuple]) -> List[float]:
        """
        Calculate relevance scores for (query, text) pairs.
        Currently uses keyword overlap as a CPU-friendly proxy.
        """
        scores = []
        for query, text in pairs:
            query_words = set(query.lower().split())
            text_lower = text.lower()
            
            # Simple keyword score normalized by query length
            matches = sum(1 for word in query_words if word in text_lower)
            score = matches / len(query_words) if query_words else 0
            
            # Add some noise to prevent identical scores
            import random
            scores.append(score + (random.random() * 0.01))
        return scores