# 🚀 API Quick Reference Card - 80 APIs

**Documotion Full-Featured Suite**  
**Last Updated**: 2024-11-18

---

## 📊 API Count by Category

| Category                     | Count | Status       |
| ---------------------------- | ----- | ------------ |
| **State Funding Explorer**   | 5     | ✅ Critical  |
| **Branding Studio**          | 20+   | ⚠️ Important |
| **Team & Invitations**       | 9     | ⚠️ Important |
| **Subscriptions & Payments** | 8     | ✅ Critical  |
| **Feed & Social**            | 7     | 📊 Optional  |
| **Agencies & Partners**      | 5     | 📊 Optional  |
| **Talent & Founders**        | 3     | ✅ Critical  |
| **Service Requests**         | 3     | ⚠️ Important |
| **Notifications**            | 2     | ⚠️ Important |
| **Eligibility & Matching**   | 2     | ✅ Critical  |
| **Others**                   | 20+   | Mixed        |

**Total: 80 endpoints**

---

## 🔴 Critical APIs (Must Work)

### Dashboard & Core

- `GET /api/dashboard` - Dashboard stats
- `GET /api/live-updates` - Real-time updates

### Government Schemes

- `GET /api/govt-schemes` - List schemes
- `POST /api/govt-schemes` - Create scheme
- `GET /api/eligibility` - Check eligibility

### State Funding

- `GET /api/states` - List states
- `GET /api/funding/state` - State schemes
- `POST /api/funding/match` - Match startup
- `GET /api/funding/[id]` - Scheme details

### Bank Schemes

- `GET /api/bank-schemes` - List banks
- `GET /api/banks/match` - Match to banks

### Documents

- `POST /api/documents/upload` - Upload file

### Payments

- `POST /api/payment/razorpay/create-order` - Create order
- `POST /api/payment/razorpay/verify` - Verify payment

### Talent

- `GET /api/talent` - List founders
- `GET /api/talent/search` - Search talent

### Matching

- `POST /api/smart-suggestions` - Smart match
- `POST /api/schemes/recommend` - Recommendations

---

## ⚠️ Important APIs (Should Work)

### Subscriptions

- `GET /api/subscription` - Get subscription
- `POST /api/subscription/upgrade` - Upgrade plan
- `GET /api/subscription/invoices` - List invoices
- `GET /api/subscription/usage` - Usage stats
- `POST /api/subscription/cancel` - Cancel

### Notifications

- `GET /api/notifications` - List notifications
- `POST /api/notifications/read` - Mark read

### Team Invitations

- `POST /api/invitations/create` - Create invite
- `POST /api/invitations/accept` - Accept invite
- `POST /api/invitations/revoke` - Revoke invite
- `POST /api/invitations/change-role` - Change role
- `GET /api/invitations` - List invites

### Service Requests

- `GET /api/service-requests` - List requests
- `POST /api/service-requests` - Create request
- `GET /api/service-requests/[id]` - Get request

---

## 📊 Optional APIs (Nice to Have)

### Branding Studio (20+ APIs)

- Drafts, Assets, Partners, Agencies
- Keep if using branding features

### Feed & Social (7 APIs)

- Posts, Comments, Reactions, Follow
- Keep if building social network

### Agency Marketplace (5 APIs)

- Requests, Messages, Bookings
- Keep if using marketplace

---

## 🛠️ Quick Commands

```bash
# Health check all APIs
npm run api:health-check

# Test critical APIs only
npm run api:test-critical

# View API examples
npm run api:examples
```

---

## 📈 Performance Targets

| API Type  | Target   | Max    |
| --------- | -------- | ------ |
| Dashboard | < 200ms  | 500ms  |
| List APIs | < 300ms  | 1000ms |
| Search    | < 500ms  | 2000ms |
| Match     | < 1000ms | 3000ms |
| Upload    | < 2000ms | 5000ms |

---

## 🔒 Security Checklist

- [ ] All protected routes authenticated
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention
- [ ] File upload validation

---

## 📚 Documentation

- **Full Reference**: `docs/API_REFERENCE.md`
- **Quick Reference**: `docs/API_QUICK_REFERENCE.md`
- **Maintenance Guide**: `docs/API_MAINTENANCE_GUIDE.md`
- **How to Add APIs**: `docs/HOW_TO_ADD_API.md`

---

## 🆘 Support

- **Health Check**: `npm run api:health-check`
- **Logs**: Check `logs/api.log`
- **Monitoring**: Dashboard metrics
- **Issues**: Review Git history

---

**Status**: ✅ All 80 APIs Active  
**Last Health Check**: Run `npm run api:health-check`
