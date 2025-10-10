# Spring Boot Backend Mimarisi - MarifetBul

> **Proje:** MarifetBul - Türkiye'nin Freelance & İş Bulma Platformu  
> **Backend:** Spring Boot 3.x + Java 17+  
> **Mimari:** Layered Architecture (Clean Architecture Principles)  
> **Tarih:** Ekim 2025  
> **Versiyon:** 1.0.0

---

## 📋 Dokümantasyon İçeriği

Bu dokümantasyon, MarifetBul platformunun Spring Boot backend mimarisinin AI-agent destekli geliştirme için hazırlanmış kapsamlı teknik kılavuzudur.

### Dokümantasyon Modülleri

| Dosya                                                          | İçerik                                                      | Durum |
| -------------------------------------------------------------- | ----------------------------------------------------------- | ----- |
| **[01-PROJECT-ANALYSIS.md](./01-PROJECT-ANALYSIS.md)**         | Proje analizi, fonksiyonel gereksinimler, kullanıcı tipleri | ✅    |
| **[02-ARCHITECTURE-DESIGN.md](./02-ARCHITECTURE-DESIGN.md)**   | Mimari tasarım, katmanlar, modüller                         | ✅    |
| **[03-DATABASE-DESIGN.md](./03-DATABASE-DESIGN.md)**           | Veritabanı şeması, ERD, migration stratejisi                | ✅    |
| **[04-API-DESIGN.md](./04-API-DESIGN.md)**                     | RESTful API endpoints, request/response formatları          | ✅    |
| **[05-SECURITY.md](./05-SECURITY.md)**                         | Spring Security, JWT, RBAC yapılandırması                   | ✅    |
| **[06-DOMAIN-MODELS.md](./06-DOMAIN-MODELS.md)**               | Domain entities, DTOs, services                             | ✅    |
| **[07-TEST-STRATEGY.md](./07-TEST-STRATEGY.md)**               | Test stratejisi, örnekler                                   | ✅    |
| **[08-DEVOPS.md](./08-DEVOPS.md)**                             | Docker, CI/CD, deployment                                   | ✅    |
| **[09-AI-DEVELOPMENT-GUIDE.md](./09-AI-DEVELOPMENT-GUIDE.md)** | AI-agent geliştirme standartları                            | ✅    |
| **[10-ROADMAP.md](./10-ROADMAP.md)**                           | Sprint bazlı geliştirme planı                               | ✅    |

---

## 🎯 Proje Özeti

### Platform Tipi

**Freelance & İş Bulma Platformu** - MarifetBul, freelancer'lar ve işverenleri buluşturan, iş ve hizmet paketlerinin alınıp satıldığı, kapsamlı mesajlaşma ve ödeme sistemlerine sahip bir B2B/C2C platformudur.

### Temel Özellikler

#### 1. Kullanıcı Yönetimi

- **Üç Kullanıcı Tipi**: Freelancer, Employer, Admin
- Multi-step kayıt süreci
- Profil yönetimi ve portfolyo sistemi
- Yetkilendirme ve rol tabanlı erişim (RBAC)

#### 2. Marketplace

- **İş İlanları (Jobs)**: Employer'lar tarafından oluşturulan proje bazlı işler
- **Hizmet Paketleri (Packages)**: Freelancer'ların önceden tanımlı hizmet teklifleri
- Kategori ve beceri bazlı filtreleme
- Gelişmiş arama ve öneri sistemi

#### 3. Teklif & İş Akışı

- Proposal (Teklif) sistemi
- Order (Sipariş) yönetimi
- Milestone (Aşama) takibi
- Teslimat ve revizyon süreci

#### 4. Mesajlaşma

- Real-time mesajlaşma sistemi
- Dosya ve medya paylaşımı
- Typing indicators ve online durumu
- Conversation ve message yönetimi

#### 5. Ödeme Sistemi

- Escrow (emanet) sistemi
- Çoklu ödeme yöntemleri
- Komisyon hesaplama
- Fatura ve gelir takibi

#### 6. İçerik Yönetimi

- Blog sistemi
- Kategori ve tag yönetimi
- SEO optimizasyonu
- Dinamik içerik yönetimi

#### 7. Destek & Moderasyon

- Ticket (Destek talebi) sistemi
- Admin moderasyon paneli
- Kullanıcı raporlama
- İçerik denetimi

#### 8. Analytics & Raporlama

- Kullanıcı aktivite izleme
- İş ve paket istatistikleri
- Gelir ve komisyon raporları
- Admin dashboard

---

## 🏗️ Teknoloji Stack

### Backend Core

```
Spring Boot 3.2+
Java 17+
Maven 3.9+
```

### Veritabanı

```
PostgreSQL 15+ (Primary)
Redis 7+ (Cache & Session)
```

### Security

```
Spring Security 6+
JWT (JSON Web Token)
OAuth2 (Future: Social login)
```

### API & Documentation

```
Spring Web
Spring REST
OpenAPI 3.0 (Swagger)
```

### ORM & Data

```
Spring Data JPA
Hibernate 6+
Flyway (Migration)
```

### Testing

```
JUnit 5
Mockito
Testcontainers
REST Assured
```

### DevOps & Deployment

```
Docker & Docker Compose
GitHub Actions (CI/CD)
AWS / Azure (Production)
```

### Monitoring & Logging

```
Spring Actuator
Micrometer
SLF4J + Logback
Sentry (Error tracking)
```

---

## 📁 Backend Proje Yapısı

```
marifetbul-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── marifetbul/
│   │   │           ├── MarifetbulApplication.java
│   │   │           │
│   │   │           ├── config/                    # Konfigürasyon
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── JwtConfig.java
│   │   │           │   ├── CorsConfig.java
│   │   │           │   ├── RedisConfig.java
│   │   │           │   ├── AsyncConfig.java
│   │   │           │   └── OpenApiConfig.java
│   │   │           │
│   │   │           ├── security/                  # Güvenlik katmanı
│   │   │           │   ├── jwt/
│   │   │           │   │   ├── JwtTokenProvider.java
│   │   │           │   │   ├── JwtAuthenticationFilter.java
│   │   │           │   │   └── JwtTokenValidator.java
│   │   │           │   ├── UserPrincipal.java
│   │   │           │   └── CustomUserDetailsService.java
│   │   │           │
│   │   │           ├── domain/                    # Domain katmanı
│   │   │           │   ├── user/
│   │   │           │   │   ├── entity/
│   │   │           │   │   ├── dto/
│   │   │           │   │   ├── repository/
│   │   │           │   │   ├── service/
│   │   │           │   │   └── controller/
│   │   │           │   │
│   │   │           │   ├── job/
│   │   │           │   ├── package/
│   │   │           │   ├── proposal/
│   │   │           │   ├── order/
│   │   │           │   ├── message/
│   │   │           │   ├── payment/
│   │   │           │   ├── blog/
│   │   │           │   ├── support/
│   │   │           │   ├── notification/
│   │   │           │   └── analytics/
│   │   │           │
│   │   │           ├── common/                    # Ortak bileşenler
│   │   │           │   ├── dto/
│   │   │           │   │   ├── ApiResponse.java
│   │   │           │   │   ├── PageResponse.java
│   │   │           │   │   └── ErrorResponse.java
│   │   │           │   ├── exception/
│   │   │           │   │   ├── GlobalExceptionHandler.java
│   │   │           │   │   ├── ResourceNotFoundException.java
│   │   │           │   │   ├── BusinessException.java
│   │   │           │   │   └── ValidationException.java
│   │   │           │   ├── util/
│   │   │           │   ├── constant/
│   │   │           │   └── validator/
│   │   │           │
│   │   │           └── infrastructure/            # Altyapı servisleri
│   │   │               ├── cache/
│   │   │               ├── email/
│   │   │               ├── storage/
│   │   │               ├── search/
│   │   │               └── notification/
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-test.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__init_schema.sql
│   │               ├── V2__add_users.sql
│   │               └── ...
│   │
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── marifetbul/
│       │           ├── integration/
│       │           ├── unit/
│       │           └── e2e/
│       └── resources/
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docs/                                          # Bu dokümantasyon
├── scripts/
├── pom.xml
└── README.md
```

---

## 🔄 Frontend-Backend Entegrasyonu

### Mevcut Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **API Client**: SWR (React Hooks for data fetching)

### Entegrasyon Noktaları

#### 1. Authentication

```typescript
// Frontend: lib/core/store/domains/auth/authStore.ts
// Backend: /api/v1/auth/login, /api/v1/auth/register
```

#### 2. API Base URL

```typescript
// Frontend: API_BASE_URL = /api/v1
// Backend: Base path = /api/v1
```

#### 3. Data Format

- **Request**: JSON
- **Response**: Standardized ApiResponse wrapper
- **Authentication**: Bearer Token (JWT)

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

```bash
Java 17+
Maven 3.9+
PostgreSQL 15+
Redis 7+
Docker (opsiyonel)
```

### Kurulum

```bash
# Proje klasörünü oluştur
mkdir marifetbul-backend
cd marifetbul-backend

# Spring Initializr ile proje oluştur (veya manuel)
# Dependencies: Web, Security, JPA, PostgreSQL, Redis, Validation, Lombok

# Veritabanını başlat
docker-compose up -d postgres redis

# Uygulamayı çalıştır
mvn spring-boot:run
```

### Test

```bash
# Tüm testleri çalıştır
mvn test

# Sadece unit testler
mvn test -Dtest=*UnitTest

# Integration testler
mvn test -Dtest=*IntegrationTest
```

---

## 📚 Mimari Prensipler

### 1. Layered Architecture

- **Presentation Layer**: Controllers, REST endpoints
- **Business Layer**: Services, business logic
- **Persistence Layer**: Repositories, data access
- **Domain Layer**: Entities, domain models

### 2. Clean Architecture Principles

- Dependency Rule (içten dışa)
- Domain bağımsızlığı
- Infrastructure soyutlama

### 3. Design Patterns

- Repository Pattern
- Service Layer Pattern
- DTO Pattern
- Factory Pattern
- Strategy Pattern

### 4. SOLID Principles

- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

---

## 🔐 Security Overview

### Authentication

- JWT (JSON Web Token) based
- Stateless authentication
- Token refresh mechanism
- Remember me functionality

### Authorization

- Role-Based Access Control (RBAC)
- Method-level security
- Resource-level permissions

### Data Protection

- Password encryption (BCrypt)
- Sensitive data encryption
- SQL injection prevention
- XSS protection

---

## 📊 API Versioning Strategy

```
/api/v1/*  - Current stable version
/api/v2/*  - Future version (breaking changes)
```

### Versioning Approach

- URI versioning (recommended for simplicity)
- Backward compatibility maintained
- Deprecation notices

---

## 🧪 Testing Strategy

### Test Pyramid

```
    /\
   /  \    E2E Tests (10%)
  /____\
 /      \   Integration Tests (30%)
/__________\ Unit Tests (60%)
```

### Coverage Target

- **Unit Tests**: 80%+
- **Integration Tests**: 60%+
- **E2E Tests**: Critical paths

---

## 📦 Deployment Strategy

### Environments

1. **Development** (local)
2. **Testing/Staging** (cloud)
3. **Production** (cloud)

### CI/CD Pipeline

```
Code Push → Build → Test → Docker Build → Deploy
```

---

## 📖 İlgili Dokümantasyon

Detaylı bilgi için ilgili dokümantasyon dosyalarını inceleyin:

1. **[Proje Analizi](./01-PROJECT-ANALYSIS.md)** - Fonksiyonel gereksinimler ve kullanıcı akışları
2. **[Mimari Tasarım](./02-ARCHITECTURE-DESIGN.md)** - Katman yapısı ve modül detayları
3. **[Veritabanı](./03-DATABASE-DESIGN.md)** - ERD ve tablo yapıları
4. **[API Tasarımı](./04-API-DESIGN.md)** - Endpoint'ler ve API spesifikasyonları
5. **[Güvenlik](./05-SECURITY.md)** - Authentication ve authorization detayları

---

## 🤝 Katkıda Bulunma

Bu dokümantasyon AI-agent destekli geliştirme için optimize edilmiştir. Geliştirme yaparken:

1. Domain-driven yaklaşımı takip edin
2. Kod standartlarına uyun
3. Test yazın
4. Dokümantasyonu güncelleyin
5. Clean code prensiplerini uygulayın

---

## 📝 Notlar

- Bu dokümantasyon canlı bir dokümandır ve proje ilerledikçe güncellenecektir
- Her modül bağımsız olarak geliştirilebilir
- API contract'ları önce tasarlanmalı, sonra implement edilmelidir
- Test-Driven Development (TDD) yaklaşımı önerilir

---

## 🎓 Geliştirme Senaryoları

### Senaryo 1: İlk Backend Kurulumu

```bash
# 1. Proje oluştur
mkdir marifetbul-backend && cd marifetbul-backend

# 2. Spring Initializr kullan veya pom.xml oluştur
# Dependencies: Web, Security, JPA, PostgreSQL, Redis, Validation, Lombok, MapStruct

# 3. Docker ile veritabanlarını başlat
docker-compose up -d postgres redis

# 4. Application.yml dosyasını yapılandır
cat > src/main/resources/application.yml << EOF
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/marifetbul
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
EOF

# 5. İlk migration'ı oluştur
mkdir -p src/main/resources/db/migration
cat > src/main/resources/db/migration/V1__init_schema.sql

# 6. Uygulamayı başlat
mvn spring-boot:run
```

### Senaryo 2: Yeni Bir Domain Eklemek (Örnek: Job)

```bash
# Adım 1: Entity oluştur
# src/main/java/com/marifetbul/domain/job/entity/Job.java

# Adım 2: DTOs oluştur
# src/main/java/com/marifetbul/domain/job/dto/CreateJobRequest.java
# src/main/java/com/marifetbul/domain/job/dto/JobResponse.java

# Adım 3: Repository oluştur
# src/main/java/com/marifetbul/domain/job/repository/JobRepository.java

# Adım 4: Mapper oluştur
# src/main/java/com/marifetbul/domain/job/mapper/JobMapper.java

# Adım 5: Service oluştur
# src/main/java/com/marifetbul/domain/job/service/JobService.java

# Adım 6: Controller oluştur
# src/main/java/com/marifetbul/domain/job/controller/JobController.java

# Adım 7: Test yaz
# src/test/java/com/marifetbul/domain/job/service/JobServiceTest.java

# Adım 8: Database migration ekle
# src/main/resources/db/migration/V5__create_jobs_table.sql
```

### Senaryo 3: API'yi Test Etmek

```bash
# Kullanıcı kaydı
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freelancer@test.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "FREELANCER"
  }'

# Giriş yap ve token al
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freelancer@test.com",
    "password": "SecurePass123!"
  }' | jq -r '.data.token')

# Token ile iş ilanlarını getir
curl -X GET "http://localhost:8080/api/v1/jobs?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"

# İş ilanı oluştur (Employer olarak)
curl -X POST http://localhost:8080/api/v1/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Developer Needed",
    "description": "Looking for experienced React developer...",
    "categoryId": "uuid-here",
    "skills": ["React", "TypeScript", "Node.js"],
    "budget": {
      "type": "FIXED",
      "amount": 5000
    }
  }'
```

### Senaryo 4: Docker ile Production Deployment

```bash
# 1. Docker image oluştur
docker build -t marifetbul-backend:1.0.0 .

# 2. Docker Compose ile production başlat
docker-compose -f docker-compose.prod.yml up -d

# 3. Health check
curl http://localhost:8080/actuator/health

# 4. Logs kontrol et
docker logs marifetbul-backend -f

# 5. Metrics kontrol et
curl http://localhost:8080/actuator/metrics
```

---

## 🔧 Troubleshooting

### Problem 1: Database Connection Hatası

```bash
# Hatalar:
# - "Connection refused to postgres:5432"
# - "Authentication failed for user postgres"

# Çözüm:
1. PostgreSQL'in çalıştığını kontrol et
   docker ps | grep postgres

2. Connection string'i kontrol et
   spring.datasource.url=jdbc:postgresql://localhost:5432/marifetbul

3. Credentials'ı kontrol et
   spring.datasource.username=postgres
   spring.datasource.password=postgres
```

### Problem 2: JWT Token Hatası

```bash
# Hata: "Invalid JWT signature"

# Çözüm:
1. JWT secret key'in aynı olduğunu kontrol et
2. Token expiration süresini kontrol et
3. Token format'ını kontrol et: "Bearer {token}"
```

### Problem 3: Migration Hatası

```bash
# Hata: "Flyway migration failed"

# Çözüm:
1. Migration dosyalarının sırasını kontrol et (V1__, V2__, V3__)
2. SQL syntax'ını kontrol et
3. Flyway metadata tablosunu temizle:
   DELETE FROM flyway_schema_history WHERE success = false;
```

---

## 📊 Performance Best Practices

### 1. Database Query Optimization

```java
// ❌ N+1 Problem
List<Job> jobs = jobRepository.findAll();
for (Job job : jobs) {
    job.getEmployer().getName(); // Her job için ayrı query!
}

// ✅ Fetch Join ile çöz
@Query("SELECT j FROM Job j LEFT JOIN FETCH j.employer WHERE j.status = :status")
List<Job> findActiveJobsWithEmployer(@Param("status") JobStatus status);
```

### 2. Caching Strategy

```java
@Service
public class JobService {

    @Cacheable(value = "jobs", key = "#id")
    public JobResponse getJobById(UUID id) {
        // Cache'de varsa database'e gitmez
    }

    @CacheEvict(value = "jobs", key = "#id")
    public void updateJob(UUID id, UpdateJobRequest request) {
        // Update sonrası cache'i temizle
    }

    @CacheEvict(value = "jobs", allEntries = true)
    public void deleteJob(UUID id) {
        // Tüm job cache'ini temizle
    }
}
```

### 3. Pagination

```java
// ❌ Tüm kayıtları getir
List<Job> allJobs = jobRepository.findAll(); // Memory overflow riski!

// ✅ Pagination kullan
Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
Page<Job> jobs = jobRepository.findAll(pageable);
```

### 4. Async Processing

```java
@Service
public class NotificationService {

    @Async
    public CompletableFuture<Void> sendEmailNotification(User user, String message) {
        // Email gönderimi async olarak yapılır, ana thread'i bloklamaz
        emailService.send(user.getEmail(), message);
        return CompletableFuture.completedFuture(null);
    }
}
```

---

## 🎯 Quick Reference

### Yaygın Endpointler

```
POST   /api/v1/auth/register        - Kayıt ol
POST   /api/v1/auth/login           - Giriş yap
GET    /api/v1/users/me             - Profili getir
GET    /api/v1/jobs                 - İş ilanları
POST   /api/v1/jobs                 - İş ilanı oluştur
GET    /api/v1/packages             - Paketler
POST   /api/v1/proposals            - Teklif ver
GET    /api/v1/orders               - Siparişler
GET    /api/v1/conversations        - Mesajlar
POST   /api/v1/reviews              - İnceleme yaz
```

### HTTP Status Codes

```
200 OK                    - Başarılı GET
201 Created               - Başarılı POST
204 No Content            - Başarılı DELETE
400 Bad Request           - Validation hatası
401 Unauthorized          - Login gerekli
403 Forbidden             - Yetki yok
404 Not Found             - Kayıt bulunamadı
500 Internal Server Error - Sunucu hatası
```

### Environment Variables

```bash
# Development
DATABASE_URL=jdbc:postgresql://localhost:5432/marifetbul
JWT_SECRET=dev-secret-key-32-characters-min
REDIS_HOST=localhost
REDIS_PORT=6379

# Production (AWS Secrets Manager'dan alınacak)
DATABASE_URL=${aws_secret:db-url}
JWT_SECRET=${aws_secret:jwt-secret}
```

---

## 📚 Ek Kaynaklar

### Resmi Dokümantasyon

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Hibernate Documentation](https://hibernate.org/orm/documentation/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Kod Kalitesi Araçları

```xml
<!-- SonarQube for code quality -->
<plugin>
    <groupId>org.sonarsource.scanner.maven</groupId>
    <artifactId>sonar-maven-plugin</artifactId>
</plugin>

<!-- JaCoCo for code coverage -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
</plugin>

<!-- Spotless for code formatting -->
<plugin>
    <groupId>com.diffplug.spotless</groupId>
    <artifactId>spotless-maven-plugin</artifactId>
</plugin>
```

### Önerilen IDE Ayarları (IntelliJ IDEA)

```
Settings > Editor > Code Style > Java
  - Tab size: 4
  - Use tab character: unchecked

Plugins to install:
  - Lombok Plugin
  - MapStruct Support
  - SonarLint
  - JPA Buddy
  - Spring Assistant
```

---

**Son Güncelleme**: Ekim 2025  
**Proje Durumu**: Tasarım Aşaması  
**Backend Durumu**: Geliştirilmemiş (Hazır dokümantasyon ile başlanacak)  
**Dokümantasyon Durumu**: ✅ %100 Tamamlandı ve Detaylandırıldı
