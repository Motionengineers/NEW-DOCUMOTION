import json
import os
from .synthetic_document_generator import SyntheticDocumentGenerator
from .backend.data_generation.data_augmentation import DocumentAugmenter

def main():
    gen = SyntheticDocumentGenerator()
    augmentor = DocumentAugmenter()
    
    # Mapping labels to generator functions
    tasks = [
        ("GST_CERTIFICATE", gen.generate_gst_certificate),
        ("PAN_CARD", gen.generate_pan_card),
        ("MSME_REGISTRATION", gen.generate_msme_certificate),
        ("INCORPORATION_CERTIFICATE", gen.generate_incorporation_certificate),
        ("PITCH_DECK", gen.generate_pitch_deck),
        ("AADHAAR_CARD", gen.generate_aadhaar),
        ("BANK_STATEMENT", gen.generate_bank_statement),
        ("CONTRACT", gen.generate_contract),
        ("INVOICE", gen.generate_invoice)
    ]
    
    samples_per_class = 250
    output_file = "backend/data/synthetic/training/synthetic_training_data.json"
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    dataset = []
    
    for label, func in tasks:
        print(f"Generating samples for {label}...")
        for _ in range(samples_per_class):
            doc_data = func()
            raw_text = doc_data["text"]
            
            # Add both clean and augmented versions
            for text in [raw_text, augmentor.augment(raw_text)]:
                dataset.append({
                    "text": text,
                    "document_type": label,
                    "is_augmented": text != raw_text
                })

    with open(output_file, 'w') as f:
        json.dump({"documents": dataset}, f, indent=2)

    print(f"Successfully generated dataset at {output_file}")

if __name__ == "__main__":
    main()