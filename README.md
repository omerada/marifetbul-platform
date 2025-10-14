# 🎯 MarifetBul - Freelance Platform# 🎯 MarifetBul - Freelance Platform

> Production-ready freelance marketplace built with Spring Boot 3.4 + Next.js 15> Modern ve güvenli freelance iş platformu. Next.js 14 (Frontend) + Spring Boot 3.2 (Backend)

[![Build Status](https://img.shields.io/github/workflow/status/marifetbul/marifet/CI)](https://github.com/marifetbul/marifet/actions)[![Production Ready](https://img.shields.io/badge/Production-75%25-yellow)](./PRODUCTION_SUMMARY.md)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)](https://spring.io/projects/spring-boot)[![Node](https://img.shields.io/badge/Node-20.x-green)](package.json)

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg)](https://nextjs.org/)[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](marifetbul-backend/pom.xml)

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)

---

## 🚀 Quick Start

## 📊 Production Readiness Status

### Prerequisites

- **Backend:** Java 17+, Maven 3.9+, PostgreSQL 16+, Redis 7+**Genel Skor: 75/100** - Production'a yakın, iyileştirmeler gerekli

- **Frontend:** Node.js 20+, npm 9+

📖 **Detaylı analiz için:** [PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md)

### Development Setup

### Hızlı Durum

#### Backend

```bash| Kategori            | Durum    | Notlar                 |

cd marifetbul-backend| ------------------- | -------- | ---------------------- |

cp .env.example .env| 🏗️ Mimari           | ⭐⭐⭐⭐ | Solid, modern          |

# Edit .env with your configurations| 🚀 Production Ready | ⭐⭐⭐   | İyileştirme gerekli    |

docker-compose up -d  # Start PostgreSQL, Redis, Elasticsearch| 🧹 Kod Temizliği    | ⭐⭐⭐   | Mock data temizlenmeli |

mvn spring-boot:run| 🔒 Güvenlik         | ⭐⭐⭐⭐ | İyi, küçük düzeltmeler |

```

---

#### Frontend

````bash## 🚀 Hızlı Başlangıç

cp .env.example .env.local

# Edit .env.local with your configurations### Önkoşullar

npm install

npm run dev- Node.js 20.x

```- Java 17

- PostgreSQL 15

**Access:**- Redis 7

- Frontend: http://localhost:3000- Docker (opsiyonel)

- Backend: http://localhost:8080

- API Docs: http://localhost:8080/swagger-ui.html### 1. Repository'yi Clone Edin



## 📋 Features```bash

git clone https://github.com/omerada/marifet.git

### Core Featurescd marifet

- ✅ User Authentication & Authorization (JWT)```

- ✅ Role-based Access Control (RBAC)

- ✅ Job Posting & Management### 2. Environment Setup (Otomatik)

- ✅ Freelancer Packages

- ✅ Proposal System```powershell

- ✅ Real-time Messaging# Windows PowerShell

- ✅ Payment Integration (Stripe).\scripts\setup-env.ps1

- ✅ File Upload (AWS S3)```

- ✅ Advanced Search (Elasticsearch)

- ✅ Email Notifications (SendGrid)Script otomatik olarak şunları yapar:

- ✅ Admin Dashboard

- ✅ Blog System- ✅ `.env.local` oluşturur (frontend)

- ✅ SEO Optimized- ✅ `marifetbul-backend/.env` oluşturur (backend)

- ✅ JWT secret generate eder

### Technical Highlights- ✅ `.gitignore` kontrol eder

- 🔒 Security hardened (OWASP compliant)

- 🚀 Performance optimized### 3. Dependencies Yükle

- 📦 Clean architecture

- 🐳 Docker ready**Frontend:**

- ⚡ CI/CD configured

- 📊 Monitoring & logging```bash

- 🧪 Comprehensive testingnpm install

- 📱 Responsive design```

- ♿ Accessibility (WCAG 2.1)

**Backend:**

## 🏗️ Architecture

```bash

### Backend Stackcd marifetbul-backend

- **Framework:** Spring Boot 3.4.1mvn clean install

- **Language:** Java 17cd ..

- **Database:** PostgreSQL 16```

- **Cache:** Redis 7

- **Search:** Elasticsearch 8### 4. Database Başlat (Docker ile)

- **Security:** Spring Security + JWT

- **API Docs:** OpenAPI 3 (Swagger)```bash

- **Testing:** JUnit 5, Testcontainerscd marifetbul-backend

- **Monitoring:** Sentry, Prometheusdocker-compose up -d postgres redis

cd ..

### Frontend Stack```

- **Framework:** Next.js 15.1

- **UI Library:** React 19Veya manuel:

- **Language:** TypeScript 5.7

- **Styling:** Tailwind CSS 4```bash

- **State Management:** Zustand# PostgreSQL

- **Data Fetching:** SWRcreatedb marifetbul_dev

- **Forms:** React Hook Form + Zod

- **Animation:** Framer Motion# Redis

- **Icons:** Lucide Reactredis-server

````

## 📁 Project Structure

### 5. Database Migration

````

marifet/```bash

├── marifetbul-backend/          # Spring Boot Backendcd marifetbul-backend

│   ├── src/main/java/           # Java source codemvn flyway:migrate

│   │   └── com/marifetbul/api/cd ..

│   │       ├── config/          # Configuration```

│   │       ├── controller/      # REST Controllers

│   │       ├── domain/          # Domain entities### 6. Projeyi Başlat

│   │       ├── security/        # Security components

│   │       └── infrastructure/  # Infrastructure layer**Terminal 1 - Backend:**

│   ├── src/main/resources/      # Application resources

│   │   ├── application.yml      # Main config```bash

│   │   ├── application-dev.yml  # Dev configcd marifetbul-backend

│   │   └── application-prod.yml # Prod configmvn spring-boot:run

│   ├── Dockerfile               # Development Docker```

│   ├── Dockerfile.prod          # Production Docker

│   └── docker-compose.yml       # Local services**Terminal 2 - Frontend:**

│

├── app/                         # Next.js pages & API routes```bash

│   ├── (auth)/                  # Auth pagesnpm run dev

│   ├── admin/                   # Admin pages```

│   ├── api/                     # API routes

│   ├── blog/                    # Blog pages### 7. Tarayıcıda Aç

│   ├── dashboard/               # Dashboard pages

│   └── marketplace/             # Marketplace pages- 🌐 Frontend: http://localhost:3000

│- 🔧 Backend API: http://localhost:8080

├── components/                  # React components- 📖 Swagger UI: http://localhost:8080/swagger-ui.html

│   ├── layout/                  # Layout components

│   ├── shared/                  # Shared components---

│   └── ui/                      # UI primitives

│## 📁 Proje Yapısı

├── lib/                         # Business logic

│   ├── api/                     # API clients```

│   ├── domains/                 # Domain logicmarifeto/

│   ├── infrastructure/          # Infrastructure services├── 📁 app/                      # Next.js App Router

│   └── shared/                  # Shared utilities│   ├── api/                     # API Routes (proxy to backend)

││   ├── (auth)/                  # Auth pages

├── hooks/                       # Custom React hooks│   ├── (info)/                  # Info pages

├── types/                       # TypeScript types│   ├── marketplace/             # Marketplace pages

├── .github/workflows/           # CI/CD workflows│   └── ...

└── public/                      # Static assets│

```├── 📁 components/               # React Components

│   ├── shared/                  # Shared components

## 🔧 Configuration│   ├── domains/                 # Domain-specific components

│   └── ui/                      # UI primitives

### Backend Environment Variables│

See [marifetbul-backend/.env.example](marifetbul-backend/.env.example) for full list.├── 📁 lib/                      # Core libraries

│   ├── infrastructure/          # API client, caching, monitoring

**Critical variables:**│   ├── domains/                 # Business logic

```bash│   └── core/                    # Core utilities

# Database│

DB_URL=jdbc:postgresql://localhost:5432/marifetbul_dev├── 📁 marifetbul-backend/       # Spring Boot Backend

DB_USERNAME=postgres│   ├── src/main/java/           # Java source code

DB_PASSWORD=postgres│   │   └── com/marifetbul/api/

│   │       ├── domain/          # Domain entities & services

# JWT (Generate secure 512-bit key for production)│   │       ├── security/        # Security config & JWT

JWT_SECRET=your_base64_encoded_512bit_secret│   │       ├── infrastructure/  # External integrations

│   │       └── common/          # Common utilities

# CORS│   │

CORS_ALLOWED_ORIGINS=http://localhost:3000│   └── src/main/resources/

│       ├── application.yml      # Spring config

# Optional Services│       └── db/migration/        # Flyway migrations

SENDGRID_API_KEY=your_sendgrid_key│

STRIPE_API_KEY=your_stripe_key├── 📁 scripts/                  # Automation scripts

AWS_S3_BUCKET=your_bucket_name│   ├── cleanup-mocks.ps1        # Mock data cleanup

```│   └── setup-env.ps1            # Environment setup

│

### Frontend Environment Variables├── 📄 PRODUCTION_SUMMARY.md     # 📊 Özet analiz raporu

See [.env.example](.env.example) for full list.├── 📄 PRODUCTION_READINESS_ANALYSIS.md  # 📖 Detaylı analiz

├── 📄 PRODUCTION_CHECKLIST.md   # ✅ Aksiyon checklist

```bash└── 📄 README.md                 # Bu dosya

# Backend API```

NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

---

# App Config

NEXT_PUBLIC_APP_URL=http://localhost:3000## 🎯 Önemli Dökümanlar

NEXT_PUBLIC_APP_NAME=MarifetBul

```### 🆕 Yeni Production Analiz Dökümanları



## 🐳 Docker Deployment| Döküman                                                                   | Amaç                  | Kim Okumalı           |

| ------------------------------------------------------------------------- | --------------------- | --------------------- |

### Development| [📊 PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md)                       | Hızlı özet ve durum   | Herkes (5 dk okuma)   |

```bash| [📖 PRODUCTION_READINESS_ANALYSIS.md](./PRODUCTION_READINESS_ANALYSIS.md) | Detaylı teknik analiz | Tech Lead, Senior Dev |

# Start infrastructure only| [✅ PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)                   | Yapılacaklar listesi  | Tüm takım             |

cd marifetbul-backend| [🔧 scripts/README.md](./scripts/README.md)                               | Script dokümantasyonu | Developers            |

docker-compose up -d

```### Backend Dökümanları



### Production| Döküman                                             | Açıklama              |

```bash| --------------------------------------------------- | --------------------- |

# Build and run all services| [DEPLOYMENT.md](./marifetbul-backend/DEPLOYMENT.md) | Deployment guide      |

docker-compose -f docker-compose.prod.yml up -d| [DEVOPS.md](./marifetbul-backend/DEVOPS.md)         | DevOps infrastructure |

````

---

## 🧪 Testing

## 🚨 Production'a Geçmeden Önce

### Backend Tests

```````bash### Kritik: Mock Data Temizliği Gerekli!

cd marifetbul-backend

mvn test                    # Run testsProjede hala mock data ve test utilities var. Production'a geçmeden önce temizlenmelidir.

mvn test jacoco:report      # Generate coverage

``````powershell

# Otomatik temizlik başlat

### Frontend Tests.\scripts\cleanup-mocks.ps1

```bash```

npm test                    # Run tests

npm run test:watch          # Watch mode**Temizlenmesi Gerekenler:**

npm run test:ci             # CI mode with coverage

```- ❌ `app/api/v1/packages/route.ts` - Mock packages

- ❌ `app/api/legacy/*` - Placeholder endpoints

## 📦 Deployment- ❌ `lib/shared/testing/*` - Test utilities

- ❌ Component'lerde mock data

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide.

**Detaylar için:** [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

### Quick Deploy

---

**Backend (JAR):**

```bash## 🛠️ Development

cd marifetbul-backend

mvn clean package -DskipTests### Available Scripts

java -jar target/marifetbul-api.jar

```**Frontend:**



**Frontend (Vercel):**```bash

```bashnpm run dev          # Development server

vercel --prodnpm run build        # Production build

```npm run start        # Start production server

npm run lint         # ESLint

## 🔐 Securitynpm run lint:fix     # ESLint with auto-fix

npm test             # Run tests

- ✅ JWT authentication with secure tokensnpm run analyze      # Bundle analyzer

- ✅ Password hashing (BCrypt)```

- ✅ CORS protection

- ✅ CSRF protection**Backend:**

- ✅ SQL injection prevention

- ✅ XSS protection```bash

- ✅ Rate limitingmvn spring-boot:run  # Start backend

- ✅ Input validationmvn test             # Run tests

- ✅ Security headers (HSTS, CSP, etc.)mvn verify           # Run tests + integration tests

- ✅ Secure cookies (httpOnly, secure)mvn clean package    # Build JAR

```````

## 📊 Performance

### Tech Stack

- ✅ Redis caching

- ✅ Database connection pooling**Frontend:**

- ✅ Query optimization

- ✅ Image optimization (Next.js)- ⚛️ Next.js 14 (App Router)

- ✅ Code splitting- 📘 TypeScript 5

- ✅ Lazy loading- 🎨 Tailwind CSS 4

- ✅ Compression (gzip/brotli)- 🔄 SWR (Data fetching)

- ✅ CDN ready- 🐻 Zustand (State management)

- 🎯 React Hook Form (Forms)

## 🤝 Contributing- ✅ Zod (Validation)

1. Fork the repository**Backend:**

2. Create your feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add amazing feature'`)- ☕ Java 17

4. Push to the branch (`git push origin feature/amazing-feature`)- 🍃 Spring Boot 3.2

5. Open a Pull Request- 🔒 Spring Security + JWT

- 🐘 PostgreSQL 15

## 📝 License- 🔴 Redis (Caching)

- 🔄 Flyway (Migrations)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.- 📊 Elasticsearch 8 (Search)

- 💳 Stripe (Payments)

## 📞 Support- 📧 SendGrid (Email)

- ☁️ AWS S3 (Storage)

- **Email:** support@marifetbul.com

- **Documentation:** https://docs.marifetbul.com**DevOps:\*\*

- **Issues:** https://github.com/marifetbul/marifet/issues

- 🐳 Docker + Docker Compose

## 🙏 Acknowledgments- ☸️ Kubernetes

- 📊 Prometheus + Grafana

- Spring Boot Team- 🐛 Sentry (Error tracking)

- Next.js Team

- React Team---

- All contributors

## 🧪 Testing

---

### Frontend Tests

**Status:** ✅ Production Ready

**Version:** 1.0.0 ```bash

**Last Updated:** October 2025npm test # Run all tests

npm run test:watch # Watch mode

Made with ❤️ by MarifetBul Teamnpm run test:ci # CI mode with coverage

````

### Backend Tests

```bash
mvn test                    # Unit tests
mvn verify                  # Integration tests
mvn test jacoco:report      # Coverage report
````

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
