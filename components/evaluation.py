"""
Model evaluation after fine-tuning
Based on PDF Pages 331-357 (LLM Evaluation & Observability)
"""

import torch
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from typing import List, Dict, Optional
import json
from torch.utils.data import DataLoader

from .config import DOCUMENT_TYPES, TrainingConfig
from .lora_model import LoRADistilBERT
from .dataset import FineTuningDataLoader


class ModelEvaluator:
    """
    Evaluates the performance of the fine-tuned LoRA model.
    Provides detailed metrics including accuracy, F1-score, and confusion matrix.
    """
    def __init__(self, model_path: str, config: Optional[TrainingConfig] = None):
        self.config = config or TrainingConfig()
        self.device = self._get_device()
        
        # Initialize the same model architecture used during training
        self.model = LoRADistilBERT(
            base_model_name=self.config.base_model_name,
            num_labels=self.config.num_labels,
            lora_rank=self.config.lora.r,
            lora_alpha=self.config.lora.lora_alpha,
            lora_dropout=self.config.lora.lora_dropout,
            target_modules=self.config.lora.target_modules
        )
        
        # Load the saved LoRA weights from the checkpoint directory
        self.model.load_lora_weights(model_path)
        self.model = self.model.to(self.device)
        self.model.eval()
        
        self.data_loader = FineTuningDataLoader(self.config)
    
    def _get_device(self) -> torch.device:
        """Hardware detection for evaluation (consistent with trainer)."""
        if self.config.use_cuda and torch.cuda.is_available():
            return torch.device("cuda")
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            return torch.device("mps")
        return torch.device("cpu")
    
    def evaluate(self, test_texts: List[str], test_labels: List[int]) -> Dict:
        """
        Runs inference on the test set and calculates performance metrics.
        """
        print(f"📡 Evaluating LoRA model on {self.device}...")
        
        # Prepare test dataset (using the standardized data split logic)
        _, _, test_ds = self.data_loader.prepare_datasets(test_texts, test_labels, augment_train=False)
        
        # Create DataLoader with optimized hardware settings
        loader_kwargs = {
            "batch_size": self.config.eval_batch_size,
            "num_workers": 4 if torch.cuda.is_available() else 2,
            "pin_memory": torch.cuda.is_available() or torch.backends.mps.is_available()
        }
        test_loader = DataLoader(test_ds, shuffle=False, **loader_kwargs)
        
        all_preds, all_labels = [], []
        
        with torch.no_grad():
            for batch in test_loader:
                input_ids = batch["input_ids"].to(self.device)
                attention_mask = batch["attention_mask"].to(self.device)
                labels = batch["labels"].to(self.device)
                
                outputs = self.model(input_ids, attention_mask)
                preds = torch.argmax(outputs.logits, dim=-1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        # Calculate metrics
        accuracy = accuracy_score(all_labels, all_preds)
        f1 = f1_score(all_labels, all_preds, average='weighted')
        conf_matrix = confusion_matrix(all_labels, all_preds)
        
        # Detailed performance reporting
        print("\n" + "=" * 60)
        print("📈 CLASSIFICATION REPORT")
        print("=" * 60)
        print(classification_report(
            all_labels, 
            all_preds, 
            target_names=DOCUMENT_TYPES,
            labels=list(range(len(DOCUMENT_TYPES))),
            zero_division=0
        ))
        
        print("\n" + "=" * 60)
        print("🧩 CONFUSION MATRIX")
        print("=" * 60)
        print(conf_matrix)
        
        return {
            "accuracy": float(accuracy),
            "f1_score": float(f1),
            "confusion_matrix": conf_matrix.tolist()
        }