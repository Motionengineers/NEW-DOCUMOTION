"""
LoRA Model Implementation from Scratch
Based on PDF Pages 78-87 (LoRA Implementation)
"""

import torch
import torch.nn as nn
import math
from typing import Optional, List
from transformers import AutoModelForSequenceClassification


class LoRALayer(nn.Module):
    """
    LoRA Layer implementation
    Based on PDF Pages 78-87
    
    W' = W + (B × A) × (alpha / r)
    Where A and B are low-rank matrices
    """
    
    def __init__(
        self,
        original_weight: nn.Module,
        in_features: int,
        out_features: int,
        rank: int = 8,
        alpha: int = 32,
        dropout: float = 0.1
    ):
        super().__init__()
        self.original_weight = original_weight
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank
        
        # Freeze original weights
        for param in self.original_weight.parameters():
            param.requires_grad = False
        
        # Low-rank matrices A and B (PDF Page 78-82)
        self.lora_A = nn.Parameter(torch.zeros(rank, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank))
        self.dropout = nn.Dropout(dropout)
        
        # Initialize A with Kaiming uniform (PDF Page 83-84)
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        # Initialize B with zeros (so initial adaptation is zero)
        nn.init.zeros_(self.lora_B)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass: Wx + (B × A)x × scaling
        """
        # Original output
        original_output = self.original_weight(x)
        
        # LoRA adaptation: (B × A) × x
        # Project input to low-rank space, then back to original space
        lora_output = (
            self.dropout(x) @ self.lora_A.t() @ self.lora_B.t()
        ) * self.scaling
        
        return original_output + lora_output


class LoRADistilBERT(nn.Module):
    """
    DistilBERT model with LoRA applied to attention layers
    Based on PDF Pages 80-87
    """
    
    def __init__(
        self,
        base_model_name: str = "distilbert-base-uncased",
        num_labels: int = 10,
        lora_rank: int = 8,
        lora_alpha: int = 32,
        lora_dropout: float = 0.1,
        target_modules: List[str] = ["q_lin", "v_lin"]
    ):
        super().__init__()
        
        # Load base model
        self.base_model = AutoModelForSequenceClassification.from_pretrained(
            base_model_name,
            num_labels=num_labels
        )
        
        # Standard LoRA procedure: First freeze the entire base model
        for param in self.base_model.parameters():
            param.requires_grad = False
            
        self.lora_rank = lora_rank
        self.lora_alpha = lora_alpha
        self.num_labels = num_labels
        
        # Apply LoRA to target modules
        self._apply_lora(target_modules, lora_dropout)
        
        # Unfreeze the classifier head so it can be fine-tuned for the specific task.
        # For DistilBERT/BERT, this typically involves 'pre_classifier' and 'classifier' or 'score'.
        for name, module in self.base_model.named_modules():
            if "classifier" in name or "score" in name:
                for param in module.parameters():
                    param.requires_grad = True
        
        # Count trainable parameters
        self._print_trainable_params()
    
    def _apply_lora(self, target_modules: List[str], dropout: float):
        """
        Apply LoRA to specified modules using named_modules for better flexibility.
        Finds and replaces target linear layers within the model architecture.
        """
        replacements = []
        for name, module in self.base_model.named_modules():
            # Check if this module is one of our targets (e.g., 'q_lin' or 'v_lin')
            if any(name.endswith(target) for target in target_modules) and isinstance(module, nn.Linear):
                # Traverse to find the parent module and attribute name for replacement
                parts = name.split('.')
                parent = self.base_model
                for part in parts[:-1]:
                    parent = getattr(parent, part)
                replacements.append((parent, parts[-1], module))
                
        for parent, attr_name, original_module in replacements:
            lora_layer = LoRALayer(
                original_module,
                original_module.in_features,
                original_module.out_features,
                rank=self.lora_rank,
                alpha=self.lora_alpha,
                dropout=dropout
            )
            setattr(parent, attr_name, lora_layer)
    
    def _print_trainable_params(self):
        """Print trainable parameter statistics"""
        trainable = sum(p.numel() for p in self.parameters() if p.requires_grad)
        total = sum(p.numel() for p in self.parameters())
        print(f"📊 LoRA Statistics:")
        print(f"   Trainable: {trainable:,} ({trainable/total:.2%})")
        print(f"   Total: {total:,}")
        print(f"   Rank: {self.lora_rank}, Alpha: {self.lora_alpha}")
    
    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        labels: Optional[torch.Tensor] = None
    ):
        """Forward pass delegated to the modified base model"""
        return self.base_model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=labels
        )
    
    def save_pretrained(self, save_path: str):
        """Save LoRA weights only (not full model)"""
        import os
        os.makedirs(save_path, exist_ok=True)
        
        # Save only LoRA parameters
        lora_state = {}
        for name, param in self.named_parameters():
            if param.requires_grad:
                lora_state[name] = param.detach().cpu()
        
        torch.save(lora_state, f"{save_path}/lora_weights.pt")
        print(f"✅ LoRA weights saved to {save_path}/lora_weights.pt")
    
    def load_lora_weights(self, load_path: str):
        """Load LoRA weights from a saved checkpoint"""
        lora_state = torch.load(f"{load_path}/lora_weights.pt", map_location="cpu")
        
        # Load only trainable parameters
        for name, param in self.named_parameters():
            if param.requires_grad and name in lora_state:
                param.data.copy_(lora_state[name])
        
        print(f"✅ LoRA weights loaded from {load_path}/lora_weights.pt")
