import re

INDIAN_ID_PATTERNS = {
    "PAN": r"[A-Z]{5}[0-9]{4}[A-Z]{1}",
    "GSTIN": r"\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}",
    "AADHAAR": r"\d{4}\s\d{4}\s\d{4}",
    "CIN": r"[UL]{1}\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}"
}

GOVT_HEADERS = [
    "GOVERNMENT OF INDIA",
    "MINISTRY OF",
    "DEPARTMENT OF",
    "GAZETTE OF INDIA",
    "OFFICE MEMORANDUM",
    "STARTUP INDIA",
    "UDYAM REGISTRATION"
]

def clean_govt_text(text: str) -> str:
    """Remove common artifacts like 'Page X of Y' or 'Digitally Signed'."""
    if not text: return ""
    text = re.sub(r"Page \d+ of \d+", "", text)
    text = re.sub(r"Digitally signed by.*?\n", "", text, flags=re.IGNORECASE)
    text = re.sub(r"Signature Not Verified.*?\n", "", text, flags=re.IGNORECASE)
    return text.strip()