# 🤖 AI Agent Production-Ready Analiz ve Refactoring Talimat Promptu

## 📋 Genel Bilgi

**Proje Adı**: MarifetBul - Türkiye'nin Freelance Platformu  
**Teknoloji Stack**:

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Spring Boot 3.2.0 + Java 17 + PostgreSQL
- **Mimari**: Clean Architecture + DDD + Layered Architecture

**Tarih**: 13 Ekim 2025  
**Analiz Seviyesi**: Production-Ready Deep Inspection  
**Hedef**: %100 Production-Ready, Clean, Maintainable, Performant

---

## 🎯 GÖREV TANIMI

Sen üst düzey bir **Software Architect** ve **Spring Boot Expert**'sin. Görevin, MarifetBul projesini baştan sona **detaylı ve sistematik** bir şekilde analiz edip, production-ready durumunu değerlendirmek ve gerekli düzenlemeleri yapmaktır.

---

## 📐 ANALİZ KRİTERLERİ

### 1️⃣ BACKEND ANALİZİ (Spring Boot)

#### A. Mimari Kalite

- [ ] Clean Architecture prensiplerine uygunluk
- [ ] Domain-Driven Design (DDD) implementasyonu
- [ ] Layered architecture (Controller → Service → Repository) düzeni
- [ ] Separation of concerns kontrolü
- [ ] SOLID prensipleri uygulaması

#### B. Domain Implementation

- [ ] Tüm domain modellerin completeness kontrolü
- [ ] Entity relationships ve foreign keys
- [ ] Business logic yerleşimi (Domain vs Service layer)
- [ ] DTO ve Mapper kullanımı
- [ ] Validation annotations kontrolü

#### C. Database Design

- [ ] Flyway migrations durumu (tüm versiyonlar applied mı?)
- [ ] Index kullanımı (performance için kritik)
- [ ] Foreign key constraints
- [ ] Cascade operations
- [ ] Rollback scripts varlığı
- [ ] Data integrity checks

#### D. Security Implementation

- [ ] JWT token authentication implementasyonu
- [ ] httpOnly cookies kullanımı
- [ ] CSRF protection aktif mi?
- [ ] Password hashing (BCrypt vs.)
- [ ] Role-based authorization (@PreAuthorize, @Secured)
- [ ] Security headers (HSTS, CSP, XSS Protection)
- [ ] SQL Injection prevention
- [ ] Rate limiting implementation

#### E. API Design

- [ ] RESTful API best practices
- [ ] Swagger/OpenAPI documentation
- [ ] ApiResponse<T> standardization
- [ ] Error handling consistency
- [ ] HTTP status codes doğruluğu
- [ ] Pagination implementation
- [ ] HATEOAS (optional)

#### F. Performance & Scalability

- [ ] Caching strategy (Redis, Caffeine)
- [ ] N+1 query problem kontrolü
- [ ] Lazy loading vs Eager loading
- [ ] Connection pooling configuration
- [ ] Query optimization
- [ ] Async operations (@Async)
- [ ] WebSocket implementation

#### G. Testing & Quality

- [ ] Unit tests coverage (hedef: >80%)
- [ ] Integration tests varlığı
- [ ] Test naming conventions
- [ ] Mocking strategies (Mockito)
- [ ] Test data management
- [ ] CI/CD test automation

#### H. DevOps & Deployment

- [ ] Docker configuration
- [ ] docker-compose.yml hazır mı?
- [ ] Environment-specific configs (.properties files)
- [ ] Health checks (Actuator)
- [ ] Monitoring setup (Prometheus, Grafana)
- [ ] Logging strategy (Logback, SLF4J)
- [ ] Error tracking (Sentry)

---

### 2️⃣ FRONTEND ANALİZİ (Next.js)

#### A. Mimari Kalite

- [ ] Component structure organization
- [ ] Custom hooks usage
- [ ] Context API vs State Management
- [ ] File/folder naming conventions
- [ ] Import/export organization
- [ ] Code splitting effectiveness

#### B. API Integration

- [ ] ✅ **KRİTİK**: API Client implementation
- [ ] ✅ **KRİTİK**: Backend entegrasyonu (MSW yerine gerçek API)
- [ ] Environment-based API URLs
- [ ] Error handling consistency
- [ ] Loading states
- [ ] Retry logic
- [ ] Request/response interceptors
- [ ] Authentication token management
- [ ] CSRF token handling

#### C. Mock Service Worker (MSW) Durumu

- [ ] ✅ **KRİTİK**: MSW production'da KAPALI mi?
- [ ] Feature flag kontrolü (NEXT_PUBLIC_ENABLE_MSW)
- [ ] MSW sadece development'ta mı çalışıyor?
- [ ] Webpack config'de MSW exclusion var mı?
- [ ] Mock handlers gereksiz kaldı mı?
- [ ] Test infrastructure ayrımı

#### D. State Management

- [ ] Zustand/Context usage
- [ ] Unnecessary re-renders
- [ ] State normalization
- [ ] Derived state vs stored state
- [ ] Async state handling (SWR, React Query)

#### E. Performance Optimization

- [ ] Image optimization (next/image)
- [ ] Code splitting & lazy loading
- [ ] Bundle size analysis
- [ ] Client-side vs Server-side rendering strategy
- [ ] Caching strategy
- [ ] Memoization (useMemo, useCallback)

#### F. Security

- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Input validation
- [ ] Sanitization
- [ ] Secure cookie handling
- [ ] Environment variable security

#### G. SEO & Accessibility

- [ ] Meta tags implementation
- [ ] robots.txt & sitemap.xml
- [ ] Semantic HTML
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

---

### 3️⃣ PRODUCTION READINESS CHECKS

#### A. Environment Configuration

- [ ] .env.example comprehensive mı?
- [ ] .env.local (development)
- [ ] .env.staging (staging)
- [ ] .env.production (production)
- [ ] Environment variable validation
- [ ] Secrets management (API keys, tokens)

#### B. Build & Deployment

- [ ] `npm run build` başarılı mı?
- [ ] Build warnings kontrolü
- [ ] TypeScript errors yok mu?
- [ ] ESLint errors yok mu?
- [ ] Bundle size acceptable mı? (<500KB ideal)
- [ ] Tree shaking working mı?

#### C. Error Handling

- [ ] Global error boundary
- [ ] API error handling
- [ ] User-friendly error messages
- [ ] Error logging (Sentry, custom logger)
- [ ] Fallback UI components

#### D. Monitoring & Observability

- [ ] Application metrics
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] User analytics
- [ ] Health checks

---

### 4️⃣ CODE QUALITY & MAINTAINABILITY

#### A. Duplicate Code

- [ ] ✅ **KRİTİK**: Duplicate API clients tespit et
- [ ] Duplicate utility functions
- [ ] Duplicate types/interfaces
- [ ] Duplicate components

#### B. Dead Code

- [ ] Unused imports
- [ ] Unused functions
- [ ] Unused components
- [ ] Unused files/folders
- [ ] Commented-out code blocks

#### C. Code Smells

- [ ] God objects/components
- [ ] Long methods (>50 lines)
- [ ] Deep nesting (>3 levels)
- [ ] Magic numbers/strings
- [ ] Poor naming conventions

#### D. Type Safety

- [ ] TypeScript strict mode
- [ ] `any` types usage (minimize)
- [ ] Type inference vs explicit types
- [ ] Generic type usage

---

## 🔍 ÖZEL FOK NOKTALARI

### ❗ KRİTİK SORUNLAR (ÖNCE BU KONTROL EDİLECEK)

#### 1. MSW (Mock Service Worker) Durumu

```bash
# Kontrol edilecek:
- lib/infrastructure/msw/ klasörü hala var mı?
- components/providers/MSWProvider.tsx aktif mi?
- public/mockServiceWorker.js dosyası production'a gidiyor mu?
- next.config.js içinde MSW exclusion var mı?
- NEXT_PUBLIC_ENABLE_MSW flag'i .env.production'da false mı?
```

**Beklenen Durum**:

- ✅ MSW sadece development'ta aktif
- ✅ Production build'de MSW kodu yok
- ✅ MSWProvider conditional olarak yükleniyor
- ✅ webpack config MSW'yi exclude ediyor

**Eğer MSW hala production'da aktifse → 🚨 ACİL DÜZELTİLMELİ**

#### 2. API Client Duplicates

```bash
# Bu dosyaları kontrol et:
- lib/api/client.ts (Ana unified client - KULLANILMALI)
- lib/infrastructure/api/client.ts (Duplicate - SİLİNMELİ)
- lib/shared/api/client.ts (Duplicate - SİLİNMELİ)
```

**Beklenen Durum**:

- ✅ Sadece `lib/api/client.ts` kullanılmalı
- ✅ Diğer client dosyaları silinmeli
- ✅ Tüm import'lar güncellenmiş olmalı

#### 3. Backend Integration

```typescript
// lib/api/client.ts içinde baseURL kontrolü:
constructor(baseURL?: string) {
  this.baseURL =
    baseURL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://api.marifetbul.com/api/v1'  // ✅ Gerçek backend
      : 'http://localhost:8080/api/v1');
}
```

**Beklenen Durum**:

- ✅ Development: localhost:8080/api/v1
- ✅ Production: api.marifetbul.com/api/v1
- ❌ ASLA: '/api' (Next.js routes - MSW proxy)

#### 4. Middleware Admin Protection

```typescript
// middleware.ts içinde:
if (isAdminRoute) {
  // ❌ HATA: Debug mode'da bypass yapılmış
  console.log('🔍 Admin route access attempt');
  const response = NextResponse.next();
  return addSecurityHeaders(response);

  // ✅ DOĞRU: Authentication kontrolü aktif olmalı
  // if (!token) {
  //   return NextResponse.redirect(adminLoginUrl);
  // }
  // if (userRole !== 'admin') {
  //   return NextResponse.redirect('/dashboard');
  // }
}
```

**Beklenen Durum**:

- ✅ Admin routes protected
- ✅ JWT token verification
- ✅ Role-based authorization
- ❌ Debug bypass kodu production'da olmamalı

---

## 🎬 ANALİZ ADIMLARI (SIRASINA UYULACAK)

### ADIM 1: Backend Verification (30 dakika)

1. Backend dizinine git: `cd marifetbul-backend`
2. Dependencies check: `mvn dependency:tree`
3. Build test: `mvn clean install`
4. Test coverage: `mvn test jacoco:report`
5. Backend başlat: `mvn spring-boot:run`
6. Swagger UI kontrol: `http://localhost:8080/swagger-ui/index.html`
7. Health check: `http://localhost:8080/actuator/health`
8. Database migrations: `psql -U postgres -d marifetbul -c "\dt"` (tablo sayısı)

**Kontrol Listesi**:

- [ ] Backend başlıyor mu?
- [ ] Swagger UI açılıyor mu?
- [ ] Test coverage %80+ mı?
- [ ] Database migration errors var mı?
- [ ] Security configs active mi?

### ADIM 2: Frontend Dependencies & Build (20 dakika)

1. Dependencies check: `npm ls`
2. Outdated packages: `npm outdated`
3. TypeScript check: `npm run type-check`
4. Lint check: `npm run lint`
5. Build test: `npm run build`
6. Build size: `ls -lh .next/static/chunks`

**Kontrol Listesi**:

- [ ] TypeScript errors yok mu?
- [ ] ESLint errors yok mu?
- [ ] Build başarılı mı?
- [ ] Bundle size <500KB mı?
- [ ] Tree shaking working mı?

### ADIM 3: MSW Investigation (45 dakika)

```bash
# MSW dosyalarını say
find lib -name "*msw*" -o -name "*mock*" | wc -l

# MSW import'larını bul
grep -r "msw" --include="*.ts" --include="*.tsx" .

# MSW handlers toplam satır sayısı
find lib/infrastructure/msw -name "*.ts" -exec wc -l {} + | tail -1
```

**Detaylı Analiz**:

1. MSWProvider component'i incele
2. next.config.js webpack config kontrol
3. .env files MSW flag kontrolü
4. app/layout.tsx MSWProvider conditional loading
5. public/mockServiceWorker.js varlığı

**Karar Matrisi**:

- MSW production'da aktif mi? → 🚨 Kritik, hemen düzelt
- MSW development-only mi? → ✅ Tamam, devam et
- MSW tamamen kaldırılmış mı? → ⭐ Mükemmel

### ADIM 4: API Client Unification (60 dakika)

```bash
# API client dosyalarını bul
find lib -name "client.ts" -o -name "api.ts"

# Her bir client'ın kullanım yerlerini bul
grep -r "from.*api.*client" --include="*.ts" --include="*.tsx" .
```

**Analiz**:

1. Her client dosyasını aç ve karşılaştır:
   - Hangi features var?
   - Hangi client en complete?
   - Authentication handling
   - Error handling
   - Retry logic
   - Caching

2. Unified client seç (muhtemelen `lib/api/client.ts`)

3. Diğer client kullanımlarını bul ve replace et:

```bash
# Örnek: infrastructure/api/client kullanımlarını bul
grep -r "infrastructure/api/client" --include="*.ts" .
```

4. Import'ları güncelle:

```typescript
// Eski
import { apiClient } from '@/lib/infrastructure/api/client';

// Yeni
import { apiClient } from '@/lib/api/client';
```

5. Test et: `npm run build && npm run type-check`

### ADIM 5: Backend Integration Verification (45 dakika)

1. Backend'i çalıştır (Terminal 1):

```bash
cd marifetbul-backend
mvn spring-boot:run
```

2. Frontend'i MSW'siz çalıştır (Terminal 2):

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MSW=false
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

npm run dev
```

3. Browser DevTools Network tab'da test et:
   - Login yap
   - API çağrılarını gözle
   - Request URL'leri kontrol et (`/api` değil, `localhost:8080/api/v1` olmalı)
   - Response'ları kontrol et (mock data değil, gerçek backend data)

**Test Scenarios**:

- [ ] Login successful
- [ ] Categories loading
- [ ] Packages listing
- [ ] Job posting
- [ ] Messages
- [ ] Profile update

### ADIM 6: Middleware Security Audit (30 dakika)

```typescript
// middleware.ts dosyasını açıp kontrol et:

// 1. Admin route protection
if (isAdminRoute) {
  // ❌ Bu satırlar varsa SİL:
  console.log('🔍 Admin route access attempt');
  const response = NextResponse.next();
  return addSecurityHeaders(response);

  // ✅ Bu satırların comment'ini KALDIR:
  if (!token) {
    const adminLoginUrl = new URL(adminLoginRoute, request.url);
    adminLoginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(adminLoginUrl);
  }

  if (userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

// 2. Security headers kontrol
addSecurityHeaders(response); // Her response'da çağrılıyor mu?
```

### ADIM 7: Environment Configuration (30 dakika)

```bash
# Tüm .env dosyalarını kontrol et:
# 1. .env.local.example (şablon)
# 2. .env.local (development - gitignored)
# 3. .env.production.example (production şablon)
```

**Her .env'de olması gerekenler**:

```bash
# Backend
NEXT_PUBLIC_API_URL=?
NEXT_PUBLIC_WS_URL=?

# Feature Flags
NEXT_PUBLIC_ENABLE_MSW=?        # production'da false
NEXT_PUBLIC_ENABLE_DEBUG=?      # production'da false
NEXT_PUBLIC_ENABLE_ANALYTICS=?
NEXT_PUBLIC_ENABLE_SENTRY=?

# Security
CSRF_SECRET=?
JWT_SECRET=?

# Third-party
SENTRY_DSN=?
GOOGLE_ANALYTICS_ID=?
```

### ADIM 8: Dead Code & Duplicates Cleanup (90 dakika)

```bash
# 1. Unused imports
npx unimport --scan

# 2. Duplicate code detection
npx jscpd lib/

# 3. Unused exports
npx ts-prune

# 4. Circular dependencies
npx madge --circular --extensions ts,tsx lib/
```

**Manuel Kontrol**:

1. Duplicate types/interfaces birleştir
2. Duplicate utility functions birleştir
3. Similar components refactor et
4. Mock data files'ları sil (eğer MSW kaldırıldıysa)

### ADIM 9: Testing (60 dakika)

```bash
# 1. Unit tests
npm run test

# 2. Type check
npm run type-check

# 3. Lint check
npm run lint

# 4. Build
npm run build

# 5. Production-like run
npm run start
```

**Manual Testing**:

1. Ana sayfa
2. Login/Register
3. Dashboard
4. Marketplace
5. Job posting
6. Messages
7. Admin panel (önemli!)
8. Profile

### ADIM 10: Documentation Update (30 dakika)

1. README.md güncelle
2. API documentation kontrol (Swagger up-to-date mi?)
3. Architecture docs güncelle
4. Deployment guide güncelle
5. CHANGELOG.md oluştur

---

## 📊 ÇIKTI FORMATI

Analizini aşağıdaki formatta raporla:

### 1. EXECUTIVE SUMMARY

```
Production Readiness Score: X/100

Backend: ✅/⚠️/❌ (Skor/100)
Frontend: ✅/⚠️/❌ (Skor/100)
Production Readiness: ✅/⚠️/❌ (Skor/100)

Overall Status: READY / NEEDS WORK / NOT READY
```

### 2. CRITICAL ISSUES (P0 - Blocker)

```
🚨 [KRİTİK] Issue başlığı
Durum: ❌ Tespit edildi
Dosya: path/to/file.ts
Problem: Detaylı açıklama
Çözüm: Adım adım ne yapılmalı
Etki: Production'a etkisi ne olur?
Priority: P0 (Blocker)
```

### 3. HIGH PRIORITY ISSUES (P1)

```
⚠️ [YÜKSEK] Issue başlığı
Durum: ⚠️ Dikkat gerekli
...
```

### 4. MEDIUM PRIORITY (P2)

```
ℹ️ [ORTA] Issue başlığı
...
```

### 5. LOW PRIORITY / IMPROVEMENTS (P3)

```
💡 [DÜŞÜK] Issue başlığı
...
```

### 6. POSITIVE FINDINGS

```
✅ [İYİ] Tespit
Açıklama: Ne iyi yapılmış?
```

### 7. RECOMMENDATIONS

```
📋 Öneri #1: ...
📋 Öneri #2: ...
```

### 8. ACTION ITEMS

```
[ ] Task 1 (P0) - Estimated: 2h
[ ] Task 2 (P1) - Estimated: 4h
[ ] Task 3 (P2) - Estimated: 1h
...
```

### 9. TIMELINE

```
Sprint 1 (Week 1): P0 issues
Sprint 2 (Week 2): P1 issues
Sprint 3 (Week 3): P2 issues + Testing
Sprint 4 (Week 4): Documentation + Deployment
```

---

## 🧪 VERİFİKASYON CHECKLİSTİ

Analiz tamamlandıktan sonra bu checklist'i doldurup sonuçlara ekle:

### Backend Verification

- [ ] Build successful (`mvn clean install`)
- [ ] Tests passing (>80% coverage)
- [ ] Backend running (`mvn spring-boot:run`)
- [ ] Swagger UI accessible
- [ ] Health check OK
- [ ] Database migrations applied
- [ ] Security configs active
- [ ] No console errors

### Frontend Verification

- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Bundle size acceptable
- [ ] MSW disabled in production
- [ ] API calls going to real backend
- [ ] Authentication working
- [ ] All pages loading
- [ ] No console errors

### Integration Verification

- [ ] Frontend connects to backend
- [ ] Login/Logout working
- [ ] API responses correct (not mock data)
- [ ] Error handling working
- [ ] Loading states working
- [ ] WebSocket connection OK (if applicable)

### Security Verification

- [ ] Admin routes protected
- [ ] CSRF protection active
- [ ] JWT tokens working
- [ ] httpOnly cookies set
- [ ] Security headers present
- [ ] No sensitive data exposed

### Production Readiness

- [ ] Environment configs complete
- [ ] No hardcoded secrets
- [ ] Error tracking setup (Sentry)
- [ ] Monitoring setup
- [ ] Documentation updated
- [ ] Deployment guide ready

---

## 🚀 DEPLOYMENT CHECKLIST (BONUS)

Eğer analiz sonrası deployment'a hazırsa:

### Pre-deployment

- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Rollback plan documented

### Deployment

- [ ] Backend deployed
- [ ] Database migrated
- [ ] Frontend deployed
- [ ] DNS configured
- [ ] SSL certificates active
- [ ] CDN configured (if applicable)

### Post-deployment

- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Monitoring active
- [ ] Error tracking active
- [ ] Performance metrics baseline
- [ ] User acceptance testing

---

## 📚 REFERANS DOKÜMANTASYON

Analizinde bu dökümanları kullan:

1. **PRODUCTION_READINESS_ANALYSIS.md**: Mevcut durum analizi
2. **PHASE_1_MSW_ISOLATION_COMPLETE.md**: MSW isolation durumu
3. **PHASE_2_REAL_API_INTEGRATION_COMPLETE.md**: API integration durumu
4. **PRODUCTION_CLEANUP_PLAN.md**: Cleanup planı
5. **Backend pom.xml**: Dependencies ve versiyonlar
6. **Frontend package.json**: Dependencies ve scripts
7. **Backend Swagger**: API documentation

---

## 🎓 İLERİ SEVİYE ANALİZ (OPTIONAL)

Zaman varsa bu konular da incelenebilir:

### Performance Analysis

- [ ] Lighthouse score (>90)
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] Bundle analysis
- [ ] Database query performance
- [ ] API response times
- [ ] Caching effectiveness

### Scalability Analysis

- [ ] Horizontal scaling ready
- [ ] Stateless architecture
- [ ] Database connection pooling
- [ ] Rate limiting
- [ ] Load balancing config

### Observability

- [ ] Structured logging
- [ ] Distributed tracing
- [ ] Custom metrics
- [ ] Alerting rules
- [ ] Dashboard setup

---

## ⚙️ OTOMASYON KOMUTLARI

Analizde kullanabileceğin helper komutlar:

```bash
# Backend
./mvnw clean install                          # Build
./mvnw test                                   # Tests
./mvnw spring-boot:run                        # Run
./mvnw dependency:tree                        # Dependencies
./mvnw jacoco:report                          # Coverage

# Frontend
npm run build                                 # Build
npm run type-check                            # TypeScript
npm run lint                                  # ESLint
npm run test                                  # Jest tests
npm run analyze                               # Bundle analysis

# Code Quality
npx ts-prune                                  # Unused exports
npx unimport --scan                           # Unused imports
npx jscpd lib/                                # Duplicate code
npx madge --circular lib/                     # Circular deps

# File Analysis
find lib -name "*msw*" | wc -l               # MSW files count
find lib -name "*.ts" -exec wc -l {} + | tail -1  # Total lines
grep -r "TODO" --include="*.ts" . | wc -l    # TODO count
grep -r "FIXME" --include="*.ts" . | wc -l   # FIXME count

# Production Build Check
npm run build && npm run start                # Production build
curl http://localhost:3000                    # Health check
curl http://localhost:3000/api/health         # API health
```

---

## 🎯 BAŞARI KRİTERLERİ

Analiz sonrası bu kriterlerin karşılanması bekleniyor:

### Must Have (Olmazsa Olmaz)

- ✅ MSW production'da kapalı
- ✅ Backend integration working
- ✅ Authentication working
- ✅ No duplicate API clients
- ✅ Admin routes protected
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ No security vulnerabilities

### Should Have (Olması Beklenen)

- ✅ Test coverage >80%
- ✅ Bundle size <500KB
- ✅ No console errors
- ✅ Error tracking setup
- ✅ Documentation updated
- ✅ Environment configs complete

### Nice to Have (İyileştirme)

- ⭐ Lighthouse score >90
- ⭐ Zero duplicate code
- ⭐ Zero dead code
- ⭐ Performance monitoring
- ⭐ Load testing done
- ⭐ E2E tests

---

## 📞 OUTPUT DELIVERABLES

Analiz tamamlandığında şunları üret:

1. **ANALYSIS_REPORT.md**: Detaylı analiz raporu
2. **ACTION_ITEMS.md**: Prioritized task list
3. **REFACTORING_PLAN.md**: Step-by-step refactoring guide
4. **DEPLOYMENT_CHECKLIST.md**: Production deployment checklist
5. **KNOWN_ISSUES.md**: Tespit edilen tüm sorunlar
6. **IMPROVEMENTS.md**: İyileştirme önerileri

---

## 🔥 START COMMAND

Bu promptu çalıştırmak için:

```
Sen bir üst düzey Software Architect ve Spring Boot Expert'sin.

Bu dokümanda belirtilen kriterlere göre MarifetBul projesini:
1. Backend (Spring Boot)
2. Frontend (Next.js)
3. Production Readiness
4. Code Quality

açısından DETAYLI ve SİSTEMATİK bir şekilde analiz et.

ADIM ADIM çalış, her adımın sonucunu raporla.
KRİTİK sorunları önce tespit et.
ÇIKTI formatına uygun rapor üret.
ACTION ITEMS listesi çıkar.

BAŞLA!
```

---

## 📋 SON NOTLAR

- Bu prompt **comprehensive** bir analizdir, ~4-6 saat sürebilir
- Her adımı **dikkatli** ve **sistematik** yap
- **Critical issues**'ları önceliklendir
- **Production safety** en önemli kriter
- **Code quality** ikinci öncelik
- **Documentation** güncel ve doğru olmalı
- Analizinde **objektif** ve **detaylı** ol
- **Action items** net ve uygulanabilir olmalı

---

**Hazırlayan**: Senior Software Architect  
**Tarih**: 13 Ekim 2025  
**Versiyon**: 1.0.0  
**Durum**: Production-Ready Analysis Template

---

## 🎉 İYİ ANALIZLER!
