# Documotion API - Quick Reference

**Total APIs: ~80+ endpoints**

## API Count by Category

| Category | Count | Status |
|----------|-------|--------|
| State Funding Explorer | 5 | ✅ Complete |
| Dashboard & Analytics | 1 | ✅ Complete |
| Government Schemes | 1 | ✅ Complete |
| Bank Schemes | 1 | ✅ Complete |
| Talent & Founders | 3 | ✅ Complete |
| Pitch Decks | 1 | ✅ Complete |
| Documents | 1 | ✅ Complete |
| Eligibility & Matching | 2 | ✅ Complete |
| Funding Applications | 1 | ✅ Complete |
| Branding Studio | 20+ | ✅ Complete |
| Agencies & Partners | 5 | ✅ Complete |
| Feed & Social | 7 | ✅ Complete |
| Subscriptions & Payments | 8 | ✅ Complete |
| Team & Invitations | 9 | ✅ Complete |
| Settings | 1 | ✅ Complete |
| Service Requests | 3 | ✅ Complete |
| Telemetry | 1 | ✅ Complete |
| AI & OpenAI | 1 | ✅ Complete |
| Notifications | 2 | ✅ Complete |
| Live Updates | 1 | ✅ Complete |
| Startups | 1 | ✅ Complete |

---

## All Endpoints (Alphabetical)

### A
- `POST /api/agency-requests` - Create agency request
- `GET /api/agency-requests` - List agency requests
- `GET /api/agency-requests/[id]` - Get agency request
- `GET /api/agency-requests/[id]/messages` - Get messages
- `POST /api/agency-requests/[id]/messages` - Send message

### B
- `GET /api/banks/match` - Match bank schemes
- `GET /api/branding/agencies` - List agencies
- `GET /api/branding/agencies/[slug]` - Get agency
- `POST /api/branding/agencies/lead` - Submit lead
- `GET /api/branding/admin/agencies/[id]` - Admin: Get agency
- `GET /api/branding/assets` - List assets
- `POST /api/branding/assets/generate` - Generate asset
- `GET /api/branding/drafts` - List drafts
- `POST /api/branding/drafts` - Create draft
- `GET /api/branding/drafts/[id]` - Get draft
- `POST /api/branding/drafts/[id]/submit` - Submit draft
- `POST /api/branding/drafts/[id]/approve` - Approve draft
- `POST /api/branding/drafts/[id]/publish` - Publish draft
- `GET /api/branding/drafts/[id]/comments` - Get comments
- `POST /api/branding/drafts/[id]/comments` - Add comment
- `POST /api/branding/generate` - Generate branding
- `POST /api/branding/kit/export` - Export kit
- `GET /api/branding/kit/[jobId]` - Get export job
- `POST /api/branding/parse` - Parse branding
- `GET /api/branding/partners` - List partners
- `GET /api/branding/partners/[id]` - Get partner
- `POST /api/branding/partners/[id]/book` - Book partner
- `GET /api/branding/partners/[id]/bookings` - List bookings
- `GET /api/branding/partners/[id]/bookings/[bookingId]` - Get booking
- `GET /api/branding/partners/[id]/availability` - Check availability
- `POST /api/branding/partners/[id]/verify` - Verify partner
- `GET /api/branding/roles` - Get roles
- `GET /api/branding/tokens` - Get tokens
- `GET /api/branding/workspace` - Get workspace
- `POST /api/branding/workspace/[id]/upload` - Upload to workspace

### D
- `GET /api/dashboard` - Dashboard summary
- `POST /api/documents/upload` - Upload document

### E
- `POST /api/eligibility` - Check eligibility

### F
- `GET /api/feed/follow` - Follow user
- `GET /api/feed/link-preview` - Get link preview
- `POST /api/feed/media/upload` - Upload media
- `GET /api/feed/posts` - List posts
- `POST /api/feed/posts` - Create post
- `GET /api/feed/posts/[postId]` - Get post
- `POST /api/feed/posts/[postId]/like` - Like post
- `POST /api/feed/posts/[postId]/bookmark` - Bookmark post
- `GET /api/feed/posts/[postId]/comments` - Get comments
- `POST /api/feed/posts/[postId]/comments` - Add comment
- `POST /api/feed/posts/[postId]/reactions` - Add reaction
- `GET /api/funding/applications` - List applications
- `GET /api/funding/[schemeId]` - Get scheme details
- `POST /api/funding/match` - Match states
- `GET /api/funding/state` - Get state schemes

### I
- `GET /api/invitations` - List invitations
- `POST /api/invitations/accept` - Accept invitation
- `POST /api/invitations/change-role` - Change role
- `POST /api/invitations/create` - Create invitation
- `POST /api/invitations/manual` - Manual add
- `POST /api/invitations/remove-member` - Remove member
- `POST /api/invitations/resend` - Resend invitation
- `POST /api/invitations/revoke` - Revoke invitation
- `GET /api/invitations/validate` - Validate token

### L
- `GET /api/live-updates` - Get live updates

### N
- `GET /api/notifications` - List notifications
- `POST /api/notifications/read` - Mark as read

### O
- `POST /api/openai/chat` - Chat with AI

### P
- `POST /api/payment/razorpay/create-order` - Create order
- `POST /api/payment/razorpay/verify` - Verify payment
- `POST /api/payment/razorpay/webhook` - Webhook

### S
- `POST /api/schemes/recommend` - Get recommendations
- `GET /api/service-requests` - List requests
- `POST /api/service-requests` - Create request
- `GET /api/service-requests/[id]` - Get request
- `PATCH /api/service-requests/[id]` - Update request
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings
- `GET /api/states` - List states
- `GET /api/startups/profile` - Get profile
- `POST /api/startups/profile` - Update profile
- `GET /api/subscription` - Get subscription
- `POST /api/subscription/addon` - Add addon
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/invoices` - List invoices
- `GET /api/subscription/invoices/[id]` - Get invoice
- `POST /api/subscription/upgrade` - Upgrade plan
- `GET /api/subscription/usage` - Get usage
- `POST /api/subscription/usage/record` - Record usage

### T
- `GET /api/talent` - List talent
- `GET /api/talent/search` - Search talent
- `GET /api/talent/suggest` - Suggest talent
- `POST /api/telemetry/events` - Ingest events

---

## Most Used APIs (Top 10)

1. `GET /api/dashboard` - Dashboard stats
2. `GET /api/funding/state` - State schemes
3. `POST /api/funding/match` - State matching
4. `GET /api/states` - List states
5. `GET /api/talent` - List founders
6. `POST /api/eligibility` - Check eligibility
7. `GET /api/feed/posts` - Feed posts
8. `GET /api/subscription` - Subscription info
9. `POST /api/documents/upload` - Upload docs
10. `POST /api/schemes/recommend` - Get recommendations

---

## Authentication Required

Most endpoints require authentication. Public endpoints:
- `GET /api/dashboard`
- `GET /api/states`
- `GET /api/funding/state`
- `GET /api/talent`
- `GET /api/pitch-decks`
- `GET /api/live-updates`

---

## Response Format

**Success**:
```json
{
  "success": true,
  "data": {...}
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Full Documentation

See `docs/API_REFERENCE.md` for complete API documentation with request/response examples.

