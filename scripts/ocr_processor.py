"""
OCR Processor for scanned PDFs
Uses Tesseract for English and Hindi support
"""

import logging
from typing import Optional

try:
    from pdf2image import convert_from_path
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    logging.warning("OCR libraries not installed. Scanned PDFs will not be processed.")

class OCRProcessor:
    def __init__(self):
        self.available = OCR_AVAILABLE

    def ocr_page(self, pdf_path: str, page_num: int) -> str:
        """Perform OCR on a specific page of a PDF"""
        if not self.available:
            return "[OCR_NOT_AVAILABLE]"

        try:
            # Convert only the specific page to image to save memory
            images = convert_from_path(
                pdf_path, 
                first_page=page_num, 
                last_page=page_num,
                thread_count=2
            )
            
            if not images:
                return ""

            # OCR with English + Hindi support
            text = pytesseract.image_to_string(images[0], lang='eng+hin')
            return text.strip()
            
        except Exception as e:
            logging.error(f"OCR Error on page {page_num}: {e}")
            return ""