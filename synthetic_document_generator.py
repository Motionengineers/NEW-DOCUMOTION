"""
Synthetic Document Generator for Indian Startup Documents
Based on PDF Pages 86-92 (Generate Your Own LLM Fine-tuning Dataset)
"""

import json
import random
import uuid
import string
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from faker import Faker
import names

from .document_templates import DOCUMENT_TEMPLATE_MAP

# Initialize Faker for Indian data
fake = Faker('en_IN')

class SyntheticDocumentGenerator:
    """
    Generates realistic synthetic Indian documents for training
    Uses templates + random data generation
    """
    
    def __init__(self, seed: int = 42):
        random.seed(seed)
        self.seed = seed
        
        # Company name prefixes
        self.company_prefixes = [
            "Tech", "Innovate", "Digital", "Smart", "NextGen", "Future", "Cloud",
            "Data", "AI", "Secure", "Eco", "Green", "Health", "Medi", "Edu", "Learn"
        ]
        
        self.company_suffixes = [
            "Solutions", "Labs", "Systems", "Tech", "Innovations", "Analytics",
            "Softwares", "Enterprises", "Group", "Ventures", "Holdings"
        ]
        
        self.industry_sectors = [
            "SaaS", "Fintech", "Healthtech", "Edtech", "Agritech", "Cleantech",
            "Logistics", "E-commerce", "D2C", "Marketplace", "B2B", "Enterprise"
        ]
        
        # Common Indian names for directors
        self.indian_first_names = [
            "Amit", "Rajesh", "Priya", "Sanjay", "Neha", "Vikram", "Deepa",
            "Rahul", "Anjali", "Suresh", "Kavita", "Manish", "Pooja", "Rakesh"
        ]
        
        self.indian_last_names = [
            "Sharma", "Verma", "Patel", "Kumar", "Singh", "Reddy", "Gupta",
            "Joshi", "Nair", "Menon", "Malhotra", "Mehta", "Agarwal"
        ]
        
        # GST states codes
        self.states = ["KA", "MH", "DL", "TN", "TS", "UP", "WB"]
        self.gst_states = {
            "27": "Maharashtra", "29": "Karnataka", "07": "Delhi",
            "33": "Tamil Nadu", "24": "Gujarat", "36": "Telangana",
            "19": "West Bengal", "08": "Rajasthan", "09": "Uttar Pradesh"
        }
        self.enterprise_types = ["MICRO", "SMALL", "MEDIUM"]

    def _generate_company_name(self) -> str:
        """Generate Indian company name"""
        prefix = random.choice(self.company_prefixes)
        suffix = random.choice(self.company_suffixes)
        return f"{prefix} {suffix} Pvt Ltd"
    
    def _generate_gstin(self) -> str:
        """Generate fake GSTIN (Indian format)"""
        state_code = random.choice(list(self.gst_states.keys()))
        pan = self._generate_pan()
        entity_code = str(random.randint(1, 9))
        check_digit = random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ123456789')
        return f"{state_code}{pan}{entity_code}Z{check_digit}"
    
    def _generate_pan(self, is_company: bool = True) -> str:
        """Generate fake PAN number"""
        letters = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ', k=3))
        # 4th character denotes status (P=Person, C=Company, etc.)
        status = 'C' if is_company else 'P'
        letters += status + random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ')
        numbers = str(random.randint(1000, 9999))
        check = random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ')
        return f"{letters}{numbers}{check}"
    
    def _generate_cin(self) -> str:
        """Generate fake CIN (Company Identification Number)"""
        listing = random.choice(['U', 'L'])
        industry_code = str(random.randint(10000, 99999))
        state_code = random.choice(self.states)
        registration_year = str(random.randint(2015, 2025))
        registration_no = str(random.randint(100000, 999999))
        return f"{listing}{industry_code}{state_code}{registration_year}PLC{registration_no}"
    
    def _generate_aadhaar(self) -> str:
        """Generate fake Aadhaar number"""
        return f"{random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
    
    def _generate_date(self, start_year: int = 2015, end_year: int = 2025) -> str:
        """Generate random date in DD/MM/YYYY format"""
        start_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year, 12, 31)
        random_date = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))
        return random_date.strftime("%d/%m/%Y")
    
    def _generate_future_date(self, max_months: int = 24) -> str:
        """Generate future date (for expiry)"""
        start_date = datetime.now()
        end_date = start_date + timedelta(days=random.randint(30, max_months * 30))
        return end_date.strftime("%d/%m/%Y")
    
    def _generate_address(self) -> str:
        """Generate Indian address"""
        return f"{random.randint(1, 999)}, {fake.street_name()}, {fake.city()}, {fake.state()} - {fake.postcode()}"
    
    def _generate_business_activity(self) -> str:
        """Generate business activity description"""
        sectors = random.sample(self.industry_sectors, random.randint(1, 3))
        return f"Business Activity: {', '.join(sectors)}"

    # ============ Document Generators ============

    def generate_gst_certificate(self):
        """Generate synthetic GST certificate"""
        company_name = self._generate_company_name()
        
        data = {
            "company_name": company_name,
            "gstin": self._generate_gstin(),
            "trade_name": company_name.split()[0],
            "registration_date": self._generate_date(),
            "address": self._generate_address(),
            "business_activity": self._generate_business_activity(),
            "reference_no": f"GST-REF-{random.randint(10000, 99999)}",
            "issue_date": self._generate_date(),
            "amendment_date": self._generate_date(),
            "valid_from": self._generate_date(),
            "valid_to": self._generate_future_date()
        }
        
        template = random.choice(DOCUMENT_TEMPLATE_MAP["GST_CERTIFICATE"])
        text = template["template"].format(**data)
        
        return {
            "text": text,
            "document_type": "GST_CERTIFICATE",
            "labels": {
                "company_name": company_name,
                "gstin": data["gstin"],
                "registration_date": data["registration_date"]
            },
            "template_used": template["name"]
        }

    def generate_pan_card(self):
        """Generate synthetic PAN card"""
        company_name = self._generate_company_name()
        director_name = f"{random.choice(self.indian_first_names)} {random.choice(self.indian_last_names)}"
        template = random.choice(DOCUMENT_TEMPLATE_MAP["PAN_CARD"])
        
        data = {
            "company_name": company_name,
            "director_name": director_name,
            "issue_date": self._generate_date(),
            "pan_number": self._generate_pan(is_company=(template["name"] == "company_pan")),
            "qr_data": f"PAN-{random.randint(100000, 999999)}",
            "full_name": director_name,
            "father_name": f"{random.choice(self.indian_first_names)} {random.choice(self.indian_last_names)}",
            "dob": self._generate_date(1970, 2000)
        }
        
        text = template["template"].format(**data)
        
        return {
            "text": text,
            "document_type": "PAN_CARD",
            "labels": {
                "company_name": company_name,
                "pan": data["pan_number"],
                "director_name": director_name
            },
            "template_used": template["name"]
        }

    def generate_msme_certificate(self):
        """Generate synthetic MSME/Udyam certificate"""
        company_name = self._generate_company_name()
        
        data = {
            "udyam_number": f"UDYAM-{random.choice(['MH', 'KA', 'DL', 'TN', 'GJ'])}-{random.randint(100000, 999999)}",
            "registration_date": self._generate_date(),
            "enterprise_name": company_name,
            "enterprise_type": random.choice(["Micro", "Small", "Medium"]),
            "category": random.choice(["Manufacturing", "Service", "Trading"]),
            "address": self._generate_address(),
            "nic_code": str(random.randint(10000, 99999)),
            "activity": self._generate_business_activity(),
            "commencement_date": self._generate_date(),
            "valid_years": str(random.randint(1, 5)),
            "registration_no": f"MSME-REG-{random.randint(100000, 999999)}",
            "investment": f"{random.randint(1, 50)}0,00,000",
            "employee_count": str(random.randint(1, 50)),
            "is_manufacturing": random.choice(["Yes", "No"]),
            "is_service": random.choice(["Yes", "No"])
        }
        
        template = random.choice(DOCUMENT_TEMPLATE_MAP["MSME_REGISTRATION"])
        text = template["template"].format(**data)
        
        return {
            "text": text,
            "document_type": "MSME_REGISTRATION",
            "labels": {
                "company_name": company_name,
                "udyam_number": data.get("udyam_number", data.get("registration_no")),
                "registration_date": data["registration_date"]
            },
            "template_used": template["name"]
        }

    def generate_incorporation_certificate(self):
        """Generate synthetic incorporation certificate"""
        company_name = self._generate_company_name()
        
        data = {
            "company_name": company_name,
            "cin": self._generate_cin(),
            "incorporation_date": self._generate_date(),
            "registered_address": self._generate_address(),
            "authorized_capital": f"{random.randint(1, 10)}0,00,000",
            "paid_up_capital": f"{random.randint(1, 10)}0,00,000",
            "roc_location": random.choice(["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"]),
            "file_number": f"ROC/INC/{random.randint(100000, 999999)}",
            "llp_name": company_name.replace("Pvt Ltd", "LLP"),
            "llpin": f"ABC-{random.randint(1000, 9999)}",
            "partners": f"{random.choice(self.indian_first_names)} {random.choice(self.indian_last_names)}, {random.choice(self.indian_first_names)} {random.choice(self.indian_last_names)}"
        }
        
        template = random.choice(DOCUMENT_TEMPLATE_MAP["INCORPORATION_CERTIFICATE"])
        text = template["template"].format(**data)
        
        return {
            "text": text,
            "document_type": "INCORPORATION_CERTIFICATE",
            "labels": {
                "company_name": company_name,
                "cin": data["cin"],
                "incorporation_date": data["incorporation_date"]
            },
            "template_used": template["name"]
        }

    def generate_pitch_deck(self):
        """Generate synthetic pitch deck text"""
        company_name = self._generate_company_name()
        sector = random.choice(self.industry_sectors)
        
        data = {
            "company_name": company_name,
            "vision_statement": f"To revolutionize the {sector} industry in India and globally.",
            "problem_description": f"Current {sector} solutions are inefficient, expensive, and not scalable for Indian needs.",
            "solution_description": f"Our AI-powered platform solves {sector} challenges with automation and intelligence.",
            "tam": f"₹{random.randint(1000, 10000)} Cr",
            "sam": f"₹{random.randint(100, 1000)} Cr",
            "som": f"₹{random.randint(10, 100)} Cr",
            "traction_metrics": f"{random.randint(1000, 50000)}+ users, ₹{random.randint(10, 100)}L ARR, {random.randint(50, 500)}% YoY growth",
            "business_model": f"SaaS subscription: ₹{random.randint(999, 9999)}/month",
            "competition_analysis": f"Competitors: {random.choice(['Global players', 'Local startups', 'Manual solutions'])}. Our advantage: AI-first, India-specific",
            "team_bios": f"Founders from IIT/IIM with {random.randint(5, 20)}+ years experience",
            "revenue": f"₹{random.randint(10, 100)}L",
            "burn": f"₹{random.randint(5, 50)}L",
            "runway": str(random.randint(6, 18)),
            "ask_amount": f"₹{random.randint(2, 10)}Cr",
            "equity_offer": str(random.randint(10, 25)),
            "fund_usage": "50% Product, 30% Marketing, 20% Team",
            "brand_story": f"{company_name} was born to solve {sector} problems for Indian consumers.",
            "product_description": f"Premium {sector} products at affordable prices.",
            "customer_persona": f"Urban Indian consumers aged {random.randint(18, 45)}+",
            "aov": str(random.randint(500, 5000)),
            "cac": str(random.randint(100, 1000)),
            "ltv": str(random.randint(1000, 10000)),
            "payback_months": str(random.randint(1, 6)),
            "channel_mix": f"Instagram ({random.randint(20, 60)}%), Google ({random.randint(10, 30)}%), Referrals ({random.randint(10, 30)}%)",
            "growth_metrics": f"MoM growth: {random.randint(10, 50)}%",
            "equity": str(random.randint(10, 20))
        }
        
        template = random.choice(DOCUMENT_TEMPLATE_MAP["PITCH_DECK"])
        text = template["template"].format(**data)
        
        return {
            "text": text,
            "document_type": "PITCH_DECK",
            "labels": {
                "company_name": company_name,
                "sector": sector,
                "ask_amount": int(data["ask_amount"].replace("₹", "").replace("Cr", "")) * 10000000 if "Cr" in data["ask_amount"] else 0
            },
            "template_used": template["name"]
        }

    def generate_invoice(self):
        """Generate synthetic invoice"""
        company_name = self._generate_company_name()
        client_name = self._generate_company_name().replace("Pvt Ltd", "")
        
        items = []
        total = 0
        for _ in range(random.randint(1, 5)):
            qty = random.randint(1, 10)
            rate = random.randint(1000, 50000)
            amount = qty * rate
            total += amount
            items.append(f"{random.choice(['Service', 'Product', 'Consulting', 'License'])} {random.randint(1, 100)} | {qty} | {rate} | {amount}")
        
        line_items = "\n".join(items)
        
        cgst_rate = random.choice([2.5, 6, 9])
        sgst_rate = cgst_rate
        igst_rate = 0
        
        cgst = total * cgst_rate / 100
        sgst = total * sgst_rate / 100
        
        data = {
            "company_name": company_name,
            "company_address": self._generate_address(),
            "gstin": self._generate_gstin(),
            "invoice_no": f"INV-{datetime.now().year}-{random.randint(1000, 9999)}",
            "invoice_date": self._generate_date(),
            "client_name": client_name,
            "client_address": self._generate_address(),
            "line_items": line_items,
            "subtotal": total,
            "cgst_rate": cgst_rate,
            "cgst": round(cgst, 2),
            "sgst_rate": sgst_rate,
            "sgst": round(sgst, 2),
            "igst_rate": igst_rate,
            "igst": 0,
            "total": total + cgst + sgst,
            "amount_in_words": f"{total + cgst + sgst} Rupees Only"
        }
        
        template = random.choice(DOCUMENT_TEMPLATE_MAP["INVOICE"])
        text = template["template"].format(**data)
        
        return {
            "text": text,
            "document_type": "INVOICE",
            "labels": {
                "company_name": company_name,
                "invoice_no": data["invoice_no"],
                "total": data["total"]
            },
            "template_used": template["name"]
        }

    def generate_dataset(self, num_samples: int = 1000, distribution: Dict = None) -> List[Dict]:
        """
        Generate synthetic dataset with specified distribution
        """
        if distribution is None:
            distribution = {
                "GST_CERTIFICATE": 0.15,
                "PAN_CARD": 0.15,
                "PITCH_DECK": 0.20,
                "INCORPORATION_CERTIFICATE": 0.10,
                "MSME_REGISTRATION": 0.10,
                "INVOICE": 0.10
            }
        
        dataset = []
        generator_map = {
            "GST_CERTIFICATE": self.generate_gst_certificate,
            "PAN_CARD": self.generate_pan_card,
            "PITCH_DECK": self.generate_pitch_deck,
            "INCORPORATION_CERTIFICATE": self.generate_incorporation_certificate,
            "MSME_REGISTRATION": self.generate_msme_certificate,
            "INVOICE": self.generate_invoice
        }
        
        print(f"📊 Generating {num_samples} synthetic documents...")
        
        for doc_type, percentage in distribution.items():
            if doc_type not in generator_map:
                continue
            
            count = int(num_samples * percentage)
            print(f"   Generating {count} {doc_type} documents...")
            
            for _ in range(count):
                try:
                    doc = generator_map[doc_type]()
                    dataset.append(doc)
                except Exception as e:
                    print(f"   Error generating {doc_type}: {e}")
        
        print(f"✅ Generated {len(dataset)} documents")
        return dataset

    def save_dataset(self, dataset: List[Dict], filename: str = "synthetic_training_data.json"):
        """Save dataset to JSON file"""
        import os
        
        output_dir = "backend/data/synthetic/training"
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        
        # Add metadata
        output = {
            "metadata": {
                "generator": "SyntheticDocumentGenerator",
                "seed": self.seed,
                "created_at": datetime.now().isoformat(),
                "total_documents": len(dataset)
            },
            "documents": dataset
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {len(dataset)} documents to {filepath}")
        return filepath

# Run generator
if __name__ == "__main__":
    generator = SyntheticDocumentGenerator(seed=42)
    
    # Generate 500 documents for initial training
    dataset = generator.generate_dataset(num_samples=500)
    
    # Save to file
    generator.save_dataset(dataset)
    
    # Print statistics
    print("\n📊 Dataset Statistics:")
    doc_types = {}
    for doc in dataset:
        doc_type = doc["document_type"]
        doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
    
    for doc_type, count in doc_types.items():
        print(f"   {doc_type}: {count} samples")
    
    # Print sample
    print("\n📄 Sample Document:")
    sample = dataset[0]
    print(f"Type: {sample['document_type']}")
    print(f"Template: {sample.get('template_used', 'N/A')}")
    print(f"Labels: {sample['labels']}")
    print(f"Text preview: {sample['text'][:200]}...")