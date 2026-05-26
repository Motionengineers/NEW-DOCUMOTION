"""
Main PDF Extraction logic for Documotion
Combines layout analysis, OCR, and Indian format detection
"""

import os
import pdfplumber
import hashlib
from datetime import datetime
from typing import Dict, List, Any

from .layout_analyzer import LayoutAnalyzer
from .indian_formats import IndianFormatDetector, clean_govt_text
from .ocr_processor import OCRProcessor

class PDFExtractor:
    """
    Extract text from PDFs with auto-detection of scanned pages
    """
    
    def __init__(self, method: str = "auto"):
        """
        Args:
            method: "auto", "accurate" (pdfplumber), or "ocr" (tesseract)
        """
        self.method = method
        self.layout_analyzer = LayoutAnalyzer()
        self.detector = IndianFormatDetector()
        self.ocr_processor = OCRProcessor()

    def extract(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract structured text and detect document metadata
        """
        if not os.path.exists(pdf_path):
            return {"error": f"File not found: {pdf_path}", "text": "", "pages": 0}

        result = {
            "filename": os.path.basename(pdf_path),
            "extracted_at": datetime.now().isoformat(),
            "pages": 0,
            "text": "",
            "doc_id": hashlib.md5(os.path.basename(pdf_path).encode()).hexdigest(),
            "method_used": self.method,
            "metadata": {},
            "detected_type": {}
        }

        try:
            with pdfplumber.open(pdf_path) as pdf:
                result["metadata"] = pdf.metadata or {}
                result["pages"] = len(pdf.pages)
                all_text_blocks = []

                for i, page in enumerate(pdf.pages, 1):
                    # Analyze page layout
                    layout = self.layout_analyzer.analyze_page(page)
                    
                    # Primary extraction attempt
                    text = page.extract_text(layout=True)

                    # Trigger OCR if page is scanned/empty and method is auto/ocr
                    if (not text or len(text.strip()) < 50) and self.method in ["auto", "ocr"]:
                        text = self.ocr_processor.ocr_page(pdf_path, i)
                    
                    if text:
                        all_text_blocks.append(text)
                
                # Combine, clean and normalize govt-specific artifacts
                raw_text = "\n\n".join(all_text_blocks)
                result["text"] = clean_govt_text(raw_text)
                
                # Detect document type (GST, PAN, etc.)
                if result["text"]:
                    result["detected_type"] = self.detector.detect_document_type(result["text"])

        except Exception as e:
            result["error"] = f"Extraction failure: {str(e)}"
            result["text"] = ""

        return result