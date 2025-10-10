# Current Sprint: Sprint 1

## Sprint Bilgileri

- **Sprint No**: 1
- **Başlangıç**: TBD (To Be Determined)
- **Bitiş**: TBD (2 hafta sonra)
- **Süre**: 2 hafta
- **İlerleme**: 0%
- **Durum**: 🔴 Başlamadı

---

## Sprint Hedefi

**Project Infrastructure & Core Setup**

Sprint 1'in amacı, projenin temel altyapısını kurmak ve core infrastructure'ı hazırlamaktır:

- Maven project setup
- Database configuration (PostgreSQL + Redis)
- Security foundation (JWT, Spring Security)
- Base classes and utilities
- Basic health checks

---

## Sprint Backlog

### 🔴 HIGH PRIORITY (Önce bunlar)

#### Task 1.1: Project Initialization ⏳ 0%

- [ ] Create Maven project structure
- [ ] Configure pom.xml with dependencies
- [ ] Setup package structure
- [ ] Create application.yml (dev/test/prod)
- [ ] Add .gitignore
- [ ] Initial Git commit

**Assignee**: AI Agent  
**Story Points**: 3  
**Tahmini Süre**: 2 saat

---

#### Task 1.2: Database Setup ⏳ 0%

- [ ] Create docker-compose.yml
- [ ] PostgreSQL container setup
- [ ] Redis container setup
- [ ] Test database connections
- [ ] Configure Flyway migrations
- [ ] Create V1\_\_init_schema.sql

**Assignee**: AI Agent  
**Story Points**: 2  
**Tahmini Süre**: 1.5 saat

---

#### Task 1.3: Core Configuration ⏳ 0%

- [ ] DatabaseConfig.java
- [ ] RedisConfig.java
- [ ] WebConfig.java (CORS)
- [ ] OpenAPIConfig.java
- [ ] Application properties for each profile

**Assignee**: AI Agent  
**Story Points**: 3  
**Tahmini Süre**: 2 saat

---

### 🟡 MEDIUM PRIORITY (Sonra bunlar)

#### Task 1.4: Base Infrastructure ⏳ 0%

- [ ] BaseEntity.java (audit fields)
- [ ] ApiResponse.java (standard wrapper)
- [ ] ErrorResponse.java
- [ ] PageResponse.java
- [ ] GlobalExceptionHandler.java

**Assignee**: AI Agent  
**Story Points**: 3  
**Tahmini Süre**: 2 saat

---

#### Task 1.5: Security Foundation ⏳ 0%

- [ ] JwtTokenProvider.java
- [ ] JwtAuthenticationFilter.java
- [ ] SecurityConfig.java
- [ ] UserPrincipal.java
- [ ] CustomUserDetailsService.java (skeleton)

**Assignee**: AI Agent  
**Story Points**: 5  
**Tahmini Süre**: 3 saat

---

#### Task 1.6: Health Check & Actuator ⏳ 0%

- [ ] Spring Actuator setup
- [ ] Custom health indicators
- [ ] /actuator/health endpoint
- [ ] /actuator/info endpoint
- [ ] Metrics configuration

**Assignee**: AI Agent  
**Story Points**: 2  
**Tahmini Süre**: 1 saat

---

### 🟢 LOW PRIORITY (İhtiyaç varsa)

#### Task 1.7: Logging Setup ⏳ 0%

- [ ] Logback configuration
- [ ] Custom log patterns
- [ ] Log file rotation
- [ ] Log levels per environment

**Assignee**: AI Agent  
**Story Points**: 1  
**Tahmini Süre**: 1 saat

---

## Sprint Timeline

```
Week 1:
Mon-Tue: Tasks 1.1, 1.2, 1.3 (Infrastructure)
Wed-Thu: Tasks 1.4, 1.5 (Base classes & Security)
Fri:     Task 1.6 (Health checks & testing)

Week 2:
Mon:     Task 1.7 (Logging) + Bug fixes
Tue:     Integration testing
Wed:     Code review & refactoring
Thu:     Documentation update
Fri:     Sprint review & next sprint planning
```

---

## Definition of Done

Sprint 1 tamamlanmış sayılır eğer:

- [ ] ✅ Tüm task'lar tamamlandı
- [ ] ✅ Application başarıyla ayağa kalkıyor
- [ ] ✅ Database bağlantısı çalışıyor
- [ ] ✅ Redis bağlantısı çalışıyor
- [ ] ✅ JWT token generate ediliyor ve validate ediliyor
- [ ] ✅ Health check endpoint'i çalışıyor
- [ ] ✅ CORS configuration doğru
- [ ] ✅ Unit testler yazıldı ve geçiyor
- [ ] ✅ Docker container'lar ayakta
- [ ] ✅ Kod dokümante edildi
- [ ] ✅ Git'e commit edildi

---

## Daily Progress

### Hafta 1

#### Pazartesi - [TBD]

**Planlanan**: Project initialization
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Salı - [TBD]

**Planlanan**: Database setup
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Çarşamba - [TBD]

**Planlanan**: Core configuration
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Perşembe - [TBD]

**Planlanan**: Base infrastructure
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Cuma - [TBD]

**Planlanan**: Security foundation
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

---

### Hafta 2

#### Pazartesi - [TBD]

**Planlanan**: Health checks, logging
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Salı - [TBD]

**Planlanan**: Integration testing
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Çarşamba - [TBD]

**Planlanan**: Code review
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Perşembe - [TBD]

**Planlanan**: Documentation
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

#### Cuma - [TBD]

**Planlanan**: Sprint review
**Tamamlanan**: -
**Sorunlar**: -
**Notlar**: -

---

## Riskler ve Engeller

### Potansiyel Riskler

1. **Dependency conflicts**: Maven dependency çakışması
   - **Mitigation**: Dependency management section kullan
2. **Docker issues**: Container başlatma sorunları
   - **Mitigation**: Docker logs'u incele, port conflict kontrolü
3. **JWT configuration**: Token generation/validation hataları
   - **Mitigation**: Test-driven approach, unit tests

---

## Öğrenilen Dersler

_(Sprint sonunda güncellenecek)_

---

## Metrikler

### Story Points

- **Toplam**: 19 points
- **Tamamlanan**: 0 points
- **Velocity**: TBD

### Zaman

- **Tahmini**: 12.5 saat
- **Gerçekleşen**: 0 saat
- **Kalan**: 12.5 saat

### Kalite

- **Code Coverage**: 0%
- **Bug Count**: 0
- **Test Pass Rate**: N/A

---

## Sprint Retrospective

_(Sprint sonunda güncellenecek)_

### Ne İyi Gitti? 😊

### Ne Geliştirilebilir? 🤔

### Action Items 🎯

---

**Sprint Durumu**: 🔴 Başlamadı  
**Sonraki Sprint**: Sprint 2 - Core User System  
**Güncelleme**: Her gün (daily standup sonrası)
