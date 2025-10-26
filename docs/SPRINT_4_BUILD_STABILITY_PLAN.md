# Sprint 4: Build Stability & SSR Fixes

## 🎯 Sprint Hedefi

**Odak:** Build hatalarını düzelt, SSR sorunlarını çöz, production-ready hale getir

**Durum:** Sprint 3 tamamlandı (%100), ancak build critical errors var
**Öncelik:** HIGH - Production deployment blocker
**Tahmini Süre:** 4-6 saat

---

## 🔴 Critical Build Issues (Production Blocker)

### Issue #1: isomorphic-dompurify SSR Hatası ⚠️

**Dosya:** `lib/infrastructure/security/xss-protection.tsx`  
**Etkilenen:** Blog post pages (`/blog/[slug]`)

**Hata:**

```
Error: ENOENT: no such file or directory
Path: C:\ROOT\node_modules\isomorphic-dompurify\node_modules\jsdom\lib\jsdom\browser\default-stylesheet.css
```

**Sebep:**

- `isomorphic-dompurify` jsdom kullanıyor
- jsdom server-side çalışmıyor (Turbopack build)
- `SafeHtml` component blog sayfalarında import ediliyor

**Çözüm:**

1. **Option A - Client-Only Approach:**

   ```tsx
   // xss-protection.tsx
   'use client';  // Component'i client-only yap

   // Blog pages'de dynamic import
   const SafeHtml = dynamic(() => import('@/lib/infrastructure/security/xss-protection'), {
     ssr: false
   });
   ```

2. **Option B - Universal Sanitization:**

   ```typescript
   // Browser check ekle
   const sanitizeHtml = (html: string) => {
     if (typeof window === 'undefined') {
       // Server-side: Basic sanitization veya pass-through
       return html;
     }
     // Client-side: DOMPurify kullan
     return DOMPurify.sanitize(html);
   };
   ```

3. **Option C - Alternative Library:**
   ```bash
   npm install dompurify
   npm install --save-dev @types/dompurify
   # isomorphic-dompurify'ı kaldır
   ```

**Tavsiye Edilen:** Option C + B kombinasyonu

- dompurify'a geç (daha hafif, isomorphic değil)
- Client-side only sanitization
- Server-side HTML'i as-is render et (backend zaten sanitize ediyor)

---

### Issue #2: LazyComponents Dynamic Import

**Dosya:** `components/shared/LazyComponents.tsx`  
**Status:** ✅ FIXED (Sprint 3'te düzeltildi)

```tsx
// createComponentLazy disabled - Turbopack does not support dynamic imports
// export const createComponentLazy = (componentPath: string) =>
//   lazy(() => import(componentPath));
```

---

### Issue #3: Tabs Component Props

**Dosya:** `components/ui/Tabs.tsx`  
**Status:** ✅ FIXED (Sprint 3'te düzeltildi)

```tsx
// Controlled + Uncontrolled support eklendi
interface TabsProps {
  defaultValue?: string;
  value?: string;  // Controlled
  onValueChange?: (value: string) => void;
  // ...
}
```

---

### Issue #4: PackageTierPricingStep Type Errors

**Dosya:** `components/packages/create/PackageTierPricingStep.tsx`  
**Status:** ✅ FIXED (Sprint 3'te düzeltildi)

```tsx
// Type assertion with eslint-disable
const basicFeatures = useFieldArray({
  control: control as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  name: 'basicTier.features',
});
```

---

## 📋 Sprint 4 Task Breakdown

### Phase 1: Critical Fixes (2-3 hours)

#### Task 1.1: isomorphic-dompurify Replacement

**Priority:** CRITICAL  
**Effort:** 1.5 hours

**Adımlar:**

1. `dompurify` kurulumu

   ```bash
   npm uninstall isomorphic-dompurify
   npm install dompurify
   npm install --save-dev @types/dompurify
   ```

2. `xss-protection.tsx` refactor

   ```tsx
   'use client';
   import DOMPurify from 'dompurify';

   export const sanitizeHtml = (html: string, config?: Config): string => {
     // Client-side only
     if (typeof window === 'undefined') {
       console.warn('DOMPurify: Server-side sanitization skipped');
       return html;
     }
     return DOMPurify.sanitize(html, config);
   };
   ```

3. Blog pages update

   ```tsx
   // app/blog/[slug]/page.tsx
   import dynamic from 'next/dynamic';

   const SafeHtml = dynamic(
     () => import('@/lib/infrastructure/security/xss-protection').then(m => m.SafeHtml),
     { ssr: false }
   );
   ```

4. Test & Verify
   - Build test: `npm run build`
   - SSR test: Blog post render
   - Client hydration test

**Acceptance Criteria:**

- ✅ Build passes without errors
- ✅ Blog posts render on server
- ✅ Client-side XSS protection works
- ✅ No hydration mismatch

---

#### Task 1.2: Duplicate Prop Fixes

**Priority:** HIGH  
**Effort:** 30 min

**Files:**

- `components/ui/UnifiedImage.tsx` - ✅ FIXED (Sprint 3)

**Kalan İşler:**

- Duplicate check for other UI components
- ESLint rule enforcement

---

#### Task 1.3: Old/Backup File Cleanup

**Priority:** MEDIUM  
**Effort:** 30 min

**Dosyalar:**

- ✅ `hooks/business/useAdminDashboard.old.ts` - Deleted (Sprint 3)

**Tarama:**

```bash
# Find all .old.* files
find . -name "*.old.*" -type f

# Find backup files
find . -name "*.backup.*" -type f
find . -name "*~" -type f
```

**Action:** Delete all found files

---

#### Task 1.4: Import Path Fixes

**Priority:** HIGH  
**Effort:** 30 min

**Files:**

- `lib/api/admin-dashboard.ts` - ✅ FIXED
  ```typescript
  // ❌ Wrong: import type { ApiResponse } from '@/types/api';
  // ✅ Right: import type { ApiResponse } from '@/types/shared/api';
  ```

**Tarama:**

```bash
# Find all broken imports
grep -r "from '@/types/api'" . --include="*.ts" --include="*.tsx"
```

---

### Phase 2: Build Optimization (1-2 hours)

#### Task 2.1: TypeScript Strict Mode Cleanup

**Priority:** MEDIUM  
**Effort:** 1 hour

**Action Items:**

1. Fix all `@ts-expect-error` warnings
2. Remove unused `@ts-ignore` comments
3. Add proper type assertions with comments

**Example:**

```typescript
// Before
// @ts-expect-error - typing issue
const data = fetchData();

// After
const data = fetchData() as DataType; // Type assertion: API returns DataType but typing is incomplete
```

---

#### Task 2.2: Unused Import Cleanup

**Priority:** LOW  
**Effort:** 30 min

**ESLint Errors:**

```
'NotificationPreferences' is defined but never used
'SomeType' is defined but never used
```

**Tool:**

```bash
# Run ESLint fix
npm run lint -- --fix

# Manual review
npm run lint
```

---

#### Task 2.3: Build Warning Fixes

**Priority:** LOW  
**Effort:** 30 min

**Warnings:**

- jsdom version mismatch (26.1.0 vs 27.0.1)
- Package duplication warnings

**Actions:**

1. Update package-lock.json

   ```bash
   npm dedupe
   npm audit fix
   ```

2. Check peer dependencies
   ```bash
   npm ls jsdom
   npm why jsdom
   ```

---

### Phase 3: Testing & Validation (1 hour)

#### Task 3.1: Build Tests

**Priority:** HIGH  
**Effort:** 30 min

**Tests:**

```bash
# Clean build
rm -rf .next
npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

**Validation:**

- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Build completes successfully
- ✅ All pages compile

---

#### Task 3.2: Runtime Tests

**Priority:** HIGH  
**Effort:** 30 min

**Manual Tests:**

1. Homepage render
2. Blog post render (`/blog/[slug]`)
3. Admin dashboard
4. Notification settings
5. User dashboard

**E2E Tests:**

```bash
npm run test:e2e -- blog-post.spec.ts
```

---

## 🎯 Success Metrics

### Build Health

- ✅ `npm run build` success rate: 100%
- ✅ Build time: < 60 seconds
- ✅ TypeScript errors: 0
- ✅ ESLint errors: 0

### Runtime Stability

- ✅ SSR pages render without errors
- ✅ Client hydration: no mismatches
- ✅ XSS protection functional
- ✅ No console errors in production

### Code Quality

- ✅ No `.old` or backup files
- ✅ All imports resolved
- ✅ Type safety: 95%+
- ✅ No deprecated API usage

---

## 📊 Risk Assessment

### High Risk

⚠️ **isomorphic-dompurify removal**

- **Risk:** Breaking XSS protection
- **Mitigation:** Comprehensive testing, staged rollout
- **Rollback:** Keep old version in git history

### Medium Risk

⚠️ **Type assertion changes**

- **Risk:** Runtime type errors
- **Mitigation:** Add runtime validation
- **Rollback:** Revert to `any` types

### Low Risk

✅ **File cleanup**

- **Risk:** Accidental deletion of active files
- **Mitigation:** Git backup, careful review
- **Rollback:** Git revert

---

## 🚀 Deployment Plan

### Stage 1: Development

1. Apply all fixes
2. Run full build
3. Manual testing
4. Commit changes

### Stage 2: Staging

1. Deploy to staging
2. Smoke tests
3. Performance monitoring
4. 24-hour soak test

### Stage 3: Production

1. Blue-green deployment
2. Canary release (10% traffic)
3. Monitor error rates
4. Full rollout if stable

---

## 📝 Implementation Notes

### DOMPurify Migration

```typescript
// New implementation
import DOMPurify from 'dompurify';

export const sanitizeHtml = (
  html: string,
  config: Config = SANITIZE_CONFIG.BASIC
): string => {
  // Server-side: Skip sanitization
  // Backend already sanitizes content
  if (typeof window === 'undefined') {
    return html;
  }

  // Client-side: Full DOMPurify sanitization
  return DOMPurify.sanitize(html, config);
};

// React component
'use client';
export function SafeHtml({ html, config = 'BASIC' }: SafeHtmlProps) {
  const [clean, setClean] = useState('');

  useEffect(() => {
    setClean(sanitizeHtml(html, SANITIZE_CONFIG[config]));
  }, [html, config]);

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### Blog Post Update

```tsx
// app/blog/[slug]/page.tsx
import dynamic from 'next/dynamic';

// Dynamic import for client-only component
const SafeHtml = dynamic(
  () => import('@/lib/infrastructure/security/xss-protection')
    .then(mod => ({ default: mod.SafeHtml })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse">Loading content...</div>
  }
);

export default function BlogPostPage({ params }) {
  // ... fetch post data

  return (
    <article>
      <SafeHtml html={post.content} config="RICH" />
    </article>
  );
}
```

---

## 🔄 Next Steps After Sprint 4

### Sprint 5 Candidates

1. **E2E Test Coverage** - Increase from 30% to 80%
2. **Performance Optimization** - LCP < 2.5s, FID < 100ms
3. **Accessibility Audit** - WCAG 2.1 AA compliance
4. **Security Hardening** - CSP headers, rate limiting
5. **Monitoring Setup** - Sentry, LogRocket integration

---

## 📈 Progress Tracking

### Checklist

- [ ] Task 1.1: isomorphic-dompurify replacement
- [ ] Task 1.2: Duplicate prop fixes review
- [ ] Task 1.3: Old file cleanup
- [ ] Task 1.4: Import path fixes
- [ ] Task 2.1: TypeScript strict mode cleanup
- [ ] Task 2.2: Unused import cleanup
- [ ] Task 2.3: Build warning fixes
- [ ] Task 3.1: Build tests
- [ ] Task 3.2: Runtime tests
- [ ] Documentation update
- [ ] Code review
- [ ] Staging deployment
- [ ] Production deployment

### Time Tracking

| Phase                   | Estimated | Actual | Status          |
| ----------------------- | --------- | ------ | --------------- |
| Phase 1: Critical Fixes | 2-3h      | -      | Not Started     |
| Phase 2: Optimization   | 1-2h      | -      | Not Started     |
| Phase 3: Testing        | 1h        | -      | Not Started     |
| **Total**               | **4-6h**  | **-**  | **Not Started** |

---

_Sprint 4: Build Stability & SSR Fixes_  
_Priority: CRITICAL - Production Blocker_  
_Status: Planning Complete - Ready to Start_
