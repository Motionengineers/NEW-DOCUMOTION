"""
Model evaluation and testing
Based on PDF Pages 331-357 (LLM Evaluation)
"""

import json
import torch
Mfrom transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
from tqdm import tqdm
import os

# Standard labels for Documotion - must match labels used in generator and training
DOCUMENT_TYPES = [
    "GST_CERTIFICATE", "PAN_CARD", "PITCH_DECK", "INCORPORATION_CERTIFICATE",
    "MSME_REGISTRATION", "AADHAAR_CARD", "BANK_STATEMENT", "CONTRACT", "INVOICE", "OTHER"
]

class ModelEvaluator:
    """Evaluate document classifier performance"""
    
    def __init__(self, model_path="./models/document-classifier"):
        # Auto-detect hardware acceleration (CUDA for NVIDIA, MPS for Mac, CPU as fallback)
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        print(f"📡 Evaluation running on device: {self.device}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path).to(self.device)
        self.model.eval()
    
    def predict(self, text: str) -> dict:
        """Predict document type for a single text input"""
        tokens = self.tokenizer.encode(text, add_special_tokens=False)
        window_size, stride = 512, 256
        all_probs = []

        if len(tokens) <= window_size - 2:
            inputs = self.tokenizer(text, truncation=True, padding=True, max_length=window_size, return_tensors="pt").to(self.device)
            with torch.no_grad():
                outputs = self.model(**inputs)
                all_probs.append(torch.sigmoid(outputs.logits[0]))
        else:
            for start in range(0, len(tokens), stride):
                end = min(start + window_size - 2, len(tokens))
                inputs = self.tokenizer.prepare_for_model(
                    tokens[start:end], 
                    add_special_tokens=True, 
                    return_tensors="pt"
                ).to(self.device)
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    all_probs.append(torch.sigmoid(outputs.logits[0]))

        probabilities = torch.max(torch.stack(all_probs), dim=0).values
        predicted_class = torch.argmax(probabilities).item()
        
        return {
            "document_type": DOCUMENT_TYPES[predicted_class],
            "confidence": probabilities[predicted_class].item(),
            "all_scores": {
                DOCUMENT_TYPES[i]: probabilities[i].item()
                for i in range(len(DOCUMENT_TYPES))
            }
        }
    
    def evaluate(self, test_texts: list, test_labels: list, batch_size: int = 16):
        """
        Evaluate on test set using batching for significantly faster processing.
        """
        predictions = []
        
        print(f"📊 Processing {len(test_texts)} samples in batches of {batch_size}...")
        
        # Batch processing for efficiency
        for i in tqdm(range(0, len(test_texts), batch_size)):
            batch_texts = test_texts[i : i + batch_size]
            inputs = self.tokenizer(
                batch_texts, 
                truncation=True, 
                padding=True, 
                max_length=512, 
                return_tensors="pt"
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                batch_probs = torch.softmax(outputs.logits, dim=-1)
                batch_preds = torch.argmax(batch_probs, dim=-1).cpu().numpy()
                predictions.extend(batch_preds)
        
        # Detailed performance reporting
        print("\n" + "=" * 60)
        print("📈 CLASSIFICATION REPORT")
        print("=" * 60)
        print(classification_report(
            test_labels, 
            predictions, 
            target_names=DOCUMENT_TYPES,
            labels=list(range(len(DOCUMENT_TYPES))),
            zero_division=0
        ))
        
        print("\n" + "=" * 60)
        print("🧩 CONFUSION MATRIX")
        print("=" * 60)
        print(confusion_matrix(test_labels, predictions))
        
        return predictions

def load_test_data(filepath: str = "backend/data/synthetic/training/synthetic_training_data.json"):
    """Helper to load evaluation data from the synthetic generation pipeline."""
    if not os.path.exists(filepath):
        print(f"❌ Error: Synthetic data file not found at {filepath}")
        return [], []
        
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    texts = []
    labels = []
    label_to_id = {label: i for i, label in enumerate(DOCUMENT_TYPES)}
    
    for doc in data.get('documents', []):
        texts.append(doc['text'])
        label_str = doc.get('document_type', 'OTHER')
        labels.append(label_to_id.get(label_str, label_to_id['OTHER']))
        
    return texts, labels

if __name__ == "__main__":
    # Initialize evaluator
    evaluator = ModelEvaluator()
    
    # Load data from the synthetic generation pipeline
    texts, labels = load_test_data()
    
    if texts:
        # Full dataset evaluation
        evaluator.evaluate(texts, labels)
    else:
        # Fallback to a single sample smoke test if no data is found
        print("\n🔍 Running single sample smoke test...")
        sample_text = "GST Certificate for ABC Tech. GSTIN: 27AAACA1234E1Z5"
        result = evaluator.predict(sample_text)
        print(f"   Input: '{sample_text}'")
        print(f"   Prediction: {result['document_type']} ({result['confidence']:.2%})")