"""
Small NER Model for Date Extraction
Based on PDF Pages 66-86 (Fine-tuning small models)
Uses a lightweight BiLSTM-CRF architecture
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from typing import List, Dict, Tuple, Optional
import pickle
import os
import re

# Label mapping for NER tags
LABELS = {
    "O": 0,           # Outside
    "B-DATE": 1,      # Beginning of date
    "I-DATE": 2,      # Inside date
    "B-EXPIRY": 3,    # Beginning of expiry context
    "I-EXPIRY": 4,    # Inside expiry context
}

IDX_TO_LABEL = {v: k for k, v in LABELS.items()}

class CharacterVocabulary:
    """Character-level vocabulary for NER"""
    
    def __init__(self):
        self.char2idx = {}
        self.idx2char = {}
        self._build_vocab()
    
    def _build_vocab(self):
        chars = " abcdefghijklmnopqrstuvwxyz0123456789/-.,()"
        for i, char in enumerate(chars):
            self.char2idx[char] = i + 1  # 0 reserved for padding
            self.idx2char[i + 1] = char
        self.char2idx['<PAD>'] = 0
        self.idx2char[0] = '<PAD>'
    
    def __len__(self):
        return len(self.char2idx)
    
    def encode(self, text: str, max_len: int = 512) -> torch.Tensor:
        """Encode text to character indices"""
        indices = []
        for char in text.lower()[:max_len]:
            indices.append(self.char2idx.get(char, 0))
        # Pad
        indices += [0] * (max_len - len(indices))
        return torch.tensor(indices)


class BiLSTMNER(nn.Module):
    """
    Small BiLSTM-CRF model for NER
    Lightweight enough to run on CPU
    """
    
    def __init__(self, vocab_size: int, embedding_dim: int = 64, hidden_dim: int = 128, num_labels: int = len(LABELS)):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        self.lstm = nn.LSTM(
            embedding_dim,
            hidden_dim,
            num_layers=2,
            bidirectional=True,
            batch_first=True,
            dropout=0.3
        )
        self.dropout = nn.Dropout(0.3)
        self.classifier = nn.Linear(hidden_dim * 2, num_labels)
        
        # CRF layer (simplified - using linear for speed)
        self.crf = None  # For simplicity, we'll use linear + softmax
    
    def forward(self, x):
        x = self.embedding(x)
        x, _ = self.lstm(x)
        x = self.dropout(x)
        x = self.classifier(x)
        return x
    
    def predict_tags(self, text: str, vocab: CharacterVocabulary) -> List[Tuple[str, str]]:
        """Predict NER tags for all characters in text"""
        self.eval()
        
        max_len = 512
        text_chunk = text[:max_len]
        
        # Encode text
        x = vocab.encode(text_chunk, max_len=max_len).unsqueeze(0)  # batch size 1
        
        with torch.no_grad():
            logits = self.forward(x)
            predictions = torch.argmax(logits, dim=-1)
        
        # Convert to labels
        tags = []
        for i in range(len(text_chunk)):
            idx = predictions[0][i].item()
            label = IDX_TO_LABEL[idx]
            tags.append((text_chunk[i], label))
        
        return tags


class DateNERModel:
    """
    Lightweight NER model for date extraction
    Can run on CPU efficiently
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.vocab = CharacterVocabulary()
        self.model = BiLSTMNER(len(self.vocab))
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def train(self, training_data: List[Tuple[str, List[Tuple[int, int, str]]]], epochs: int = 10):
        """
        Train the NER model
        training_data: list of (text, [(start_pos, end_pos, label_type)])
        """
        # Prepare training samples
        X = []
        y = []
        max_len = 512
        
        for text, annotations in training_data:
            # Tokenize at character level
            encoded = self.vocab.encode(text, max_len=max_len)
            labels = torch.zeros(max_len, dtype=torch.long)
            
            for start, end, label in annotations:
                if start < max_len:
                    if label == "DATE":
                        labels[start] = LABELS["B-DATE"]
                        end_pos = min(end, max_len)
                        labels[start+1:end_pos] = LABELS["I-DATE"]
            
            X.append(encoded)
            y.append(labels)
        
        # Create DataLoader
        dataset = list(zip(X, y))
        dataloader = DataLoader(dataset, batch_size=8, shuffle=True)
        
        # Optimizer
        optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        criterion = nn.CrossEntropyLoss()
        
        # Training loop
        for epoch in range(epochs):
            total_loss = 0
            for batch_x, batch_y in dataloader:
                optimizer.zero_grad()
                outputs = self.model(batch_x)
                loss = criterion(outputs.view(-1, len(LABELS)), batch_y.view(-1))
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            
            print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss:.4f}")
    
    def extract_date_entities(self, text: str) -> List[str]:
        """Extract dates from text as strings (maintains API compatibility)"""
        tags = self.model.predict_tags(text, self.vocab)
        
        # Group consecutive date tokens
        dates = []
        current_date = ""
        
        for char, tag in tags:
            if tag in ["B-DATE", "I-DATE"]:
                current_date += char
            else:
                if current_date:
                    dates.append(current_date)
                    current_date = ""
        
        if current_date:
            dates.append(current_date)
        
        return dates

    def extract_dates(self, text: str) -> List[Dict]:
        """Extract dates with their actual start positions in the text."""
        tags = self.model.predict_tags(text, self.vocab)
        
        dates = []
        current_date = ""
        start_pos = -1
        
        for i, (char, tag) in enumerate(tags):
            if tag in ["B-DATE", "I-DATE"]:
                if tag == "B-DATE" or start_pos == -1:
                    # Flush existing if we hit a new B-tag while I-tag was active
                    if current_date and start_pos != -1:
                        dates.append({"date_string": current_date, "position": start_pos})
                    current_date = char
                    start_pos = i
                else:
                    current_date += char
            else:
                if current_date and start_pos != -1:
                    dates.append({"date_string": current_date, "position": start_pos})
                    current_date = ""
                    start_pos = -1
        
        if current_date and start_pos != -1:
            dates.append({"date_string": current_date, "position": start_pos})
        
        return dates
    
    def save_model(self, path: str):
        """Save model to disk"""
        os.makedirs(path, exist_ok=True)
        torch.save(self.model.state_dict(), os.path.join(path, "model.pt"))
        with open(os.path.join(path, "vocab.pkl"), "wb") as f:
            pickle.dump(self.vocab, f)
        print(f"✅ NER model saved to {path}")
    
    def load_model(self, path: str):
        """Load model from disk"""
        model_file = os.path.join(path, "model.pt")
        vocab_file = os.path.join(path, "vocab.pkl")
        
        if os.path.exists(model_file):
            self.model.load_state_dict(torch.load(model_file, map_location="cpu"))
        if os.path.exists(vocab_file):
            with open(vocab_file, "rb") as f:
                self.vocab = pickle.load(f)
        self.model.eval()
        print(f"✅ NER model loaded from {path}")


# Singleton instance
_ner_instance = None

def get_ner_model() -> DateNERModel:
    """Get singleton NER model instance"""
    global _ner_instance
    if _ner_instance is None:
        model_path = "./models/date_ner"
        _ner_instance = DateNERModel(model_path)
    return _ner_instance

date_ner_model = get_ner_model()