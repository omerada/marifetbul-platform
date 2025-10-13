# MarifetBul - Türkiye'nin Freelance Platformu

> Modern, güvenli ve kullanıcı dostu freelance marketplace platformu

[![Production Ready](https://img.shields.io/badge/backend-95%25%20ready-success)](docs/PRODUCTION_READINESS_ANALYSIS.md)
[![Integration](https://img.shields.io/badge/integration-needs%20work-yellow)](docs/PRODUCTION_READINESS_ANALYSIS.md)
[![Overall](https://img.shields.io/badge/overall-72%25-orange)](docs/ANALYSIS_SUMMARY.md)

---

## 🚨 IMPORTANT: Production Readiness Notice

**Status**: 🔴 **NOT PRODUCTION READY** - Critical issues found

Bu proje kapsamlı bir production readiness analizi yapılmıştır. Detaylar için:

### 📑 Analiz Dokümanları

1. **[ANALYSIS_SUMMARY.md](docs/ANALYSIS_SUMMARY.md)** ⭐ **START HERE**
   - 5 dakikalık özet
   - 4 kritik sorun
   - Hızlı aksiy on planı

2. **[PRODUCTION_READINESS_ANALYSIS.md](docs/PRODUCTION_READINESS_ANALYSIS.md)**
   - 50+ sayfa detaylı analiz
   - Backend: 95/100 (Mükemmel)
   - Frontend: 60/100 (İyileştirme gerekli)
   - Integration: 40/100 (Kritik sorunlar)

3. **[PRODUCTION_CLEANUP_PLAN.md](docs/PRODUCTION_CLEANUP_PLAN.md)**
   - Adım adım implementasyon kılavuzu
   - 7 fazlı temizlik planı
   - Kod örnekleri ve kontrol listeleri

4. **[PRODUCTION_READINESS_INDEX.md](docs/PRODUCTION_READINESS_INDEX.md)**
   - Dokümantasyon indeksi
   - Rol bazlı okuma kılavuzu

### 🚨 Kritik Sorunlar

1. **MSW Production'da Aktif** 🔴
   - Mock Service Worker tüm API çağrılarını engelliyor
   - Backend ile gerçek iletişim yok

2. **Backend Entegrasyonu Yok** 🔴
   - Frontend backend API'lerini çağırmıyor
   - Sadece mock data gösteriliyor

3. **Admin Rotaları Korumasız** 🔴
   - Middleware debug mode'da
   - Herkes admin paneline erişebilir

4. **Production Config Eksik** 🔴
   - Environment variables yapılandırılmamış

**Timeline to Production**: 10-14 gün  
**Approval Required**: YES

---

## 📚 Proje Hakkında

MarifetBul, Türkiye'deki freelancer'lar ve işverenleri bir araya getiren modern bir platform. Next.js ve Spring Boot ile geliştirilmiş, ölçeklenebilir ve güvenli bir yapıya sahip.

### ✨ Özellikler

- 🔐 JWT tabanlı authentication
- 👥 Freelancer ve işveren profilleri
- 💼 İş ilanları ve paket sistemi
- 💬 Gerçek zamanlı mesajlaşma
- 📊 Detaylı istatistikler ve raporlar
- ⭐ Değerlendirme ve yorum sistemi
- 💳 Güvenli ödeme entegrasyonu
- 🔔 Bildirim sistemi

---

## 🏗️ Teknoloji Stack

### Frontend

- **Framework**: Next.js 14.2.33 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS 4
- **State**: Zustand + SWR
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion

### Backend

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **ORM**: Spring Data JPA + Hibernate
- **Migration**: Flyway
- **Auth**: JWT + Spring Security
- **API Docs**: OpenAPI/Swagger
- **Testing**: JUnit 5 + Mockito + Testcontainers

### DevOps

- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + Sentry
- **Deployment**: Vercel (Frontend) + AWS/GCP (Backend)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Java 17+
- PostgreSQL 14+
- Redis 7+
- Maven 3.8+

### Frontend Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

### Backend Setup

```bash
# Navigate to backend
cd marifetbul-backend/marifetbul-backend

# Install dependencies
mvn clean install

# Set up database
# Create PostgreSQL database: marifetbul_dev

# Run migrations
mvn flyway:migrate

# Start application
mvn spring-boot:run

# API available at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## 📁 Proje Yapısı

```
marifet/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── admin/               # Admin panel
│   ├── api/                 # API routes
│   ├── blog/                # Blog pages
│   ├── dashboard/           # User dashboards
│   ├── marketplace/         # Marketplace
│   └── ...
├── components/              # React components
│   ├── domains/            # Domain-specific components
│   ├── layout/             # Layout components
│   ├── providers/          # Context providers
│   ├── shared/             # Shared components
│   └── ui/                 # UI components
├── lib/                     # Core library
│   ├── api/                # API client (⚠️ Needs refactor)
│   ├── core/               # Core utilities
│   ├── domains/            # Domain logic
│   ├── infrastructure/     # Infrastructure (⚠️ MSW to be removed)
│   └── shared/             # Shared utilities
├── docs/                    # Documentation
│   ├── ANALYSIS_SUMMARY.md                  ⭐ Read first
│   ├── PRODUCTION_READINESS_ANALYSIS.md     📊 Full analysis
│   ├── PRODUCTION_CLEANUP_PLAN.md           🛠️ Implementation
│   └── backend-architecture/                📚 Backend docs
├── marifetbul-backend/      # Spring Boot backend
│   └── marifetbul-backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/marifetbul/api/
│       │   │   │       ├── common/
│       │   │   │       ├── config/
│       │   │   │       ├── controller/
│       │   │   │       ├── domain/
│       │   │   │       ├── infrastructure/
│       │   │   │       └── security/
│       │   │   └── resources/
│       │   │       ├── db/migration/    # Flyway migrations
│       │   │       └── application*.yml
│       │   └── test/
│       ├── docker/
│       ├── k8s/
│       └── pom.xml
└── public/                  # Static assets
```

---

## 📊 Backend Status

### ✅ Production Ready - 95/100

**Completed Domains:**

- ✅ Auth (13/13 tests)
- ✅ User Management
- ✅ Categories (34/34 tests, hierarchical)
- ✅ Jobs (35/35 tests)
- ✅ Packages (15/15 tests)
- ✅ Proposals (36/36 tests)
- ✅ Messages (51/51 tests)
- ✅ Notifications (25/25 tests)
- ✅ Reviews (43/43 tests)
- ✅ Payments

**Test Coverage**: 174/187 tests passing (93%)

**Database**:

- V1-V13 migrations applied
- Rollback scripts available
- Full referential integrity
- 25+ optimized indexes

**API Documentation**:

- Swagger UI available
- OpenAPI 3.0 compliant
- 80+ endpoints documented

---

## ⚠️ Frontend Status

### 60/100 - Needs Integration Work

**Strong Points:**

- ✅ Clean architecture
- ✅ TypeScript strict mode
- ✅ Modern tech stack
- ✅ Security headers
- ✅ SEO optimized

**Critical Issues:**

- ❌ MSW intercepting all API calls (56 files, ~10k lines)
- ❌ No real backend integration
- ❌ Mock data in production
- ❌ 3 duplicate API clients
- ❌ Admin routes unprotected (debug mode)

---

## 🛠️ Cleanup & Production Plan

### Timeline: 10-14 Days

**Week 1: Critical Fixes**

- Days 1-2: MSW removal/isolation
- Days 3-5: Real API integration
- Day 6: Security fixes
- Day 7: Environment configuration

**Week 2: Polish & Deploy**

- Days 8-9: Code cleanup
- Days 10-12: Testing
- Days 13-14: Production deployment

**Detailed Plan**: See [PRODUCTION_CLEANUP_PLAN.md](docs/PRODUCTION_CLEANUP_PLAN.md)

---

## 📖 Documentation

### Quick Links

- **[Start Here](docs/ANALYSIS_SUMMARY.md)** - Executive summary
- **[Full Analysis](docs/PRODUCTION_READINESS_ANALYSIS.md)** - Detailed findings
- **[Cleanup Plan](docs/PRODUCTION_CLEANUP_PLAN.md)** - Implementation guide
- **[Index](docs/PRODUCTION_READINESS_INDEX.md)** - Document navigator

### Backend Documentation

- [Architecture Design](docs/backend-architecture/02-ARCHITECTURE-DESIGN.md)
- [Database Design](docs/backend-architecture/03-DATABASE-DESIGN.md)
- [API Design](docs/backend-architecture/04-API-DESIGN.md)
- [Security](docs/backend-architecture/05-SECURITY.md)
- [Migrations](docs/MIGRATIONS.md)

---

## 🧪 Testing

### Backend Tests

```bash
cd marifetbul-backend/marifetbul-backend

# Run all tests
mvn test

# Run specific test
mvn test -Dtest=CategoryServiceTest

# Generate coverage report
mvn jacoco:report
```

### Frontend Tests

```bash
# Run tests (⚠️ Currently minimal)
npm test

# Run with coverage
npm run test:ci
```

---

## 🔒 Security

- JWT authentication with refresh tokens
- BCrypt password hashing
- CORS configuration
- CSRF protection
- XSS prevention
- SQL injection protection (JPA/Hibernate)
- Rate limiting (planned)
- Security headers (HSTS, CSP, etc.)

---

## 📈 Monitoring

- **Health Checks**: `/actuator/health`
- **Metrics**: `/actuator/metrics`
- **Prometheus**: `/actuator/prometheus`
- **Sentry**: Error tracking (configured)
- **Google Analytics**: User analytics (configured)

---

## 🤝 Contributing

**IMPORTANT**: Before contributing, read the production readiness analysis.

### Current Priority

1. 🔴 **MSW Removal** - Critical
2. 🔴 **API Integration** - Critical
3. 🔴 **Security Fixes** - Critical
4. 🟡 **Code Cleanup** - High
5. 🟡 **Testing** - High

### Development Workflow

1. Create feature branch: `feature/your-feature`
2. Follow cleanup plan if applicable
3. Write tests
4. Submit PR with 2+ approvals
5. CI/CD checks must pass

---

## 📞 Support

### For Issues

- **Critical Production Issues**: Create issue with `critical` label
- **High Priority**: Use `high-priority` label
- **Cleanup Tasks**: Use `cleanup` label
- **Questions**: Use `question` label

### Contacts

- **Technical Lead**: [TBD]
- **Backend Team**: [TBD]
- **Frontend Team**: [TBD]
- **DevOps Team**: [TBD]

---

## 📜 License

Proprietary - MarifetBul Platform © 2025

---

## 🎯 Roadmap

### Immediate (Q4 2025)

- [ ] Complete production cleanup (10-14 days)
- [ ] Real backend integration
- [ ] Security audit
- [ ] Production deployment

### Short Term (Q1 2026)

- [ ] Mobile app (React Native)
- [ ] Advanced search (Elasticsearch)
- [ ] Video chat
- [ ] AI recommendations

### Long Term (Q2-Q4 2026)

- [ ] Multi-language support
- [ ] International expansion
- [ ] Advanced analytics
- [ ] Enterprise features

---

## 📊 Project Status

```
Backend:      ████████████████████░ 95%  ✅ Production Ready
Frontend:     ████████████░░░░░░░░░ 60%  ⚠️ Needs Work
Integration:  ████████░░░░░░░░░░░░░ 40%  ❌ Critical Issues
Overall:      ██████████████░░░░░░░ 72%  🔴 Not Ready

Next Milestone: Production Ready (Target: 2 weeks)
```

---

## ⚡ Quick Commands

```bash
# Frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run linter
npm run type-check       # Check TypeScript

# Backend
mvn spring-boot:run      # Start backend server
mvn test                 # Run tests
mvn clean package        # Build JAR
mvn flyway:migrate       # Run migrations

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services

# Kubernetes
kubectl apply -f k8s/    # Deploy to K8s
kubectl get pods         # Check status
```

---

**Last Updated**: 2025-10-13  
**Version**: 1.0.0-SNAPSHOT  
**Status**: 🔴 Development (Not Production Ready)

**⚠️ DO NOT DEPLOY TO PRODUCTION** until critical issues are resolved. See [production readiness analysis](docs/ANALYSIS_SUMMARY.md) for details.
