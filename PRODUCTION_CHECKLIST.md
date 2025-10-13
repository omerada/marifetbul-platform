# ✅ Production-Ready Checklist

## MarifetBul - Quick Action Guide

> Bu checklist, projeyi production'a hazır hale getirmek için atılması gereken adımları içerir.
> Her maddeyi tamamladıkça işaretleyin.

---

## 🔴 KRİTİK (1-2 Hafta) - ÖNCELİK 1

### 1. Mock Data Temizliği

- [ ] **Script'i Çalıştır**

  ```powershell
  .\scripts\cleanup-mocks.ps1
  ```

- [ ] **Legacy Routes Temizliği**
  - [ ] `app/api/legacy/` klasörünü sil (kullanılmıyorsa)
  - [ ] Alternatif olarak, backend'e taşı

- [ ] **Mock Packages API'yi Düzelt**
  - [ ] `app/api/v1/packages/route.ts` - Mock data'yı kaldır
  - [ ] Backend endpoint'e proxy et
  - [ ] Backend'de PackageController implement et (zaten var ✅)

- [ ] **Auth Utilities Düzelt**
  - [ ] `lib/shared/utils/auth.ts` - Mock JWT decode kaldır
  - [ ] `jwt-decode` kütüphanesini yükle
  - [ ] Düzgün JWT decode implement et
  - [ ] httpOnly cookie'lerden token oku

- [ ] **Component Mock Data**
  - [ ] `LocationPicker.tsx` - Geocoding API implement et
  - [ ] `MapView.tsx` - Gerçek harita API'si ekle
  - [ ] `UniversalSearch.tsx` - Backend search endpoint'e bağla
  - [ ] `SearchAutocomplete.tsx` - Backend suggestions endpoint'e bağla

- [ ] **Test Utilities Temizliği**
  - [ ] `lib/shared/testing/` klasörünü `__tests__/utilities/` altına taşı
  - [ ] `tsconfig.json`'da testing klasörünü exclude et
  - [ ] Production build'de test utilities olmadığını doğrula

### 2. Environment Configuration

- [ ] **Script'i Çalıştır**

  ```powershell
  .\scripts\setup-env.ps1
  ```

- [ ] **Frontend Environment (.env.local)**

  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NEXT_PUBLIC_ENABLE_DEBUG=true
  ```

- [ ] **Backend Environment (marifetbul-backend/.env)**
  - [ ] Database credentials güncelle
  - [ ] JWT_SECRET güncelle (script otomatik oluşturur)
  - [ ] SendGrid API key ekle
  - [ ] Stripe API key ekle
  - [ ] AWS S3 credentials ekle (opsiyonel)

- [ ] **Vercel Environment Variables (Production)**
  - [ ] `NEXT_PUBLIC_API_URL` - Production backend URL
  - [ ] `NEXT_PUBLIC_APP_URL` - Production frontend URL
  - [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
  - [ ] `NEXT_PUBLIC_ENABLE_ANALYTICS` - Google Analytics

- [ ] **Backend CORS Configuration**
  ```yaml
  # application-prod.yml
  app:
    cors:
      allowed-origins: https://marifetbul.com,https://marifetbul.vercel.app
  ```

### 3. Authentication Implementation

- [ ] **Cookie-Based Auth Frontend**
  - [ ] localStorage kullanımını kaldır
  - [ ] httpOnly cookies ile çalışacak şekilde güncelle
  - [ ] `credentials: 'include'` her yerde kullan (zaten var ✅)

- [ ] **CSRF Token Implementation**
  - [ ] Backend CSRF token generate et (zaten var ✅)
  - [ ] Frontend'de CSRF token'ı header'a ekle (zaten var ✅)
  - [ ] Test et

- [ ] **Token Refresh Mechanism**
  - [ ] Refresh token endpoint'i test et
  - [ ] Automatic token refresh implement et
  - [ ] 401 hatalarında token refresh dene

- [ ] **Logout Implementation**
  - [ ] Backend logout endpoint'i tamamla
  - [ ] Frontend logout'u cookie clear ile güncelle
  - [ ] Session cleanup test et

---

## 🟡 YÜKSEK ÖNCELİK (2-4 Hafta) - ÖNCELİK 2

### 4. Backend-Frontend Integration

- [ ] **API Endpoints Mapping**
  - [ ] Tüm frontend API çağrılarını dokümante et
  - [ ] Backend endpoint'lerin mevcut olduğunu doğrula
  - [ ] Eksik endpoint'leri backend'e ekle

- [ ] **Response Format Standardization**
  - [ ] Tüm backend response'ların aynı formatı kullandığını doğrula
  - [ ] Frontend'de ApiResponse type'ını tutarlı kullan

- [ ] **Error Handling Standardization**
  - [ ] Backend error response'larını standardize et
  - [ ] Frontend error handling'i güncelle
  - [ ] User-friendly error message'lar ekle

- [ ] **Real-time Features (WebSocket)**
  - [ ] Backend WebSocket config'i tamamla
  - [ ] Frontend WebSocket client implement et
  - [ ] Messages real-time updates test et
  - [ ] Notifications real-time updates test et

### 5. Security Hardening

- [ ] **JWT Secret Management**
  - [ ] application.yml'den default JWT secret'ı kaldır
  - [ ] Environment variable'ı zorunlu yap
  - [ ] Production'da güçlü secret kullan (min 64 byte)

- [ ] **API Keys Protection**
  - [ ] SendGrid API key - Environment variable only
  - [ ] Stripe API key - Environment variable only
  - [ ] AWS credentials - Environment variable only

- [ ] **Rate Limiting**
  - [ ] Backend'de rate limiting implement et
  - [ ] Login endpoint'e özel rate limit ekle
  - [ ] API endpoint'lere rate limit ekle

- [ ] **Input Validation**
  - [ ] Tüm request DTO'larında @Valid kullan
  - [ ] Frontend form validation ekle
  - [ ] XSS protection test et
  - [ ] SQL injection test et

- [ ] **Security Headers**
  - [ ] CSP header'ları doğrula
  - [ ] HSTS enable et
  - [ ] X-Frame-Options doğrula

### 6. Monitoring ve Logging

- [ ] **Sentry Frontend Setup**

  ```bash
  npm install @sentry/nextjs
  ```

  - [ ] `sentry.client.config.ts` oluştur
  - [ ] `sentry.server.config.ts` oluştur
  - [ ] Production'da test et

- [ ] **Backend Monitoring**
  - [ ] Sentry DSN production'da set et
  - [ ] Prometheus metrics doğrula
  - [ ] Grafana dashboard hazırla (opsiyonel)

- [ ] **Logging Strategy**
  - [ ] Production log level'ı ayarla (INFO/WARN)
  - [ ] Sensitive data log'lanmadığını doğrula
  - [ ] Log aggregation solution (ELK/CloudWatch)

- [ ] **Health Checks**
  - [ ] Backend `/actuator/health` endpoint'i test et
  - [ ] Frontend health check endpoint ekle
  - [ ] Database connectivity check
  - [ ] Redis connectivity check

---

## 🟢 ORTA ÖNCELİK (1-2 Ay) - ÖNCELİK 3

### 7. Code Quality

- [ ] **TypeScript Strict Mode**
  - [ ] Tüm TypeScript hatalarını düzelt
  - [ ] `any` kullanımını minimize et
  - [ ] Type definitions tamamla

- [ ] **ESLint Warnings**

  ```bash
  npm run lint:fix
  ```

  - [ ] Tüm warning'leri gözden geçir
  - [ ] Critical warning'leri düzelt

- [ ] **Code Duplication**
  - [ ] Duplicate kod bloklarını tespit et
  - [ ] Shared utilities'e taşı
  - [ ] DRY principle uygula

- [ ] **Component Refactoring**
  - [ ] Büyük component'leri böl
  - [ ] Props interface'lerini düzenle
  - [ ] Reusability artır

### 8. Testing

- [ ] **Unit Tests**
  - [ ] Backend service layer testleri
  - [ ] Frontend utility functions testleri
  - [ ] Coverage %80+ hedefle

- [ ] **Integration Tests**
  - [ ] Backend API endpoint testleri
  - [ ] Database transaction testleri
  - [ ] Authentication flow testleri

- [ ] **E2E Tests**

  ```bash
  npm install -D @playwright/test
  ```

  - [ ] User registration flow
  - [ ] User login flow
  - [ ] Job posting flow
  - [ ] Package ordering flow

- [ ] **Load Testing**
  - [ ] JMeter/k6 ile load test
  - [ ] Concurrent user simulation
  - [ ] Performance bottleneck tespit

### 9. Documentation

- [ ] **API Documentation**
  - [ ] OpenAPI/Swagger dokümantasyonu tamamla
  - [ ] Request/Response örnekleri ekle
  - [ ] Authentication flow dokümante et

- [ ] **Architecture Decision Records (ADR)**
  - [ ] Önemli mimari kararları dokümante et
  - [ ] Technology seçimlerini açıkla
  - [ ] Trade-off'ları not et

- [ ] **Deployment Guide**
  - [ ] Production deployment adımları
  - [ ] Rollback prosedürü
  - [ ] Troubleshooting guide

- [ ] **Developer Onboarding**
  - [ ] Setup guide güncelle
  - [ ] Code style guide yaz
  - [ ] Git workflow dokümante et

---

## 🔵 DÜŞÜK ÖNCELİK (2+ Ay) - ÖNCELİK 4

### 10. Performance Optimization

- [ ] **Database Optimization**
  - [ ] Query performance analizi
  - [ ] Index optimization
  - [ ] N+1 query problemlerini çöz
  - [ ] Connection pool tuning

- [ ] **Frontend Bundle Optimization**

  ```bash
  npm run analyze
  ```

  - [ ] Bundle size analizi
  - [ ] Gereksiz dependencies kaldır
  - [ ] Dynamic imports ekle
  - [ ] Code splitting optimize et

- [ ] **Caching Strategy**
  - [ ] Redis cache hit rate analizi
  - [ ] Cache invalidation stratejisi
  - [ ] CDN integration (Cloudflare/CloudFront)

- [ ] **Image Optimization**
  - [ ] Image CDN kullan (Cloudinary/ImageKit)
  - [ ] Lazy loading implement et
  - [ ] WebP/AVIF formatlarına geç

### 11. Feature Additions

- [ ] **Real-time Notifications**
  - [ ] Push notifications (FCM/OneSignal)
  - [ ] Email notifications
  - [ ] In-app notifications

- [ ] **Advanced Search**
  - [ ] Elasticsearch integration
  - [ ] Faceted search
  - [ ] Auto-complete
  - [ ] Search analytics

- [ ] **Payment Gateway**
  - [ ] Stripe integration tamamla
  - [ ] Payment webhooks
  - [ ] Refund flow
  - [ ] Invoice generation

- [ ] **File Upload**
  - [ ] S3 integration
  - [ ] File validation
  - [ ] Virus scanning
  - [ ] Thumbnail generation

---

## 📊 PRE-PRODUCTION CHECKLIST

### Final Review (Production'dan 1 Hafta Önce)

- [ ] **Security Audit**
  - [ ] Penetration testing
  - [ ] OWASP Top 10 kontrol
  - [ ] Dependency vulnerabilities scan
  - [ ] Secrets scanning

- [ ] **Performance Audit**
  - [ ] Load testing sonuçları
  - [ ] Lighthouse score (90+)
  - [ ] Core Web Vitals
  - [ ] API response times (<200ms)

- [ ] **Backup Strategy**
  - [ ] Database backup automation
  - [ ] Backup restore test
  - [ ] Disaster recovery plan

- [ ] **Monitoring Alerts**
  - [ ] Error rate alerts
  - [ ] Performance degradation alerts
  - [ ] Disk space alerts
  - [ ] Memory usage alerts

### Deployment Day

- [ ] **Pre-Deployment**
  - [ ] Tüm testler geçiyor
  - [ ] Code review tamamlandı
  - [ ] Deployment plan hazır
  - [ ] Rollback plan hazır

- [ ] **Deployment**
  - [ ] Blue-green deployment
  - [ ] Health checks pass
  - [ ] Smoke tests pass
  - [ ] Database migrations success

- [ ] **Post-Deployment**
  - [ ] Monitoring dashboard kontrol
  - [ ] Error logs kontrol
  - [ ] User feedback topla
  - [ ] Performance metrics kaydet

---

## 📈 Progress Tracking

### Haftalık İlerleme

**Hafta 1-2:** Kritik Öncelik (🔴)

- [ ] Mock data temizliği: 0/6
- [ ] Environment setup: 0/4
- [ ] Authentication fix: 0/4

**Hafta 3-4:** Yüksek Öncelik (🟡)

- [ ] Backend-frontend integration: 0/4
- [ ] Security hardening: 0/5
- [ ] Monitoring setup: 0/4

**Hafta 5-6:** Test ve Optimize

- [ ] Code quality: 0/4
- [ ] Testing: 0/4
- [ ] Documentation: 0/4

**Hafta 7:** Pre-Production Testing

- [ ] Security audit
- [ ] Performance audit
- [ ] Backup strategy
- [ ] Monitoring alerts

**Hafta 8:** Production Deployment

- [ ] Pre-deployment checklist
- [ ] Deployment
- [ ] Post-deployment monitoring

---

## 🎯 Quick Win'ler (1 Gün İçinde)

Hızlı başarı için önce bunları yapın:

1. ✅ Environment variables setup (30 dk)

   ```powershell
   .\scripts\setup-env.ps1
   ```

2. ✅ Mock data detection (15 dk)

   ```powershell
   .\scripts\cleanup-mocks.ps1
   ```

3. ✅ Legacy routes temizliği (10 dk)
   - `app/api/legacy/` klasörünü sil

4. ✅ .gitignore update (5 dk)
   - `.env.local`, `.env` ekle

5. ✅ README update (30 dk)
   - Environment setup guide ekle
   - Quick start guide güncelle

---

**Not:** Bu checklist canlı bir dokümandır. İlerleme kaydettikçe güncelleyin!

**Son Güncelleme:** 13 Ekim 2025  
**Tracking Tool:** GitHub Projects / Jira / Notion
