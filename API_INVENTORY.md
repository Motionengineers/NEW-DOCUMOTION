# 📡 API Inventory & Requirements

## ✅ **EXISTING APIs (48 Route Files)**

### **Core Features (8 APIs)**
1. ✅ `GET /api/dashboard` - Dashboard stats
2. ✅ `GET /api/startups/profile` - Startup profile
3. ✅ `GET /api/eligibility` - Eligibility checking
4. ✅ `POST /api/documents/upload` - Document uploads
5. ✅ `GET /api/schemes/recommend` - Scheme recommendations
6. ✅ `GET /api/funding/applications` - Funding applications
7. ✅ `GET /api/banks/match` - Bank matching
8. ✅ `GET /api/talent` - Talent database

### **Branding System (9 APIs)**
9. ✅ `GET /api/settings` - Get settings (branding, theme)
10. ✅ `POST /api/settings` - Save settings
11. ✅ `GET /api/branding/workspace` - Branding workspace
12. ✅ `POST /api/branding/workspace` - Create/update workspace
13. ✅ `POST /api/branding/generate` - AI asset generation
14. ✅ `GET /api/branding/partners` - List verified partners
15. ✅ `POST /api/branding/partners` - Create partner
16. ✅ `GET /api/branding/partners/[id]` - Get partner details
17. ✅ `POST /api/branding/partners/[id]/book` - Book partner
18. ✅ `GET /api/branding/partners/[id]/bookings` - List bookings
19. ✅ `PATCH /api/branding/partners/[id]/verify` - Verify partner
20. ✅ `GET /api/branding/agencies` - List agencies
21. ✅ `GET /api/branding/agencies/[slug]` - Get agency
22. ✅ `POST /api/branding/agencies/lead` - Submit lead

### **Subscription & Pricing (3 APIs)**
23. ✅ `GET /api/subscription/usage` - Get usage stats
24. ✅ `POST /api/subscription/upgrade` - Upgrade tier
25. ✅ `POST /api/subscription/addon` - Purchase add-ons

### **Feed & Social (4 APIs)**
26. ✅ `GET /api/feed/posts` - List posts
27. ✅ `POST /api/feed/posts` - Create post
28. ✅ `POST /api/feed/posts/[postId]/like` - Like/unlike
29. ✅ `POST /api/feed/posts/[postId]/bookmark` - Bookmark
30. ✅ `GET /api/feed/posts/[postId]/comments` - Get comments
31. ✅ `POST /api/feed/posts/[postId]/comments` - Add comment

### **Team & Invitations (9 APIs)**
32. ✅ `GET /api/invitations` - List invitations
33. ✅ `POST /api/invitations/create` - Create invitation
34. ✅ `POST /api/invitations/accept` - Accept invitation
35. ✅ `POST /api/invitations/revoke` - Revoke invitation
36. ✅ `POST /api/invitations/resend` - Resend invitation
37. ✅ `POST /api/invitations/change-role` - Change role
38. ✅ `POST /api/invitations/remove-member` - Remove member
39. ✅ `POST /api/invitations/manual` - Manual add
40. ✅ `GET /api/invitations/validate` - Validate token

### **Services & Requests (3 APIs)**
41. ✅ `GET /api/service-requests` - List requests
42. ✅ `POST /api/service-requests` - Create request
43. ✅ `GET /api/service-requests/[id]` - Get request
44. ✅ `POST /api/agency-requests` - Agency request
45. ✅ `GET /api/agency-requests/[id]/messages` - Get messages

### **Talent (3 APIs)**
46. ✅ `GET /api/talent` - List talent
47. ✅ `GET /api/talent/search` - Search talent
48. ✅ `GET /api/talent/suggest` - Suggest talent

### **Payment (2 APIs)**
49. ✅ `POST /api/payment/razorpay/create-order` - Create order
50. ✅ `POST /api/payment/razorpay/verify` - Verify payment

### **Notifications (2 APIs)**
51. ✅ `GET /api/notifications` - List notifications
52. ✅ `POST /api/notifications/read` - Mark read

### **AI & Utilities (2 APIs)**
53. ✅ `POST /api/openai/chat` - AI chat
54. ✅ `GET /api/live-updates` - Live updates

---

## ⚠️ **MISSING APIs (Recommended)**

### **Subscription Management (3 APIs)**
1. ✅ `GET /api/subscription` - Get current subscription details **[IMPLEMENTED]**
2. ✅ `POST /api/subscription/cancel` - Cancel subscription **[IMPLEMENTED]**
3. ❌ `GET /api/subscription/invoices` - Get billing history

### **Branding Workspace (2 APIs)**
4. ❌ `GET /api/branding/workspace/[id]` - Get specific workspace
5. ❌ `DELETE /api/branding/workspace/[id]` - Delete workspace
6. ✅ `POST /api/branding/workspace/[id]/upload` - Upload branding files **[IMPLEMENTED]**
7. ✅ `POST /api/branding/parse` - Parse uploaded documents **[IMPLEMENTED]**

### **Smart Branding Assistant (3 APIs)**
8. ✅ `POST /api/branding/parse` - Parse branding data (text/PDF/DOCX) **[IMPLEMENTED]**
9. ❌ `GET /api/branding/suggestions` - Get AI suggestions
10. ❌ `POST /api/branding/tasks` - Create/update tasks

### **Partner Bookings (2 APIs)**
11. ❌ `GET /api/branding/partners/[id]/availability` - Check availability
12. ❌ `PATCH /api/branding/partners/[id]/bookings/[bookingId]` - Update booking status

### **Usage Tracking (2 APIs)**
13. ✅ `POST /api/subscription/usage/record` - Record usage (internal) **[IMPLEMENTED]**
14. ❌ `GET /api/subscription/usage/history` - Usage history

### **Feed Enhancements (2 APIs)**
15. ❌ `DELETE /api/feed/posts/[postId]` - Delete post
16. ❌ `PATCH /api/feed/posts/[postId]` - Edit post

### **Admin APIs (3 APIs)**
17. ❌ `GET /api/admin/users` - List users (admin)
18. ❌ `GET /api/admin/subscriptions` - List all subscriptions
19. ❌ `GET /api/admin/analytics` - Platform analytics

### **Auto-Apply Workflows (2 APIs)**
20. ❌ `POST /api/auto-apply/trigger` - Trigger auto-apply
21. ❌ `GET /api/auto-apply/logs` - Get application logs

---

## 🔌 **EXTERNAL APIs NEEDED**

### **Payment Gateway**
- ✅ **Razorpay** - Already integrated
  - Order creation
  - Payment verification
  - Webhook handling (needs implementation)

### **AI Services**
- ✅ **OpenAI** - Already integrated
  - Chat completions
  - Document parsing (needs implementation)
  - Image generation (needs implementation)

### **File Storage** (Choose one)
- ❌ **AWS S3** or **Cloudinary** or **Local Storage**
  - Logo uploads
  - Document storage
  - Branding assets

### **Email Service** (Choose one)
- ❌ **SendGrid** or **Resend** or **AWS SES**
  - Invitation emails
  - Notification emails
  - Booking confirmations

### **SMS/WhatsApp** (Optional)
- ❌ **Twilio** or **WhatsApp Business API**
  - Booking reminders
  - OTP verification

### **Calendar Integration** (Optional)
- ❌ **Google Calendar API** or **Cal.com**
  - Partner booking scheduling
  - Meeting reminders

---

## 📊 **SUMMARY**

### **Current Status:**
- ✅ **59 APIs Implemented** (53 route files + 6 implicit)
- ⚠️ **15 APIs Recommended** (missing but useful)
- 🔌 **5 External Services** (2 integrated, 3 needed)

### **Priority Missing APIs:**
1. **High Priority:**
   - ✅ Subscription management (GET, cancel) **[DONE]**
   - ✅ Branding workspace file upload & parsing **[DONE]**
   - ✅ Usage recording endpoint **[DONE]**
   - ❌ Subscription invoices/history

2. **Medium Priority:**
   - Partner availability checking
   - Feed post edit/delete
   - Auto-apply workflows

3. **Low Priority:**
   - Admin analytics
   - Usage history
   - Advanced booking management

### **External Services Priority:**
1. **Critical:**
   - File storage (S3/Cloudinary) - For logo/uploads
   - Email service - For invitations/notifications

2. **Important:**
   - Razorpay webhooks - For subscription renewals
   - OpenAI document parsing - For Smart Branding Assistant

3. **Nice to Have:**
   - SMS/WhatsApp - For reminders
   - Calendar integration - For bookings

---

## 🎯 **RECOMMENDATION**

**You have a solid foundation with 54 APIs!**

**Next Steps:**
1. **Implement file storage** (S3/Cloudinary) - Critical for branding
2. **Add email service** - Critical for invitations
3. **Complete subscription APIs** - GET, cancel, invoices
4. **Add branding workspace file upload** - For Smart Assistant
5. **Implement Razorpay webhooks** - For auto-renewals

**Total APIs Needed: ~70 APIs** (59 existing + 15 recommended + 1 webhook)

