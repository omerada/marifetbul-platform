# Mock Data & Backend Integration Roadmap

**Created**: 2025-11-04  
**Status**: Documentation  
**Priority**: MEDIUM (Post-Sprint)

## Overview

This document tracks all components using mock data and documents required backend endpoints for full integration.

---

## Components Using Mock Data

### 🎨 HIGH PRIORITY - User-Facing Features

#### 1. PackageAnalytics Component

**File**: `components/domains/packages/PackageAnalytics.tsx`  
**Current**: Uses `generateMockData()` function  
**Function**: Lines 72-124 (52 lines of mock logic)

**Required Backend Endpoint**:

```
GET /api/v1/packages/analytics/seller
Authorization: Bearer {token}
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalPackages": 12,
      "activePackages": 9,
      "totalViews": 3420,
      "totalOrders": 156,
      "totalRevenue": 45680,
      "averageRating": 4.8,
      "completionRate": 94.5,
      "conversionRate": 4.56
    },
    "trends": {
      "views": 12.5,
      "orders": 8.3,
      "revenue": 15.7,
      "rating": 0.2
    },
    "topPackages": [
      {
        "id": "1",
        "title": "Professional Logo Design",
        "category": "Graphic Design",
        "views": 850,
        "orders": 45,
        "revenue": 13500,
        "rating": 4.9
      }
    ],
    "chartData": {
      "labels": ["1 Kas", "2 Kas", ...],
      "views": [420, 480, ...],
      "orders": [18, 22, ...],
      "revenue": [5400, 6600, ...]
    }
  }
}
```

**Implementation Notes**:

- Mock data removed in commit c920721
- TODO comments added (lines 66, 149)
- Ready for backend integration

---

#### 2. SearchSuggestions - Popular Searches

**File**: `components/shared/search/SearchSuggestions.tsx`  
**Current**: Returns hardcoded popular searches (line 151)  
**Function**: `getPopularSearches()` - Lines 157-194

**Required Backend Endpoint**:

```
GET /api/v1/analytics/search/popular?limit=10
```

**Expected Response**:

```json
{
  "success": true,
  "data": [
    {
      "searchTerm": "logo tasarım",
      "searchCount": 1240,
      "category": "Grafik Tasarım"
    },
    {
      "searchTerm": "web sitesi",
      "searchCount": 980,
      "category": "Web Geliştirme"
    }
  ]
}
```

**Implementation Notes**:

- Search suggestions API connected (line 103)
- Only popular searches need backend
- Graceful fallback to empty array on error (line 133)

---

#### 3. WalletDashboard - Transaction Limits

**File**: `stores/walletStore.ts`  
**Current**: Mock wallet limits (line 212)

**Required Backend Endpoint**:

```
GET /api/v1/wallet/limits
Authorization: Bearer {token}
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "dailyWithdrawalLimit": 5000,
    "monthlyWithdrawalLimit": 50000,
    "minimumWithdrawal": 100,
    "maximumTransactionAmount": 100000
  }
}
```

**Implementation Notes**:

- Main wallet data already connected to backend
- Only limits are mocked

---

### 📊 MEDIUM PRIORITY - Admin/Analytics Features

#### 4. useReportBuilder Hook

**File**: `hooks/business/admin/useReportBuilder.ts`  
**Current**: Uses `generateMockData()` function  
**Function**: Lines 256-294 (38 lines of mock logic)

**Required Backend Endpoint**:

```
POST /api/v1/admin/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "reportType": "revenue" | "orders" | "refunds" | "users" | "custom",
  "metrics": ["totalRevenue", "orderCount", "averageOrderValue"],
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-10-31T23:59:59Z",
  "groupBy": "day" | "week" | "month",
  "filters": {
    "categories": ["Web Geliştirme"],
    "status": ["COMPLETED"],
    "userTypes": ["FREELANCER"],
    "minAmount": 100,
    "maxAmount": 10000
  }
}
```

**Expected Response**:

```json
{
  "success": true,
  "data": [
    {
      "date": "2025-10-01",
      "totalRevenue": 15420,
      "orderCount": 42,
      "averageOrderValue": 367
    }
  ],
  "summary": {
    "total": 450000,
    "average": 14516,
    "min": 5200,
    "max": 28400,
    "trend": "up",
    "percentageChange": 12.5
  }
}
```

**Implementation Notes**:

- Complex reporting system
- Requires flexible metric aggregation
- Export functionality (CSV, PDF, JSON) already implemented client-side
- TODO comments added (lines 116, 221)

---

#### 5. useFacets Hook - Search Facets

**File**: `hooks/shared/useFacets.ts`  
**Current**: Returns `DEFAULT_FACETS_DATA` constant  
**Function**: `fetchFacetsFromAPI()` - Lines 156-172

**Required Backend Endpoint**:

```
GET /api/v1/jobs/facets?category={category}&location={location}&minBudget={min}&maxBudget={max}
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "categories": {
      "Web Geliştirme": 142,
      "Mobil Uygulama": 87,
      "Grafik Tasarım": 156
    },
    "skills": {
      "React": 89,
      "Node.js": 67,
      "TypeScript": 54
    },
    "locations": {
      "İstanbul": 234,
      "Ankara": 112,
      "Uzaktan": 456
    },
    "budgetRanges": {
      "0-500": 45,
      "500-1000": 89,
      "1000-5000": 156
    }
  }
}
```

**Implementation Notes**:

- Used for faceted navigation in job search
- Should update dynamically based on current filter selection
- TODO comments added (lines 138, 159)

---

### 🔧 LOW PRIORITY - Feature Enhancements

#### 6. useCommentModeration - Comment Escalation

**File**: `hooks/business/useCommentModeration.ts`  
**Status**: Feature not implemented in backend  
**Lines**: 407, 603

**Required Backend Endpoints**:

```
POST /api/v1/moderator/comments/{commentId}/escalate
POST /api/v1/moderator/comments/bulk/escalate
Body: { commentIds: [...], reason: "..." }
```

**Implementation Notes**:

- Optional feature for escalating comments to higher authority
- Currently shows toast notification but no backend call
- TODO comments in place

---

#### 7. useModerationQueue - Bulk Review Approval

**File**: `hooks/business/useModerationQueue.ts`  
**Status**: Bulk actions only supported for comments  
**Line**: 214

**Required Backend Endpoint**:

```
POST /api/v1/moderator/reviews/bulk/approve
Body: { reviewIds: [...], moderatorNote: "..." }
```

**Implementation Notes**:

- Individual review approval works
- Bulk approval would improve moderator efficiency
- TODO comment added

---

## Backend Endpoint Priority Matrix

| Priority  | Component            | Endpoint                                    | Complexity | User Impact | Status  |
| --------- | -------------------- | ------------------------------------------- | ---------- | ----------- | ------- |
| 🔴 HIGH   | PackageAnalytics     | GET /api/v1/packages/analytics/seller       | Medium     | High        | ⏳ TODO |
| 🔴 HIGH   | SearchSuggestions    | GET /api/v1/analytics/search/popular        | Low        | Medium      | ⏳ TODO |
| 🟡 MEDIUM | WalletStore          | GET /api/v1/wallet/limits                   | Low        | Low         | ⏳ TODO |
| 🟡 MEDIUM | useReportBuilder     | POST /api/v1/admin/reports/generate         | High       | Medium      | ⏳ TODO |
| 🟡 MEDIUM | useFacets            | GET /api/v1/jobs/facets                     | Medium     | Medium      | ⏳ TODO |
| 🟢 LOW    | useCommentModeration | POST /api/v1/moderator/comments/\*/escalate | Low        | Low         | ⏳ TODO |
| 🟢 LOW    | useModerationQueue   | POST /api/v1/moderator/reviews/bulk/approve | Low        | Low         | ⏳ TODO |

---

## Integration Checklist

### Phase 1: High Priority (Sprint 6-7)

- [ ] **PackageAnalytics** - Critical for seller dashboard
  - [ ] Backend: Implement analytics aggregation
  - [ ] Frontend: Replace `generateMockData()` with API call
  - [ ] Test: Verify all metrics display correctly
  - [ ] Deploy: Backend first, then frontend

- [ ] **SearchSuggestions (Popular)** - Improves search UX
  - [ ] Backend: Track search terms in analytics
  - [ ] Backend: Create aggregation endpoint
  - [ ] Frontend: Replace hardcoded array with API call
  - [ ] Test: Verify popular searches update

### Phase 2: Medium Priority (Sprint 8-9)

- [ ] **WalletLimits** - Account safety
  - [ ] Backend: Add limits configuration
  - [ ] Frontend: Replace mock limits
  - [ ] Test: Verify withdrawal validations

- [ ] **ReportBuilder** - Admin analytics
  - [ ] Backend: Complex aggregation system
  - [ ] Frontend: Replace `generateMockData()`
  - [ ] Test: All report types work
  - [ ] Deploy: Gradual rollout

- [ ] **SearchFacets** - Enhanced search
  - [ ] Backend: Real-time facet counting
  - [ ] Frontend: Replace `DEFAULT_FACETS_DATA`
  - [ ] Test: Dynamic facet updates

### Phase 3: Low Priority (Sprint 10+)

- [ ] **Comment Escalation** - Optional moderation feature
- [ ] **Bulk Review Approval** - Efficiency improvement

---

## Testing Strategy

### Unit Tests

- Mock API responses for each endpoint
- Test error handling (network errors, invalid data)
- Test loading states

### Integration Tests

- Test full data flow (API → Store → Component)
- Test data transformations
- Test cache behavior

### E2E Tests

- Test complete user workflows
- Test all dashboard views with real data
- Test analytics updates in real-time

---

## Migration Strategy

### Step 1: Preparation

1. Backend implements endpoint
2. Frontend adds API client function
3. Add feature flag for gradual rollout

### Step 2: Implementation

```typescript
// Example migration pattern
async function loadAnalytics() {
  try {
    if (FEATURE_FLAGS.useRealAnalytics) {
      // New: Call backend
      const response = await fetch('/api/v1/packages/analytics/seller');
      const data = await response.json();
      setAnalytics(data.data);
    } else {
      // Old: Use mock data
      const mockData = generateMockData();
      setAnalytics(mockData);
    }
  } catch (error) {
    // Fallback to mock on error during transition
    const mockData = generateMockData();
    setAnalytics(mockData);
  }
}
```

### Step 3: Validation

1. Monitor error rates
2. Compare data accuracy
3. Check performance metrics

### Step 4: Cleanup

1. Remove feature flag
2. Delete `generateMockData()` functions
3. Remove mock data constants
4. Update documentation

---

## Performance Considerations

### Caching Strategy

- Package analytics: 5 minute cache
- Search suggestions: 30 minute cache
- Wallet limits: 1 hour cache
- Report data: No cache (on-demand)
- Search facets: 1 minute cache

### Optimization

- Use pagination for large datasets
- Implement lazy loading
- Add debouncing for real-time updates
- Consider WebSocket for live data

---

## Documentation Updates Needed

### API Documentation

- [ ] Add all new endpoints to API docs
- [ ] Document request/response schemas
- [ ] Add authentication requirements
- [ ] Provide example requests

### Component Documentation

- [ ] Update component JSDoc
- [ ] Remove "mock data" mentions
- [ ] Add integration examples
- [ ] Document data flow

---

## Success Metrics

### Code Quality

- [ ] Zero mock data functions in production code
- [ ] All components use real API endpoints
- [ ] Comprehensive error handling
- [ ] Full TypeScript type safety

### Performance

- [ ] Page load time < 2s
- [ ] API response time < 500ms (p95)
- [ ] Zero data inconsistencies
- [ ] 99.9% uptime

### User Experience

- [ ] Accurate real-time data
- [ ] Smooth loading states
- [ ] Graceful error handling
- [ ] No flickering or layout shifts

---

## Notes

- All TODO comments already added to affected files ✅
- Mock data clearly marked with comments ✅
- Graceful fallbacks implemented where critical ✅
- Feature flags recommended for safe rollout
- Coordinate with backend team for endpoint priorities

**Last Updated**: 2025-11-04  
**Next Review**: When backend endpoints become available
