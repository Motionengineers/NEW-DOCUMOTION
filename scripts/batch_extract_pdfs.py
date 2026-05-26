import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.pdf_extractor.batch_processor import BatchProcessor

if __name__ == "__main__":
    # Define paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    RAW_PDF_DIR = os.path.join(BASE_DIR, "data/pdfs/raw")
    OUTPUT_DIR = os.path.join(BASE_DIR, "data/pdfs/extracted")

    processor = BatchProcessor(RAW_PDF_DIR, OUTPUT_DIR)
    processor.run()
    print("✅ Batch extraction complete.")