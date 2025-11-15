# 🚀 MarifetBul - Türkiye'nin Freelance Platformu

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

Modern, ölçeklenebilir ve güvenli freelance platformu. Spring Boot backend + Next.js frontend ile geliştirilmiş production-ready web uygulaması.

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje Yapısı](#-proje-yapısı)
- [🔄 Refactoring & Sprint Planı](#-refactoring--sprint-planı) ← **YENİ!**
- [📊 Sprint Analysis Reports](#-sprint-analysis-reports) ← **YENİ!**
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Deployment](#-deployment)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## ✨ Özellikler

### 🎯 Core Features

- ✅ **Kullanıcı Yönetimi**: JWT tabanlı güvenli authentication & authorization
- ✅ **Paket/Hizmet Listeme**: Freelancer'ların hizmetlerini sergilemesi
- ✅ **İş İlanları**: Employer'ların proje ilanları oluşturması
- ✅ **Teklif Sistemi**: Freelancer'ların işlere teklif vermesi
- ✅ **Mesajlaşma**: Real-time mesajlaşma sistemi
- ✅ **Ödeme Sistemi**: Iyzico entegrasyonu ile güvenli ödemeler
- ✅ **Review & Rating**: İki yönlü değerlendirme sistemi
- ✅ **Media Upload**: Cloudinary ile görsel yükleme ve optimizasyon
- ✅ **Analytics Dashboard**: Paket ve kullanıcı istatistikleri
- ✅ **Blog Sistemi**: SEO-friendly blog platformu
- ✅ **Destek Sistemi**: Ticket-based support management

### 🔐 Security

- JWT authentication with refresh tokens
- CSRF protection
- Rate limiting
- Input validation & sanitization
- SQL injection prevention
- XSS protection
- Secure password hashing (BCrypt)

### 🚀 Performance

- Redis caching (user sessions, API responses)
- Elasticsearch full-text search
- Database query optimization
- API response caching
- Lazy loading & code splitting
- Image optimization

### 📊 Monitoring & Analytics

- Sentry error tracking
- Prometheus metrics
- Grafana dashboards
- Actuator health checks
- Custom business metrics

---

## 🛠️ Teknoloji Stack

### Backend (Spring Boot)

```
├── Spring Boot 3.4.1          # Core framework
├── Spring Security            # Authentication & authorization
├── Spring Data JPA            # Database ORM
├── PostgreSQL 16              # Primary database
├── Redis 7                    # Caching & sessions
├── Elasticsearch 8            # Full-text search
├── Flyway                     # Database migrations
├── JWT (jjwt 0.12.6)         # Token authentication
├── MapStruct 1.6.3           # DTO mapping
├── Lombok 1.18.36            # Code generation
├── Iyzico SDK                 # Payment processing
├── SendGrid                   # Email service
├── AWS S3                     # File storage
└── Sentry                     # Error tracking
```

### Frontend (Next.js)

```
├── Next.js 15.1.6            # React framework
├── React 19.0.0              # UI library
├── TypeScript 5.7.3          # Type safety
├── Tailwind CSS 4.1.1        # Styling
├── React Hook Form 7.54.2    # Form management
├── Zod 4.1.5                 # Schema validation
├── SWR 2.3.6                 # Data fetching
├── Zustand 5.0.8             # State management
├── Framer Motion 12.23.22    # Animations
└── Lucide React 0.469.0      # Icons
```

### DevOps & Infrastructure

```
├── Docker & Docker Compose   # Containerization
├── Nginx                      # Reverse proxy
├── Prometheus                 # Metrics
├── Grafana                    # Monitoring dashboards
├── GitHub Actions (CI/CD)    # Automation
└── Vercel (Frontend hosting) # Deployment
```

---

## 📁 Proje Yapısı

```
marifeto/
├── marifetbul-backend/              # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/marifetbul/api/
│   │   │   │   ├── common/          # Common utilities
│   │   │   │   ├── config/          # Spring configurations
│   │   │   │   ├── domain/          # Business logic (DDD)
│   │   │   │   │   ├── auth/        # Authentication
│   │   │   │   │   ├── user/        # User management
│   │   │   │   │   ├── packages/    # Services/Packages
│   │   │   │   │   ├── job/         # Job postings
│   │   │   │   │   ├── proposal/    # Proposals/Bids
│   │   │   │   │   ├── order/       # Orders
│   │   │   │   │   ├── payment/     # Payments
│   │   │   │   │   ├── message/     # Messaging
│   │   │   │   │   ├── review/      # Reviews
│   │   │   │   │   ├── blog/        # Blog system
│   │   │   │   │   └── support/     # Support tickets
│   │   │   │   ├── infrastructure/  # External services
│   │   │   │   ├── presentation/    # API DTOs
│   │   │   │   └── security/        # Security config
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── db/migration/    # Flyway migrations
│   │   └── test/                    # Unit & integration tests
│   ├── docker/                      # Docker configurations
│   ├── k8s/                         # Kubernetes manifests
│   ├── pom.xml                      # Maven dependencies
│   └── Dockerfile.prod              # Production build
│
├── app/                             # Next.js pages (App Router)
│   ├── (auth)/                      # Auth pages
│   ├── admin/                       # Admin panel
│   ├── api/                         # API routes
│   ├── blog/                        # Blog pages
│   ├── dashboard/                   # User dashboards
│   ├── marketplace/                 # Marketplace pages
│   ├── profile/                     # User profiles
│   └── ...
│
├── components/                      # React components
│   ├── domains/                     # Domain-specific components
│   ├── layout/                      # Layout components
│   ├── shared/                      # Shared/common components
│   └── ui/                          # UI primitives
│
├── lib/                             # Utilities & services
│   ├── api/                         # API client
│   ├── domains/                     # Domain services
│   ├── infrastructure/              # Infrastructure services
│   └── shared/                      # Shared utilities
│
├── public/                          # Static assets
├── scripts/                         # Development scripts
├── docs/                            # Documentation
├── PRODUCTION-DEPLOYMENT.md         # Deployment guide
└── package.json                     # NPM dependencies
```

---

## 📊 Sprint Analysis & Development Roadmap

Proje için detaylı analiz ve sprint planlama dokümanları hazırlanmıştır:

### 🎯 Ana Dokümanlar

1. **[System Health Overview](./SYSTEM_HEALTH_OVERVIEW.md)** 📋 **← YENİ!**
   - ✅ Full-stack sistem sağlığı analizi
   - ✅ 15 bileşen detaylı değerlendirmesi
   - ✅ Production-blocker tespit (4 kritik eksik)
   - ✅ 5 Sprint önceliklendirilmiş roadmap
   - ✅ Teknik borç (technical debt) özeti
   - **Sayfa:** 45+ sayfa genel bakış

2. **[Production Readiness Analysis](./PRODUCTION_READINESS_ANALYSIS.md)** 🎯 **← YENİ!**
   - ✅ Odak Alan: Milestone Payment System
   - ✅ Backend %100, Frontend %15 analizi
   - ✅ 2 haftalık detaylı sprint planı (55 SP)
   - ✅ Week 1 ve Week 2 story breakdown
   - ✅ Test stratejisi ve deployment checklist
   - **Sayfa:** 40+ sayfa sprint detayı

3. **[Sprint 1: Quick Start Guide](./SPRINT_1_QUICK_START.md)** 🚀 **← YENİ!**
   - ✅ Günlük görev listesi (Day 1-17)
   - ✅ Development setup ve checklist
   - ✅ Common issues & solutions
   - ✅ Progress tracking template
   - ✅ Definition of Done kriterleri
   - **Sayfa:** 12+ sayfa pratik rehber

4. **[Sprint 1: Progress Tracker](./SPRINT_1_PROGRESS.md)** 📈 **← LIVE TRACKING!**
   - ✅ Real-time sprint progress (64% complete)
   - ✅ Story-by-story completion status
   - ✅ Daily velocity tracking
   - ✅ Known issues & blockers
   - ✅ Next actions & sprint health
   - **Status:** 35/55 SP completed, AHEAD OF SCHEDULE 🎉

5. **[Sprint Analysis Report](./SPRINT_ANALYSIS_REPORT.md)** 📊 **(Önceki Analiz)**
   - ✅ Eksik ve hatalı yapı analizi
   - ✅ Production-ready değerlendirmesi (45 item)
   - ✅ 5 Sprint önceliklendirilmiş backlog
   - **Sayfa:** 60+ sayfa detaylı rapor

6. **[Technical Debt Tracker](./docs/TECHNICAL_DEBT_TRACKER.md)** 🔧
   - ✅ 45+ teknik borç detaylı kaydı
   - ✅ Öncelik matrisi (7 Critical, 17 High, 16 Medium, 5 Low)
   - ✅ Impact vs Effort analizi
   - **Sayfa:** 40+ sayfa teknik detay

### 🎯 Sprint Önceliklendirmesi

```
🔴 ACTIVE SPRINT: Sprint 1 - Milestone Payment System (15-29 Kasım 2025)
Progress: ████████████░░░░░ 64% (35/55 SP)
Status: AHEAD OF SCHEDULE ✅
Time Remaining: 14 days

✅ Completed Stories (35 SP):
  ✅ Story 1.1: Order Detail Milestone Tab (8 SP)
  ✅ Story 1.2: Freelancer Delivery Modal (10 SP)
  ✅ Story 1.3: Employer Acceptance Modal (10 SP)
  ✅ Story 1.4: Revision Request Flow (5 SP)
  ✅ Story 2.2: Dashboard Widgets (Partial, 8 SP)
  ✅ Story 2.3: Wallet Transaction Display (5 SP)

🔄 In Progress (12 SP):
  🔄 Story 2.1: Order Creation Milestones (60% complete)

⏳ Pending (8 SP):
  ⏳ Story 2.4: Notification System (3 SP)
  ⏳ Story 2.5: Testing & Bug Fixes (5 SP)

Next Up: Complete Story 2.1 testing → Story 2.4 → Story 2.5 → Sprint Review
```

**Full Roadmap:**

```
Phase 1: Critical Features (4-5 hafta)
├── Week 1-2: Sprint 1 - Milestone Payment Frontend ⭐⭐⭐⭐⭐ [ACTIVE - 64% DONE]
├── Week 3:   Sprint 2 - User Refund Flow ⭐⭐⭐⭐
├── Week 4:   Sprint 3 - Dashboard Route Cleanup ⭐⭐⭐
└── Week 5:   Sprint 4 - Wallet-Escrow UI ⭐⭐⭐

Phase 2: Polish & Launch (2 hafta)
├── Week 6-7: Sprint 5 - Code Quality & Testing ⭐⭐
└── Week 8:   Beta Launch & User Feedback 🚀
```

### 📈 Kritik Bulgular Özeti

**✅ Production-Ready (80%+)**

- Dashboard System (Unified dashboard başarılı)
- Authentication & 2FA
- Order Management
- Admin Refund Management
- Wallet Basics
- Messaging System

**⚠️ Needs Attention (50-79%)**

- Milestone Payments (Backend ready, frontend missing)
- User Refund Flow (Admin side only)
- Wallet Escrow UI (Backend logic ready, UI incomplete)
- Payout Management (Admin panel ready, user visibility low)

**❌ Missing/Incomplete (<50%)**

- Milestone Frontend (0% complete)
- User-side Refund Request (0% complete)
- Escrow Balance Breakdown (10% complete)
- Milestone-Wallet Integration UI (0% complete)

### 🚨 Immediate Actions

**Bu Hafta:**

1. ✅ Sprint 1 başlat: Milestone frontend development
2. ✅ Backend milestone API documentation güncelle
3. ✅ Figma'da milestone UI mockup'ları hazırla
4. ✅ Email templates (milestone notifications) review

**Gelecek 2-4 Hafta:**

1. Sprint 1 tamamlanınca Sprint 2'ye geç (Refund user flow)
2. Beta test kullanıcıları belirle (10-15 kişi)
3. Production deployment checklist hazırla
4. Monitoring & alerting setup (Sentry, Prometheus)

---

## 🚀 Kurulum

### Ön Gereksinimler

- **Java 17+** ([Download](https://adoptium.net/))
- **Node.js 18.17+** ([Download](https://nodejs.org/))
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- **Redis 7+** ([Download](https://redis.io/download))
- **Docker** (Opsiyonel) ([Download](https://www.docker.com/))

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/omerada/marifet.git
cd marifeto
```

### 2. Backend Setup

#### Option A: Docker ile (Önerilen)

```bash
cd marifetbul-backend
docker-compose up -d
```

Bu komut PostgreSQL, Redis ve Elasticsearch'ü otomatik başlatır.

#### Option B: Manuel Kurulum

**Database Oluşturma:**

```sql
CREATE DATABASE marifetbul_dev;
CREATE USER marifetbul WITH ENCRYPTED PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE marifetbul_dev TO marifetbul;
```

**Redis Başlatma:**

```bash
redis-server --requirepass redis123
```

**Backend Çalıştırma:**

```bash
cd marifetbul-backend
./mvnw spring-boot:run
```

Backend şimdi `http://localhost:8080` adresinde çalışıyor.

### 3. Frontend Setup

**Environment Variables:**

```bash
# .env.local oluşturun (development için)
cp .env.local.example .env.local

# Gerekli değişkenleri düzenleyin:
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary (Image Upload - Required)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=marifetbul_packages

# Iyzico (Payment - Required for production)
NEXT_PUBLIC_IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Firebase Push Notifications (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

> 📚 **Cloudinary Kurulumu:** [CLOUDINARY_SETUP_GUIDE.md](./docs/CLOUDINARY_SETUP_GUIDE.md) - Detaylı kurulum rehberi
>
> 🔔 **Push Notification Kurulumu:** [PUSH_NOTIFICATIONS_SETUP.md](./docs/PUSH_NOTIFICATIONS_SETUP.md) - Firebase FCM kurulum rehberi

**Dependencies ve Server:**

```bash
# Dependencies yükleme
npm install

# Development server başlatma
npm run dev
```

Frontend şimdi `http://localhost:3000` adresinde çalışıyor.

### 4. Test Kullanıcıları ile Giriş 🔐

Backend başlatıldığında otomatik olarak test kullanıcıları oluşturulur:

**Freelancer:**

```
Email: freelancer@test.com
Password: Test123!
```

**Employer:**

```
Email: employer@test.com
Password: Test123!
```

**Admin:**

```
Email: admin@marifetbul.com
Password: Admin123!
```

> 📚 **Detaylı bilgi için:** [TEST_USERS.md](./TEST_USERS.md) - Tüm test kullanıcıları ve kullanım örnekleri

---

## 🔧 Kullanım

### Development Mode

**Backend:**

```bash
cd marifetbul-backend
./mvnw spring-boot:run
```

**Frontend:**

```bash
npm run dev
```

### Production Build

**Backend:**

```bash
cd marifetbul-backend
./mvnw clean package -DskipTests
java -jar target/marifetbul-api.jar
```

**Frontend:**

```bash
npm run build
npm start
```

### Docker ile Full Stack

```bash
cd marifetbul-backend
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 API Dokümantasyonu

### Swagger UI (Development)

Backend çalıştıktan sonra:

```
http://localhost:8080/swagger-ui.html
```

### OpenAPI Spec

```
http://localhost:8080/api-docs
```

### Postman Collection

Postman koleksiyonu `/docs/postman/` klasöründe bulunmaktadır.

### 🔑 Önemli API Endpoint'leri

#### Authentication & User Management

```http
# Authentication
POST   /api/v1/auth/register           # Kullanıcı kaydı
POST   /api/v1/auth/login              # Giriş yapma
POST   /api/v1/auth/logout             # Çıkış yapma
POST   /api/v1/auth/refresh            # Token yenileme
GET    /api/v1/auth/me                 # Mevcut kullanıcı bilgisi
PUT    /api/v1/auth/profile            # Profil güncelleme
PUT    /api/v1/auth/password           # Şifre değiştirme

# Password Reset
POST   /api/v1/auth/password/reset-request  # Şifre sıfırlama talebi
POST   /api/v1/auth/password/reset          # Şifre sıfırlama

# Email Verification
POST   /api/v1/auth/verify-email            # Email doğrulama
POST   /api/v1/auth/resend-verification     # Doğrulama email'i tekrar gönder

# User Management
GET    /api/v1/users/{id}              # Kullanıcı detayı
GET    /api/v1/users/{id}/profile      # Kullanıcı profil özeti
GET    /api/v1/users/search            # Kullanıcı arama
POST   /api/v1/users/{id}/follow       # Kullanıcı takip et
GET    /api/v1/users/{id}/followers    # Takipçiler
GET    /api/v1/users/{id}/following    # Takip edilenler
```

#### Packages (Services)

```http
GET    /api/v1/packages                # Paket listesi (pagination)
GET    /api/v1/packages/{packageId}    # Paket detayı (UUID)
GET    /api/v1/packages/slug/{slug}    # Paket detayı (slug)
POST   /api/v1/packages                # Yeni paket oluştur
PUT    /api/v1/packages/{id}           # Paket güncelle
DELETE /api/v1/packages/{id}           # Paket sil
GET    /api/v1/packages/search         # Paket arama
```

#### Jobs & Proposals

```http
GET    /api/v1/jobs                    # İş ilanları listesi
GET    /api/v1/jobs/{id}               # İlan detayı
POST   /api/v1/jobs                    # İlan oluştur
PUT    /api/v1/jobs/{id}               # İlan güncelle
POST   /api/v1/jobs/{id}/proposals     # İlana teklif ver
GET    /api/v1/proposals/my            # Tekliflerim
```

#### Messaging

```http
GET    /api/v1/conversations           # Konuşma listesi
GET    /api/v1/conversations/{id}      # Konuşma detayı
POST   /api/v1/conversations           # Yeni konuşma başlat
POST   /api/v1/messages                # Mesaj gönder
GET    /api/v1/messages/{conversationId} # Mesajlar
```

#### Categories & Blog

```http
GET    /api/v1/categories              # Kategori listesi
GET    /api/v1/blog/posts              # Blog yazıları
GET    /api/v1/blog/posts/{slug}       # Blog yazı detayı
```

### 📊 Response Format

Tüm API yanıtları standardize edilmiş `ApiResponse<T>` formatındadır:

```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { ... },
  "timestamp": "2025-10-15T10:30:00Z",
  "path": "/api/v1/packages"
}
```

### 🚨 Error Response Format

```json
{
  "success": false,
  "message": "Hata mesajı",
  "errors": [
    {
      "field": "email",
      "message": "Geçerli bir email adresi giriniz"
    }
  ],
  "timestamp": "2025-10-15T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

### 📄 Pagination Response

```json
{
  "success": true,
  "data": {
    "content": [...],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 100,
    "totalPages": 10,
    "first": true,
    "last": false,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 🌐 Deployment

Detaylı deployment rehberi için: [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md)

### Quick Deploy - Vercel (Frontend)

```bash
vercel --prod
```

### Quick Deploy - Docker (Full Stack)

```bash
cd marifetbul-backend
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🧪 Testing

### Backend Tests

```bash
cd marifetbul-backend
./mvnw test
```

**Coverage Report:**

```bash
./mvnw test jacoco:report
open target/site/jacoco/index.html
```

### Frontend Tests

```bash
npm test
```

**Coverage:**

```bash
npm run test:ci
```

---

## 📈 Monitoring

### Health Checks

- **Backend Health:** `http://localhost:8080/actuator/health`
- **Database:** `http://localhost:8080/actuator/health/db`
- **Redis:** `http://localhost:8080/actuator/health/redis`

### Metrics

- **Prometheus:** `http://localhost:8080/actuator/prometheus`
- **Grafana:** `http://localhost:3000` (Docker setup)

### Admin Panel

**Development:**

- **URL:** `http://localhost:3000/admin/login`
- **Test Credentials:** admin@marifetbul.com / Admin123!
- ⚠️ Development helper visible only in NODE_ENV=development

**Production:**

- ⚠️ **CRITICAL**: Change default admin password immediately after first login
- Enable 2FA for all admin accounts
- See [ADMIN_SECURITY_GUIDE.md](./docs/ADMIN_SECURITY_GUIDE.md) for complete security setup

---

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Coding Standards

- Backend: [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Frontend: ESLint + Prettier (configured)

---

## 📝 Lisans

Bu proje özel lisans altında korunmaktadır. Tüm hakları saklıdır.

Copyright © 2025 MarifetBul

---

## 👥 İletişim

- **Email:** dev@marifetbul.com
- **Website:** https://www.marifetbul.com
- **GitHub:** https://github.com/omerada/marifet

---

## 🙏 Teşekkürler

Bu projeyi mümkün kılan tüm açık kaynak katkıcılarına teşekkürler!

---

**Built with ❤️ by MarifetBul Development Team**
