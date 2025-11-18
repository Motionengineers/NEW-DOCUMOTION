# State-Wise Funding Explorer - API Endpoints

## Core APIs (5 Required)

### 1. **GET /api/states**
**Purpose**: List all states with optional metadata

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
      "schemeCount": 3,
      "topSectors": [{"sector": "AI", "count": 2}]
    }
  ]
}
```

**Status**: ✅ Implemented

---

### 2. **GET /api/funding/state**
**Purpose**: Get funding schemes filtered by state and other criteria

**Query Parameters**:
- `state=Karnataka` (required) - State name
- `sector=AI` - Filter by sector
- `fundingType=Grant|Loan|Subsidy` - Filter by type
- `fundingMin=1000000` - Minimum funding amount
- `fundingMax=5000000` - Maximum funding amount
- `verified=true` - Only verified schemes
- `tags=ai|deep-tech` - Filter by tags
- `q=search term` - Full-text search
- `sort=recent|interest-low|interest-high|funding-high|funding-low|popularity` - Sort order
- `cursor=123` - Pagination cursor
- `limit=20` - Results per page (max 50)

**Response**:
```json
{
  "success": true,
  "data": {
    "schemes": [...],
    "nextCursor": 123
  }
}
```

**Status**: ✅ Implemented

---

### 3. **POST /api/funding/match**
**Purpose**: Match startup profile to best-fit states

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
        "explanation": [...],
        "topSchemes": [...]
      }
    ]
  }
}
```

**Status**: ✅ Implemented

---

### 4. **GET /api/funding/[schemeId]**
**Purpose**: Get detailed information about a specific scheme

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

**Status**: ✅ Implemented

---

### 5. **POST /api/telemetry/events**
**Purpose**: Ingest telemetry events for analytics

**Request Body**:
```json
{
  "events": [
    {
      "event_id": "uuid",
      "event_type": "search.query",
      "properties": {...}
    }
  ]
}
```

**Status**: ✅ Implemented

---

## Optional/Enhancement APIs (3 Recommended)

### 6. **GET /api/funding/sectors** (Optional)
**Purpose**: Get list of all available sectors

**Response**:
```json
{
  "success": true,
  "data": {
    "sectors": ["AI", "EV", "Fintech", ...],
    "counts": {"AI": 45, "EV": 32, ...}
  }
}
```

**Status**: ⚠️ Not implemented (can be derived from /api/funding/state)

---

### 7. **GET /api/funding/export** (Optional)
**Purpose**: Export filtered schemes as CSV

**Query Parameters**: Same as `/api/funding/state`

**Response**: CSV file download

**Status**: ⚠️ Not implemented (can be done client-side)

---

### 8. **POST /api/funding/report-stale** (Optional)
**Purpose**: Report stale or incorrect scheme data

**Request Body**:
```json
{
  "schemeId": 123,
  "reason": "outdated|incorrect|duplicate",
  "notes": "This scheme was updated in 2023"
}
```

**Status**: ⚠️ Not implemented

---

## Summary

### Minimum Required: **5 APIs**
1. GET /api/states
2. GET /api/funding/state
3. POST /api/funding/match
4. GET /api/funding/[schemeId]
5. POST /api/telemetry/events

### Recommended Additions: **3 APIs**
6. GET /api/funding/sectors
7. GET /api/funding/export
8. POST /api/funding/report-stale

### Total: **8 APIs** (5 required + 3 optional)

---

## Current Implementation Status

✅ **5/5 Core APIs** - Fully implemented and working
⚠️ **0/3 Optional APIs** - Can be added if needed

The current implementation covers all essential functionality. Optional APIs can be added based on user feedback and requirements.

