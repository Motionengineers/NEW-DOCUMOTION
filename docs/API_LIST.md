# Documotion - Complete API List

**Total APIs: 90 endpoints** (80 internal + 10 free external APIs)

**Last Updated**: 2024-11-18

---

## 📊 API Summary by Category

| Category | Count | Endpoints |
|----------|-------|-----------|
| **Free External APIs** | 10 | RBI Rates, Startup India, MCA, MSME, Email, Geocoding, IP Geo, Currency, GitHub, Unsplash |
| State Funding Explorer | 5 | States, Funding, Match |
| Branding Studio | 20+ | Drafts, Assets, Partners, Agencies |
| Team & Invitations | 9 | Create, Accept, Revoke, Roles |
| Subscriptions & Payments | 8 | Plans, Invoices, Usage, Razorpay |
| Feed & Social | 7 | Posts, Comments, Reactions, Follow |
| Agencies & Partners | 5 | Requests, Messages, Bookings |
| Talent & Founders | 3 | List, Search, Suggest |
| Service Requests | 3 | Create, Update, List |
| Notifications | 2 | List, Mark Read |
| Eligibility & Matching | 2 | Eligibility, Recommendations |
| Others | 15+ | Dashboard, Documents, Settings, etc. |

---

## 🔍 Complete API List (Alphabetical)

### A

1. **GET /api/agency-requests**
   - List all agency requests
   - Query: `?status=pending`

2. **POST /api/agency-requests**
   - Create new agency request
   - Body: `{agencyId, serviceType, budget, message}`

3. **GET /api/agency-requests/[id]**
   - Get specific agency request
   - Path: `/api/agency-requests/123`

4. **PATCH /api/agency-requests/[id]**
   - Update agency request
   - Body: `{status, notes}`

5. **GET /api/agency-requests/[id]/messages**
   - Get messages for request
   - Path: `/api/agency-requests/123/messages`

6. **POST /api/agency-requests/[id]/messages**
   - Send message
   - Body: `{message, senderId}`

### B

7. **GET /api/banks/match**
   - Match startup to bank schemes
   - POST Body: `{startupId, requiredAmount, sector}`

8. **GET /api/banking/rbi-rates** 🆓
   - Get RBI policy rates (Repo Rate, Reverse Repo Rate, CRR, SLR)
   - Query: `?refresh=true` to force refresh
   - Free API: RBI banking data

9. **GET /api/branding/agencies**
   - List branding agencies
   - Query: `?service=branding&location=Delhi`

9. **GET /api/branding/agencies/[slug]**
   - Get agency by slug
   - Path: `/api/branding/agencies/agency-name`

10. **POST /api/branding/agencies/lead**
    - Submit agency lead
    - Body: `{name, email, company, message}`

11. **GET /api/branding/admin/agencies/[id]**
    - Admin: Get agency details
    - Auth: Admin only

12. **GET /api/branding/assets**
    - List branding assets
    - Query: `?startupId=1&kind=logo`

13. **POST /api/branding/assets/generate**
    - Generate new asset
    - Body: `{kind, variant, startupId}`

14. **GET /api/branding/drafts**
    - List branding drafts
    - Query: `?startupId=1&status=draft`

15. **POST /api/branding/drafts**
    - Create new draft
    - Body: `{startupId, dataJson, status}`

16. **GET /api/branding/drafts/[id]**
    - Get specific draft
    - Path: `/api/branding/drafts/123`

17. **POST /api/branding/drafts/[id]/submit**
    - Submit draft for review
    - Path: `/api/branding/drafts/123/submit`

18. **POST /api/branding/drafts/[id]/approve**
    - Approve draft
    - Path: `/api/branding/drafts/123/approve`
    - Auth: Admin/Reviewer

19. **POST /api/branding/drafts/[id]/publish**
    - Publish draft
    - Path: `/api/branding/drafts/123/publish`

20. **GET /api/branding/drafts/[id]/comments**
    - Get draft comments
    - Path: `/api/branding/drafts/123/comments`

21. **POST /api/branding/drafts/[id]/comments**
    - Add comment to draft
    - Body: `{content, authorId}`

22. **POST /api/branding/generate**
    - Generate branding from prompt
    - Body: `{companyName, industry, style}`

23. **POST /api/branding/kit/export**
    - Export branding kit
    - Body: `{versionId, formats: ['png', 'svg']}`

24. **GET /api/branding/kit/[jobId]**
    - Get export job status
    - Path: `/api/branding/kit/export-123`

25. **POST /api/branding/parse**
    - Parse branding from URL/image
    - Body: `{url, imageUrl}`

26. **GET /api/branding/partners**
    - List branding partners
    - Query: `?verified=true&service=logo`

27. **GET /api/branding/partners/[id]**
    - Get partner details
    - Path: `/api/branding/partners/123`

28. **POST /api/branding/partners/[id]/book**
    - Book a partner
    - Body: `{startDate, endDate, serviceType}`

29. **GET /api/branding/partners/[id]/bookings**
    - List partner bookings
    - Query: `?status=confirmed`

30. **GET /api/branding/partners/[id]/bookings/[bookingId]**
    - Get booking details
    - Path: `/api/branding/partners/123/bookings/456`

31. **GET /api/branding/partners/[id]/availability**
    - Check partner availability
    - Query: `?startDate=2024-01-01&endDate=2024-01-31`

32. **POST /api/branding/partners/[id]/verify**
    - Verify partner
    - Auth: Admin only

33. **GET /api/branding/roles**
    - Get branding roles
    - Returns: `{roles: ['admin', 'reviewer', 'viewer']}`

34. **GET /api/branding/tokens**
    - Get branding tokens
    - Query: `?startupId=1`

35. **GET /api/branding/workspace**
    - Get workspace info
    - Query: `?startupId=1`

36. **POST /api/branding/workspace/[id]/upload**
    - Upload asset to workspace
    - Multipart: `file, kind, variant`

### D

37. **GET /api/dashboard**
    - Get dashboard summary
    - Returns: `{schemes, banks, talent, pitchdecks, ...}`

38. **POST /api/documents/upload**
    - Upload document
    - Multipart: `file, type, startupId`
    - Max size: 10MB

### E

39. **POST /api/eligibility**
    - Check eligibility for scheme
    - Body: `{startupId, schemeId}`
    - Returns: `{eligible, score, missingDocuments}`

### F

40. **POST /api/feed/follow**
    - Follow user/startup
    - Body: `{targetId, targetType}`

41. **GET /api/feed/link-preview**
    - Get link preview metadata
    - Query: `?url=https://example.com`

42. **POST /api/feed/media/upload**
    - Upload media for posts
    - Multipart: `file, type`
    - Returns: `{url, width, height}`

43. **GET /api/feed/posts**
    - List feed posts
    - Query: `?type=funding&limit=20&cursor=123`

44. **POST /api/feed/posts**
    - Create new post
    - Body: `{type, content, amount?, round?}`

45. **GET /api/feed/posts/[postId]**
    - Get post details
    - Path: `/api/feed/posts/123`

46. **POST /api/feed/posts/[postId]/like**
    - Like a post
    - Path: `/api/feed/posts/123/like`

47. **POST /api/feed/posts/[postId]/bookmark**
    - Bookmark a post
    - Path: `/api/feed/posts/123/bookmark`

48. **GET /api/feed/posts/[postId]/comments**
    - Get post comments
    - Query: `?limit=20&cursor=123`

49. **POST /api/feed/posts/[postId]/comments**
    - Add comment
    - Body: `{content, authorId}`

50. **POST /api/feed/posts/[postId]/reactions**
    - Add reaction
    - Body: `{type: 'like'|'love'|'fire'}`

51. **GET /api/funding/applications**
    - List funding applications
    - Query: `?startupId=1&status=pending`

52. **GET /api/funding/[schemeId]**
    - Get scheme details
    - Path: `/api/funding/123`
    - Returns: `{scheme, similarSchemes}`

53. **POST /api/funding/match**
    - Match startup to states
    - Body: `{industry, stage, requiredFunding, registeredState, prefersGrant}`
    - Returns: `{recommendations: [{stateName, score, ...}]}`

54. **GET /api/funding/state**
    - Get state funding schemes
    - Query: `?state=Karnataka&sector=AI&sort=recent&limit=20`

### I

54. **GET /api/images/unsplash** 🆓
    - Search high-quality stock images
    - Query: `?q=startup&perPage=10&orientation=landscape`
    - Free API: Unsplash (50 requests/hour)

55. **GET /api/invitations**
    - List team invitations
    - Query: `?startupId=1&status=pending`

56. **POST /api/invitations/accept**
    - Accept invitation
    - Body: `{token}`

57. **POST /api/invitations/change-role**
    - Change member role
    - Body: `{userId, newRole}`

58. **POST /api/invitations/create**
    - Create invitation
    - Body: `{email, role, startupId}`

59. **POST /api/invitations/manual**
    - Manually add member
    - Body: `{email, role, startupId}`
    - Auth: Admin only

60. **POST /api/invitations/remove-member**
    - Remove team member
    - Body: `{userId, startupId}`

61. **POST /api/invitations/resend**
    - Resend invitation
    - Body: `{invitationId}`

62. **POST /api/invitations/revoke**
    - Revoke invitation
    - Body: `{invitationId}`

63. **GET /api/invitations/validate**
    - Validate invitation token
    - Query: `?token=abc123`

### L

64. **GET /api/live-updates**
    - Get live updates/news
    - Query: `?category=startups&limit=10`

### M

65. **GET /api/msme/schemes** 🆓
    - Get MSME-specific schemes and benefits
    - Query: `?sector=manufacturing&state=Maharashtra&limit=20`
    - Free API: MSME schemes data

### N

66. **GET /api/notifications**
    - List notifications
    - Query: `?unread=true&limit=20`

67. **POST /api/notifications/read**
    - Mark as read
    - Body: `{notificationIds: [1,2,3]}`

### O

68. **POST /api/openai/chat**
    - Chat with AI
    - Body: `{messages: [{role, content}], model?}`

### P

69. **POST /api/payment/razorpay/create-order**
    - Create Razorpay order
    - Body: `{amount, currency: 'INR', receipt}`

70. **POST /api/payment/razorpay/verify**
    - Verify payment
    - Body: `{razorpay_order_id, razorpay_payment_id, razorpay_signature}`

71. **POST /api/payment/razorpay/webhook**
    - Razorpay webhook handler
    - Handles: payment success, failure, refund

### S

71. **POST /api/schemes/recommend**
    - Get scheme recommendations
    - Body: `{startupId, sector, stage}`

72. **GET /api/startup-india/schemes** 🆓
    - Get Startup India Hub schemes and resources
    - Query: `?category=funding&limit=20&refresh=true`
    - Free API: Startup India data

73. **GET /api/service-requests**
    - List service requests
    - Query: `?startupId=1&status=pending`

74. **POST /api/service-requests**
    - Create service request
    - Body: `{startupId, serviceType, amount?}`

75. **GET /api/service-requests/[id]**
    - Get service request
    - Path: `/api/service-requests/123`

76. **PATCH /api/service-requests/[id]**
    - Update service request
    - Body: `{status, notes}`

77. **GET /api/settings**
    - Get settings
    - Query: `?category=branding`

78. **POST /api/settings**
    - Update settings
    - Body: `{category, settings: {...}}`

79. **GET /api/states**
    - List all states
    - Query: `?withCounts=true&withSectors=true&region=South`

80. **GET /api/startups/profile**
    - Get startup profile
    - Query: `?startupId=1`

81. **POST /api/startups/profile**
    - Update startup profile
    - Body: `{name, sector, stage, ...}`

82. **GET /api/subscription**
    - Get current subscription
    - Returns: `{plan, status, currentPeriodEnd}`

83. **POST /api/subscription/addon**
    - Add subscription addon
    - Body: `{addonType, quantity}`

84. **POST /api/subscription/cancel**
    - Cancel subscription
    - Body: `{reason?}`

85. **GET /api/subscription/invoices**
    - List invoices
    - Query: `?limit=20&cursor=123`

86. **GET /api/subscription/invoices/[id]**
    - Get invoice details
    - Path: `/api/subscription/invoices/123`

87. **POST /api/subscription/upgrade**
    - Upgrade subscription plan
    - Body: `{newPlan, prorate?}`

88. **GET /api/subscription/usage**
    - Get usage statistics
    - Query: `?startDate=2024-01-01&endDate=2024-01-31`

89. **POST /api/subscription/usage/record**
    - Record usage event
    - Body: `{eventType, quantity, metadata?}`

### T

90. **GET /api/talent**
    - List talent/founders
    - Query: `?location=Delhi&skills=AI,ML&page=1&limit=36`

91. **GET /api/talent/search**
    - Search talent
    - Query: `?q=AI engineer&location=Delhi`

92. **GET /api/talent/suggest**
    - Suggest talent for startup
    - Query: `?startupId=1&role=CTO`

93. **POST /api/telemetry/events**
    - Ingest telemetry events
    - Body: `{events: [{event_id, event_type, properties, ...}]}`

---

## 📋 API List by HTTP Method

### GET Endpoints (53)
- `/api/dashboard`
- `/api/states`
- `/api/funding/state`
- `/api/funding/[schemeId]`
- `/api/funding/applications`
- `/api/talent`
- `/api/talent/search`
- `/api/talent/suggest`
- `/api/banking/rbi-rates` 🆓
- `/api/companies/mca-verify` 🆓
- `/api/currency/exchange-rate` 🆓
- `/api/github/user` 🆓
- `/api/images/unsplash` 🆓
- `/api/location/geocode` 🆓
- `/api/location/ip-geolocation` 🆓
- `/api/msme/schemes` 🆓
- `/api/startup-india/schemes` 🆓
- `/api/feed/posts`
- `/api/feed/posts/[postId]`
- `/api/feed/posts/[postId]/comments`
- `/api/feed/link-preview`
- `/api/branding/*` (15+ GET endpoints)
- `/api/agency-requests`
- `/api/agency-requests/[id]`
- `/api/agency-requests/[id]/messages`
- `/api/invitations`
- `/api/invitations/validate`
- `/api/subscription`
- `/api/subscription/invoices`
- `/api/subscription/invoices/[id]`
- `/api/subscription/usage`
- `/api/service-requests`
- `/api/service-requests/[id]`
- `/api/settings`
- `/api/startups/profile`
- `/api/notifications`
- `/api/live-updates`
- `/api/banks/match` (POST but listed here for reference)

### POST Endpoints (26)
- `/api/funding/match`
- `/api/eligibility`
- `/api/schemes/recommend`
- `/api/feed/posts`
- `/api/feed/posts/[postId]/like`
- `/api/feed/posts/[postId]/bookmark`
- `/api/feed/posts/[postId]/comments`
- `/api/feed/posts/[postId]/reactions`
- `/api/feed/follow`
- `/api/feed/media/upload`
- `/api/documents/upload`
- `/api/branding/*` (10+ POST endpoints)
- `/api/agency-requests`
- `/api/agency-requests/[id]/messages`
- `/api/invitations/*` (7 POST endpoints)
- `/api/subscription/upgrade`
- `/api/subscription/cancel`
- `/api/subscription/addon`
- `/api/subscription/usage/record`
- `/api/payment/razorpay/*` (3 POST endpoints)
- `/api/service-requests`
- `/api/settings`
- `/api/startups/profile`
- `/api/notifications/read`
- `/api/telemetry/events`
- `/api/email/test` 🆓
- `/api/openai/chat`

### PATCH Endpoints (2)
- `/api/service-requests/[id]`
- `/api/agency-requests/[id]`

### DELETE Endpoints (0)
- None currently (but can be added following same pattern)

---

## 🔐 Authentication Required

**Public APIs** (No auth needed):
- `GET /api/dashboard`
- `GET /api/states`
- `GET /api/funding/state`
- `GET /api/talent`
- `GET /api/live-updates`
- `GET /api/feed/posts` (public feed)

**Protected APIs** (Auth required):
- All POST/PATCH/DELETE endpoints
- User-specific GET endpoints
- Admin endpoints (marked with "Admin:")

---

## 📊 API Statistics

- **Total Endpoints**: 92
- **GET Methods**: 45
- **POST Methods**: 25
- **PATCH Methods**: 2
- **DELETE Methods**: 0 (can be added)
- **Public APIs**: 5
- **Protected APIs**: 87

---

## 🎯 Most Used APIs (Top 10)

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

## 📝 Notes

- All APIs return JSON
- Standard response format: `{success: true/false, data: {...}, error: "..."}`
- Most list APIs support pagination (cursor-based)
- Error status codes: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Rate limiting: 100 req/min (public), 1000 req/min (authenticated)

---

## 📚 Related Documentation

- **Full API Reference**: `docs/API_REFERENCE.md`
- **Quick Reference**: `docs/API_QUICK_REFERENCE.md`
- **State Funding APIs**: `docs/state-funding-apis.md`
- **How to Add API**: `docs/HOW_TO_ADD_API.md`

---

**Last Updated**: 2024-11-18

