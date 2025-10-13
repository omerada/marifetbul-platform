# 🧹 Production Cleanup & Refactoring Plan

## MarifetBul - Mock Removal & Real API Integration

**Date**: 2025-10-13  
**Status**: 🔴 ACTION REQUIRED  
**Timeline**: 10-14 days  
**Priority**: CRITICAL

---

## 📋 OVERVIEW

Bu doküman, MarifetBul web uygulamasını production-ready hale getirmek için gereken tüm adımları detaylı olarak açıklar.

### Main Objectives

1. ✅ Remove all MSW (Mock Service Worker) code from production
2. ✅ Integrate real Spring Boot backend APIs
3. ✅ Clean up duplicate and unused code
4. ✅ Implement proper error handling
5. ✅ Configure production environment
6. ✅ Ensure security measures are active

---

## 🎯 PHASE 1: MSW REMOVAL (Days 1-2)

### Goal: Completely isolate MSW to development environment only

### 1.1 Add Feature Flag

**File**: `.env.example`

```bash
# Add MSW feature flag
NEXT_PUBLIC_ENABLE_MSW=true
```

**File**: `.env.production.example`

```bash
# Disable MSW in production
NEXT_PUBLIC_ENABLE_MSW=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

**File**: `.env.staging.example`

```bash
# Optional: Enable for staging tests
NEXT_PUBLIC_ENABLE_MSW=false
```

### 1.2 Update MSWProvider

**File**: `components/providers/MSWProvider.tsx`

**BEFORE**:

```typescript
export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const startMSW = async () => {
        // Start MSW...
      };
      startMSW();
    }
  }, []);
  return <>{children}</>;
}
```

**AFTER**:

```typescript
export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only load MSW if explicitly enabled via environment variable
    const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (mswEnabled && isDevelopment && typeof window !== 'undefined') {
      const startMSW = async () => {
        try {
          const { worker } = await import('../../lib/infrastructure/msw/browser');
          await worker.start({
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
            quiet: false,
          });
          console.log('🔧 MSW: Mock Service Worker enabled (dev only)');
        } catch (error) {
          console.error('❌ MSW: Failed to start worker:', error);
        }
      };
      startMSW();
    } else if (!isDevelopment) {
      console.log('✅ Production mode: MSW disabled');
    }
  }, []);

  return <>{children}</>;
}
```

### 1.3 Conditional Provider in Layout

**File**: `app/layout.tsx`

**BEFORE**:

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <MSWProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
```

**AFTER**:

```typescript
export default function RootLayout({ children }) {
  const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <html lang="tr">
      <body>
        {mswEnabled && isDevelopment ? (
          <MSWProvider>
            <AuthProvider>{children}</AuthProvider>
          </MSWProvider>
        ) : (
          <AuthProvider>{children}</AuthProvider>
        )}
      </body>
    </html>
  );
}
```

### 1.4 Exclude MSW from Production Build

**File**: `next.config.js`

Add webpack configuration:

```javascript
module.exports = {
  // ... existing config

  webpack: (config, { isServer, dev }) => {
    // Exclude MSW from production builds
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace MSW with empty module in production
        'msw/node': false,
        'msw/browser': false,
        msw: false,
      };
    }

    return config;
  },
};
```

### 1.5 Gitignore Public MSW File (Optional - Keep for Dev)

**File**: `.gitignore`

```bash
# MSW
/public/mockServiceWorker.js
```

**OR** Keep it but ensure it's not loaded in production via service worker check.

### 1.6 Remove MSW from API Routes

**File**: `app/api/[...slug]/route.ts`

**BEFORE**:

```typescript
export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
      error: 'API endpoint not found',
      message: 'MSW should handle this request in development',
    }),
    { status: 404 }
  );
}
```

**AFTER**:

```typescript
// Remove this file completely OR
// Proxy to real backend in production
export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return new Response(JSON.stringify({ error: 'API URL not configured' }), {
      status: 500,
    });
  }

  // Proxy to real backend
  try {
    const backendResponse = await fetch(
      `${apiUrl}${url.pathname}${url.search}`
    );
    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Backend connection failed' }),
      { status: 502 }
    );
  }
}
```

---

## 🔌 PHASE 2: REAL API INTEGRATION (Days 3-5)

### Goal: Connect frontend to Spring Boot backend

### 2.1 Unified API Client

**Create**: `lib/api/client.ts` (Delete other duplicates)

```typescript
/**
 * Unified API Client for Production
 * Connects to real Spring Boot backend
 */

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.defaultHeaders = config.headers || {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Add auth token
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Send cookies
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleRequestError(error);
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async handleError(response: Response): Promise<Error> {
    const errorData = await response.json().catch(() => ({}));
    return new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  private handleRequestError(error: unknown): Error {
    if (error instanceof Error) return error;
    return new Error('Unknown error occurred');
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Singleton instance
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  retries: 3,
});

export default apiClient;
```

### 2.2 API Endpoints Registry

**Create**: `lib/api/endpoints.ts`

```typescript
/**
 * Centralized API Endpoints
 * Maps to Spring Boot backend endpoints
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: (id: string) => `/users/${id}/profile`,
  },

  // Jobs
  JOBS: {
    LIST: '/jobs',
    GET: (id: string) => `/jobs/${id}`,
    CREATE: '/jobs',
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    SEARCH: '/jobs/search',
  },

  // Packages
  PACKAGES: {
    LIST: '/packages',
    GET: (id: string) => `/packages/${id}`,
    CREATE: '/packages',
    UPDATE: (id: string) => `/packages/${id}`,
    DELETE: (id: string) => `/packages/${id}`,
    SEARCH: '/packages/search',
  },

  // Messages
  MESSAGES: {
    CONVERSATIONS: '/conversations',
    GET_CONVERSATION: (id: string) => `/conversations/${id}`,
    MESSAGES: (conversationId: string) =>
      `/conversations/${conversationId}/messages`,
    SEND: (conversationId: string) =>
      `/conversations/${conversationId}/messages`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // Proposals
  PROPOSALS: {
    LIST: '/proposals',
    GET: (id: string) => `/proposals/${id}`,
    CREATE: '/proposals',
    UPDATE: (id: string) => `/proposals/${id}`,
    ACCEPT: (id: string) => `/proposals/${id}/accept`,
    REJECT: (id: string) => `/proposals/${id}/reject`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    GET: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
  },

  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    GET: (id: string) => `/reviews/${id}`,
    CREATE: '/reviews',
    SELLER_REVIEWS: (sellerId: string) => `/reviews/seller/${sellerId}`,
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/payments/intent',
    CONFIRM: (intentId: string) => `/payments/intent/${intentId}/confirm`,
    HISTORY: '/payments/history',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    GET: (id: string) => `/categories/${id}`,
    TREE: '/categories/tree',
    ROOT: '/categories/root',
  },
} as const;
```

### 2.3 API Services Refactor

**Create**: `lib/api/services/auth.service.ts`

```typescript
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  userType: 'FREELANCER' | 'EMPLOYER';
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
  };
}

export class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );

    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
    }

    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});

    // Clear tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  }
}

export const authService = new AuthService();
```

**Repeat this pattern for all domains:**

- `job.service.ts`
- `package.service.ts`
- `message.service.ts`
- `notification.service.ts`
- etc.

### 2.4 Delete Duplicate API Clients

**Delete these files:**

```bash
rm lib/infrastructure/api/client.ts
rm lib/infrastructure/api/UnifiedApiClient.ts
rm lib/shared/api/client.ts
```

**Update imports:** Search and replace all imports to use new unified client.

### 2.5 Update React Hooks

**File**: `lib/api/hooks/useAuth.ts`

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  authService,
  LoginRequest,
  RegisterRequest,
} from '../services/auth.service';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      // Handle successful login
      console.log('Login successful:', data);
    },
    onError: (error) => {
      // Handle error
      console.error('Login failed:', error);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authService.logout(),
  });
}
```

---

## 🔒 PHASE 3: SECURITY FIXES (Day 6)

### 3.1 Fix Middleware - Admin Protection

**File**: `middleware.ts`

**REMOVE DEBUG CODE:**

```typescript
// BEFORE (Lines 107-120) - REMOVE THIS:
if (isAdminRoute) {
  // DEBUG: Temporarily allow admin access
  console.log('🔍 Admin route access attempt:', { pathname, token, userRole });
  const response = NextResponse.next();
  return addSecurityHeaders(response);
  // Original code (commented for debug):
  // if (!token) { ... }
}

// AFTER - RESTORE REAL PROTECTION:
if (isAdminRoute) {
  // Admin authentication required
  if (!token) {
    const adminLoginUrl = new URL(adminLoginRoute, request.url);
    adminLoginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(adminLoginUrl);
  }

  // Admin role verification
  if (userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}
```

### 3.2 CSRF Protection

**Create**: `lib/security/csrf.ts`

```typescript
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(
  token: string,
  expectedToken: string
): boolean {
  return token === expectedToken;
}

// Add to API client
export function addCSRFHeader(headers: HeadersInit): HeadersInit {
  const csrfToken = sessionStorage.getItem('csrf_token');
  return {
    ...headers,
    'X-CSRF-Token': csrfToken || '',
  };
}
```

### 3.3 Rate Limiting (Client-Side)

**Create**: `lib/security/rate-limiter.ts`

```typescript
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove old timestamps
    const recentTimestamps = timestamps.filter(
      (time) => now - time < this.windowMs
    );

    if (recentTimestamps.length >= this.maxRequests) {
      return false;
    }

    recentTimestamps.push(now);
    this.requests.set(key, recentTimestamps);
    return true;
  }
}

export const apiRateLimiter = new RateLimiter(100, 60000);
```

---

## 🧹 PHASE 4: CODE CLEANUP (Days 7-8)

### 4.1 Remove MSW Files

**Delete entire MSW directory:**

```bash
rm -rf lib/infrastructure/msw/
```

**Files to delete (56 total):**

- `lib/infrastructure/msw/server.ts`
- `lib/infrastructure/msw/browser.ts`
- `lib/infrastructure/msw/handlers.ts`
- `lib/infrastructure/msw/admin/*.ts`
- `lib/infrastructure/msw/handlers/*.ts`
- `lib/infrastructure/msw/data/*.ts`

**Total lines removed**: ~10,000+ lines

### 4.2 Remove Duplicate Services

**Consolidate services:**

```bash
# Keep only:
lib/api/services/*.service.ts

# Delete duplicates:
rm -rf lib/infrastructure/services/api/
rm -rf lib/domains/*/services/
```

### 4.3 Clean Up Test Infrastructure

**File**: `package.json`

**Remove MSW dependency:**

```json
{
  "devDependencies": {
    "msw": "^2.11.1" // ❌ Remove this
  }
}
```

### 4.4 Update Imports

**Search and replace:**

```typescript
// OLD
import { ... } from '@/lib/infrastructure/msw/...'

// NEW
// Remove these imports completely
```

---

## ⚙️ PHASE 5: ENVIRONMENT CONFIGURATION (Day 9)

### 5.1 Production Environment Variables

**File**: `.env.production`

```bash
# ============================================================================
# PRODUCTION ENVIRONMENT - MarifetBul
# ============================================================================

# Application
NEXT_PUBLIC_APP_NAME=MarifetBul
NEXT_PUBLIC_APP_URL=https://marifetbul.com
NEXT_PUBLIC_APP_ENV=production

# Backend API
NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.marifetbul.com/ws

# Feature Flags
NEXT_PUBLIC_ENABLE_MSW=false
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=true

# Authentication
NEXT_PUBLIC_SESSION_TIMEOUT=3600000
NEXT_PUBLIC_COOKIE_DOMAIN=.marifetbul.com
NEXT_PUBLIC_COOKIE_SECURE=true
NEXT_PUBLIC_COOKIE_SAME_SITE=strict

# Security
NEXT_PUBLIC_CSRF_ENABLED=true
NEXT_PUBLIC_RATE_LIMIT_ENABLED=true

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Payment (Production Keys)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Build
NODE_ENV=production
ANALYZE=false
```

### 5.2 Staging Environment

**File**: `.env.staging`

```bash
# Staging Environment
NEXT_PUBLIC_APP_URL=https://staging.marifetbul.com
NEXT_PUBLIC_API_URL=https://api-staging.marifetbul.com/api/v1
NEXT_PUBLIC_ENABLE_MSW=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Test Keys
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

### 5.3 Development Environment

**File**: `.env.local` (gitignored)

```bash
# Development Environment
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_ENABLE_MSW=true
NEXT_PUBLIC_ENABLE_DEBUG=true

# Local Backend
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

### 5.4 Environment Validation

**Create**: `lib/config/env.ts`

```typescript
const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_URL'] as const;

export function validateEnvironment(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file.'
    );
  }
}

// Validate on app start
if (typeof window === 'undefined') {
  validateEnvironment();
}
```

---

## 🧪 PHASE 6: TESTING & VALIDATION (Days 10-12)

### 6.1 Integration Testing Checklist

- [ ] Test login flow with real backend
- [ ] Test registration
- [ ] Test job creation
- [ ] Test package creation
- [ ] Test messaging
- [ ] Test notifications
- [ ] Test file uploads
- [ ] Test payment flow
- [ ] Test admin panel

### 6.2 Error Handling Tests

- [ ] Test network failures
- [ ] Test authentication errors
- [ ] Test validation errors
- [ ] Test server errors (500)
- [ ] Test timeout scenarios

### 6.3 Performance Testing

- [ ] Measure API response times
- [ ] Test with slow network
- [ ] Test concurrent requests
- [ ] Measure bundle size
- [ ] Check Core Web Vitals

### 6.4 Security Testing

- [ ] Test CSRF protection
- [ ] Test XSS prevention
- [ ] Test SQL injection (backend)
- [ ] Test authentication bypass attempts
- [ ] Test authorization checks

---

## 📦 PHASE 7: DEPLOYMENT (Days 13-14)

### 7.1 Backend Deployment

```bash
# Already ready! ✅
cd marifetbul-backend
mvn clean package -P production
docker build -t marifetbul-api:latest .
kubectl apply -f k8s/production/
```

### 7.2 Frontend Deployment

```bash
# Build for production
npm run build

# Verify build
npm run start

# Deploy to Vercel
vercel --prod

# OR Deploy to custom server
docker build -t marifetbul-web:latest .
```

### 7.3 Post-Deployment Verification

**Run these checks:**

```bash
# 1. Health Check
curl https://api.marifetbul.com/actuator/health

# 2. API Endpoints
curl https://api.marifetbul.com/api/v1/categories

# 3. Frontend
curl https://marifetbul.com

# 4. WebSocket
# Test WS connection

# 5. Authentication
# Test login flow
```

---

## 📊 SUCCESS CRITERIA

### Must Have ✅

- [ ] MSW completely disabled in production
- [ ] All API calls hitting real backend
- [ ] Authentication working end-to-end
- [ ] Admin panel secured
- [ ] Environment variables configured
- [ ] Error handling implemented
- [ ] Security headers active
- [ ] HTTPS enforced

### Should Have 🎯

- [ ] Loading states implemented
- [ ] Error boundaries working
- [ ] Analytics tracking
- [ ] Sentry error tracking
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Monitoring active

### Nice to Have 🌟

- [ ] E2E tests passing
- [ ] Load testing done
- [ ] Documentation updated
- [ ] Team training completed

---

## 🚨 ROLLBACK PLAN

If issues arise after deployment:

### Quick Rollback

```bash
# Revert to previous version
vercel rollback
kubectl rollout undo deployment/marifetbul-api
```

### Emergency Hotfix

```bash
# Re-enable MSW temporarily (NOT RECOMMENDED)
NEXT_PUBLIC_ENABLE_MSW=true

# Fix issue
# Deploy new version
```

---

## 📝 DOCUMENTATION UPDATES

### Files to Update

- [ ] `README.md` - Remove MSW references
- [ ] `docs/API_INTEGRATION.md` - Document real API usage
- [ ] `docs/DEPLOYMENT.md` - Update deployment steps
- [ ] `docs/ENVIRONMENT.md` - Document env vars
- [ ] `docs/TESTING.md` - Update testing guide

---

## 🎓 TEAM TRAINING

### Knowledge Transfer Topics

1. **New API Client Usage**
   - How to use unified client
   - Adding new endpoints
   - Error handling patterns

2. **Environment Configuration**
   - Local vs staging vs production
   - Managing secrets
   - Feature flags

3. **Testing Without MSW**
   - Integration testing
   - E2E testing
   - Using real test backend

4. **Deployment Process**
   - Building for production
   - Environment verification
   - Rollback procedures

---

## 📈 METRICS TO TRACK

### Performance Metrics

- API response times
- Frontend load time
- Time to Interactive (TTI)
- First Contentful Paint (FCP)

### Error Metrics

- API error rate
- Frontend error rate
- Authentication failures
- Failed transactions

### Business Metrics

- User registrations
- Job postings
- Transactions completed
- User retention

---

## 🎯 FINAL CHECKLIST

### Pre-Launch

- [ ] All MSW code removed/isolated
- [ ] Real API integration tested
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained

### Launch Day

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] DNS configured correctly
- [ ] SSL certificates active
- [ ] Monitoring dashboards watching
- [ ] Error tracking active
- [ ] Team on standby

### Post-Launch

- [ ] Monitor error rates (first 24h critical)
- [ ] Check performance metrics
- [ ] Verify user flows
- [ ] Collect feedback
- [ ] Plan hotfixes if needed

---

## 📞 SUPPORT & ESCALATION

### Issues During Implementation

**Technical Lead**: Review architecture decisions  
**Backend Team**: Spring Boot integration issues  
**Frontend Team**: React/Next.js issues  
**DevOps Team**: Deployment and infrastructure

### Production Issues

**Severity 1 (Critical)**: All hands on deck  
**Severity 2 (High)**: Resolve within 4 hours  
**Severity 3 (Medium)**: Resolve within 24 hours  
**Severity 4 (Low)**: Plan for next sprint

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-13  
**Status**: 🔴 READY FOR EXECUTION  
**Approval Required**: YES
