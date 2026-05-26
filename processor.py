"""
Document Processor - Integrates date extraction with document classification
"""

from typing import Dict, List, Any
from .extractor import get_date_extractor
import re

class DocumentDateProcessor:
    """
    Process documents and extract all date-related information
    Integrates with document classifier for context-aware extraction
    """
    
    def __init__(self):
        self.extractor = get_date_extractor()
    
    def process_document(self, text: str, doc_type: str = None) -> Dict:
        """
        Process document and extract all date information
        """
        # Extract all dates
        date_result = self.extractor.extract(text, include_context=True)
        
        # Find expiry dates specifically
        expiry_dates = [d for d in date_result.get("dates", []) if d.get("context") == "expiry"]
        
        # Find issue dates
        issue_dates = [d for d in date_result.get("dates", []) if d.get("context") == "issue"]
        
        # Find deadlines
        deadline_dates = [d for d in date_result.get("dates", []) if d.get("context") == "deadline"]
        
        # Determine document status based on dates
        status = self._determine_status(date_result, doc_type)
        
        return {
            "document_type": doc_type,
            "all_dates": date_result,
            "expiry_dates": expiry_dates,
            "issue_dates": issue_dates,
            "deadline_dates": deadline_dates,
            "status": status,
            "alert_level": status["alert_level"],
            "requires_action": status["requires_action"]
        }
    
    def _determine_status(self, date_result: Dict, doc_type: str = None) -> Dict:
        """
        Determine document status based on extracted dates
        """
        all_dates = date_result.get("dates", [])
        
        # Filter for dates that actually affect validity
        # We only care about expiry dates or deadlines for the status
        validity_dates = [
            d for d in all_dates 
            if d.get("context") in ["expiry", "deadline"]
        ]
        
        if not validity_dates:
            return {
                "status": "VALID" if all_dates else "NO_DATES_FOUND",
                "alert_level": "success" if all_dates else "info",
                "requires_action": False,
                "message": "No expiry dates found. Document is assumed valid." if all_dates else "No dates found in document"
            }
        
        # Check for expired dates
        expired_dates = [d for d in validity_dates if d.get("is_expired", False)]
        if expired_dates:
            earliest_expired = min(expired_dates, key=lambda x: x["days_remaining"])
            return {
                "status": "EXPIRED",
                "alert_level": "critical",
                "requires_action": True,
                "message": f"Document expired on {earliest_expired['date_iso']}",
                "days_overdue": abs(earliest_expired["days_remaining"])
            }
        
        # Check for expiring soon
        expiring_soon = [d for d in validity_dates if d.get("is_expiring_soon", False)]
        if expiring_soon:
            earliest_expiring = min(expiring_soon, key=lambda x: x["days_remaining"])
            return {
                "status": "EXPIRING_SOON",
                "alert_level": "warning",
                "requires_action": True,
                "message": f"Document expires in {earliest_expiring['days_remaining']} days ({earliest_expiring['date_iso']})",
                "days_remaining": earliest_expiring["days_remaining"]
            }
        
        return {
            "status": "VALID",
            "alert_level": "success",
            "requires_action": False,
            "message": "All dates are valid"
        }
    
    def get_compliance_alerts(self, documents: List[Dict]) -> List[Dict]:
        """
        Generate compliance alerts from multiple documents
        """
        alerts = []
        
        for doc in documents:
            if doc.get("status", {}).get("requires_action"):
                alerts.append({
                    "document_type": doc.get("document_type"),
                    "alert_level": doc["status"]["alert_level"],
                    "message": doc["status"]["message"],
                    "action_required": doc["status"]["requires_action"]
                })
        
        return sorted(alerts, key=lambda x: x["alert_level"] == "critical", reverse=True)


# Singleton instance
_processor_instance = None

def get_document_processor() -> DocumentDateProcessor:
    """Get singleton document processor instance"""
    global _processor_instance
    if _processor_instance is None:
        _processor_instance = DocumentDateProcessor()
    return _processor_instance