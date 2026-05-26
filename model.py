"""
Base Model Architecture for Document Classification
Uses LoRA for parameter-efficient fine-tuning
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from peft import get_peft_model, LoraConfig, TaskType
import os

class DocumentClassifier:
    """
    Document Classifier using a Transformer base with LoRA adapters
    """
    def __init__(self, model_name="bert-base-uncased", num_labels=10):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        model_path = "./models/document-classifier"

        if os.path.exists(model_path):
            print(f"🚀 Loading fine-tuned model from {model_path}")
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_path).to(self.device)
        else:
            print(f"🏗️ Initializing base model: {model_name} on {self.device}")
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Load base model for classification
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                num_labels=num_labels
            ).to(self.device)
            
            # Configure LoRA (Low-Rank Adaptation)
            # Based on PDF Pages 66-86 (Efficient Fine-tuning)
            peft_config = LoraConfig(
                task_type=TaskType.SEQ_CLS,
                inference_mode=False,
                r=16,
                lora_alpha=32,
                lora_dropout=0.1,
                target_modules=["query", "value"]  # Targets attention blocks in BERT/DistilBERT
            )
            
            self.model = get_peft_model(self.model, peft_config)
            self.model.print_trainable_parameters()
        
        self.model.eval()

    def save_model(self, path: str):
        """Save both tokenizer and LoRA adapter weights"""
        print(f"💾 Saving model to {path}")
        os.makedirs(path, exist_ok=True)
        self.model.save_pretrained(path)
        self.tokenizer.save_pretrained(path)

    def predict(self, text: str, window_size: int = 512, stride: int = 256) -> dict:
        """
        Single sample inference with sliding window to handle long documents.
        Aggregates results using Max Pooling across windows.
        """
        tokens = self.tokenizer.encode(text, add_special_tokens=False)
        
        # Handle short documents normally
        if len(tokens) <= window_size - 2:
            inputs = self.tokenizer(text, truncation=True, padding=True, max_length=window_size, return_tensors="pt").to(self.device)
            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = torch.sigmoid(outputs.logits[0])
        else:
            # Process long documents with overlapping windows
            all_probs = []
            for start in range(0, len(tokens), stride):
                end = min(start + window_size - 2, len(tokens))
                window_tokens = tokens[start:end]
                
                # Prepare tokens with special [CLS]/[SEP] markers
                inputs = self.tokenizer.prepare_for_model(
                    window_tokens,
                    add_special_tokens=True,
                    return_tensors="pt"
                ).to(self.device)
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    all_probs.append(torch.sigmoid(outputs.logits[0]))
            
            # Aggregate using max pooling (picks the highest signal from any part of the doc)
            probs = torch.max(torch.stack(all_probs), dim=0).values

        predicted_class = torch.argmax(probs).item()
        return {
            "class_id": predicted_class,
            "confidence": probs[predicted_class].item(),
            "all_probabilities": probs.tolist()
        }

_classifier = None

def get_classifier():
    """Singleton provider for DocumentClassifier inference"""
    global _classifier
    if _classifier is None:
        _classifier = DocumentClassifier()
    return _classifier