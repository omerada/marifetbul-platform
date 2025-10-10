# TODO List - MarifetBul Backend

> **Son Güncelleme**: 2025-10-10  
> **Sprint**: Sprint 1  
> **Toplam Görev**: 7 major tasks

---

## 🚨 URGENT (Bu oturumda yapılacak)

### Sprint 1 - Task 1.1: Project Initialization

**Priority**: 🔴 CRITICAL  
**Status**: ⏳ Not Started  
**Estimated**: 2 hours

- [ ] Create Maven project with Spring Initializr
- [ ] Add required dependencies to pom.xml:
  - spring-boot-starter-web
  - spring-boot-starter-security
  - spring-boot-starter-data-jpa
  - postgresql driver
  - redis
  - lombok
  - mapstruct
  - validation
  - jwt
- [ ] Create package structure:
  - com.marifetbul.api.config
  - com.marifetbul.api.security
  - com.marifetbul.api.domain
  - com.marifetbul.api.common
  - com.marifetbul.api.infrastructure
- [ ] Create application.yml, application-dev.yml, application-test.yml, application-prod.yml
- [ ] Create .gitignore
- [ ] Initial git commit

**Acceptance Criteria**:

- ✅ Project builds successfully: `mvn clean install`
- ✅ No compilation errors
- ✅ Git repository initialized

---

## 🔥 HIGH (Bugün/yarın)

### Sprint 1 - Task 1.2: Database Setup

**Priority**: 🔴 HIGH  
**Status**: ⏳ Not Started  
**Estimated**: 1.5 hours

- [ ] Create docker-compose.yml with:
  - PostgreSQL 15+ service
  - Redis 7+ service
  - Network configuration
  - Volume mounts
- [ ] Start containers: `docker-compose up -d`
- [ ] Test PostgreSQL connection
- [ ] Test Redis connection
- [ ] Configure Flyway in application.yml
- [ ] Create first migration: `V1__init_schema.sql`

**Acceptance Criteria**:

- ✅ Containers running: `docker ps`
- ✅ Can connect to PostgreSQL
- ✅ Can connect to Redis
- ✅ Flyway migrations run successfully

---

### Sprint 1 - Task 1.3: Core Configuration

**Priority**: 🔴 HIGH  
**Status**: ⏳ Not Started  
**Estimated**: 2 hours

- [ ] Create DatabaseConfig.java
  - HikariCP configuration
  - JPA properties
  - Transaction management
- [ ] Create RedisConfig.java
  - RedisTemplate bean
  - Cache configuration
  - Serializers
- [ ] Create WebConfig.java
  - CORS configuration
  - Message converters
  - Interceptors
- [ ] Create OpenAPIConfig.java
  - Swagger UI setup
  - API documentation
  - Security schema
- [ ] Update application.yml with all configs

**Acceptance Criteria**:

- ✅ Application starts without errors
- ✅ Database pool configured
- ✅ Redis cache working
- ✅ CORS headers present
- ✅ Swagger UI accessible: http://localhost:8080/swagger-ui.html

---

## 🟡 MEDIUM (Bu hafta)

### Sprint 1 - Task 1.4: Base Infrastructure

**Priority**: 🟡 MEDIUM  
**Status**: ⏳ Not Started  
**Estimated**: 2 hours

- [ ] Create BaseEntity.java
  - id field (UUID)
  - createdAt, updatedAt (audit fields)
  - version (optimistic locking)
- [ ] Create ApiResponse.java
  - success field
  - data field (generic)
  - message field
  - timestamp field
- [ ] Create ErrorResponse.java
  - error code
  - error message
  - details list
- [ ] Create PageResponse.java
  - data list
  - pagination metadata
- [ ] Create GlobalExceptionHandler.java
  - @ControllerAdvice
  - Handle common exceptions
  - Return standardized error responses

**Acceptance Criteria**:

- ✅ BaseEntity can be extended
- ✅ ApiResponse wraps all responses
- ✅ Exceptions return proper ErrorResponse
- ✅ Unit tests written for all classes

---

### Sprint 1 - Task 1.5: Security Foundation

**Priority**: 🟡 MEDIUM  
**Status**: ⏳ Not Started  
**Estimated**: 3 hours

- [ ] Create JwtTokenProvider.java
  - generateToken() method
  - validateToken() method
  - extractUsername() method
  - JWT secret configuration
- [ ] Create JwtAuthenticationFilter.java
  - Extract token from header
  - Validate token
  - Set authentication in SecurityContext
- [ ] Create SecurityConfig.java
  - Security filter chain
  - Password encoder bean
  - CORS configuration
  - Endpoint authorization rules
- [ ] Create UserPrincipal.java
  - Implement UserDetails
  - User information holder
- [ ] Create CustomUserDetailsService.java (skeleton)
  - Implement UserDetailsService
  - Load user from database (placeholder)

**Acceptance Criteria**:

- ✅ JWT token can be generated
- ✅ JWT token can be validated
- ✅ Security filter chain configured
- ✅ Endpoints protected appropriately
- ✅ Unit tests for token provider

---

### Sprint 1 - Task 1.6: Health Check & Actuator

**Priority**: 🟡 MEDIUM  
**Status**: ⏳ Not Started  
**Estimated**: 1 hour

- [ ] Add spring-boot-starter-actuator dependency
- [ ] Configure actuator endpoints in application.yml
- [ ] Create custom health indicators:
  - Database health check
  - Redis health check
- [ ] Configure info endpoint
- [ ] Configure metrics endpoint
- [ ] Test all actuator endpoints

**Acceptance Criteria**:

- ✅ /actuator/health returns UP
- ✅ /actuator/info returns app info
- ✅ /actuator/metrics available
- ✅ Custom health indicators working

---

## 🟢 LOW (İhtiyaç varsa)

### Sprint 1 - Task 1.7: Logging Setup

**Priority**: 🟢 LOW  
**Status**: ⏳ Not Started  
**Estimated**: 1 hour

- [ ] Create logback-spring.xml
- [ ] Configure log patterns
- [ ] Set log levels per environment
- [ ] Configure file appenders
- [ ] Configure rolling policy
- [ ] Test logging in different levels

**Acceptance Criteria**:

- ✅ Logs written to file
- ✅ Different log levels work
- ✅ Log rotation configured
- ✅ Console and file logging both work

---

## 📊 Sprint Özeti

```
Total Tasks: 7
Completed: 0 (0%)
In Progress: 0 (0%)
Not Started: 7 (100%)

Estimated Total Time: 12.5 hours
Actual Time Spent: 0 hours
Remaining Time: 12.5 hours
```

---

## 🎯 Sonraki Sprint Preview (Sprint 2)

### Sprint 2: Core User System

- User entity
- User repository
- User service
- User controller
- Authentication endpoints
- User CRUD endpoints
- Freelancer entity
- Employer entity

_(Detaylar Sprint 1 tamamlandıktan sonra)_

---

## 📝 Notlar

### Bağımlılıklar

- Task 1.2 depends on Task 1.1
- Task 1.3 depends on Task 1.2
- Task 1.4 depends on Task 1.3
- Task 1.5 depends on Task 1.3, 1.4
- Task 1.6 depends on Task 1.3
- Task 1.7 can be done anytime

### Öneriler

1. Task'ları sırayla yap (1.1 → 1.2 → 1.3 → ...)
2. Her task'ı bitir, test et, commit et
3. Blocking sorun olursa daha küçük parçalara böl
4. Her commit öncesi testleri çalıştır
5. DEVELOPMENT-PROGRESS.md'yi güncellemeyi unutma

### Hızlı Komutlar

```bash
# Build
mvn clean install

# Test
mvn test

# Run
mvn spring-boot:run

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down

# Git
git status
git add .
git commit -m "feat(task): description"
git push origin develop
```

---

**Sonraki Güncelleme**: Her task tamamlandığında
**Durum Kontrolü**: Her gün başında
**Referans**: AI-AGENT-INSTRUCTIONS.md
