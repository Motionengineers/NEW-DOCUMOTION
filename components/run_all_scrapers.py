#!/usr/bin/env python3
"""
Orchestration script to run all scrapers and process schemes
Based on PDF Pages 105-113 (RAG workflow)
"""

import sys
import os

# Add parent directory (backend/) to path to allow importing from scrapers package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.startup_india_scraper import StartupIndiaScraper
from scrapers.msme_scraper import MSMEScraper
from scrapers.state_scraper import StateSchemeScraper
from scrapers.scheme_processor import SchemeProcessor
from scrapers.scheme_vector_store import SchemeVectorStore # New import

def main():
    print("=" * 60)
    print("📡 GOVERNMENT SCHEMES WEB SCRAPER PIPELINE")
    print("=" * 60)
    print()
    
    # Step 1: Run all scrapers (Source Discovery & Extraction)
    print("🔍 STEP 1: Scraping schemes from various sources...")
    print("-" * 40)
    
    scrapers = [
        StartupIndiaScraper(),
        MSMEScraper(),
        StateSchemeScraper()
    ]
    
    all_schemes = []
    for scraper in scrapers:
        try:
            print(f"\n📌 Running {scraper.name} scraper...")
            schemes = scraper.scrape()
            if schemes:
                all_schemes.extend(schemes)
                # Save raw data for traceability and local caching
                scraper.save_schemes(schemes)
        except Exception as e:
            print(f"❌ Error during {scraper.name} execution: {e}")
    
    print(f"\n✅ Total schemes scraped: {len(all_schemes)}")
    
    # Step 2: Process schemes into chunks & embeddings (Page 118-124)
    print("\n" + "=" * 60)
    print("🧩 STEP 2: Processing schemes into RAG chunks")
    print("=" * 60)
    
    try:
        processor = SchemeProcessor()
        chunks = processor.process_all_schemes()

        # Step 3: Store chunks in Vector DB (Qdrant)
        print("\n" + "=" * 60)
        print("📦 STEP 3: Storing chunks in Vector Database (Qdrant)")
        print("=" * 60)
        vector_store = SchemeVectorStore()
        vector_store.add_chunks(chunks)
        
        print("\n" + "=" * 60)
        print("✅ PIPELINE COMPLETE")
        print("=" * 60)
        print(f"📊 Statistics:")
        print(f"   - Total schemes: {len(all_schemes)}")
        print(f"   - Total chunks: {len(chunks)}")
        print(f"   - Storage: backend/data/schemes/chunks/")
    except Exception as e:
        print(f"❌ Error during processing stage: {e}")
    
    # Print sample of first scraped item
    if all_schemes:
        sample = all_schemes[0]
        print(f"\n📋 Latest entry: {sample.get('name')} ({sample.get('ministry')})")

if __name__ == "__main__":
    main()