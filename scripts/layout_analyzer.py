from typing import List, Dict, Any

class LayoutAnalyzer:
    def is_header(self, line: str) -> bool:
        """Heuristic to detect headers: short lines, all caps, or specific prefixes."""
        clean_line = line.strip()
        if not clean_line: return False
        
        # All caps and relatively short
        if clean_line.isupper() and len(clean_line) < 120 and not clean_line.isdigit():
            return True
            
        # Starts with numbering (e.g., 1.1, Section A)
        if any(clean_line.lower().startswith(p) for p in ["section", "chapter", "annexure", "rule", "clause"]):
            return True
            
        return False

    def analyze_page(self, page_obj: Any) -> Dict[str, Any]:
        """Identify tables vs text blocks."""
        tables = page_obj.extract_tables()
        text = page_obj.extract_text()
        
        return {
            "has_tables": len(tables) > 0,
            "table_count": len(tables),
            "raw_text": text
        }