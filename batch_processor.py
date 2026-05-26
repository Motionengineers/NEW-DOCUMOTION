"""
Batch process multiple PDF files
"""

import os
import json
from typing import List, Dict
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from .extractor import PDFExtractor
from .indian_formats import IndianFormatDetector

class BatchProcessor:
    """
    Process multiple PDFs in parallel
    """
    
    def __init__(self, input_dir: str, output_dir: str, max_workers: int = 4):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.max_workers = max_workers
        self.extractor = PDFExtractor(method="auto")
        self.detector = IndianFormatDetector()
        
        os.makedirs(output_dir, exist_ok=True)

    def run(self) -> List[Dict]:
        """Compatibility method for existing scripts"""
        return self.process_all()

    def process_all(self) -> List[Dict]:
        """Process all PDFs in input directory"""
        results = []
        
        # Find all PDF files
        pdf_files = []
        for root, dirs, files in os.walk(self.input_dir):
            for file in files:
                if file.lower().endswith('.pdf'):
                    pdf_files.append(os.path.join(root, file))
        
        print(f"📄 Found {len(pdf_files)} PDF files to process")
        
        # Process in parallel
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {executor.submit(self._process_one, pdf_path): pdf_path for pdf_path in pdf_files}
            
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                print(f"   Processed: {result['filename']} ({result.get('pages', 0)} pages)")
        
        # Save summary
        self._save_summary(results)
        
        return results

    def _process_one(self, pdf_path: str) -> Dict:
        """Process a single PDF"""
        # Extract text
        result = self.extractor.extract(pdf_path)
        
        if result.get('text'):
            # Detect document type
            type_detection = self.detector.detect_document_type(result['text'])
            result['detected_type'] = type_detection
            
            # Extract Indian formats
            result['extracted_entities'] = {
                "gst_numbers": self.detector.extract_gst(result['text']),
                "pan_numbers": self.detector.extract_pan(result['text']),
                "aadhaar_numbers": self.detector.extract_aadhaar(result['text']),
                "cin_numbers": self.detector.extract_cin(result['text']),
                "dates": self.detector.extract_dates(result['text'])[:10],  # First 10 dates
                "amounts": self.detector.extract_amounts(result['text'])[:10]  # First 10 amounts
            }
        
        # Save extracted data
        self._save_result(result)
        
        return result

    def _save_result(self, result: Dict):
        """Save extracted result to JSON"""
        output_filename = result['filename'].replace('.pdf', '.json')
        output_path = os.path.join(self.output_dir, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

    def _save_summary(self, results: List[Dict]):
        """Save processing summary"""
        summary = {
            "processed_at": datetime.now().isoformat(),
            "total_files": len(results),
            "successful_extractions": sum(1 for r in results if r.get('text')),
            "failed_extractions": sum(1 for r in results if r.get('error')),
            "total_pages": sum(r.get('pages', 0) for r in results),
            "document_types": {}
        }
        
        for result in results:
            doc_type = result.get('detected_type', {}).get('document_type', 'UNKNOWN')
            summary['document_types'][doc_type] = summary['document_types'].get(doc_type, 0) + 1
        
        summary_path = os.path.join(self.output_dir, "summary.json")
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Summary saved to {summary_path}")
        print(f"   Total files: {summary['total_files']}")
        print(f"   Total pages: {summary['total_pages']}")

if __name__ == "__main__":
    processor = BatchProcessor(
        input_dir="data/pdfs/raw",
        output_dir="data/pdfs/extracted",
        max_workers=4
    )
    
    results = processor.run()
    
    print("\n📊 Processing Complete")
    print(f"   Processed: {len(results)} files")
    print(f"   Successful: {sum(1 for r in results if r.get('text'))}")