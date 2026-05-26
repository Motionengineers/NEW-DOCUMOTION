import json
from pathlib import Path
from typing import List, Dict
from datetime import datetime
import logging

class BaseSchemeScraper:
    """
    Base class for all government scheme scrapers.
    Handles directory management and standardized JSON storage.
    """
    def __init__(self, name: str):
        self.name = name
        # Output path relative to the project root
        self.raw_data_path = Path("backend/data/schemes/raw")
        self.raw_data_path.mkdir(parents=True, exist_ok=True)
        logging.basicConfig(level=logging.INFO)

    def scrape(self) -> List[Dict]:
        """To be implemented by specific scrapers"""
        raise NotImplementedError("Scrapers must implement the scrape() method.")

    def save_schemes(self, schemes: List[Dict]):
        """Standardized method to save raw scraped data with source metadata"""
        if not schemes:
            return
            
        file_path = self.raw_data_path / f"{self.name}.json"
        
        # Inject metadata for traceability in RAG pipeline
        for scheme in schemes:
            scheme["_scraped_at"] = datetime.utcnow().isoformat()
            scheme["_source_name"] = self.name

        with file_path.open("w", encoding="utf-8") as f:
            json.dump(schemes, f, indent=2, ensure_ascii=False)
        logging.info(f"💾 Saved {len(schemes)} raw schemes to {file_path}")