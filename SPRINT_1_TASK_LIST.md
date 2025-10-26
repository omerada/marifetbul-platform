# 🎯 SPRINT 1: ROUTING & NAVIGATION CLEANUP - Task Listesi

**Sprint Hedefi:** Duplicate route yapılarını temizle, tutarlı navigasyon sağla
**Sprint Süresi:** 8 gün  
**Takım:** 2 Frontend Developer, 1 QA Engineer  
**Sprint Başlangıç:** [TBD]

---

## 📋 Epic Breakdown

### **EPIC 1: Package Routes Cleanup** (3 gün / 24 saat)

#### **Story 1.1: Route Migration** (1 gün / 8 saat)

**Priority:** P0 - CRITICAL  
**Assignee:** [Frontend Dev 1]

**Tasks:**

- [ ] `T1.1.1` Mevcut route kullanımlarını dokümante et (2h)
  - grep ile tüm `/packages/[id]` ve `/packages-detail` kullanımlarını bul
  - Excel/Notion'da liste çıkar
  - Screenshot'lar al (dokümantasyon için)

- [ ] `T1.1.2` Eski route dosyalarını sil (1h)

  ```bash
  rm -rf app/marketplace/packages-detail/
  rm app/marketplace/packages/[id]/page.tsx
  ```

  - Git commit: "feat: remove duplicate package routes"

- [ ] `T1.1.3` Slug route'unu kontrol et ve optimize et (2h)
  - `app/marketplace/packages/[slug]/page.tsx` review
  - Error handling ekle
  - Loading states güncelle

- [ ] `T1.1.4` Redirect API route oluştur (3h)
  - `app/api/redirect-to-slug/route.ts` yaz
  - ID → slug lookup logic
  - Error handling
  - Unit test yaz

**Definition of Done:**

- ✅ Sadece `/marketplace/packages/[slug]` route'u var
- ✅ Redirect API çalışıyor
- ✅ Tests passing
- ✅ Code reviewed

---

#### **Story 1.2: Component Consolidation** (1 gün / 8 saat)

**Priority:** P0 - CRITICAL  
**Assignee:** [Frontend Dev 1]

**Tasks:**

- [ ] `T1.2.1` ServiceDetail component'lerini karşılaştır (2h)

  ```bash
  diff components/shared/features/ServiceDetail.tsx \
       components/domains/packages/ServiceDetail.tsx
  ```

  - Farkları dokümante et
  - En güncel versiyonu belirle

- [ ] `T1.2.2` Duplicate component'i sil (1h)

  ```bash
  rm components/shared/features/ServiceDetail.tsx
  ```

- [ ] `T1.2.3` Index export'ları güncelle (2h)
  - `components/shared/features/index.ts` düzenle
  - ServiceDetail export'unu kaldır
  - Tüm import'ları kontrol et

- [ ] `T1.2.4` Import path'lerini güncelle (3h)
  - Global search/replace:
    ```
    From: @/components/shared/features/ServiceDetail
    To: @/components/domains/packages/ServiceDetail
    ```
  - Tüm dosyalarda kontrol et
  - TypeScript errors çöz

**Definition of Done:**

- ✅ Tek ServiceDetail component kaldı
- ✅ Tüm import'lar doğru
- ✅ No TypeScript errors
- ✅ Tests updated & passing

---

#### **Story 1.3: Global Link Updates** (1 gün / 8 saat)

**Priority:** P0 - CRITICAL  
**Assignee:** [Frontend Dev 2]

**Tasks:**

- [ ] `T1.3.1` Link usage audit (2h)

  ```bash
  grep -r "packages\/\${.*id" components/ app/ lib/
  grep -r "packages-detail" components/ app/ lib/
  ```

  - Değiştirilecek dosya listesi çıkar

- [ ] `T1.3.2` Component link updates (3h)
  - `components/**/*.tsx` dosyalarında:
    - `/packages/${id}` → `/packages/${slug}`
    - `/packages-detail/${id}` → `/packages/${slug}`
  - Slug variable'ının mevcut olduğundan emin ol

- [ ] `T1.3.3` API client updates (2h)

  ```typescript
  // lib/api/packages.ts

  // Update function
  export async function fetchPackageBySlug(slug: string) {
    return apiClient.get(`/api/v1/packages/slug/${slug}`);
  }

  // Keep for backward compatibility
  export async function fetchPackageById(id: string) {
    const pkg = await apiClient.get(`/api/v1/packages/${id}`);
    return { ...pkg, redirectTo: `/marketplace/packages/${pkg.slug}` };
  }
  ```

- [ ] `T1.3.4` Verification & testing (1h)
  - Manuel test: Her değişen link'i test et
  - Browser console'da error kontrolü

**Definition of Done:**

- ✅ Tüm internal linkler slug kullanıyor
- ✅ ID-based links backward compatible
- ✅ No broken links
- ✅ Manual testing completed

---

### **EPIC 2: Contact & Help Cleanup** (1 gün / 8 saat)

#### **Story 2.1: Remove Redirect Pages** (0.5 gün / 4 saat)

**Priority:** P1 - HIGH  
**Assignee:** [Frontend Dev 2]

**Tasks:**

- [ ] `T2.1.1` Redirect pages'i sil (0.5h)

  ```bash
  rm app/contact/page.tsx
  rm app/help/page.tsx
  ```

- [ ] `T2.1.2` next.config.js redirectlerini verify et (1h)
  - `/contact` → `/info/contact` redirect test
  - `/help` → `/support/help` redirect test
  - Production build ile test et

- [ ] `T2.1.3` Sitemap güncelle (1h)
  - `app/sitemap.ts` kontrol et
  - Removed routes varsa temizle
  - New route priority'leri ayarla

- [ ] `T2.1.4` Google Search Console update (1.5h)
  - Old URLs'i new URLs'e map et
  - 301 redirects submit et
  - Coverage report kontrol et

**Definition of Done:**

- ✅ `/contact` ve `/help` dosyaları yok
- ✅ Redirectler çalışıyor (prod-like test)
- ✅ Sitemap updated
- ✅ GSC submitted

---

### **EPIC 3: Marketplace Hub Implementation** (2 gün / 16 saat)

#### **Story 3.1: Hub Page Design & Implementation** (1.5 gün / 12 saat)

**Priority:** P1 - HIGH  
**Assignee:** [Frontend Dev 1]

**Tasks:**

- [ ] `T3.1.1` Component architecture planning (2h)

  ```
  MarketplaceHub/
  ├── FeaturedPackages
  ├── TopFreelancers
  ├── RecentJobs
  ├── CategoryBrowser
  └── PopularSkills
  ```

  - Wireframe çiz
  - Component breakdown

- [ ] `T3.1.2` MarketplaceHub component (3h)

  ```typescript
  // components/domains/marketplace/MarketplaceHub.tsx
  export function MarketplaceHub() {
    const { featured, topFreelancers, recentJobs } = useMarketplaceData();

    return (
      <div className="space-y-12">
        <HeroSection />
        <FeaturedPackages packages={featured} />
        <TopFreelancers freelancers={topFreelancers} />
        <RecentJobs jobs={recentJobs} />
        <CategoryBrowser />
      </div>
    );
  }
  ```

- [ ] `T3.1.3` Sub-components (4h)
  - FeaturedPackages.tsx (1h)
  - TopFreelancers.tsx (1h)
  - RecentJobs.tsx (1h)
  - CategoryBrowser.tsx (1h)

- [ ] `T3.1.4` Page integration (2h)

  ```typescript
  // app/marketplace/page.tsx
  import { MarketplaceHub } from '@/components/domains/marketplace';

  export default function MarketplacePage() {
    return (
      <AppLayout>
        <MarketplaceHub />
      </AppLayout>
    );
  }
  ```

- [ ] `T3.1.5` Responsive design (1h)
  - Mobile breakpoints
  - Tablet view
  - Desktop grid

**Definition of Done:**

- ✅ All components created
- ✅ Page renders correctly
- ✅ Mobile responsive
- ✅ Performance optimized (lazy loading)

---

#### **Story 3.2: Data Fetching & Integration** (0.5 gün / 4 saat)

**Priority:** P1 - HIGH  
**Assignee:** [Frontend Dev 1]

**Tasks:**

- [ ] `T3.2.1` API endpoints (2h)

  ```typescript
  // lib/api/marketplace.ts
  export async function fetchMarketplaceData() {
    const [featured, topFreelancers, recentJobs] = await Promise.all([
      apiClient.get('/api/v1/packages/featured'),
      apiClient.get('/api/v1/users/top-freelancers'),
      apiClient.get('/api/v1/jobs/recent'),
    ]);
    return { featured, topFreelancers, recentJobs };
  }
  ```

- [ ] `T3.2.2` Custom hook (1h)

  ```typescript
  // hooks/business/useMarketplaceData.ts
  export function useMarketplaceData() {
    return useSWR('/marketplace/data', fetchMarketplaceData, {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    });
  }
  ```

- [ ] `T3.2.3` Error & loading states (1h)
  - Skeleton components
  - Error boundaries
  - Retry logic

**Definition of Done:**

- ✅ Data fetching works
- ✅ Loading states implemented
- ✅ Error handling works
- ✅ Cache configured

---

### **EPIC 4: Navigation Consistency** (2 gün / 16 saat)

#### **Story 4.1: Navigation Audit & Standardization** (1 gün / 8 saat)

**Priority:** P1 - HIGH  
**Assignee:** [Frontend Dev 2]

**Tasks:**

- [ ] `T4.1.1` Navigation components inventory (2h)

  ```bash
  # Find all navigation-related components
  find components/layout -name "*Nav*.tsx" -o -name "*Menu*.tsx"
  ```

  - Header.tsx
  - Footer.tsx
  - MobileMenu.tsx
  - Sidebar.tsx (if exists)
  - Dokümante et

- [ ] `T4.1.2` Link standardization (3h)

  ```typescript
  // lib/config/navigation.ts
  export const marketplaceNavigation = [
    { href: '/marketplace', label: 'Keşfet', icon: Search },
    { href: '/marketplace/packages', label: 'Paketler', icon: Package },
    { href: '/marketplace/jobs', label: 'İşler', icon: Briefcase },
    { href: '/marketplace/categories', label: 'Kategoriler', icon: Grid },
  ] as const;
  ```

  - Centralized navigation config
  - Tüm navigation'larda kullan

- [ ] `T4.1.3` Active state implementation (2h)

  ```typescript
  // components/layout/NavLink.tsx
  export function NavLink({ href, label, icon }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + '/');

    return (
      <Link
        href={href}
        className={cn(
          'nav-link',
          isActive && 'nav-link-active'
        )}
      >
        {icon && <icon />}
        {label}
      </Link>
    );
  }
  ```

- [ ] `T4.1.4` Apply to all navigations (1h)
  - Update Header
  - Update Footer
  - Update MobileMenu

**Definition of Done:**

- ✅ Centralized navigation config
- ✅ All navigations use same links
- ✅ Active states working
- ✅ Consistent styling

---

#### **Story 4.2: Breadcrumbs & Mobile Menu** (1 gün / 8 saat)

**Priority:** P2 - MEDIUM  
**Assignee:** [Frontend Dev 2]

**Tasks:**

- [ ] `T4.2.1` Breadcrumb component (3h)

  ```typescript
  // components/layout/Breadcrumbs.tsx
  export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {segments.map((segment, index) => (
            <BreadcrumbItem
              key={segment}
              href={`/${segments.slice(0, index + 1).join('/')}`}
              label={formatSegment(segment)}
              isLast={index === segments.length - 1}
            />
          ))}
        </ol>
      </nav>
    );
  }
  ```

- [ ] `T4.2.2` Mobile menu improvements (3h)
  - Hamburger animation
  - Smooth transitions
  - Keyboard navigation
  - A11y improvements

- [ ] `T4.2.3` Desktop/mobile consistency (2h)
  - Same links on both
  - Responsive breakpoints
  - User preference save (open/closed state)

**Definition of Done:**

- ✅ Breadcrumbs working
- ✅ Mobile menu improved
- ✅ Desktop/mobile consistent
- ✅ Accessibility compliant

---

### **EPIC 5: Testing & QA** (0 gün - Parallel)

#### **Story 5.1: E2E Tests** (Throughout sprint)

**Priority:** P0 - CRITICAL  
**Assignee:** [QA Engineer]

**Tasks:**

- [ ] `T5.1.1` Package route tests (2h)

  ```typescript
  // tests/e2e/package-routes.spec.ts
  test('slug route works', async ({ page }) => {
    await page.goto('/marketplace/packages/web-development');
    await expect(page).toHaveURL(/\/marketplace\/packages\/[a-z-]+$/);
  });

  test('ID redirects to slug', async ({ page }) => {
    await page.goto('/marketplace/packages/uuid-here');
    await expect(page).toHaveURL(/\/marketplace\/packages\/[a-z-]+$/);
  });
  ```

- [ ] `T5.1.2` Navigation tests (2h)
  - All menu links work
  - Active states correct
  - Mobile menu functions

- [ ] `T5.1.3` Redirect tests (1h)
  - `/contact` redirects
  - `/help` redirects
  - Old package URLs redirect

- [ ] `T5.1.4` Marketplace hub tests (2h)
  - Data loads correctly
  - Components render
  - Links are functional

**Definition of Done:**

- ✅ All E2E tests passing
- ✅ Coverage > 80%
- ✅ No flaky tests
- ✅ CI/CD pipeline green

---

#### **Story 5.2: Manual QA** (Day 7-8)

**Priority:** P0 - CRITICAL  
**Assignee:** [QA Engineer]

**Test Scenarios:**

- [ ] `T5.2.1` Cross-browser testing (3h)
  - Chrome ✅
  - Firefox ✅
  - Safari ✅
  - Edge ✅

- [ ] `T5.2.2` Mobile devices (3h)
  - iOS Safari
  - Android Chrome
  - Tablet views

- [ ] `T5.2.3` User flows (4h)
  - Browse marketplace → View package → Checkout
  - Search → Results → Package detail
  - Menu navigation → All pages accessible

- [ ] `T5.2.4` Performance testing (2h)
  - Lighthouse scores > 90
  - Page load < 2s
  - No console errors

**Definition of Done:**

- ✅ All scenarios passed
- ✅ No critical bugs
- ✅ Performance acceptable
- ✅ Sign-off from QA lead

---

## 📊 Sprint Tracking

### Daily Standup Template

**What did you do yesterday?**

- Task ID + brief description

**What will you do today?**

- Task ID + plan

**Any blockers?**

- Issue + need help from who

---

### Sprint Burndown Chart

```
Day 1: 64 hours remaining
Day 2: 56 hours remaining (ideal: 56)
Day 3: 48 hours remaining (ideal: 48)
Day 4: 40 hours remaining (ideal: 40)
Day 5: 32 hours remaining (ideal: 32)
Day 6: 24 hours remaining (ideal: 24)
Day 7: 16 hours remaining (ideal: 16)
Day 8: 0 hours remaining (ideal: 0)
```

---

## ✅ Sprint Definition of Done

**Code:**

- [ ] All tasks completed
- [ ] Code reviewed (2 approvals minimum)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tests passing (unit + E2E)

**Documentation:**

- [ ] README.md updated
- [ ] CHANGELOG.md entry added
- [ ] API docs updated (if needed)
- [ ] Migration guide written

**QA:**

- [ ] Manual testing completed
- [ ] Cross-browser verified
- [ ] Mobile responsive confirmed
- [ ] Performance benchmarks met

**Deployment:**

- [ ] Staging deployed & tested
- [ ] Production deployment plan ready
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

---

## 🚨 Risk Register

### Risk 1: External Links Breakage

**Probability:** Medium  
**Impact:** High  
**Mitigation:** 301 redirects + GSC update

### Risk 2: Team Velocity Lower Than Expected

**Probability:** Medium  
**Impact:** Medium  
**Mitigation:** De-scope Story 4.2 if needed

### Risk 3: Unexpected Backend Issues

**Probability:** Low  
**Impact:** High  
**Mitigation:** Backend team on standby

---

## 📞 Contacts

**Sprint Master:** [TBD]  
**Tech Lead:** [TBD]  
**Frontend Devs:** [Dev 1], [Dev 2]  
**QA Engineer:** [QA]  
**Product Owner:** [PO]

---

## 🎉 Sprint Retrospective (End of Sprint)

**Template:**

**What went well? ✅**

- ...

**What didn't go well? ❌**

- ...

**Action items for next sprint 🎯**

- ...

---

**Sprint 1 Task List - Ready for Implementation** 🚀
