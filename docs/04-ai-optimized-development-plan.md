# AI Agent Optimized Geliştirme Planı

## 🤖 AI Agent İçin MVP Geliştirme Aşamaları

### Genel Proje Timeline

- **Toplam Süre**: 8-10 hafta
- **Yaklaşım**: AI Agent ile iterative development
- **Metodoloji**: Dokümantasyon-driven development
- **Quality Gates**: Her phase sonunda code review

---

## 🏗️ Phase 1: Foundation & Authentication (2 hafta)

### AI Agent Görev 1.1: Proje Foundation (3-4 gün)

#### Ana Talimat Prompt:

```
GÖREV: Marifeto projesinin foundation'ını kur

ADIMLAR:
1. Next.js 14 projesi oluştur (TypeScript + Tailwind)
2. Proje yapısını docs/01-frontend-architecture.md'ye göre organize et
3. Base UI component library'sini başlat (docs/05-component-structure.md)
4. MSW mock API'yi kur (docs/03-mock-api-services.md)
5. Development environment'ı hazırla

ÇIKTILAR:
- Çalışan Next.js development server
- Base component library (Button, Input, Card, Modal)
- Mock API endpoints (auth + basic data)
- Responsive layout structure
- TypeScript strict mode working

TEST KRİTERLERİ:
- npm run dev çalışıyor
- Temel sayfalar render oluyor
- Mock API endpoints response veriyor
- ESLint/TypeScript errors yok
```

#### Beklenen Dosyalar:

```
✅ app/layout.tsx - Root layout
✅ app/page.tsx - Landing page
✅ components/ui/Button/ - Button component
✅ components/ui/Input/ - Input component
✅ components/ui/Card/ - Card component
✅ components/layout/Header/ - Header component
✅ lib/utils.ts - Utility functions
✅ mocks/handlers.ts - MSW handlers
✅ types/index.ts - Type definitions
```

### AI Agent Görev 1.2: Authentication System (3-4 gün)

#### Ana Talimat Prompt:

```
GÖREV: Complete authentication system geliştir

REFERANS DOKÜMANTASYON:
- docs/02-user-flows-screens.md#authentication
- docs/03-mock-api-services.md#authentication-endpoints
- docs/08-advanced-page-structure.md#landing-page

GEREKSINIMLER:
1. Login/Register sayfaları (responsive)
2. Form validation (React Hook Form + Zod)
3. Auth state management (Zustand)
4. Protected routes middleware
5. User type selection (Freelancer/Employer)
6. JWT token persistence

ÇIKTILAR:
- /login ve /register sayfaları
- Auth store ve hooks
- Protected route wrapper
- Role-based navigation
- Error handling ve loading states

TEST SENARYOLARI:
- Kayıt flow end-to-end çalışıyor
- Login başarılı olunca dashboard'a yönlendiriyor
- Protected routes unauthorized erişimi engelliyor
- Token browser refresh'te persist ediyor
```

#### Kabul Kriterleri:

- ✅ Kullanıcı kayıt/giriş yapabiliyor
- ✅ Role selection çalışıyor
- ✅ Protected routes active
- ✅ Mobile responsive
- ✅ Error handling implemented

---

## 🎯 Phase 2: Core Marketplace Features (3 hafta)

### AI Agent Görev 2.1: Hibrit Marketplace (4-5 gün)

#### Ana Talimat Prompt:

```
GÖREV: Hibrit marketplace sistemini geliştir

REFERANS DOKÜMANTASYON:
- docs/08-advanced-page-structure.md#marketplace-sayfaları
- docs/03-mock-api-services.md#jobs-endpoints
- docs/07-mock-data-examples.md#mock-jobs-data

ÖZELLİKLER:
1. /marketplace ana sayfası
2. Toggle interface (Services ⟷ Jobs)
3. Smart filtering system
4. Responsive card layouts
5. Infinite scroll
6. Search functionality

LAYOUT GEREKSINIMLERI:
- Desktop: Sidebar filters + Grid layout
- Mobile: Stack layout + Bottom sheet filters
- Smooth transitions between views
- Loading states ve error handling

ÇIKTILAR:
- Marketplace ana sayfası
- ServiceCard ve JobCard componentleri
- Filter components
- Search infrastructure
- Mobile optimization

TEST SENARYOLARI:
- Toggle Services/Jobs çalışıyor
- Filtering results correct
- Infinite scroll loading
- Mobile touch interactions
- Search suggestions working
```

### AI Agent Görev 2.2: Detail Pages & Interactions (4-5 gün)

#### Ana Talimat Prompt:

```
GÖREV: Detail pages ve user interactions geliştir

SAYFALAR:
1. /packages/[id] - Service detail
2. /jobs/[id] - Job detail
3. /profile/[id] - User profiles
4. Proposal submission flow

REFERANS:
- docs/02-user-flows-screens.md#detail-pages
- docs/05-component-structure.md#feature-components

INTERACTIONS:
- Service ordering flow
- Job proposal submission
- Profile viewing
- Contact/messaging init
- Favorite/bookmark system

ÇIKTILAR:
- Responsive detail layouts
- Interactive forms
- Image galleries
- User profile displays
- CTA flows working

PERFORMANCE:
- Image optimization
- SEO meta tags
- Loading skeletons
- Error boundaries
```

### AI Agent Görev 2.3: User Profiles & Management (3-4 gün)

#### Ana Talimat Prompt:

```
GÖREV: User profile system geliştir

PROFILE TYPES:
1. Freelancer public profile
2. Employer public profile
3. Profile edit interface
4. Portfolio/work samples

FEATURES:
- Profile photo upload
- Skills selection
- Portfolio gallery
- Review/rating display
- Contact information
- Social links

REFERANS:
- docs/02-user-flows-screens.md#profile-sayfaları
- docs/05-component-structure.md#profile-components

ÇIKTILAR:
- /profile/[id] public pages
- /profile/edit interface
- File upload component
- Skills selector
- Portfolio manager
```

---

## 🎨 Phase 3: Dashboard & Polish (2 hafta)

### AI Agent Görev 3.1: Smart Dashboard (4-5 gün)

#### Ana Talimat Prompt:

```
GÖREV: Unified dashboard system geliştir

REFERANS:
- docs/08-advanced-page-structure.md#dashboard-integration
- docs/02-user-flows-screens.md#dashboard-sayfaları

FEATURES:
1. /dashboard - Smart routing based on user type
2. Stats cards (contextual to user type)
3. Quick actions panel
4. Recent activity feed
5. Switch view functionality

DASHBOARD VIEWS:
- Freelancer: Proposals, earnings, profile views
- Employer: Posted jobs, received proposals, budget
- Universal: Messages, notifications, completed work

ÇIKTILAR:
- Responsive dashboard layout
- Interactive charts/stats
- Quick action buttons
- Activity timeline
- View switching

PERFORMANCE:
- Real-time data updates (mock)
- Optimistic UI updates
- Skeleton loading states
```

### AI Agent Görev 3.2: Polish & Mobile Optimization (3-4 gün)

#### Ana Talimat Prompt:

```
GÖREV: Mobile optimization ve final polish

POLISH AREAS:
1. Mobile navigation patterns
2. Touch interactions
3. Animation polish
4. Performance optimization
5. Accessibility improvements

MOBILE SPECIFIC:
- Bottom navigation
- Swipe gestures
- Pull-to-refresh
- Bottom sheets
- Touch-friendly buttons

REFERANS:
- docs/05-component-structure.md#mobile-components
- docs/08-advanced-page-structure.md#responsive-geçişler

ÇIKTILAR:
- Polished mobile experience
- Smooth animations
- Accessibility compliance
- Performance optimizations
- Cross-browser testing

QUALITY GATES:
- Lighthouse score >85
- Mobile usability 100%
- No console errors
- TypeScript strict mode
```

---

## 🔧 AI Agent Development Workflow

### Her Görev Öncesi Checklist:

```
HAZIRLIK:
□ İlgili dokümantasyon dosyalarını oku
□ Mevcut codebase'i analiz et
□ Dependencies güncel mi kontrol et
□ Git status temiz mi kontrol et

GELİŞTİRME:
□ Feature branch oluştur
□ Component interfaces tanımla
□ Mock API endpoints implement et
□ Responsive design uygula
□ Error handling ekle
□ Loading states ekle

KALITE KONTROL:
□ TypeScript errors fix
□ ESLint warnings temizle
□ Mobile responsive test
□ Accessibility kontrol
□ Performance check
□ Cross-browser basic test

FİNALİZE:
□ Git commit (meaningful messages)
□ Progress report hazırla
□ Next steps belirt
□ Blocking issues report
```

### Code Quality Standards:

#### TypeScript Strict Mode

```typescript
// ✅ Required - Always use proper typing
interface ComponentProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// ❌ Forbidden - No any usage
function Component(props: any) { ... }
```

#### Error Handling Pattern

```typescript
// ✅ Required - Proper error boundaries
function ComponentWithError() {
  const { data, error, isLoading } = useSWR("/api/data");

  if (error) return <ErrorFallback error={error} />;
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

#### Mobile-First CSS

```css
/* ✅ Required - Mobile first approach */
.component {
  /* Mobile styles (default) */
  display: flex;
  flex-direction: column;

  /* Tablet and up */
  @media (min-width: 768px) {
    flex-direction: row;
  }

  /* Desktop and up */
  @media (min-width: 1024px) {
    gap: 2rem;
  }
}
```

---

## 📊 Success Metrics per Phase

### Phase 1 Success Criteria:

- ✅ Authentication flow 100% functional
- ✅ Base components library ready
- ✅ Mobile responsive foundation
- ✅ Mock API integration working
- ✅ TypeScript coverage >95%

### Phase 2 Success Criteria:

- ✅ Marketplace browsing functional
- ✅ Detail pages with interactions
- ✅ User profiles complete
- ✅ Cross-platform compatibility
- ✅ Performance score >80

### Phase 3 Success Criteria:

- ✅ Dashboard fully functional
- ✅ Mobile experience polished
- ✅ Accessibility compliance
- ✅ Production-ready code
- ✅ Documentation updated

---

## 🚀 Continuous Integration Points

### After Each Major Feature:

1. **Code Review Simulation**

   - Run automated quality checks
   - Test responsive breakpoints
   - Validate TypeScript strict mode
   - Check accessibility basics

2. **Feature Demo Preparation**

   - Create demo scenarios
   - Test user flows end-to-end
   - Document any limitations
   - Prepare next iteration plans

3. **Backlog Grooming**
   - Update development plan
   - Identify blocking dependencies
   - Prioritize bug fixes
   - Plan performance optimizations

Bu optimized plan ile AI agent, Marifeto projesini verimli ve kaliteli şekilde geliştirebilecek.
