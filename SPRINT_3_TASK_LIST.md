# 🚀 SPRINT 3: API Layer Unification & Error Handling

**Sprint Duration:** 7 gün (26 Ekim - 2 Kasım 2025)  
**Priority:** MEDIUM 🟡  
**Complexity:** Medium  
**Risk Level:** Low-Medium

---

## 📊 Sprint Overview

### Hedefler

1. **API Service Consolidation**: 17 farklı API dosyasını standardize et
2. **Error Handling**: Unified error handling ve user-friendly messages
3. **Type Safety**: Response type validation ve transformation
4. **Developer Experience**: Tutarlı API usage patterns

### Mevcut Durum Analizi

**Tespit Edilen Sorunlar:**

#### 🔴 Issue 1: Inconsistent Error Handling

```typescript
// packages.ts - try-catch olmadan
export const getActivePackages = async () => {
  const response = await apiClient.get(...);
  return response; // Error handling yok
};

// orders.ts - try-catch ile ama inconsistent
export const createOrder = async (data) => {
  try {
    const response = await apiClient.post(...);
    return response;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error; // Sadece console.error
  }
};

// proposals.ts - Custom error transformation
export const createProposal = async (data) => {
  try {
    const response = await apiClient.post(...);
    return response;
  } catch (error) {
    if (error.status === 400) {
      throw new Error('Invalid proposal data');
    }
    throw error; // Farklı error handling pattern
  }
};
```

**Sorun:** Her dosya kendi error handling pattern'ini kullanıyor.

#### 🟡 Issue 2: Type Safety Gaps

```typescript
// packages.ts - Generic typing
export const getPackageById = async (id: string): Promise<Package> => {
  const response = await apiClient.get(`/api/v1/packages/${id}`);
  return response; // Backend response'u direkt return
};

// orders.ts - Backend-aligned types kullanıyor
export const getOrderById = async (id: string): Promise<OrderResponse> => {
  const response = await apiClient.get<OrderResponse>(`/api/orders/${id}`);
  return response; // Type-safe ✅
};
```

**Sorun:** Bazı dosyalar backend-aligned types kullanıyor, bazıları generic.

#### 🟢 Issue 3: Duplication (But Good Foundation)

**Pozitif Gözlem:**

- ✅ `apiClient` zaten iyi tasarlanmış
- ✅ Caching, retry, logging built-in
- ✅ CSRF protection var
- ✅ HttpOnly cookie authentication

**Sorun:**

- Her service dosyası kendi endpoint constants tanımlıyor
- Similar transformation logic tekrar ediliyor

---

## 📋 Sprint 3 Task Breakdown

### **Story 3.1: API Error Handling Standardization**

**Priority:** HIGH 🔴  
**Estimation:** 2 gün

#### Problem Statement

Şu anda her API service kendi error handling'ini yapıyor. Bazıları try-catch kullanıyor, bazıları kullanmıyor. Error messages user-friendly değil.

#### Solution Design

**1. Custom Error Classes** (`lib/api/errors.ts`)

```typescript
/**
 * Base API Error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', fields);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Bu işlem için yetkiniz yok.') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'İçerik') {
    super(`${resource} bulunamadı.`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Server Error (500+)
 */
export class ServerError extends ApiError {
  constructor(message = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

/**
 * Network Error (no response)
 */
export class NetworkError extends ApiError {
  constructor(message = 'İnternet bağlantısı kesildi. Lütfen bağlantınızı kontrol edin.') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}
```

**2. Error Transformation Utility**

```typescript
/**
 * Transform HTTP error to user-friendly ApiError
 */
export function transformApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Fetch/Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError();
  }

  // HTTP error with status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    const message = (error as any).message || 'Bir hata oluştu';

    switch (status) {
      case 400:
        return new ValidationError(message, (error as any).fields);
      case 401:
        return new AuthenticationError();
      case 403:
        return new AuthorizationError();
      case 404:
        return new NotFoundError();
      case 409:
        return new ConflictError(message);
      case 500:
      case 502:
      case 503:
        return new ServerError();
      default:
        return new ApiError(message, status);
    }
  }

  // Unknown error
  const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
  return new ApiError(message, 500);
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const apiError = transformApiError(error);
  return apiError.message;
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: unknown): boolean {
  return error instanceof AuthenticationError;
}

/**
 * Check if error is retriable
 */
export function isRetriableError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof ServerError) return true;
  if (error instanceof ApiError) {
    return error.statusCode >= 500 || error.statusCode === 408;
  }
  return false;
}
```

**3. Update ApiClient to Use Custom Errors**

```typescript
// lib/infrastructure/api/client.ts

import {
  ApiError,
  transformApiError,
  NetworkError
} from '@/lib/api/errors';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // ... existing code ...

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Parse error response
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        // Create structured error
        const error = {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          fields: errorData.fields,
        };

        throw transformApiError(error);
      }

      return await response.json();
    } catch (error) {
      // Network errors
      if (error instanceof TypeError) {
        throw new NetworkError();
      }

      // Already transformed
      if (error instanceof ApiError) {
        throw error;
      }

      // Transform unknown errors
      throw transformApiError(error);
    }
  }
}
```

#### Subtasks

##### 3.1.1: Create Error Classes

**Time:** 2 saat

- [ ] Create `lib/api/errors.ts`
- [ ] Implement all error classes
- [ ] Add JSDoc documentation
- [ ] Export utilities

##### 3.1.2: Update ApiClient Error Handling

**Time:** 2 saat

- [ ] Integrate error transformation
- [ ] Update error logging
- [ ] Test with mock errors
- [ ] Update TypeScript types

##### 3.1.3: Create Error Utilities

**Time:** 1.5 saat

- [ ] Implement `getUserFriendlyErrorMessage()`
- [ ] Implement `requiresReauth()`
- [ ] Implement `isRetriableError()`
- [ ] Add unit tests

##### 3.1.4: Update Retry Logic

**Time:** 1.5 saat

- [ ] Use `isRetriableError()` in retry manager
- [ ] Update retry presets
- [ ] Test network failures
- [ ] Test server errors

---

### **Story 3.2: API Response Type Validation**

**Priority:** MEDIUM 🟡  
**Estimation:** 1.5 gün

#### Problem Statement

API responses direkt return ediliyor, runtime validation yok. Backend değişikliği frontend'i bozabilir.

#### Solution Design

**Option A: Runtime Validation with Zod** (Recommended)

```typescript
// lib/api/validators.ts
import { z } from 'zod';

/**
 * Order Response Schema
 */
export const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
  type: z.enum(['PACKAGE', 'CUSTOM']),
  buyerId: z.string(),
  sellerId: z.string(),
  buyerName: z.string(),
  sellerName: z.string(),
  totalAmount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Validate API response
 */
export function validateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('API response validation failed:', error.errors);
      throw new ApiError(
        'Sunucu beklenmeyen formatta veri döndü',
        500,
        'VALIDATION_FAILED',
        error.errors
      );
    }
    throw error;
  }
}

/**
 * Safe validation (returns null on error)
 */
export function safeValidateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}
```

**Usage in API Services:**

```typescript
// lib/api/orders.ts
import { OrderResponseSchema, validateResponse } from './validators';

export const getOrderById = async (id: string): Promise<OrderResponse> => {
  const response = await apiClient.get(`/api/orders/${id}`);
  return validateResponse(response, OrderResponseSchema);
};
```

**Option B: Type Guards (Lightweight)**

```typescript
// lib/api/type-guards.ts

export function isOrderResponse(data: unknown): data is OrderResponse {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.orderNumber === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.totalAmount === 'number'
  );
}

export function assertOrderResponse(data: unknown): asserts data is OrderResponse {
  if (!isOrderResponse(data)) {
    throw new ApiError('Invalid order response format', 500, 'INVALID_RESPONSE');
  }
}
```

**Decision:** Use **Option A (Zod)** for critical endpoints, **Option B** for simple validations.

#### Subtasks

##### 3.2.1: Install & Configure Zod

**Time:** 30 min

- [ ] Install zod: `npm install zod`
- [ ] Create `lib/api/validators.ts`
- [ ] Setup base schemas

##### 3.2.2: Create Response Schemas

**Time:** 3 saat

Priority schemas:

- [ ] OrderResponseSchema
- [ ] PackageResponseSchema
- [ ] ProposalResponseSchema
- [ ] UserResponseSchema
- [ ] ReviewResponseSchema

##### 3.2.3: Update API Services

**Time:** 2 saat

- [ ] Update `orders.ts` with validation
- [ ] Update `packages.ts` with validation
- [ ] Test validation errors
- [ ] Add error handling

##### 3.2.4: Create Type Guards for Simple Cases

**Time:** 1 saat

- [ ] Create `lib/api/type-guards.ts`
- [ ] Implement common guards
- [ ] Use in less-critical endpoints

---

### **Story 3.3: API Service Pattern Standardization**

**Priority:** HIGH 🔴  
**Estimation:** 2 gün

#### Goal

Standardize all 17 API service files to follow consistent patterns.

#### Standard Pattern Template

```typescript
/**
 * ================================================
 * [RESOURCE] API SERVICE
 * ================================================
 * API client for [resource] operations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { validateResponse } from './validators';
import { ResourceResponseSchema } from './validators';
import type { ResourceResponse, CreateResourceRequest } from '@/types/...';

// ================================================
// ENDPOINTS
// ================================================

const ENDPOINTS = {
  LIST: '/api/v1/resources',
  GET: (id: string) => `/api/v1/resources/${id}`,
  CREATE: '/api/v1/resources',
  UPDATE: (id: string) => `/api/v1/resources/${id}`,
  DELETE: (id: string) => `/api/v1/resources/${id}`,
} as const;

// ================================================
// SERVICE FUNCTIONS
// ================================================

/**
 * Get all resources
 */
export const getResources = async (
  params?: PaginationParams
): Promise<PaginatedResponse<ResourceResponse>> => {
  const response = await apiClient.get(ENDPOINTS.LIST, params);
  return response; // Pagination response doesn't need validation
};

/**
 * Get resource by ID
 */
export const getResourceById = async (
  id: string
): Promise<ResourceResponse> => {
  const response = await apiClient.get(ENDPOINTS.GET(id));
  return validateResponse(response, ResourceResponseSchema);
};

/**
 * Create new resource
 */
export const createResource = async (
  data: CreateResourceRequest
): Promise<ResourceResponse> => {
  const response = await apiClient.post(ENDPOINTS.CREATE, data);
  return validateResponse(response, ResourceResponseSchema);
};

/**
 * Update resource
 */
export const updateResource = async (
  id: string,
  data: Partial<CreateResourceRequest>
): Promise<ResourceResponse> => {
  const response = await apiClient.put(ENDPOINTS.UPDATE(id), data);
  return validateResponse(response, ResourceResponseSchema);
};

/**
 * Delete resource
 */
export const deleteResource = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.DELETE(id));
};
```

#### Checklist for Each Service File

- [ ] Clear documentation header
- [ ] Centralized ENDPOINTS constants
- [ ] Type-safe request/response types
- [ ] JSDoc for each function
- [ ] Consistent naming (get, create, update, delete)
- [ ] Response validation where needed
- [ ] No direct try-catch (apiClient handles it)
- [ ] Export all types used

#### Subtasks

##### 3.3.1: Create Standard Template

**Time:** 1 saat

- [ ] Document standard pattern
- [ ] Create template file
- [ ] Review with team

##### 3.3.2: Refactor Priority Services

**Time:** 4 saat

Priority order:

1. [ ] orders.ts (most used)
2. [ ] packages.ts (most complex)
3. [ ] proposals.ts (second most used)
4. [ ] review.ts (user-facing)

##### 3.3.3: Refactor Remaining Services

**Time:** 3 saat

- [ ] categories.ts
- [ ] blog.ts
- [ ] analytics.ts
- [ ] portfolio.ts
- [ ] follow.ts
- [ ] favorites.ts
- [ ] notification.ts
- [ ] privacy-settings.ts
- [ ] payment-methods.ts
- [ ] notification-preferences.ts

##### 3.3.4: Update Index Exports

**Time:** 30 min

- [ ] Update `lib/api/index.ts`
- [ ] Group exports by domain
- [ ] Add JSDoc comments

---

### **Story 3.4: Error Handling UI Components**

**Priority:** MEDIUM 🟡  
**Estimation:** 1 gün

#### Goal

Create reusable components for displaying API errors to users.

#### Components to Create

**1. ErrorAlert Component** (`components/shared/ErrorAlert.tsx`)

```typescript
interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onRetry, onDismiss }: ErrorAlertProps) {
  const message = getUserFriendlyErrorMessage(error);
  const isRetriable = isRetriableError(error);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Hata</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>

          {isRetriable && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-800 underline hover:no-underline"
            >
              Tekrar Dene
            </button>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss}>
            <X className="h-4 w-4 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}
```

**2. useApiError Hook** (`hooks/shared/useApiError.ts`)

```typescript
export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((err: unknown) => {
    const apiError = transformApiError(err);
    setError(apiError);

    // Auto-clear after 5 seconds
    setTimeout(() => setError(null), 5000);

    // Handle authentication errors
    if (requiresReauth(apiError)) {
      // Redirect to login
      window.location.href = '/login';
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
}
```

**3. ErrorBoundary for API Errors** (`components/shared/ApiErrorBoundary.tsx`)

```typescript
export class ApiErrorBoundary extends React.Component<Props, State> {
  // Catch API errors and display fallback UI
}
```

#### Subtasks

##### 3.4.1: Create ErrorAlert Component

**Time:** 1.5 saat

- [ ] Implement component
- [ ] Add variants (error, warning, info)
- [ ] Styling with Tailwind
- [ ] Storybook story

##### 3.4.2: Create useApiError Hook

**Time:** 1 saat

- [ ] Implement hook
- [ ] Add auto-dismiss
- [ ] Add reauth handling
- [ ] Unit tests

##### 3.4.3: Create ApiErrorBoundary

**Time:** 1.5 saat

- [ ] Implement error boundary
- [ ] Fallback UI
- [ ] Reset functionality
- [ ] Integration with Sentry

##### 3.4.4: Update Existing Pages

**Time:** 1 saat

- [ ] Use ErrorAlert in order pages
- [ ] Use ErrorAlert in package pages
- [ ] Replace old error displays

---

## 🧪 Testing Strategy

### Unit Tests

**Coverage Goals:**

- Error classes: 100%
- Error transformation: 95%
- Validators: 90%
- Type guards: 85%

**Test Files:**

```
lib/api/__tests__/
  ├── errors.test.ts
  ├── validators.test.ts
  ├── type-guards.test.ts
  └── api-client-errors.test.ts
```

### Integration Tests

- [ ] Test error handling flow
- [ ] Test validation failures
- [ ] Test network errors
- [ ] Test authentication errors

### Manual Testing

- [ ] Disconnect network → NetworkError shown
- [ ] Invalid token → AuthenticationError → redirect to login
- [ ] 404 endpoint → NotFoundError with friendly message
- [ ] Server error → ServerError with retry button

---

## 📊 Sprint Metrics

### Estimated Effort

| Story     | Estimation | Complexity |
| --------- | ---------- | ---------- |
| 3.1       | 2 days     | Medium     |
| 3.2       | 1.5 days   | Medium     |
| 3.3       | 2 days     | High       |
| 3.4       | 1 day      | Low        |
| Buffer    | 0.5 days   | -          |
| **Total** | **7 days** | **Medium** |

### Success Metrics

- [ ] 17/17 API services follow standard pattern
- [ ] 0 unhandled API errors in production
- [ ] 100% type-safe API responses (critical endpoints)
- [ ] < 100ms validation overhead
- [ ] User-friendly error messages in all error cases

---

## 🎯 Acceptance Criteria

### Story 3.1

- [x] Custom error classes created
- [x] ApiClient uses custom errors
- [x] Error transformation works for all status codes
- [x] Retry logic respects error types

### Story 3.2

- [ ] Zod installed and configured
- [ ] Top 5 response schemas created
- [ ] Validation integrated in API services
- [ ] Type guards for simple validations

### Story 3.3

- [ ] Standard pattern documented
- [ ] All 17 services follow pattern
- [ ] Consistent naming across services
- [ ] Clear JSDoc documentation

### Story 3.4

- [ ] ErrorAlert component created
- [ ] useApiError hook created
- [ ] ApiErrorBoundary implemented
- [ ] Used in 3+ pages

---

## 🚀 Deployment Plan

### Phase 1: Error Handling (Day 1-2)

- Deploy error classes
- Update ApiClient
- No user-facing changes
- Low risk

### Phase 2: Validation (Day 3-4)

- Deploy validators
- Update critical services
- Monitor validation errors
- Medium risk (may catch backend issues)

### Phase 3: Service Standardization (Day 5-6)

- Deploy refactored services
- A/B test if needed
- Monitor for regressions

### Phase 4: UI Components (Day 7)

- Deploy error UI components
- Update pages incrementally
- Collect user feedback

---

## 📚 Documentation

### Files to Create

- [x] `SPRINT_3_TASK_LIST.md` (this file)
- [ ] `docs/API_ERROR_HANDLING.md`
- [ ] `docs/API_VALIDATION.md`
- [ ] `docs/API_PATTERNS.md`

### Files to Update

- [ ] `README.md` - Add error handling section
- [ ] `CONTRIBUTING.md` - Add API service guidelines
- [ ] `ARCHITECTURE.md` - Document API layer

---

## 🔄 Sprint 3 → Sprint 4 Transition

### Deliverables

- ✅ Unified error handling
- ✅ Response validation
- ✅ Standardized API services
- ✅ Error UI components

### Sprint 4 Preparation

**Focus:** Type System Refactor

Identified issues for Sprint 4:

1. types/index.ts: 2000+ lines (needs splitting)
2. Duplicate type definitions across files
3. Backend-frontend type alignment
4. OpenAPI schema generation

---

**End of Sprint 3 Task List**

_Last Updated: 26 Ekim 2025_  
_Status: Ready for Implementation_
