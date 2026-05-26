from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, List
from typing import Dict, List, Any
import uvicorn
import os

# Labels must exactly match the ones used during training
DOCUMENT_TYPES = [
    "GST_CERTIFICATE", "PAN_CARD", "PITCH_DECK", "INCORPORATION_CERTIFICATE",
    "MSME_REGISTRATION", "AADHAAR_CARD", "BANK_STATEMENT", "CONTRACT", "INVOICE", "OTHER"
]

class ClassificationRequest(BaseModel):
    text: str

class ClassificationResponse(BaseModel):
    document_type: str
    confidence: float
    detections: List[Dict[str, Any]]
    all_scores: Dict[str, float]

app = FastAPI(
    title="Documotion Classifier API",
    description="AI Service for Indian Startup Document Classification",
    version="1.0.0"
)

# Global model and tokenizer instances
model = None
tokenizer = None
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

@app.on_event("startup")
async def load_classifier():
    """Load the model and tokenizer into memory on startup."""
    global model, tokenizer
    model_path = "./models/document-classifier"
    
    if not os.path.exists(model_path):
        print(f"⚠️ Warning: Model path {model_path} not found. Classification will fail.")
        return

    print(f"🚀 Loading Documotion Classifier on {device}...")
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    # Transformers + PEFT handles LoRA loading automatically via from_pretrained
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model.to(device)
    model.eval()
    print("✅ Model loaded and ready for inference.")

@app.post("/api/v1/classify", response_model=ClassificationResponse)
async def classify_document(payload: ClassificationRequest):
    """
    Classifies the provided document text into one of the known Indian startup document types.
    """
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is still loading or not found.")

    # Sliding window logic for long document classification
    tokens = tokenizer.encode(payload.text, add_special_tokens=False)
    window_size, stride = 512, 256
    
    all_probs = []
    
    if len(tokens) <= window_size - 2:
        inputs = tokenizer(payload.text, truncation=True, padding=True, max_length=window_size, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model(**inputs)
            all_probs.append(torch.sigmoid(outputs.logits[0]))
    else:
        for start in range(0, len(tokens), stride):
            end = min(start + window_size - 2, len(tokens))
            inputs = tokenizer.prepare_for_model(tokens[start:end], add_special_tokens=True, return_tensors="pt").to(device)
            with torch.no_grad():
                outputs = model(**inputs)
                all_probs.append(torch.sigmoid(outputs.logits[0]))
    
    # Combine window predictions (Max Pooling)
    final_probs = torch.max(torch.stack(all_probs), dim=0).values
    
    detections = []
    for i, prob in enumerate(final_probs):
        if prob.item() >= 0.5:
            detections.append({
                "document_type": DOCUMENT_TYPES[i],
                "confidence": prob.item()
            })
    
    if not detections:
        idx = torch.argmax(final_probs).item()
        detections.append({
            "document_type": DOCUMENT_TYPES[idx],
            "confidence": final_probs[idx].item()
        })

    return {
        "document_type": detections[0]["document_type"],
        "confidence": detections[0]["confidence"],
        "detections": detections,
        "all_scores": {
            DOCUMENT_TYPES[i]: final_probs[i].item()
            for i in range(len(DOCUMENT_TYPES))
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)