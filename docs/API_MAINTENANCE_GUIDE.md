# 🔧 API Maintenance Guide - 80 APIs

**Last Updated**: 2024-11-18  
**Total APIs**: 80 endpoints  
**Status**: Full-Featured Suite

---

## 📋 Table of Contents

1. [API Health Monitoring](#api-health-monitoring)
2. [Testing Strategy](#testing-strategy)
3. [Performance Optimization](#performance-optimization)
4. [Security Checklist](#security-checklist)
5. [Documentation Standards](#documentation-standards)
6. [Version Control](#version-control)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Caching Strategy](#caching-strategy)
10. [Monitoring & Alerts](#monitoring--alerts)

---

## 🏥 API Health Monitoring

### Daily Health Checks

Run these checks daily to ensure all APIs are functioning:

```bash
# Check all API endpoints
npm run api:health-check

# Test critical APIs
npm run api:test-critical

# Check response times
npm run api:performance
```

### Health Check Categories

#### ✅ Critical APIs (Must Work Always)
- `GET /api/dashboard` - Dashboard stats
- `GET /api/govt-schemes` - Government schemes
- `GET /api/funding/state` - State funding
- `POST /api/funding/match` - State matching
- `GET /api/talent` - Talent database
- `POST /api/documents/upload` - Document upload
- `POST /api/payment/razorpay/create-order` - Payment creation

#### ⚠️ Important APIs (Should Work)
- All subscription APIs
- All notification APIs
- All invitation APIs
- All branding studio APIs

#### 📊 Monitoring APIs (Nice to Have)
- All feed/social APIs
- All agency marketplace APIs
- Analytics and telemetry APIs

---

## 🧪 Testing Strategy

### Unit Tests

Each API should have:
- ✅ Input validation tests
- ✅ Error handling tests
- ✅ Success response tests
- ✅ Edge case tests

**Example Test Structure:**
```javascript
describe('GET /api/funding/state', () => {
  it('should return schemes for valid state', async () => {
    // Test implementation
  });
  
  it('should handle invalid state gracefully', async () => {
    // Test implementation
  });
  
  it('should respect pagination limits', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Test API interactions with:
- Database (Prisma)
- External services (Razorpay, OpenAI)
- File uploads
- Authentication

### E2E Tests

Test complete user flows:
- User registration → Dashboard → Scheme search → Application
- Payment flow: Create order → Verify → Subscription
- Team invitation → Accept → Collaboration

---

## ⚡ Performance Optimization

### Response Time Targets

| API Category | Target | Max Acceptable |
|-------------|--------|----------------|
| Dashboard | < 200ms | 500ms |
| List APIs | < 300ms | 1000ms |
| Search APIs | < 500ms | 2000ms |
| Match APIs | < 1000ms | 3000ms |
| Upload APIs | < 2000ms | 5000ms |

### Optimization Techniques

1. **Database Indexing**
   ```sql
   -- Ensure indexes on frequently queried fields
   CREATE INDEX idx_schemes_sector ON StateFundingScheme(sector);
   CREATE INDEX idx_schemes_state ON StateFundingScheme(stateId);
   ```

2. **Caching**
   - Use Redis for frequently accessed data
   - Cache list endpoints (5-10 minutes)
   - Cache dashboard stats (1-5 minutes)

3. **Pagination**
   - Always use cursor pagination for large datasets
   - Default limit: 20 items
   - Max limit: 50 items

4. **Query Optimization**
   - Use `select` to fetch only needed fields
   - Avoid N+1 queries with `include`
   - Use `findMany` with proper `where` clauses

---

## 🔒 Security Checklist

### Authentication & Authorization

- [ ] All protected routes require authentication
- [ ] Role-based access control (RBAC) implemented
- [ ] Admin-only endpoints properly secured
- [ ] JWT tokens validated on every request

### Input Validation

- [ ] All user inputs validated
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (sanitize user inputs)
- [ ] File upload validation (type, size, content)

### Rate Limiting

- [ ] Public APIs rate limited (100 req/min)
- [ ] Authenticated APIs rate limited (1000 req/min)
- [ ] Payment APIs rate limited (10 req/min)
- [ ] Upload APIs rate limited (20 req/min)

### Data Protection

- [ ] Sensitive data encrypted at rest
- [ ] PII (Personally Identifiable Information) masked in logs
- [ ] Payment data never stored (use Razorpay tokens)
- [ ] API keys stored in environment variables

---

## 📚 Documentation Standards

### API Documentation Requirements

Each API endpoint should have:

1. **Route Definition**
   ```markdown
   ## GET /api/funding/state
   
   Fetches state funding schemes with filtering and pagination.
   ```

2. **Query Parameters**
   ```markdown
   | Parameter | Type | Required | Description |
   |-----------|------|----------|-------------|
   | state | string | Yes | State name |
   | sector | string | No | Filter by sector |
   | limit | number | No | Items per page (default: 20) |
   ```

3. **Request Body** (for POST/PATCH)
   ```markdown
   ```json
   {
     "state": "Karnataka",
     "sector": "AI"
   }
   ```
   ```

4. **Response Format**
   ```markdown
   ```json
   {
     "success": true,
     "data": { ... },
     "nextCursor": "123"
   }
   ```
   ```

5. **Error Responses**
   ```markdown
   ```json
   {
     "success": false,
     "error": "Invalid state name"
   }
   ```
   ```

---

## 🔄 Version Control

### API Versioning Strategy

Currently using **implicit versioning** (no `/v1/` prefix).

**Future Consideration:**
- Add `/api/v1/` prefix when breaking changes needed
- Maintain backward compatibility for 6 months
- Document deprecation timeline

### Breaking Changes Policy

1. **Major Changes**: Create new endpoint version
2. **Minor Changes**: Add optional parameters
3. **Patch Changes**: Fix bugs, improve performance

---

## ⚠️ Error Handling

### Standard Error Format

```javascript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE", // Optional
  details: {} // Optional, for debugging
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Logging

```javascript
// Log errors with context
console.error('API Error:', {
  endpoint: '/api/funding/state',
  error: error.message,
  stack: error.stack,
  userId: request.user?.id,
  timestamp: new Date().toISOString()
});
```

---

## 🚦 Rate Limiting

### Implementation

```javascript
// Example rate limiter
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Rate Limits by Category

| Category | Limit | Window |
|----------|-------|--------|
| Public APIs | 100 | 15 min |
| Authenticated | 1000 | 15 min |
| Payment APIs | 10 | 15 min |
| Upload APIs | 20 | 15 min |
| Match APIs | 50 | 15 min |

---

## 💾 Caching Strategy

### Cache TTL by Endpoint Type

| Endpoint Type | TTL | Invalidation |
|--------------|-----|--------------|
| Dashboard stats | 5 min | On data update |
| List endpoints | 5 min | On create/update/delete |
| Detail endpoints | 10 min | On update |
| Search results | 1 min | On data change |
| Static data | 1 hour | Manual |

### Cache Keys

Use consistent cache key format:
```
{namespace}:{endpoint}:{params_hash}
```

Example:
```
states:list:region=north
funding:state:state=Karnataka:sector=AI
```

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor

1. **Response Times**
   - P50, P95, P99 latencies
   - Alert if P95 > 2000ms

2. **Error Rates**
   - 4xx errors (client errors)
   - 5xx errors (server errors)
   - Alert if error rate > 1%

3. **Request Volume**
   - Requests per minute
   - Peak usage times
   - Traffic patterns

4. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Slow query logs

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time (P95) | > 1000ms | > 3000ms |
| Error Rate | > 0.5% | > 2% |
| Database Connections | > 80% | > 95% |
| Memory Usage | > 80% | > 95% |

---

## 🔍 API Audit Checklist

### Monthly Review

- [ ] Review all API response times
- [ ] Check error logs for patterns
- [ ] Update documentation for changes
- [ ] Review security vulnerabilities
- [ ] Check rate limit effectiveness
- [ ] Review cache hit rates
- [ ] Audit unused endpoints
- [ ] Update API list documentation

### Quarterly Review

- [ ] Performance optimization review
- [ ] Security audit
- [ ] Breaking changes planning
- [ ] Deprecation announcements
- [ ] User feedback analysis
- [ ] API usage analytics

---

## 🛠️ Maintenance Scripts

### Available Commands

```bash
# Health check all APIs
npm run api:health-check

# Test critical APIs
npm run api:test-critical

# Performance test
npm run api:performance

# Generate API documentation
npm run api:docs

# Audit API security
npm run api:audit
```

---

## 📞 Support & Escalation

### API Issues

1. **Check logs**: `logs/api.log`
2. **Check monitoring**: Dashboard metrics
3. **Review recent changes**: Git history
4. **Test locally**: `npm run dev`
5. **Escalate**: Contact dev team

### Emergency Response

1. **Identify affected APIs**
2. **Check error logs**
3. **Rollback if needed**: `git revert`
4. **Notify users**: Status page
5. **Post-mortem**: Document issue

---

## ✅ Quick Reference

### API Categories

- **State Funding**: 5 APIs
- **Branding Studio**: 20+ APIs
- **Team & Invitations**: 9 APIs
- **Subscriptions**: 8 APIs
- **Feed & Social**: 7 APIs
- **Agencies**: 5 APIs
- **Talent**: 3 APIs
- **Others**: 23+ APIs

### Critical Path APIs

These APIs must always work:
1. Dashboard
2. Government Schemes
3. State Funding
4. Document Upload
5. Payment Processing
6. Talent Search

---

**Last Reviewed**: 2024-11-18  
**Next Review**: 2024-12-18

