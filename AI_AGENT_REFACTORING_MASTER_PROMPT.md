# 🔧 AI Agent Refactoring Master Prompt - Marifeto Platform

Bu dokümanda, Marifeto freelancer platform projesinin production-ready seviyeye çıkarılması için kapsamlı refactoring planı ve AI agent talimatları yer almaktadır.

## 📊 Proje Durumu Analizi

### 🎯 Teknoloji Stack'i

- **Framework**: Next.js 15.5.2 (React 19.1.0)
- **UI Library**: Tailwind CSS 4 + Shadcn/ui
- **State Management**: Zustand 5.0.8 + Immer
- **API Layer**: Custom client + SWR 2.3.6
- **Validation**: Zod 4.1.5 + React Hook Form 7.62.0
- **Testing**: MSW 2.11.1 (Mock Service Worker)
- **Development**: TypeScript 5, ESLint 9, Prettier 3.6.2

### 📁 Proje Yapısı

```
marifeto/
├── app/                    # Next.js App Router
├── components/             # UI bileşenleri (15 kategori)
├── hooks/                  # Custom hooks (44 adet)
├── lib/                    # Utility libraries
├── types/                  # TypeScript type definitions
├── lib/store/              # Zustand state stores (23 adet)
├── lib/validations/        # Zod validation schemas (10 dosya)
└── docs/                   # Sprint dökümanları
```

## 🚨 Kritik Problemler ve Refactoring Gereksinimleri

### 1. 🔄 DUPLICATE CODE ve CODE SMELL'LER

#### **Problem 1.1: Component Duplication**

```typescript
// KÖTÜ: Çoklu Button implementasyonları
// components/ui/Button.tsx
// components/shared/ActionButton.tsx
// components/forms/SubmitButton.tsx

// ÇÖZÜMLEMESİ GEREKİR: Tek, kapsamlı Button component
```

#### **Problem 1.2: Loading State Duplication**

```typescript
// KÖTÜ: Farklı loading componentleri
- UnifiedLoading (4 variant)
- AdminLoadingSkeleton
- AdminSpinnerLoading
- LoadingCard
- PerformanceMonitor loading states

// ÇÖZÜMLEMESİ GEREKİR: Unified loading system
```

#### **Problem 1.3: Error Handling Duplication**

```typescript
// KÖTÜ: Çoklu error boundary implementasyonları
- ErrorBoundaryFallback (global, page, component levels)
- AdminErrorBoundary
- LazyAdminWrapper error handling

// ÇÖZÜMLEMESİ GEREKİR: Centralized error handling
```

#### **Problem 1.4: Image Component Duplication**

```typescript
// KÖTÜ: Farklı image componentleri
- OptimizedImage
- AvatarImage
- HeroImage
- GalleryImage
- ThumbnailImage
- BackgroundImage

// ÇÖZÜMLEMESİ GEREKİR: Single, optimized image component
```

### 2. 🗂️ STATE MANAGEMENT PROBLEMS

#### **Problem 2.1: Zustand Store Fragmentation**

```typescript
// KÖTÜ: 23 farklı store, tutarsız patterns
- useMarketplaceStore
- useMessagingStore
- useNotificationStore
- usePerformanceStore
- useAdminDashboardStore
- useAuthStore
// ... ve diğerleri

// ÇÖZÜMLEMESİ GEREKİR: Domain-based store consolidation
```

#### **Problem 2.2: Performance Bottlenecks**

```typescript
// KÖTÜ: Memory leaks ve optimization issues
- Set/Array conversion problems in messaging store
- localStorage subscription leaks in marketplace
- useEffect cleanup eksiklikleri
- Excessive re-renders in admin components

// ÇÖZÜMLEMESİ GEREKİR: Performance optimization
```

#### **Problem 2.3: Inconsistent Selectors**

```typescript
// KÖTÜ: Tutarsız selector patterns
// Bazı stores selector exports kullanıyor, bazıları kullanmıyor
export const useMarketplaceJobs = () => useMarketplaceStore(state => state.jobs);
// vs
const { data } = useAdminDashboardStore();

// ÇÖZÜMLEMESİ GEREKİR: Consistent selector pattern
```

### 3. 🔗 API LAYER INCONSISTENCIES

#### **Problem 3.1: Multiple API Clients**

```typescript
// KÖTÜ: Farklı API client implementasyonları
- lib/api/client.ts (Simple ApiClient)
- lib/repositories/base.ts (BaseRepository)
- lib/services/ (Service layer)

// ÇÖZÜMLEMESİ GEREKİR: Unified API architecture
```

#### **Problem 3.2: Request/Response Type Inconsistency**

```typescript
// KÖTÜ: Tutarsız response wrapping
// Bazı endpoints ApiResponse<T> döndürüyor, bazıları direkt T

// ÇÖZÜMLEMESİ GEREKİR: Standardized API responses
```

### 4. 📝 VALIDATION SCHEMA DUPLICATION

#### **Problem 4.1: Schema Fragmentation**

```typescript
// KÖTÜ: Benzer validasyon logic'leri
- lib/validations/auth.ts
- lib/validations/profile.ts
- lib/validations/admin.ts
- app/api/*/route.ts (inline schemas)

// ÇÖZÜMLEMESİ GEREKİR: Schema composition ve reuse
```

#### **Problem 4.2: Inconsistent Error Messages**

```typescript
// KÖTÜ: Farklı dillerde ve formatlarda error messages
// Türkçe: "E-posta adresi gereklidir"
// İngilizce: "Email is required"
// Format inconsistency

// ÇÖZÜMLEMESİ GEREKİR: Centralized error messages
```

### 5. 🎯 HOOK ARCHITECTURE PROBLEMS

#### **Problem 5.1: Hook Responsibility Overlap**

```typescript
// KÖTÜ: Overlapping responsibilities
- usePerformance (deprecated)
- useEnhancedPerformance
- usePerformanceMonitoring
- PerformanceMonitor component

// ÇÖZÜMLEMESİ GEREKİR: Clear hook responsibilities
```

#### **Problem 5.2: Custom Hook Inconsistencies**

```typescript
// KÖTÜ: 44 custom hook, tutarsız patterns
// Bazıları store wrapper'ı, bazıları business logic
// Return value inconsistencies

// ÇÖZÜMLEMESİ GEREKİR: Hook standardization
```

### 6. 🚀 PERFORMANCE ISSUES

#### **Problem 6.1: Bundle Size Optimization**

```typescript
// KÖTÜ: Potential bundle bloat
- Multiple lazy loading implementations
- Unnecessary dependencies
- Large image assets without optimization

// ÇÖZÜMLEMESİ GEREKİR: Bundle optimization
```

#### **Problem 6.2: Memory Management**

```typescript
// KÖTÜ: Memory leaks potential
- WebSocket connections without cleanup
- Event listeners not removed
- Store subscriptions without cleanup

// ÇÖZÜMLEMESİ GEREKİR: Memory management audit
```

## 🎯 AI AGENT REFACTORING PROMPT

Aşağıdaki talimatları tam olarak uygulayarak bu projeyi production-ready hale getir:

### 📋 PHASE 1: CODE DUPLICATION ELIMINATION

#### Task 1.1: Unified Component System

```typescript
// GÖREV: Tek, kapsamlı component library oluştur

// 1. Button Component Unification
// components/ui/Button.tsx - Tek button component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg' | 'xl';
  state: 'default' | 'loading' | 'disabled';
  leftIcon?: React.ComponentType;
  rightIcon?: React.ComponentType;
  // ... tüm use case'leri destekle
}

// 2. Loading System Unification
// components/ui/LoadingSystem.tsx - Tek loading component
interface LoadingProps {
  variant: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  size: 'sm' | 'md' | 'lg';
  count?: number; // skeleton için
  shape?: 'card' | 'text' | 'avatar' | 'image';
}

// 3. Image Component Unification
// components/ui/Image.tsx - Tek image component
interface ImageProps extends NextImageProps {
  variant: 'avatar' | 'hero' | 'gallery' | 'thumbnail' | 'background';
  aspectRatio?: string;
  overlay?: boolean;
  lazy?: boolean;
  priority?: boolean;
}
```

#### Task 1.2: Error Handling Consolidation

```typescript
// GÖREV: Centralized error management

// lib/errors/ErrorBoundary.tsx - Master error boundary
interface ErrorBoundaryProps {
  level: 'global' | 'page' | 'component';
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

// lib/errors/ErrorHandler.ts - Centralized error logic
export class ErrorHandler {
  static logError(error: Error, context: string): void;
  static reportError(error: Error, userId?: string): void;
  static getUserFriendlyMessage(error: Error): string;
}
```

### 📋 PHASE 2: STATE MANAGEMENT OPTIMIZATION

#### Task 2.1: Store Architecture Refactoring

```typescript
// GÖREV: Domain-based store consolidation

// lib/store/domains/ klasörü altında organize et:
// - auth/authStore.ts
// - marketplace/marketplaceStore.ts
// - messaging/messagingStore.ts
// - admin/adminStore.ts
// - ui/uiStore.ts (loading, modals, notifications)

// Her store için unified pattern:
interface StorePattern<T> {
  // State
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetch: () => Promise<void>;
  create: (data: Partial<T>) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}
```

#### Task 2.2: Performance Optimization

```typescript
// GÖREV: Store performance optimization

// 1. Selector optimization
// lib/store/selectors/ - Memoized selectors
export const useOptimizedMarketplaceJobs = () =>
  useMarketplaceStore(
    useCallback(state => state.jobs, []),
    shallow
  );

// 2. Subscription cleanup
// Her store'da proper cleanup logic
// 3. Memory leak prevention
// Set/Array conversion optimization
// 4. Unnecessary re-render prevention
```

### 📋 PHASE 3: API LAYER STANDARDIZATION

#### Task 3.1: Unified API Architecture

```typescript
// GÖREV: Tek, tutarlı API layer

// lib/api/ApiClient.ts - Master API client
export class ApiClient {
  private baseURL: string;
  private interceptors: Interceptors;

  // Standardized methods
  async get<T>(endpoint: string, params?: object): Promise<ApiResponse<T>>;
  async post<T>(endpoint: string, data?: object): Promise<ApiResponse<T>>;
  async put<T>(endpoint: string, data?: object): Promise<ApiResponse<T>>;
  async delete<T>(endpoint: string): Promise<ApiResponse<T>>;

  // Error handling, retry logic, caching
}

// lib/api/types.ts - Standardized response types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  meta?: PaginationMeta;
}
```

#### Task 3.2: Repository Pattern Implementation

```typescript
// GÖREV: Repository pattern ile API organization

// lib/repositories/BaseRepository.ts
abstract class BaseRepository<T> {
  protected apiClient: ApiClient;
  protected endpoint: string;

  async findAll(params?: QueryParams): Promise<PaginatedResponse<T>>;
  async findById(id: string): Promise<T>;
  async create(data: CreateDTO<T>): Promise<T>;
  async update(id: string, data: UpdateDTO<T>): Promise<T>;
  async delete(id: string): Promise<void>;
}

// Domain repositories:
// - UserRepository extends BaseRepository<User>
// - JobRepository extends BaseRepository<Job>
// - PackageRepository extends BaseRepository<ServicePackage>
```

### 📋 PHASE 4: VALIDATION SYSTEM OVERHAUL

#### Task 4.1: Schema Composition System

```typescript
// GÖREV: Reusable validation building blocks

// lib/validations/base.ts - Base validation schemas
export const baseSchemas = {
  id: z.string().min(1, 'ID gereklidir'),
  email: z.string().email('Geçerli e-posta adresi giriniz'),
  password: z.string().min(6, 'En az 6 karakter'),
  name: z.string().min(2, 'En az 2 karakter').max(50, 'En fazla 50 karakter'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Geçerli telefon numarası'),
  url: z.string().url('Geçerli URL giriniz'),
  currency: z.enum(['TRY', 'USD', 'EUR']),
  date: z.string().datetime('Geçerli tarih formatı'),
};

// lib/validations/composites.ts - Composite schemas
export const compositeSchemas = {
  user: z.object({
    id: baseSchemas.id,
    email: baseSchemas.email,
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
  }),

  address: z.object({
    city: baseSchemas.name,
    district: baseSchemas.name.optional(),
    // ...
  }),
};
```

#### Task 4.2: Centralized Error Messages

```typescript
// GÖREV: i18n ready error message system

// lib/validations/messages.ts
export const validationMessages = {
  tr: {
    required: 'Bu alan zorunludur',
    email: 'Geçerli e-posta adresi giriniz',
    minLength: (min: number) => `En az ${min} karakter olmalıdır`,
    // ...
  },
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: (min: number) => `Must be at least ${min} characters`,
    // ...
  }
};
```

### 📋 PHASE 5: HOOK ARCHITECTURE REDESIGN

#### Task 5.1: Hook Responsibility Separation

```typescript
// GÖREV: Clear separation of concerns

// hooks/api/ - API related hooks
// - useApiQuery<T>(endpoint: string, params?: object)
// - useApiMutation<T>(endpoint: string, method: Method)

// hooks/state/ - State management hooks
// - useAppState<T>(selector: StateSelector<T>)
// - useLocalState<T>(key: string, defaultValue: T)

// hooks/ui/ - UI related hooks
// - useDisclosure() // modal, drawer etc.
// - useClipboard(text: string)
// - useMediaQuery(query: string)

// hooks/business/ - Business logic hooks
// - useAuthentication()
// - useMarketplace()
// - useMessaging()
```

#### Task 5.2: Hook Standardization

```typescript
// GÖREV: Consistent hook patterns

// Hook return type standardization
interface AsyncHookReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface MutationHookReturn<T, P> {
  mutate: (params: P) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}
```

### 📋 PHASE 6: PERFORMANCE OPTIMIZATION

#### Task 6.1: Bundle Optimization

```typescript
// GÖREV: Bundle size optimization

// 1. Dynamic imports optimization
// components/lazy/ - Proper lazy loading structure
export const LazyAdminDashboard = lazy(() =>
  import('@/components/admin/Dashboard').then(module => ({
    default: module.AdminDashboard
  }))
);

// 2. Tree shaking optimization
// lib/exports/ - Proper export structure
// 3. Code splitting strategy
// 4. Unused dependency removal
```

#### Task 6.2: Memory Management Audit

```typescript
// GÖREV: Memory leak prevention

// 1. useEffect cleanup audit
useEffect(() => {
  const cleanup = setupSomething();
  return cleanup; // Her useEffect'te cleanup
}, []);

// 2. WebSocket cleanup
// 3. Event listener cleanup
// 4. Store subscription cleanup
// 5. Timer/interval cleanup
```

### 📋 PHASE 7: TYPE SAFETY ENHANCEMENT

#### Task 7.1: Strict TypeScript Configuration

```typescript
// GÖREV: Type safety improvements

// tsconfig.json updates
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true, // Enable
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true, // Enable
    "noUnusedParameters": true, // Enable
  }
}
```

#### Task 7.2: Generic Type System

```typescript
// GÖREV: Reusable generic types

// types/generic.ts
export type ApiEndpoint<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K]
    : never;
};

export type FormData<T> = {
  [K in keyof T]: T[K] extends object
    ? FormData<T[K]>
    : T[K];
};
```

### 📋 PHASE 8: TESTING INFRASTRUCTURE

#### Task 8.1: Test Utilities

```typescript
// GÖREV: Test helper functions

// tests/utils/testUtils.tsx
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  // Provider wrapper ile render
};

export const createMockStore = <T>(initialState: Partial<T>) => {
  // Mock store factory
};
```

#### Task 8.2: MSW Integration Enhancement

```typescript
// GÖREV: Mock API improvements

// lib/msw/handlers/ - Organized by domain
// - authHandlers.ts
// - marketplaceHandlers.ts
// - messagingHandlers.ts

// Realistic data generation
// Error scenario testing
// Performance testing scenarios
```

## 🎯 IMPLEMENTATION PRIORITY

### 🔥 HIGH PRIORITY (Hemen yapılması gerekenler)

1. **Component Duplication Elimination** (Phase 1)
2. **Store Performance Optimization** (Phase 2.2)
3. **API Layer Standardization** (Phase 3)
4. **Memory Management Audit** (Phase 6.2)

### 📋 MEDIUM PRIORITY (2-3 hafta içinde)

1. **Validation System Overhaul** (Phase 4)
2. **Hook Architecture Redesign** (Phase 5)
3. **Bundle Optimization** (Phase 6.1)

### 📝 LOW PRIORITY (1-2 ay içinde)

1. **Type Safety Enhancement** (Phase 7)
2. **Testing Infrastructure** (Phase 8)

## 🔍 CODE REVIEW CHECKLIST

Her refactoring işlemi sonrası kontrol edilecekler:

### ✅ Component Quality

- [ ] Single Responsibility Principle
- [ ] Proper prop typing
- [ ] Accessibility compliance
- [ ] Performance optimization
- [ ] Error boundary integration

### ✅ State Management

- [ ] Minimal re-renders
- [ ] Proper cleanup
- [ ] Consistent patterns
- [ ] Memory leak prevention
- [ ] Selector optimization

### ✅ API Integration

- [ ] Error handling
- [ ] Loading states
- [ ] Retry logic
- [ ] Caching strategy
- [ ] Type safety

### ✅ Performance

- [ ] Bundle size impact
- [ ] Core Web Vitals
- [ ] Memory usage
- [ ] Network requests
- [ ] Image optimization

## 📊 SUCCESS METRICS

### 📈 Technical Metrics

- Bundle size reduction: **%30+**
- Core Web Vitals score: **90+**
- TypeScript strict mode: **100% compliance**
- Test coverage: **80%+**
- Memory leak incidents: **0**

### 📊 Developer Experience

- Component reusability: **%80+**
- API consistency: **100%**
- Hook standardization: **100%**
- Documentation completeness: **100%**

## 🚀 FINAL PRODUCTION CHECKLIST

### ✅ Performance

- [ ] Bundle analysis completed
- [ ] Core Web Vitals optimized
- [ ] Memory leaks eliminated
- [ ] Lazy loading implemented
- [ ] Image optimization configured

### ✅ Code Quality

- [ ] Duplication eliminated
- [ ] TypeScript strict mode
- [ ] ESLint rules enforced
- [ ] Component standards followed
- [ ] Hook patterns consistent

### ✅ Architecture

- [ ] Store architecture optimized
- [ ] API layer standardized
- [ ] Validation system unified
- [ ] Error handling centralized
- [ ] Testing infrastructure ready

### ✅ Documentation

- [ ] Component documentation
- [ ] API documentation
- [ ] Hook documentation
- [ ] Architecture decisions recorded
- [ ] Migration guides provided

---

**Bu promptu AI agent'a vererek tüm refactoring işlemlerini sistematik olarak gerçekleştir. Her phase'i tamamladıktan sonra code review checklist'ini kullanarak kaliteyi kontrol et.**
