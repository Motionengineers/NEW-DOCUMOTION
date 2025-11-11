#!/usr/bin/env bash
set -euo pipefail

echo "# Agencies"
curl -s "http://localhost:3000/api/agency?service=branding&limit=5" | jq '.data.list | length'
curl -s "http://localhost:3000/api/agency/1" | jq

echo "# Import"
curl -s -X POST http://localhost:3000/api/agency/import | jq

#!/bin/sh
# Quick examples to exercise POST-only endpoints locally
BASE="http://localhost:3000"
CT="Content-Type: application/json"

# Agency
curl -s -X POST "$BASE/api/agency/request" -H "$CT" -d '{"agencyId":1,"startupId":1,"serviceType":"branding","budget":50000,"timeline":"4-6 weeks","message":"Brand identity + guidelines"}' | jq .
curl -s -X POST "$BASE/api/agency/proposal" -H "$CT" -d '{"agencyId":1,"requestId":1,"startupId":1,"price":50000,"timeline":"4 weeks","proposalText":"Scope, deliverables, milestones"}' | jq .

# Auto-apply
curl -s -X POST "$BASE/api/auto-apply/trigger" | jq .

# Banks import (admin/protected)
curl -s -X POST "$BASE/api/banks/import" | jq .

# Uploads (multipart examples)
# curl -s -X POST "$BASE/api/compliance/upload" -F "file=@/path/to/compliance.pdf" -F "requestId=1" | jq .
# curl -s -X POST "$BASE/api/documents/upload" -F "file=@/path/to/document.pdf" -F "startupId=1" -F "type=pan" | jq .

# Eligibility
curl -s -X POST "$BASE/api/eligibility" -H "$CT" -d '{"startupId":1,"criteria":{"sector":"SaaS","stage":"seed","location":"Karnataka"}}' | jq .

# Notifications
curl -s -X POST "$BASE/api/notifications/create" -H "$CT" -d '{"title":"Welcome","body":"Your profile is ready","level":"info","link":"/dashboard"}' | jq .
curl -s -X POST "$BASE/api/notifications/read" -H "$CT" -d '{"id":123}' | jq .

# OpenAI (requires key)
# curl -s -X POST "$BASE/api/openai/chat" -H "$CT" -d '{"messages":[{"role":"user","content":"Write a tagline for a fintech startup"}]}' | jq .
# curl -s -X POST "$BASE/api/openai/summarize" -H "$CT" -d '{"text":"Long content to summarize..."}' | jq .

# Razorpay (sandbox keys required)
# curl -s -X POST "$BASE/api/payment/razorpay/create-order" -H "$CT" -d '{"amount":49900,"currency":"INR","receipt":"rcpt_123"}' | jq .
# curl -s -X POST "$BASE/api/razorpay/create-order" -H "$CT" -d '{"amount":49900,"currency":"INR","receipt":"rcpt_456"}' | jq .
# curl -s -X POST "$BASE/api/razorpay/verify" -H "$CT" -d '{"orderId":"order_123","paymentId":"pay_123","signature":"generated_signature"}' | jq .
# curl -s -X POST "$BASE/api/payment/razorpay/complianceOrder" -H "$CT" -d '{"requestId":1,"amount":49900,"currency":"INR"}' | jq .
# curl -s -X POST "$BASE/api/payment/razorpay/webhook" -H "$CT" -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_123"}}}}' | jq .

# Schemes recommend / Smart suggestions
curl -s -X POST "$BASE/api/schemes/recommend" -H "$CT" -d '{"startupId":1}' | jq .
curl -s -X POST "$BASE/api/smart-suggestions" -H "$CT" -d '{"context":"Need branding and launch plan for a B2B SaaS"}' | jq .

printf "\nDone.\n"
