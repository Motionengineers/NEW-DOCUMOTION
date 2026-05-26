import os
import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models

class QdrantVectorStore:
    """
    Wrapper for Qdrant vector database operations.
    """
    def __init__(self, collection_name: str = "schemes"):
        self.host = os.getenv("QDRANT_HOST", "localhost")
        self.port = int(os.getenv("QDRANT_PORT", 6333))
        self.client = QdrantClient(host=self.host, port=self.port)
        self.collection_name = collection_name
        self._ensure_collection()

    def _ensure_collection(self):
        """Ensure the collection exists with the correct vector size (384 for MiniLM)."""
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            self.client.recreate_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=384, 
                    distance=models.Distance.COSINE
                )
            )

    def search(self, vector: List[float], limit: int = 10, filter_query: Optional[Any] = None) -> List[Dict]:
        """Search for similar vectors."""
        hits = self.client.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=limit,
            query_filter=filter_query
        )
        return [
            {
                "id": hit.id,
                "score": hit.score,
                "content": hit.payload.get("content", ""),
                "metadata": hit.payload
            }
            for hit in hits
        ]

    def add_chunks(self, points: List[Any]):
        """Add points to the collection."""
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def add_documents_batch(self, texts: List[str], metadatas: List[Dict[str, Any]]) -> List[str]:
        """
        Generate embeddings and index a batch of documents.
        """
        from .embeddings import get_embedding_generator
        generator = get_embedding_generator()
        
        embeddings = generator.encode_batch(texts)
        
        points = []
        point_ids = []
        for text, metadata, vector in zip(texts, metadatas, embeddings):
            p_id = str(uuid.uuid4())
            point_ids.append(p_id)
            points.append(models.PointStruct(
                id=p_id,
                vector=vector.tolist(),
                payload={**metadata, "content": text}
            ))
            
        self.add_chunks(points)
        return point_ids

# Singleton instance
_vector_store = None

def get_vector_store(collection_name: str = "schemes") -> QdrantVectorStore:
    """Get singleton vector store instance"""
    global _vector_store
    if _vector_store is None:
        _vector_store = QdrantVectorStore(collection_name)
    return _vector_store