# 🎯 MarifetBul - Freelance Platform

> Modern ve güvenli freelance iş platformu. Next.js 14 (Frontend) + Spring Boot 3.2 (Backend)

[![Production Ready](https://img.shields.io/badge/Production-75%25-yellow)](./PRODUCTION_SUMMARY.md)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-20.x-green)](package.json)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](marifetbul-backend/pom.xml)

---

## 📊 Production Readiness Status

**Genel Skor: 75/100** - Production'a yakın, iyileştirmeler gerekli

📖 **Detaylı analiz için:** [PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md)

### Hızlı Durum

| Kategori            | Durum    | Notlar                 |
| ------------------- | -------- | ---------------------- |
| 🏗️ Mimari           | ⭐⭐⭐⭐ | Solid, modern          |
| 🚀 Production Ready | ⭐⭐⭐   | İyileştirme gerekli    |
| 🧹 Kod Temizliği    | ⭐⭐⭐   | Mock data temizlenmeli |
| 🔒 Güvenlik         | ⭐⭐⭐⭐ | İyi, küçük düzeltmeler |

---

## 🚀 Hızlı Başlangıç

### Önkoşullar

- Node.js 20.x
- Java 17
- PostgreSQL 15
- Redis 7
- Docker (opsiyonel)

### 1. Repository'yi Clone Edin

```bash
git clone https://github.com/omerada/marifet.git
cd marifet
```

### 2. Environment Setup (Otomatik)

```powershell
# Windows PowerShell
.\scripts\setup-env.ps1
```

Script otomatik olarak şunları yapar:

- ✅ `.env.local` oluşturur (frontend)
- ✅ `marifetbul-backend/.env` oluşturur (backend)
- ✅ JWT secret generate eder
- ✅ `.gitignore` kontrol eder

### 3. Dependencies Yükle

**Frontend:**

```bash
npm install
```

**Backend:**

```bash
cd marifetbul-backend
mvn clean install
cd ..
```

### 4. Database Başlat (Docker ile)

```bash
cd marifetbul-backend
docker-compose up -d postgres redis
cd ..
```

Veya manuel:

```bash
# PostgreSQL
createdb marifetbul_dev

# Redis
redis-server
```

### 5. Database Migration

```bash
cd marifetbul-backend
mvn flyway:migrate
cd ..
```

### 6. Projeyi Başlat

**Terminal 1 - Backend:**

```bash
cd marifetbul-backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

### 7. Tarayıcıda Aç

- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8080
- 📖 Swagger UI: http://localhost:8080/swagger-ui.html

---

## 📁 Proje Yapısı

```
marifeto/
├── 📁 app/                      # Next.js App Router
│   ├── api/                     # API Routes (proxy to backend)
│   ├── (auth)/                  # Auth pages
│   ├── (info)/                  # Info pages
│   ├── marketplace/             # Marketplace pages
│   └── ...
│
├── 📁 components/               # React Components
│   ├── shared/                  # Shared components
│   ├── domains/                 # Domain-specific components
│   └── ui/                      # UI primitives
│
├── 📁 lib/                      # Core libraries
│   ├── infrastructure/          # API client, caching, monitoring
│   ├── domains/                 # Business logic
│   └── core/                    # Core utilities
│
├── 📁 marifetbul-backend/       # Spring Boot Backend
│   ├── src/main/java/           # Java source code
│   │   └── com/marifetbul/api/
│   │       ├── domain/          # Domain entities & services
│   │       ├── security/        # Security config & JWT
│   │       ├── infrastructure/  # External integrations
│   │       └── common/          # Common utilities
│   │
│   └── src/main/resources/
│       ├── application.yml      # Spring config
│       └── db/migration/        # Flyway migrations
│
├── 📁 scripts/                  # Automation scripts
│   ├── cleanup-mocks.ps1        # Mock data cleanup
│   └── setup-env.ps1            # Environment setup
│
├── 📄 PRODUCTION_SUMMARY.md     # 📊 Özet analiz raporu
├── 📄 PRODUCTION_READINESS_ANALYSIS.md  # 📖 Detaylı analiz
├── 📄 PRODUCTION_CHECKLIST.md   # ✅ Aksiyon checklist
└── 📄 README.md                 # Bu dosya
```

---

## 🎯 Önemli Dökümanlar

### 🆕 Yeni Production Analiz Dökümanları

| Döküman                                                                   | Amaç                  | Kim Okumalı           |
| ------------------------------------------------------------------------- | --------------------- | --------------------- |
| [📊 PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md)                       | Hızlı özet ve durum   | Herkes (5 dk okuma)   |
| [📖 PRODUCTION_READINESS_ANALYSIS.md](./PRODUCTION_READINESS_ANALYSIS.md) | Detaylı teknik analiz | Tech Lead, Senior Dev |
| [✅ PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)                   | Yapılacaklar listesi  | Tüm takım             |
| [🔧 scripts/README.md](./scripts/README.md)                               | Script dokümantasyonu | Developers            |

### Backend Dökümanları

| Döküman                                             | Açıklama              |
| --------------------------------------------------- | --------------------- |
| [DEPLOYMENT.md](./marifetbul-backend/DEPLOYMENT.md) | Deployment guide      |
| [DEVOPS.md](./marifetbul-backend/DEVOPS.md)         | DevOps infrastructure |

---

## 🚨 Production'a Geçmeden Önce

### Kritik: Mock Data Temizliği Gerekli!

Projede hala mock data ve test utilities var. Production'a geçmeden önce temizlenmelidir.

```powershell
# Otomatik temizlik başlat
.\scripts\cleanup-mocks.ps1
```

**Temizlenmesi Gerekenler:**

- ❌ `app/api/v1/packages/route.ts` - Mock packages
- ❌ `app/api/legacy/*` - Placeholder endpoints
- ❌ `lib/shared/testing/*` - Test utilities
- ❌ Component'lerde mock data

**Detaylar için:** [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

---

## 🛠️ Development

### Available Scripts

**Frontend:**

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm test             # Run tests
npm run analyze      # Bundle analyzer
```

**Backend:**

```bash
mvn spring-boot:run  # Start backend
mvn test             # Run tests
mvn verify           # Run tests + integration tests
mvn clean package    # Build JAR
```

### Tech Stack

**Frontend:**

- ⚛️ Next.js 14 (App Router)
- 📘 TypeScript 5
- 🎨 Tailwind CSS 4
- 🔄 SWR (Data fetching)
- 🐻 Zustand (State management)
- 🎯 React Hook Form (Forms)
- ✅ Zod (Validation)

**Backend:**

- ☕ Java 17
- 🍃 Spring Boot 3.2
- 🔒 Spring Security + JWT
- 🐘 PostgreSQL 15
- 🔴 Redis (Caching)
- 🔄 Flyway (Migrations)
- 📊 Elasticsearch 8 (Search)
- 💳 Stripe (Payments)
- 📧 SendGrid (Email)
- ☁️ AWS S3 (Storage)

**DevOps:**

- 🐳 Docker + Docker Compose
- ☸️ Kubernetes
- 📊 Prometheus + Grafana
- 🐛 Sentry (Error tracking)

---

## 🧪 Testing

### Frontend Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:ci             # CI mode with coverage
```

### Backend Tests

```bash
mvn test                    # Unit tests
mvn verify                  # Integration tests
mvn test jacoco:report      # Coverage report
```

### E2E Tests (TODO)

```bash
npx playwright test         # Run E2E tests
```

---

## 📊 Code Quality

### Frontend Linting

```bash
npm run lint                # Check for issues
npm run lint:fix            # Auto-fix issues
```

### Backend Code Quality

```bash
mvn checkstyle:check        # Checkstyle
mvn spotbugs:check          # SpotBugs
mvn pmd:check               # PMD
```

---

## 🚢 Deployment

### Frontend (Vercel)

**Development:**

```bash
vercel dev
```

**Production:**

```bash
vercel --prod
```

**Environment Variables (Vercel Dashboard):**

```env
NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1
NEXT_PUBLIC_APP_URL=https://marifetbul.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Backend (Docker)

**Build:**

```bash
cd marifetbul-backend
docker build -f Dockerfile.prod -t marifetbul-api:latest .
```

**Run:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Kubernetes:**

```bash
kubectl apply -f k8s/
```

---

## 🔐 Security

### Environment Variables

**ASLA commit etmeyin:**

- ❌ `.env.local`
- ❌ `marifetbul-backend/.env`
- ❌ API keys, secrets

**Production'da kullanın:**

- ✅ Vercel Environment Variables (Frontend)
- ✅ Kubernetes Secrets (Backend)
- ✅ AWS Secrets Manager (opsiyonel)

### Security Best Practices

- ✅ JWT with httpOnly cookies
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Security headers (CSP, HSTS, etc.)

---

## 📈 Monitoring

### Frontend

- 🐛 Sentry (Error tracking)
- 📊 Vercel Analytics
- 🔍 Google Analytics (optional)

### Backend

- 🐛 Sentry (Error tracking)
- 📊 Prometheus + Grafana (Metrics)
- 📋 Spring Boot Actuator (Health checks)
- 📝 ELK Stack (Logs - optional)

**Health Check:**

- Frontend: `http://localhost:3000/api/health`
- Backend: `http://localhost:8080/actuator/health`

---

## 🤝 Contributing

### Branching Strategy

```
main          → Production branch
develop       → Development branch
feature/*     → Feature branches
bugfix/*      → Bugfix branches
hotfix/*      → Hotfix branches
```

### Commit Convention

```bash
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with tests
3. Update documentation
4. Create PR to `develop`
5. Code review
6. Merge after approval

---

## 🐛 Troubleshooting

### Frontend Issues

**Port already in use:**

```bash
# Kill process on port 3000
npx kill-port 3000
```

**Module not found:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**

```bash
rm -rf .next
npm run build
```

### Backend Issues

**Port already in use:**

```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Database connection error:**

```bash
# Check PostgreSQL is running
docker ps
docker-compose logs postgres

# Check credentials in .env
```

**Maven build error:**

```bash
mvn clean install -U
```

---

## 📞 Support

**Documentation:**

- [Production Summary](./PRODUCTION_SUMMARY.md)
- [Production Analysis](./PRODUCTION_READINESS_ANALYSIS.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)

**Contact:**

- 📧 Tech Lead
- 💬 Team Chat: #dev-general
- 🐛 GitHub Issues

---

## 📝 License

Proprietary - All rights reserved.

---

## 🎉 Acknowledgments

- Next.js Team
- Spring Boot Team
- MarifetBul Development Team

---

**Last Updated:** 13 Ekim 2025  
**Version:** 1.0.0  
**Maintainer:** MarifetBul Dev Team

---

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**🎯 Ready to start? Run setup script:**

```powershell
.\scripts\setup-env.ps1
```
