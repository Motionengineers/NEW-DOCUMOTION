# 🆓 Free & Open Data APIs Guide for Documotion

**Last Updated**: 2024-11-18  
**Purpose**: List of free/open data APIs you can integrate

---

## 📊 Summary

| Category | Free APIs Available | Status |
|----------|---------------------|--------|
| **Government Data** | 10+ APIs | ✅ Free |
| **Banking & Finance** | 5+ APIs | ✅ Free |
| **Startup Data** | 8+ APIs | ✅ Free |
| **Location & Maps** | 3+ APIs | ✅ Free (with limits) |
| **News & Updates** | 5+ APIs | ✅ Free (with limits) |
| **Company Data** | 4+ APIs | ✅ Free (with limits) |
| **Total** | **35+ Free APIs** | ✅ Available |

---

## 🏛️ Government & Public Data APIs

### 1. **data.gov.in** (India Open Data Portal)
- **URL**: https://data.gov.in/
- **Cost**: ✅ **FREE**
- **Rate Limit**: 1000 requests/day
- **Data**: Government schemes, policies, statistics
- **Use Case**: Government schemes database
- **API Key**: Required (free registration)
- **Example**:
  ```javascript
  GET https://api.data.gov.in/resource/{resource_id}?api-key={api_key}
  ```

### 2. **India Census API**
- **URL**: https://censusindia.gov.in/
- **Cost**: ✅ **FREE**
- **Data**: Population, demographics, economic data
- **Use Case**: State-wise population, GDP data
- **Format**: CSV/JSON downloads

### 3. **RBI (Reserve Bank of India) APIs**
- **URL**: https://www.rbi.org.in/
- **Cost**: ✅ **FREE**
- **Data**: Interest rates, banking statistics, policy rates
- **Use Case**: Bank interest rate data
- **Format**: CSV/Excel downloads

### 4. **Ministry of MSME APIs**
- **URL**: https://msme.gov.in/
- **Cost**: ✅ **FREE**
- **Data**: MSME schemes, registration data
- **Use Case**: MSME-specific schemes
- **Format**: Web scraping or official APIs

### 5. **Startup India Hub API**
- **URL**: https://www.startupindia.gov.in/
- **Cost**: ✅ **FREE**
- **Data**: Startup registrations, schemes, resources
- **Use Case**: Startup database, scheme matching
- **Format**: Official API (if available) or web scraping

### 6. **Ministry of Commerce & Industry APIs**
- **URL**: https://commerce.gov.in/
- **Cost**: ✅ **FREE**
- **Data**: Trade data, export-import statistics
- **Use Case**: Industry-specific schemes

### 7. **NITI Aayog Data Portal**
- **URL**: https://www.niti.gov.in/
- **Cost**: ✅ **FREE**
- **Data**: Policy data, state rankings, development indices
- **Use Case**: State-wise development data

### 8. **GST Portal APIs** (Official)
- **URL**: https://www.gst.gov.in/
- **Cost**: ✅ **FREE** (with registration)
- **Data**: GST rates, tax information
- **Use Case**: Tax-related compliance data
- **Note**: Requires GST registration

### 9. **MCA (Ministry of Corporate Affairs) APIs**
- **URL**: https://www.mca.gov.in/
- **Cost**: ✅ **FREE**
- **Data**: Company registration, director information
- **Use Case**: Company verification
- **Format**: Official APIs available

### 10. **SEBI APIs**
- **URL**: https://www.sebi.gov.in/
- **Cost**: ✅ **FREE**
- **Data**: Market data, regulations
- **Use Case**: Financial regulations, compliance

---

## 🏦 Banking & Financial APIs

### 11. **RBI Policy Rates API**
- **URL**: https://www.rbi.org.in/Scripts/BS_ViewBulletin.aspx
- **Cost**: ✅ **FREE**
- **Data**: Repo rate, reverse repo rate, CRR, SLR
- **Use Case**: Interest rate calculations
- **Format**: Web scraping or official data

### 12. **Bank IFSC Code API** (Multiple Providers)
- **Providers**: 
  - Razorpay IFSC API (free tier)
  - ifsc.razorpay.com
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Bank IFSC codes, branch details
- **Use Case**: Bank verification
- **Rate Limit**: 1000 requests/month (free tier)

### 13. **Currency Exchange API** (Free Tier)
- **Providers**: 
  - exchangerate-api.com (free tier)
  - fixer.io (free tier)
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Currency exchange rates
- **Use Case**: Multi-currency support
- **Rate Limit**: 1500 requests/month (free tier)

### 14. **Stock Market APIs** (Free Tier)
- **Providers**:
  - Alpha Vantage (free tier)
  - Yahoo Finance API (unofficial)
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Stock prices, market data
- **Use Case**: Startup valuation, market trends
- **Rate Limit**: 5 calls/minute (free tier)

---

## 🚀 Startup & Company Data APIs

### 15. **Crunchbase API** (Free Tier)
- **URL**: https://data.crunchbase.com/
- **Cost**: ✅ **FREE** (limited access)
- **Data**: Startup profiles, funding data
- **Use Case**: Startup database enrichment
- **Rate Limit**: 1000 requests/month (free tier)

### 16. **Clearbit Company API** (Free Tier)
- **URL**: https://clearbit.com/
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Company information, logos
- **Use Case**: Company data enrichment
- **Rate Limit**: 50 requests/month (free tier)

### 17. **LinkedIn API** (Free Tier)
- **URL**: https://developer.linkedin.com/
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Professional profiles, company data
- **Use Case**: Founder/talent profiles
- **Rate Limit**: 500 requests/day (free tier)

### 18. **AngelList API** (Unofficial/Scraping)
- **URL**: https://angel.co/
- **Cost**: ✅ **FREE** (web scraping)
- **Data**: Startup listings, funding rounds
- **Use Case**: Startup database
- **Note**: Check robots.txt and terms of service

### 19. **Y Combinator API** (Unofficial)
- **URL**: https://www.ycombinator.com/
- **Cost**: ✅ **FREE** (web scraping)
- **Data**: YC startup data
- **Use Case**: Startup database
- **Note**: Check terms of service

### 20. **GitHub API** (Free)
- **URL**: https://api.github.com/
- **Cost**: ✅ **FREE**
- **Data**: Repository data, developer profiles
- **Use Case**: Tech stack analysis, developer profiles
- **Rate Limit**: 60 requests/hour (unauthenticated), 5000/hour (authenticated)

---

## 📍 Location & Maps APIs

### 21. **OpenStreetMap API** (Nominatim)
- **URL**: https://nominatim.openstreetmap.org/
- **Cost**: ✅ **FREE**
- **Data**: Geocoding, reverse geocoding, places
- **Use Case**: Location search, address validation
- **Rate Limit**: 1 request/second (free tier)

### 22. **Google Places API** (Free Tier)
- **URL**: https://developers.google.com/maps/documentation/places
- **Cost**: ✅ **FREE** (with $200/month credit)
- **Data**: Places, businesses, reviews
- **Use Case**: Agency directory, location search
- **Free Credit**: $200/month (covers ~40,000 requests)

### 23. **Mapbox API** (Free Tier)
- **URL**: https://www.mapbox.com/
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Maps, geocoding, routing
- **Use Case**: Location features
- **Free Credit**: 50,000 map loads/month

---

## 📰 News & Updates APIs

### 24. **NewsAPI** (Free Tier)
- **URL**: https://newsapi.org/
- **Cost**: ✅ **FREE** (with limits)
- **Data**: News articles, headlines
- **Use Case**: Live updates, startup news
- **Rate Limit**: 100 requests/day (free tier)
- **Note**: Already integrated in your codebase

### 25. **RSS Feeds** (Multiple Sources)
- **Sources**: 
  - Startup India blog
  - YourStory
  - Inc42
- **Cost**: ✅ **FREE**
- **Data**: News articles, blog posts
- **Use Case**: News aggregation
- **Format**: RSS/XML

### 26. **Reddit API** (Free)
- **URL**: https://www.reddit.com/dev/api/
- **Cost**: ✅ **FREE**
- **Data**: Posts, comments, discussions
- **Use Case**: Community discussions, trends
- **Rate Limit**: 60 requests/minute

### 27. **Twitter API** (Free Tier - Limited)
- **URL**: https://developer.twitter.com/
- **Cost**: ✅ **FREE** (very limited)
- **Data**: Tweets, trends
- **Use Case**: Social media integration
- **Note**: Free tier is very limited, consider paid tier

---

## 📊 Analytics & Data APIs

### 28. **Google Analytics API** (Free)
- **URL**: https://developers.google.com/analytics
- **Cost**: ✅ **FREE**
- **Data**: Website analytics
- **Use Case**: User analytics, behavior tracking
- **Note**: Requires Google Analytics setup

### 29. **SimilarWeb API** (Free Tier)
- **URL**: https://www.similarweb.com/
- **Cost**: ✅ **FREE** (limited)
- **Data**: Website traffic, rankings
- **Use Case**: Competitor analysis
- **Rate Limit**: 5 requests/month (free tier)

---

## 🔍 Search & Discovery APIs

### 30. **Algolia Places API** (Free Tier)
- **URL**: https://www.algolia.com/
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Address autocomplete, places
- **Use Case**: Location search
- **Free Credit**: 10,000 requests/month

### 31. **DuckDuckGo API** (Free)
- **URL**: https://duckduckgo.com/api
- **Cost**: ✅ **FREE**
- **Data**: Search results, instant answers
- **Use Case**: Search functionality
- **Rate Limit**: No official limit (be respectful)

---

## 📧 Communication APIs

### 32. **Resend API** (Free Tier)
- **URL**: https://resend.com/
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Email sending
- **Use Case**: Transactional emails
- **Free Credit**: 3,000 emails/month
- **Note**: Already in your dependencies

### 33. **Twilio API** (Free Trial)
- **URL**: https://www.twilio.com/
- **Cost**: ✅ **FREE** (trial credit)
- **Data**: SMS, voice, WhatsApp
- **Use Case**: Notifications, OTP
- **Free Credit**: $15.50 trial credit

---

## 🎨 Design & Media APIs

### 34. **Unsplash API** (Free)
- **URL**: https://unsplash.com/developers
- **Cost**: ✅ **FREE**
- **Data**: High-quality images
- **Use Case**: Stock photos, blog images
- **Rate Limit**: 50 requests/hour (free tier)

### 35. **Pexels API** (Free)
- **URL**: https://www.pexels.com/api/
- **Cost**: ✅ **FREE**
- **Data**: Stock photos, videos
- **Use Case**: Media content
- **Rate Limit**: 200 requests/hour (free tier)

---

## 🛠️ Utility APIs

### 36. **IP Geolocation API** (Free Tier)
- **Providers**: 
  - ipapi.co (free tier)
  - ip-api.com (free tier)
- **Cost**: ✅ **FREE** (with limits)
- **Data**: IP location, country, city
- **Use Case**: Location detection
- **Rate Limit**: 1000 requests/month (free tier)

### 37. **Email Validation API** (Free Tier)
- **Providers**:
  - email-validator.net (free tier)
  - hunter.io (free tier)
- **Cost**: ✅ **FREE** (with limits)
- **Data**: Email validation, verification
- **Use Case**: Form validation
- **Rate Limit**: 100 requests/month (free tier)

### 38. **QR Code API** (Free)
- **URL**: https://qr-server.com/
- **Cost**: ✅ **FREE**
- **Data**: QR code generation
- **Use Case**: QR code generation
- **Rate Limit**: Unlimited (free tier)

---

## 📋 Recommended Integration Priority

### Phase 1: High Value, Easy Integration
1. ✅ **data.gov.in** - Government schemes (already integrated)
2. ✅ **NewsAPI** - News updates (already integrated)
3. ✅ **Google Places API** - Agency directory (already integrated)
4. **RBI APIs** - Banking data
5. **Startup India Hub** - Startup data

### Phase 2: Medium Priority
6. **Crunchbase API** - Startup enrichment
7. **LinkedIn API** - Talent profiles
8. **OpenStreetMap** - Location services
9. **Resend API** - Email (already in dependencies)
10. **GitHub API** - Developer profiles

### Phase 3: Nice to Have
11. **Unsplash/Pexels** - Stock images
12. **Currency Exchange API** - Multi-currency
13. **IP Geolocation** - Location detection
14. **Reddit API** - Community discussions

---

## 🔧 Implementation Guide

### Example: Integrating data.gov.in

```javascript
// app/api/govt-schemes/external/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resource_id');
  const apiKey = process.env.GOV_DATA_API_KEY;

  if (!apiKey || !resourceId) {
    return NextResponse.json({ error: 'Missing API key or resource ID' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=100`
    );
    
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

### Example: Integrating RBI Data

```javascript
// app/api/banking/rbi-rates/route.js
export async function GET() {
  try {
    // RBI publishes data in CSV format
    const response = await fetch('https://www.rbi.org.in/Scripts/BS_ViewBulletin.aspx');
    // Parse and return structured data
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RBI data' }, { status: 500 });
  }
}
```

---

## ⚠️ Important Notes

### Rate Limiting
- Most free APIs have rate limits
- Implement caching to reduce API calls
- Use Redis or in-memory cache
- Respect rate limits to avoid blocking

### API Keys
- Register for free API keys
- Store keys in `.env` file
- Never commit keys to Git
- Rotate keys periodically

### Terms of Service
- Read and understand ToS for each API
- Some APIs prohibit commercial use
- Some require attribution
- Check data usage restrictions

### Caching Strategy
```javascript
// Example caching for free APIs
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getCachedData(key, fetchFn) {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  return data;
}
```

---

## 📊 Cost Comparison

| API Category | Free Tier | Paid Tier (if needed) |
|--------------|-----------|----------------------|
| Government Data | ✅ Free | N/A |
| Banking Data | ✅ Free | N/A |
| Location APIs | ✅ Free ($200 credit) | $0.005/request |
| News APIs | ✅ Free (100/day) | $449/month |
| Email APIs | ✅ Free (3000/month) | $20/month |
| Stock Data | ✅ Free (5/min) | $49.99/month |

---

## ✅ Quick Start Checklist

- [ ] Register for data.gov.in API key
- [ ] Set up Google Places API (free tier)
- [ ] Configure NewsAPI (already done)
- [ ] Add RBI data scraping/API
- [ ] Set up Resend for emails
- [ ] Implement caching layer
- [ ] Add rate limiting
- [ ] Monitor API usage

---

## 📚 Resources

- **API Documentation**: Check each provider's docs
- **Rate Limit Tracker**: Implement usage monitoring
- **Error Handling**: Implement retry logic
- **Fallback Strategy**: Use database as fallback

---

**Total Free APIs Available**: **35+ APIs**  
**Recommended for MVP**: **10-15 APIs**  
**Status**: ✅ Ready to integrate

