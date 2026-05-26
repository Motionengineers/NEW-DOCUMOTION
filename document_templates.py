"""Templates for realistic Indian business documents."""

from typing import Dict, List, Any

# GST Certificate Templates
GST_TEMPLATES = [
    {
        "name": "standard_gst",
        "template": """
GOODS AND SERVICES TAX CERTIFICATE

Government of India
Ministry of Finance
Department of Revenue

This is to certify that {company_name} has been registered under the
Central Goods and Services Tax Act, 2017.

GSTIN: {gstin}
Legal Name: {company_name}
Trade Name: {trade_name}
Date of Registration: {registration_date}
Status: Active

Registered Office:
{address}

{business_activity}

This certificate is valid for GST purposes.

Issued by:
Proper Officer
{registration_date}
""",
        "fields": ["company_name", "gstin", "trade_name", "registration_date", "address", "business_activity"]
    },
    {
        "name": "amended_gst",
        "template": """
FORM GST REG-06
[See rule 9(4)]

Reference No: {reference_no}
Date: {issue_date}

GSTIN: {gstin}
Legal Name: {company_name}

This is to inform that the application for registration filed by the above taxpayer has been APPROVED.

The certificate of registration has been amended with effect from {amendment_date}.

Valid from: {valid_from}
Valid to: {valid_to}

Note: This is a system generated certificate.
""",
        "fields": ["company_name", "gstin", "reference_no", "issue_date", "amendment_date", "valid_from", "valid_to"]
    }
]

# PAN Card Templates
PAN_TEMPLATES = [
    {
        "name": "company_pan",
        "template": """
INCOME TAX DEPARTMENT
GOVERNMENT OF INDIA

PERMANENT ACCOUNT NUMBER CARD

Name: {company_name}
Father's Name: {director_name}
Date of Issue: {issue_date}

PAN: {pan_number}

Signature of Assessee

Important:
- This is a computer generated PAN card
- Signature not required
- Valid for all income tax purposes

QR Code: {qr_data}
""",
        "fields": ["company_name", "director_name", "issue_date", "pan_number", "qr_data"]
    },
    {
        "name": "individual_pan",
        "template": """
भारत सरकार
आयकर विभाग

स्थायी खाता संख्या कार्ड

नाम: {full_name}
पिता का नाम: {father_name}
जन्म तिथि: {dob}

PAN: {pan_number}

हस्ताक्षर

Important: This is a computer generated PAN card.
""",
        "fields": ["full_name", "father_name", "dob", "pan_number"]
    }
]

# Pitch Deck Templates
PITCH_TEMPLATES = [
    {
        "name": "saas_pitch",
        "template": """
{company_name} - PITCH DECK

SLIDE 1: VISION
{vision_statement}

SLIDE 2: PROBLEM
{problem_description}

SLIDE 3: SOLUTION
{solution_description}

SLIDE 4: MARKET SIZE
TAM: {tam}
SAM: {sam}
SOM: {som}

SLIDE 5: TRACTION
{traction_metrics}

SLIDE 6: BUSINESS MODEL
{business_model}

SLIDE 7: COMPETITION
{competition_analysis}

SLIDE 8: TEAM
{team_bios}

SLIDE 9: FINANCIALS
Revenue: {revenue} | Burn: {burn}
Runway: {runway} months

SLIDE 10: ASK
Raising {ask_amount} for {equity_offer}%
Use of funds: {fund_usage}
""",
        "fields": [
            "company_name", "vision_statement", "problem_description", "solution_description",
            "tam", "sam", "som", "traction_metrics", "business_model", "competition_analysis",
            "team_bios", "revenue", "burn", "runway", "ask_amount", "equity_offer", "fund_usage"
        ]
    },
    {
        "name": "d2c_pitch",
        "template": """
{company_name} - D2C BRAND DECK

THE BRAND
{brand_story}

THE PRODUCT
{product_description}

THE CUSTOMER
{customer_persona}

UNIT ECONOMICS
AOV: ₹{aov}
CAC: ₹{cac}
LTV: ₹{ltv}
Payback: {payback_months} months

CHANNEL MIX
{channel_mix}

GROWTH METRICS
{growth_metrics}

FUNDING ASK
{ask_amount} for {equity}% equity
""",
        "fields": [
            "company_name", "brand_story", "product_description", "customer_persona",
            "aov", "cac", "ltv", "payback_months", "channel_mix", "growth_metrics",
            "ask_amount", "equity"
        ]
    }
]

# Incorporation Certificate Templates
INCORPORATION_TEMPLATES = [
    {
        "name": "private_limited",
        "template": """
CERTIFICATE OF INCORPORATION

COMPANY NAME: {company_name}
CIN: {cin}
DATE OF INCORPORATION: {incorporation_date}
TYPE: Private Limited Company

REGISTERED OFFICE:
{registered_address}

AUTHORIZED CAPITAL: ₹{authorized_capital}
PAID UP CAPITAL: ₹{paid_up_capital}

I hereby certify that the above named company is incorporated under the Companies Act, 2013.

(Roc Officer)
Registrar of Companies, {roc_location}

File Number: {file_number}
""",
        "fields": [
            "company_name", "cin", "incorporation_date", "registered_address",
            "authorized_capital", "paid_up_capital", "roc_location", "file_number"
        ]
    },
    {
        "name": "llp",
        "template": """
CERTIFICATE OF INCORPORATION
LIMITED LIABILITY PARTNERSHIP

LLP Name: {llp_name}
LLPIN: {llpin}
Date of Incorporation: {incorporation_date}

Registered Office:
{registered_address}

Partners:
{partners}

This LLP is incorporated under the Limited Liability Partnership Act, 2008.

(Registrar)
Registrar of LLPs, {roc_location}
""",
        "fields": ["llp_name", "llpin", "incorporation_date", "registered_address", "partners", "roc_location"]
    }
]

# MSME/Udyam Registration Templates
MSME_TEMPLATES = [
    {
        "name": "udyam_registration",
        "template": """
UDYAM REGISTRATION CERTIFICATE
Ministry of Micro, Small and Medium Enterprises
Government of India

Udyam Registration Number: {udyam_number}
Date of Registration: {registration_date}

Enterprise Name: {enterprise_name}
Type of Enterprise: {enterprise_type}
Category: {category}

Plant/Address: {address}

 NIC Code: {nic_code}
Activity: {activity}

Date of Commencement: {commencement_date}

This certificate is valid for {valid_years} years.

Digital Signature
{registration_date}
""",
        "fields": [
            "udyam_number", "registration_date", "enterprise_name", "enterprise_type",
            "category", "address", "nic_code", "activity", "commencement_date", "valid_years"
        ]
    },
    {
        "name": "msme_registration",
        "template": """
MSME REGISTRATION CERTIFICATE
(Entrepreneurs Memorandum)

Registration No: {registration_no}
Date: {registration_date}

1. Name of Enterprise: {enterprise_name}
2. Address: {address}
3. Date of Commencement: {commencement_date}
4. Investment in Plant & Machinery/Equipment: ₹{investment}
5. Number of Employees: {employee_count}

Nature of Activity:
- Manufacturing: {is_manufacturing}
- Service: {is_service}

Signature of Entrepreneur

(EM-II)
""",
        "fields": [
            "registration_no", "registration_date", "enterprise_name", "address",
            "commencement_date", "investment", "employee_count", "is_manufacturing", "is_service"
        ]
    }
]

# Aadhaar Templates (with dummy data)
AADHAAR_TEMPLATES = [
    {
        "name": "standard_aadhaar",
        "template": """
भारत सरकार
Government of India
विशिष्ट पहचान प्राधिकरण
Unique Identification Authority of India

आधार कार्ड / Aadhaar Letter

नाम / Name: {full_name}
आधार संख्या / Aadhaar Number: {aadhaar_number}
जन्म तिथि / Date of Birth: {dob}
लिंग / Gender: {gender}

पता / Address:
{address}

QR Code: {qr_data}

{date_of_issue}
""",
        "fields": ["full_name", "aadhaar_number", "dob", "gender", "address", "qr_data", "date_of_issue"]
    }
]

# Bank Statement Templates
BANK_STATEMENT_TEMPLATES = [
    {
        "name": "current_account",
        "template": """
{bank_name}
BANK STATEMENT

Account Holder: {company_name}
Account Number: {account_number}
IFSC: {ifsc}
Period: {start_date} to {end_date}

Date        | Description              | Deposit   | Withdrawal | Balance
{transactions}

Closing Balance: ₹{closing_balance}
Total Credits: ₹{total_credits}
Total Debits: ₹{total_debits}

This is a computer generated statement.
""",
        "fields": [
            "bank_name", "company_name", "account_number", "ifsc", "start_date", "end_date",
            "transactions", "closing_balance", "total_credits", "total_debits"
        ]
    }
]

# Contract Templates
CONTRACT_TEMPLATES = [
    {
        "name": "nda",
        "template": """
NON-DISCLOSURE AGREEMENT

This Agreement is made on {agreement_date} between:

{company_name} (Disclosing Party)
and
{recipient_name} (Receiving Party)

1. CONFIDENTIAL INFORMATION
{confidential_info_description}

2. OBLIGATIONS
{obligations}

3. TERM
This Agreement shall remain in effect for {term_years} years.

4. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement.

For {company_name}
Signature: _________________

For {recipient_name}
Signature: _________________
""",
        "fields": ["agreement_date", "company_name", "recipient_name", "confidential_info_description", "obligations", "term_years"]
    }
]

# Invoice Templates
INVOICE_TEMPLATES = [
    {
        "name": "gst_invoice",
        "template": """
TAX INVOICE

{company_name}
{company_address}
GSTIN: {gstin}

Invoice No: {invoice_no}
Date: {invoice_date}

Bill To:
{client_name}
{client_address}

Description                | Qty | Rate  | Amount
{line_items}

Subtotal: ₹{subtotal}
CGST ({cgst_rate}%): ₹{cgst}
SGST ({sgst_rate}%): ₹{sgst}
IGST ({igst_rate}%): ₹{igst}
Total: ₹{total}

Amount in Words: {amount_in_words}

This is a computer generated invoice.
""",
        "fields": [
            "company_name", "company_address", "gstin", "invoice_no", "invoice_date",
            "client_name", "client_address", "line_items", "subtotal", "cgst_rate", "cgst",
            "sgst_rate", "sgst", "igst_rate", "igst", "total", "amount_in_words"
        ]
    }
]

# Document type mapping
DOCUMENT_TEMPLATE_MAP = {
    "GST_CERTIFICATE": GST_TEMPLATES,
    "PAN_CARD": PAN_TEMPLATES,
    "PITCH_DECK": PITCH_TEMPLATES,
    "INCORPORATION_CERTIFICATE": INCORPORATION_TEMPLATES,
    "MSME_REGISTRATION": MSME_TEMPLATES,
    "AADHAAR_CARD": AADHAAR_TEMPLATES,
    "BANK_STATEMENT": BANK_STATEMENT_TEMPLATES,
    "CONTRACT": CONTRACT_TEMPLATES,
    "INVOICE": INVOICE_TEMPLATES
}