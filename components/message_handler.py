"""Logic for processing incoming messages and routing to AI models."""
import re
from .templates import get_template, CLASSIFICATION_RESULT
from hyde_retriever import HyDERetriever
from scheme_retriever import SchemeRetriever
from scrapers.scheme_vector_store import SchemeVectorStore
from classifier.model import get_classifier
from evaluate_model import DOCUMENT_TYPES

class MessageHandler:
    def __init__(self):
        # Initialize local classifier for document type routing
        self.classifier = get_classifier()
        self._init_rag()

    def _init_rag(self):
        """Initialize RAG components for HyDE search"""
        try:
            self.vector_store = SchemeVectorStore()
            self.retriever = SchemeRetriever(self.vector_store)
            self.hyde_retriever = HyDERetriever(self.vector_store, self.retriever)
            self.rag_available = True
        except Exception as e:
            print(f"⚠️ RAG System Initialization failed: {e}")
            self.rag_available = False

    def handle(self, user_text, user_phone):
        """Main entry point for routing logic."""
        text = user_text.strip().lower()

        # 1. Hallucination/PII Protection check (inspired by lib/twilio.js)
        if self._contains_sensitive_data(text):
            return "🛡️ For security, please do not send raw passwords or sensitive PII via WhatsApp."

        # 2. Routing logic
        if "classify" in text or len(text) > 200:
            return self._classify_doc(user_text)
        
        if "scheme" in text or "benefit" in text or "govt" in text:
            return self._search_schemes(user_text)

        if text in ["hi", "hello", "start"]:
            return f"{get_template('welcome')}\n\n{get_template('help')}"

        return get_template('help')

    def _classify_doc(self, text):
        """Process document classification using local LoRA model."""
        try:
            res = self.classifier.predict(text)
            doc_type = DOCUMENT_TYPES[res['class_id']]
            return CLASSIFICATION_RESULT.format(
                doc_type=doc_type, 
                confidence=res['confidence']
            )
        except Exception as e:
            print(f"Classification error: {e}")
        return get_template("error")

    def _search_schemes(self, query):
        """
        RAG integration with HyDE (PDF Pages 131-134)
        """
        if not self.rag_available:
            return get_template("error")

        try:
            # Perform HyDE retrieval
            results = self.hyde_retriever.retrieve(query, top_k=3)
            chunks = results.get("retrieved_chunks", [])
            
            if not chunks:
                return get_template("no_results", query=query)

            response = "🔍 *Top matching schemes for your startup:*\n\n"
            for i, chunk in enumerate(chunks, 1):
                name = chunk.get("scheme_name", "Unknown Scheme")
                content = chunk.get("content", "")[:200]
                response += f"{i}. *{name}*\n{content}...\n\n"
            
            response += "Reply with a scheme name for more details."
            return response
            
        except Exception as e:
            print(f"RAG search error: {e}")
            return get_template("error")

    def _contains_sensitive_data(self, text):
        """Basic check for PII Hallucination/Hallucination check."""
        patterns = [
            r'\b\d{4}\s\d{4}\s\d{4}\b', # Aadhaar-like
            r'[a-zA-Z]{5}\d{4}[a-zA-Z]', # PAN-like
        ]
        for p in patterns:
            if re.search(p, text):
                return True
        return False

message_handler = MessageHandler()