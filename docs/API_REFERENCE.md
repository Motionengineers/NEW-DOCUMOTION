# Documotion - Complete API Reference

**Base URL**: `http://localhost:3000` (development) | `https://api.yourdomain.com` (production)

**Version**: 1.0.0

**Authentication**: Most endpoints use NextAuth session cookies. Some endpoints support Bearer tokens.

---

## Table of Contents

1. [Dashboard & Analytics](#dashboard--analytics)
2. [State Funding Explorer](#state-funding-explorer)
3. [Government Schemes](#government-schemes)
4. [Bank Schemes](#bank-schemes)
5. [Talent & Founders](#talent--founders)
6. [Pitch Decks](#pitch-decks)
7. [Documents](#documents)
8. [Eligibility & Matching](#eligibility--matching)
9. [Funding Applications](#funding-applications)
10. [Branding Studio](#branding-studio)
11. [Agencies & Partners](#agencies--partners)
12. [Feed & Social](#feed--social)
13. [Subscriptions & Payments](#subscriptions--payments)
14. [Team & Invitations](#team--invitations)
15. [Settings](#settings)
16. [Service Requests](#service-requests)
17. [Telemetry](#telemetry)
18. [AI & OpenAI](#ai--openai)
19. [Notifications](#notifications)
20. [Live Updates](#live-updates)

---

## Dashboard & Analytics

### GET /api/dashboard
Get dashboard summary statistics.

**Response**:
```json
{
  "success": true,
  "schemes": 150,
  "banks": 45,
  "talent": 200,
  "pitchdecks": 50,
  "registrations": 6,
  "govtLoans": 20,
  "privateBanks": 15,
  "ventureDebt": 10,
  "updatedToday": 5
}
```

---

## State Funding Explorer

### GET /api/states
List all states with optional metadata.

**Query Parameters**:
- `withCounts=true` - Include scheme counts per state
- `withSectors=true` - Include top sectors per state
- `region=North|South|East|West|NE` - Filter by region
- `limit=10` - Limit results

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Karnataka",
      "abbreviation": "KA",
      "region": "South",
      "population": 61000000,
      "gdp": 2500000000000,
      "schemeCount": 3,
      "topSectors": [{"sector": "AI", "count": 2}]
    }
  ]
}
```

### GET /api/funding/state
Get funding schemes filtered by state and criteria.

**Query Parameters**:
- `state=Karnataka` (required) - State name
- `sector=AI` - Filter by sector
- `fundingType=Grant|Loan|Subsidy` - Filter by type
- `fundingMin=1000000` - Minimum funding (₹)
- `fundingMax=5000000` - Maximum funding (₹)
- `verified=true` - Only verified schemes
- `tags=ai|deep-tech` - Filter by tags
- `q=search term` - Full-text search
- `sort=recent|interest-low|interest-high|funding-high|funding-low|popularity`
- `cursor=123` - Pagination cursor
- `limit=20` - Results per page (max 50)

**Response**:
```json
{
  "success": true,
  "data": {
    "schemes": [
      {
        "id": 1,
        "title": "Karnataka Seed Grant Program",
        "description": "...",
        "fundingAmount": "₹10-50 Lakhs",
        "fundingMin": 1000000,
        "fundingMax": 5000000,
        "fundingType": "Grant",
        "interestRate": 0,
        "subsidyPercent": null,
        "sector": "AI",
        "state": {"id": 1, "name": "Karnataka", "abbreviation": "KA"}
      }
    ],
    "nextCursor": 123
  }
}
```

### POST /api/funding/match
Match startup profile to best-fit states.

**Request Body**:
```json
{
  "industry": "AI",
  "stage": "seed",
  "requiredFunding": 2000000,
  "registeredState": "Karnataka",
  "prefersGrant": true,
  "limit": 5
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "profile": {...},
    "recommendations": [
      {
        "stateId": 1,
        "stateName": "Karnataka",
        "score": 85,
        "explanation": [
          {"key": "sector", "value": 100, "note": "Sector match found"}
        ],
        "topSchemes": [...]
      }
    ]
  }
}
```

### GET /api/funding/[schemeId]
Get detailed information about a specific scheme.

**Response**:
```json
{
  "success": true,
  "data": {
    "scheme": {...},
    "similarSchemes": [...]
  }
}
```

---

## Government Schemes

### GET /api/govt-schemes
List government schemes (if implemented).

**Query Parameters**:
- `sector=AI` - Filter by sector
- `ministry=MSME` - Filter by ministry
- `region=North` - Filter by region

---

## Bank Schemes

### GET /api/banks/match
Match startup to bank loan schemes.

**Request Body**:
```json
{
  "startupId": 1,
  "requiredAmount": 5000000,
  "sector": "Fintech"
}
```

**Response**:
```json
{
  "success": true,
  "matches": [
    {
      "bankName": "HDFC",
      "schemeName": "Startup Loan",
      "eligibilityScore": 85,
      "interestRate": "8-10%",
      "maxLoanAmount": 10000000
    }
  ]
}
```

---

## Talent & Founders

### GET /api/talent
List founder/talent profiles.

**Query Parameters**:
- `location=Delhi` - Filter by location
- `skills=AI,ML` - Filter by skills
- `available=true` - Only available founders

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "skills": ["AI", "ML"],
      "location": "Delhi",
      "linkedin": "https://linkedin.com/...",
      "available": true
    }
  ]
}
```

### GET /api/talent/search
Search talent profiles.

**Query Parameters**:
- `q=AI engineer` - Search query
- `location=Delhi` - Filter by location

### GET /api/talent/suggest
Get talent suggestions for a startup.

**Query Parameters**:
- `startupId=1` - Startup ID
- `role=CTO` - Desired role

---

## Pitch Decks

### GET /api/pitch-decks
List pitch decks in library.

**Query Parameters**:
- `stage=seed|series_a` - Filter by stage
- `industry=Fintech` - Filter by industry
- `year=2023` - Filter by year

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Fintech Startup Pitch",
      "startupName": "PayTech",
      "stage": "series_a",
      "pdfUrl": "https://...",
      "year": 2023
    }
  ]
}
```

---

## Documents

### POST /api/documents/upload
Upload a document.

**Request**: Multipart form data
- `file` - PDF, PNG, or JPEG file (max 10MB)
- `type` - Document type
- `startupId` - Startup ID

**Response**:
```json
{
  "success": true,
  "document": {
    "id": 1,
    "name": "certificate.pdf",
    "fileUrl": "https://...",
    "type": "certificate",
    "status": "pending"
  }
}
```

---

## Eligibility & Matching

### POST /api/eligibility
Check eligibility for schemes.

**Request Body**:
```json
{
  "startupId": 1,
  "schemeId": 5
}
```

**Response**:
```json
{
  "success": true,
  "eligible": true,
  "score": 85,
  "missingDocuments": ["certificate"],
  "reasons": ["Missing certificate"]
}
```

### POST /api/schemes/recommend
Get recommended schemes for a startup.

**Request Body**:
```json
{
  "startupId": 1,
  "sector": "AI",
  "stage": "seed"
}
```

**Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "schemeId": 1,
      "schemeName": "Startup India",
      "score": 90,
      "matchReasons": ["Sector match", "Stage match"]
    }
  ]
}
```

---

## Funding Applications

### GET /api/funding/applications
List funding applications.

**Query Parameters**:
- `startupId=1` - Filter by startup
- `status=pending|approved|rejected` - Filter by status

**Response**:
```json
{
  "success": true,
  "applications": [
    {
      "id": 1,
      "schemeId": 5,
      "startupId": 1,
      "status": "pending",
      "submittedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Branding Studio

### GET /api/branding/tokens
Get branding tokens.

**Response**:
```json
{
  "success": true,
  "tokens": {
    "colors": {...},
    "typography": {...}
  }
}
```

### POST /api/branding/generate
Generate branding assets.

**Request Body**:
```json
{
  "companyName": "My Startup",
  "industry": "Fintech",
  "style": "modern"
}
```

### GET /api/branding/drafts
List branding drafts.

### POST /api/branding/drafts
Create a new branding draft.

### GET /api/branding/drafts/[id]
Get a specific draft.

### POST /api/branding/drafts/[id]/submit
Submit draft for review.

### POST /api/branding/drafts/[id]/approve
Approve a draft.

### POST /api/branding/drafts/[id]/publish
Publish a draft.

### GET /api/branding/drafts/[id]/comments
Get draft comments.

### POST /api/branding/drafts/[id]/comments
Add a comment to draft.

### GET /api/branding/assets
List branding assets.

### POST /api/branding/assets/generate
Generate new asset.

### POST /api/branding/kit/export
Export branding kit.

### GET /api/branding/kit/[jobId]
Get export job status.

### GET /api/branding/workspace
Get workspace info.

### POST /api/branding/workspace/[id]/upload
Upload asset to workspace.

### GET /api/branding/partners
List branding partners.

### GET /api/branding/partners/[id]
Get partner details.

### POST /api/branding/partners/[id]/book
Book a partner.

### GET /api/branding/partners/[id]/bookings
List partner bookings.

### GET /api/branding/partners/[id]/bookings/[bookingId]
Get booking details.

### GET /api/branding/partners/[id]/availability
Check partner availability.

### POST /api/branding/partners/[id]/verify
Verify a partner.

### GET /api/branding/agencies
List agencies.

### GET /api/branding/agencies/[slug]
Get agency by slug.

### POST /api/branding/agencies/lead
Submit agency lead.

### GET /api/branding/admin/agencies/[id]
Admin: Get agency details.

### GET /api/branding/roles
Get branding roles.

### POST /api/branding/parse
Parse branding from URL/image.

---

## Agencies & Partners

### GET /api/agency-requests
List agency requests.

### POST /api/agency-requests
Create agency request.

**Request Body**:
```json
{
  "agencyId": 1,
  "serviceType": "branding",
  "budget": 50000,
  "timeline": "2 weeks",
  "message": "Need logo design"
}
```

### GET /api/agency-requests/[id]
Get agency request details.

### GET /api/agency-requests/[id]/messages
Get request messages.

### POST /api/agency-requests/[id]/messages
Send message.

---

## Feed & Social

### GET /api/feed/posts
List feed posts.

**Query Parameters**:
- `type=funding|hiring|product` - Filter by type
- `limit=20` - Results per page
- `cursor=123` - Pagination cursor

**Response**:
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "nextCursor": 123
  }
}
```

### POST /api/feed/posts
Create a new post.

**Request Body**:
```json
{
  "type": "funding",
  "content": "We raised $1M!",
  "amount": 1000000,
  "round": "seed"
}
```

### GET /api/feed/posts/[postId]
Get post details.

### POST /api/feed/posts/[postId]/like
Like a post.

### POST /api/feed/posts/[postId]/bookmark
Bookmark a post.

### GET /api/feed/posts/[postId]/comments
Get post comments.

### POST /api/feed/posts/[postId]/comments
Add a comment.

### POST /api/feed/posts/[postId]/reactions
Add reaction to post.

### POST /api/feed/follow
Follow a user/startup.

### POST /api/feed/media/upload
Upload media for posts.

### GET /api/feed/link-preview
Get link preview metadata.

**Query Parameters**:
- `url=https://example.com` - URL to preview

---

## Subscriptions & Payments

### GET /api/subscription
Get current subscription.

**Response**:
```json
{
  "success": true,
  "subscription": {
    "id": 1,
    "plan": "pro",
    "status": "active",
    "currentPeriodEnd": "2024-12-31T00:00:00Z"
  }
}
```

### POST /api/subscription/upgrade
Upgrade subscription plan.

### POST /api/subscription/cancel
Cancel subscription.

### POST /api/subscription/addon
Add subscription addon.

### GET /api/subscription/usage
Get usage statistics.

### POST /api/subscription/usage/record
Record usage event.

### GET /api/subscription/invoices
List invoices.

### GET /api/subscription/invoices/[id]
Get invoice details.

### POST /api/payment/razorpay/create-order
Create Razorpay payment order.

**Request Body**:
```json
{
  "amount": 10000,
  "currency": "INR",
  "receipt": "order_123"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order_123",
    "amount": 10000,
    "currency": "INR"
  }
}
```

### POST /api/payment/razorpay/verify
Verify Razorpay payment.

**Request Body**:
```json
{
  "razorpay_order_id": "order_123",
  "razorpay_payment_id": "pay_456",
  "razorpay_signature": "signature"
}
```

### POST /api/payment/razorpay/webhook
Razorpay webhook handler.

---

## Team & Invitations

### GET /api/invitations
List team invitations.

### POST /api/invitations/create
Create invitation.

**Request Body**:
```json
{
  "email": "user@example.com",
  "role": "member",
  "startupId": 1
}
```

### POST /api/invitations/accept
Accept invitation.

### POST /api/invitations/revoke
Revoke invitation.

### POST /api/invitations/resend
Resend invitation.

### POST /api/invitations/change-role
Change member role.

### POST /api/invitations/remove-member
Remove team member.

### POST /api/invitations/manual
Manually add member.

### GET /api/invitations/validate
Validate invitation token.

---

## Settings

### GET /api/settings
Get settings.

**Query Parameters**:
- `category=branding` - Settings category

**Response**:
```json
{
  "success": true,
  "settings": {
    "companyName": "Documotion",
    "primaryColor": "#0066cc"
  }
}
```

### POST /api/settings
Update settings.

**Request Body**:
```json
{
  "category": "branding",
  "settings": {
    "companyName": "New Name",
    "primaryColor": "#ff0000"
  }
}
```

---

## Service Requests

### GET /api/service-requests
List service requests.

**Response**:
```json
{
  "success": true,
  "serviceRequests": [
    {
      "id": "uuid",
      "startupId": 1,
      "serviceType": "registration",
      "status": "pending"
    }
  ]
}
```

### POST /api/service-requests
Create service request.

**Request Body**:
```json
{
  "startupId": 1,
  "serviceType": "registration",
  "amount": 5000
}
```

### GET /api/service-requests/[id]
Get service request details.

### PATCH /api/service-requests/[id]
Update service request.

---

## Telemetry

### POST /api/telemetry/events
Ingest telemetry events.

**Request Body**:
```json
{
  "events": [
    {
      "event_id": "uuid-v4",
      "event_type": "search.query",
      "user_id": "optional",
      "session_id": "string",
      "platform": "web",
      "app_version": "1.0.0",
      "timestamp": "2024-01-15T10:00:00Z",
      "properties": {...},
      "context": {...}
    }
  ]
}
```

**Response**:
```json
{
  "ok": true,
  "count": 1,
  "bq": {"inserted": 1},
  "backup": "jsonl"
}
```

---

## AI & OpenAI

### POST /api/openai/chat
Chat with OpenAI.

**Request Body**:
```json
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "model": "gpt-4"
}
```

**Response**:
```json
{
  "success": true,
  "response": "Hello! How can I help?"
}
```

---

## Notifications

### GET /api/notifications
List notifications.

**Query Parameters**:
- `unread=true` - Only unread notifications
- `limit=20` - Results per page

**Response**:
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "scheme_match",
      "title": "New scheme match",
      "read": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/notifications/read
Mark notifications as read.

**Request Body**:
```json
{
  "notificationIds": [1, 2, 3]
}
```

---

## Live Updates

### GET /api/live-updates
Get live updates/news feed.

**Query Parameters**:
- `category=startups` - Filter by category
- `limit=10` - Results per page

**Response**:
```json
{
  "success": true,
  "feed": [
    {
      "title": "Startup News",
      "source": "TechCrunch",
      "time": "2024-01-15T10:00:00Z",
      "url": "https://..."
    }
  ]
}
```

---

## Startups

### GET /api/startups/profile
Get startup profile.

**Query Parameters**:
- `startupId=1` - Startup ID

### POST /api/startups/profile
Update startup profile.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Authenticated: 1000 requests per minute per user

---

## Pagination

Most list endpoints support cursor-based pagination:

- `cursor=123` - Start from this cursor
- `limit=20` - Results per page (default: 20, max: 100)

Response includes `nextCursor` if more results available.

---

## Authentication

Most endpoints require authentication via:
- NextAuth session cookie
- Bearer token in `Authorization` header

Public endpoints:
- `GET /api/dashboard`
- `GET /api/states`
- `GET /api/funding/state`
- `GET /api/talent`
- `GET /api/pitch-decks`

---

## Versioning

Current API version: `1.0.0`

Future versions will be available at `/api/v2/...`

---

## Support

For API support, contact: api@documotion.com

Documentation: https://docs.documotion.com/api

