# 🏗️ MarifetBul - System Architecture Documentation

**Version:** 2.0.0  
**Last Updated:** 2025-10-14  
**Author:** MarifetBul Development Team

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Infrastructure Architecture](#infrastructure-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability Strategy](#scalability-strategy)

---

## 🌐 System Overview

MarifetBul is a modern, microservice-ready monolithic application built with:

- **Backend:** Spring Boot 3.4 (Modular Monolith with Domain-Driven Design)
- **Frontend:** Next.js 15 (Server-Side Rendering + Static Generation)
- **Architecture Style:** Clean Architecture + Domain-Driven Design (DDD)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS/CLIENTS                         │
│              (Web Browsers, Mobile Apps)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER / CDN                       │
│                   (Cloudflare / AWS ELB)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴──────────────┐
         ▼                               ▼
┌─────────────────────┐         ┌──────────────────────┐
│   FRONTEND LAYER    │         │   BACKEND API        │
│   Next.js 15 App    │◄────────┤   Spring Boot 3.4    │
│   (SSR + SSG)       │         │   (REST API)         │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
         ┌──────────────────┐   ┌─────────────────┐   ┌──────────────────┐
         │   PostgreSQL 16  │   │    Redis 7      │   │ Elasticsearch 8  │
         │   (Primary DB)   │   │   (Cache/       │   │  (Full-text      │
         │                  │   │    Sessions)    │   │   Search)        │
         └──────────────────┘   └─────────────────┘   └──────────────────┘
                    │
                    ▼
         ┌──────────────────────────────────────────────────────┐
         │              EXTERNAL SERVICES                        │
         │  - SendGrid (Email)                                   │
         │  - Stripe (Payments)                                  │
         │  - AWS S3 (File Storage)                              │
         │  - Sentry (Error Tracking)                            │
         │  - Google Maps (Geocoding)                            │
         └──────────────────────────────────────────────────────┘
```

---

## 🎯 Architecture Principles

### 1. **Clean Architecture**

- Separation of concerns
- Dependency inversion
- Independent of frameworks
- Testable business logic

### 2. **Domain-Driven Design (DDD)**

- Bounded contexts for each business domain
- Rich domain models
- Ubiquitous language
- Strategic and tactical patterns

### 3. **SOLID Principles**

- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

### 4. **Modularity**

- Loosely coupled modules
- High cohesion within modules
- Clear module boundaries
- Easy to extract to microservices if needed

---

## 🏢 Backend Architecture

### Layered Architecture (Clean Architecture)

```
┌───────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│  - REST Controllers (API endpoints)                            │
│  - DTOs (Request/Response objects)                             │
│  - Input validation                                            │
│  - Exception handling                                          │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                          │
│  - Use Cases / Services (Business logic orchestration)         │
│  - Application services                                        │
│  - Transaction management                                      │
│  - Security / Authorization                                    │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                              │
│  - Domain Models (Entities, Value Objects)                     │
│  - Domain Services                                             │
│  - Business Rules                                              │
│  - Domain Events                                               │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                         │
│  - Repositories (Data access)                                  │
│  - External API clients                                        │
│  - File storage                                                │
│  - Caching                                                     │
│  - Email service                                               │
└───────────────────────────────────────────────────────────────┘
```

### Domain Modules (Bounded Contexts)

1. **Auth Domain**
   - User authentication
   - JWT token management
   - Session management

2. **User Domain**
   - User profiles
   - User settings
   - User statistics

3. **Marketplace Domain**
   - Packages (Services)
   - Jobs (Projects)
   - Proposals (Bids)
   - Orders

4. **Payment Domain**
   - Wallet management
   - Transactions
   - Payouts
   - Stripe integration

5. **Messaging Domain**
   - Conversations
   - Messages
   - Real-time notifications

6. **Review Domain**
   - Reviews & ratings
   - Review moderation
   - Rating aggregation

7. **Blog Domain**
   - Blog posts
   - Categories
   - Comments
   - Tags

8. **Support Domain**
   - Support tickets
   - Ticket responses
   - Knowledge base

9. **Analytics Domain**
   - User analytics
   - Revenue analytics
   - Platform metrics

### Technology Stack Details

**Core Framework:**

```java
Spring Boot 3.4.1
├── Spring Web (REST APIs)
├── Spring Security (Auth & Authorization)
├── Spring Data JPA (ORM)
├── Spring Cache (Caching abstraction)
├── Spring Validation (Input validation)
└── Spring Actuator (Health & Metrics)
```

**Data & Persistence:**

```
PostgreSQL 16 (Primary database)
├── Flyway (Database migrations)
├── HikariCP (Connection pooling)
└── JPA/Hibernate (ORM)

Redis 7 (Caching & Sessions)
├── Lettuce client
└── Spring Data Redis

Elasticsearch 8 (Full-text search)
└── Spring Data Elasticsearch
```

**Security:**

```java
JWT (JSON Web Tokens)
├── jjwt 0.12.6
├── HS512 algorithm
└── Refresh token mechanism

Spring Security
├── JWT filter
├── CSRF protection
├── BCrypt password encoding
└── Role-based access control (RBAC)
```

---

## 🎨 Frontend Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                    │
│  app/                                                    │
│  ├── (auth)/          # Auth pages                      │
│  ├── admin/           # Admin panel                     │
│  ├── dashboard/       # User dashboards                 │
│  ├── marketplace/     # Marketplace pages               │
│  └── ...              # Other routes                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 COMPONENT LAYER                          │
│  components/                                             │
│  ├── domains/         # Domain-specific components      │
│  │   ├── auth/        # Login, Register, etc.           │
│  │   ├── marketplace/ # Package cards, Job listings     │
│  │   ├── messaging/   # Chat, Conversations             │
│  │   └── ...          # Other domains                   │
│  ├── layout/          # Layout components               │
│  ├── shared/          # Reusable components             │
│  └── ui/              # UI primitives                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                         │
│  lib/                                                    │
│  ├── api/             # API client                      │
│  │   ├── endpoints.ts # API endpoints                   │
│  │   └── blog.ts      # Blog API functions              │
│  ├── domains/         # Domain services                 │
│  │   ├── auth/        # Auth service                    │
│  │   ├── marketplace/ # Marketplace service             │
│  │   └── ...          # Other domain services           │
│  ├── infrastructure/  # Infrastructure services         │
│  │   ├── api/         # API client config               │
│  │   ├── cache/       # API caching                     │
│  │   ├── retry/       # Retry mechanism                 │
│  │   └── monitoring/  # Sentry, logging                 │
│  └── shared/          # Shared utilities                │
└─────────────────────────────────────────────────────────┘
```

### State Management Strategy

1. **Server State (SWR)**
   - API data caching
   - Automatic revalidation
   - Optimistic updates

2. **Client State (Zustand)**
   - UI state
   - User preferences
   - Cart/temporary data

3. **Form State (React Hook Form)**
   - Form validation
   - Form submission
   - Error handling

### Data Fetching Patterns

```typescript
// Server Components (Next.js 15)
async function ServerComponent() {
  const data = await fetch('http://backend/api/v1/packages');
  return <PackageList packages={data} />;
}

// Client Components (SWR)
function ClientComponent() {
  const { data, error, isLoading } = useSWR(
    '/packages',
    fetcher,
    { revalidateOnFocus: true }
  );

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <PackageList packages={data} />;
}
```

---

## 🔄 Data Flow

### Authentication Flow

```
User Login Request
      │
      ▼
[Frontend] POST /api/v1/auth/login
      │
      ▼
[Backend] AuthController
      │
      ├──> Validate credentials (UserService)
      │
      ├──> Generate JWT tokens (JwtTokenProvider)
      │    ├── Access Token (24h)
      │    └── Refresh Token (7d)
      │
      └──> Set httpOnly cookie
           │
           ▼
[Frontend] Receives tokens
      │
      ├──> Store user data (Zustand)
      │
      └──> Redirect to dashboard
```

### API Request Flow with Caching

```
[Frontend] API Request
      │
      ▼
[API Client] Check cache
      │
      ├──> Cache HIT ──> Return cached data
      │
      └──> Cache MISS
           │
           ▼
      [Backend] API Endpoint
           │
           ├──> Check Redis cache
           │    │
           │    ├──> Cache HIT ──> Return from Redis
           │    │
           │    └──> Cache MISS
           │         │
           │         ▼
           │    [Service Layer]
           │         │
           │         ▼
           │    [Repository Layer]
           │         │
           │         ▼
           │    [PostgreSQL Database]
           │         │
           │         ▼
           │    Save to Redis
           │
           ▼
      [Frontend] Update cache
           │
           ▼
      Display data
```

### Order Creation Flow

```
User clicks "Order Package"
      │
      ▼
[Frontend] POST /api/v1/orders
      │
      ├──> Validate form (Zod schema)
      │
      └──> Submit to backend
           │
           ▼
[Backend] OrderController
      │
      ├──> Validate request (Spring Validation)
      │
      ├──> Check authentication (JWT)
      │
      ├──> Business logic (OrderService)
      │    │
      │    ├──> Check package availability
      │    ├──> Validate buyer != seller
      │    ├──> Calculate total amount
      │    │
      │    └──> Create order entity
      │
      ├──> Save to database (OrderRepository)
      │
      ├──> Create payment intent (StripeService)
      │
      ├──> Send notification (NotificationService)
      │
      └──> Return response
           │
           ▼
[Frontend] Show order confirmation
      │
      └──> Navigate to payment page
```

---

## 🔒 Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────┐
│         SECURITY ARCHITECTURE                │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌─────────────┐         ┌──────────────┐
│ JWT Tokens  │         │ Spring       │
│             │         │ Security     │
│ - Access    │◄────────┤              │
│ - Refresh   │         │ - JWT Filter │
│ - httpOnly  │         │ - CSRF       │
│   cookies   │         │ - CORS       │
└─────────────┘         └──────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          ┌──────────────────┐    ┌─────────────────┐
          │ Role-Based       │    │ Resource-Based  │
          │ Access Control   │    │ Authorization   │
          │ (RBAC)           │    │                 │
          │ - ADMIN          │    │ - Owner check   │
          │ - FREELANCER     │    │ - Permissions   │
          │ - EMPLOYER       │    │                 │
          └──────────────────┘    └─────────────────┘
```

### Security Layers

1. **Network Security**
   - HTTPS/TLS encryption
   - Firewall rules
   - DDoS protection

2. **Application Security**
   - JWT authentication
   - CSRF tokens
   - Rate limiting
   - Input sanitization

3. **Data Security**
   - Encrypted database connections
   - Password hashing (BCrypt)
   - Sensitive data encryption
   - SQL injection prevention

4. **API Security**
   - API key management
   - Webhook signature validation
   - Request validation
   - Response sanitization

---

## 🏗️ Infrastructure Architecture

### Development Environment

```
Developer Machine
├── Backend (Spring Boot)
│   ├── Port: 8080
│   └── Profile: dev
│
├── Frontend (Next.js)
│   ├── Port: 3000
│   └── ENV: development
│
└── Local Services (Docker Compose)
    ├── PostgreSQL:5432
    ├── Redis:6379
    └── Elasticsearch:9200
```

### Production Environment

```
┌──────────────────────────────────────────────────┐
│                LOAD BALANCER                      │
│            (AWS ELB / DigitalOcean)               │
└─────────────┬────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────┐       ┌──────────┐
│Frontend │       │ Backend  │
│(Vercel) │       │(Docker)  │
│Next.js  │       │Spring    │
│         │       │Boot      │
└─────────┘       └────┬─────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌────────┐   ┌─────────┐  ┌──────────┐
    │ PostgreSQL  │ Redis   │  │Elastic-  │
    │ (RDS)  │   │(Managed)│  │search    │
    │        │   │         │  │(Managed) │
    └────────┘   └─────────┘  └──────────┘
```

### Caching Strategy

```
┌─────────────────────────────────────────────┐
│           MULTI-LEVEL CACHING                │
└─────────────────────────────────────────────┘

Level 1: Browser Cache
├── Static assets (images, CSS, JS)
├── API responses (SWR cache)
└── TTL: 5-60 minutes

Level 2: CDN Cache (Cloudflare/Vercel)
├── Static pages
├── Images
└── TTL: 1-24 hours

Level 3: Application Cache (Redis)
├── User sessions
├── API responses
├── Database query results
└── TTL: 1-60 minutes

Level 4: Database Query Cache
├── Hibernate second-level cache
└── TTL: 5-15 minutes
```

---

## 🚀 Deployment Architecture

### CI/CD Pipeline

```
Git Push (GitHub)
      │
      ▼
[GitHub Actions]
      │
      ├──> Run Tests
      │    ├── Backend (JUnit)
      │    └── Frontend (Jest)
      │
      ├──> Code Quality
      │    ├── SonarQube
      │    └── ESLint
      │
      ├──> Build
      │    ├── Backend (Maven)
      │    └── Frontend (Next.js)
      │
      ├──> Docker Build
      │    └── Push to Registry
      │
      └──> Deploy
           ├── Staging (Auto)
           └── Production (Manual approval)
```

### Deployment Targets

**Frontend (Vercel):**

- Automatic deployments on push to main
- Preview deployments for PRs
- Edge caching via Vercel CDN
- Environment variables via dashboard

**Backend (Docker + AWS ECS / DigitalOcean):**

- Docker containerized deployment
- Blue-green deployment strategy
- Auto-scaling based on CPU/memory
- Health check monitoring

---

## 📈 Scalability Strategy

### Horizontal Scaling

```
┌──────────────────────────────────────┐
│         LOAD BALANCER                 │
└────────┬─────────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│Backend │ │Backend │ │Backend │
│Instance│ │Instance│ │Instance│
│   1    │ │   2    │ │   3    │
└────────┘ └────────┘ └────────┘
```

### Database Scaling

**Read Replicas:**

```
Master DB (Write)
    │
    ├──> Replica 1 (Read)
    ├──> Replica 2 (Read)
    └──> Replica 3 (Read)
```

**Sharding Strategy (Future):**

- Shard by user ID
- Shard by region
- Shard by date (for analytics)

### Caching Strategy

- **Cache frequently accessed data** (user profiles, categories)
- **Cache expensive queries** (analytics, aggregations)
- **Invalidate cache on updates** (write-through cache)

---

## 📊 Monitoring & Observability

```
Application Metrics (Prometheus)
    │
    ├──> HTTP request metrics
    ├──> Database query metrics
    ├──> Cache hit/miss rates
    └──> Business metrics (orders, revenue)

Error Tracking (Sentry)
    │
    ├──> Backend exceptions
    ├──> Frontend errors
    └──> Performance issues

Logging (ELK Stack / CloudWatch)
    │
    ├──> Application logs
    ├──> Access logs
    └──> Error logs

Health Checks
    │
    ├──> /actuator/health (Backend)
    ├──> Database connection
    ├──> Redis connection
    └──> External service status
```

---

## 🔮 Future Architecture Evolution

### Phase 1: Current (Modular Monolith)

✅ Single deployable unit  
✅ Clean boundaries between domains  
✅ Easy to develop and test

### Phase 2: Service Extraction (Future)

- Extract high-traffic services (Payment, Messaging)
- Implement API Gateway
- Service mesh for inter-service communication

### Phase 3: Microservices (If needed)

- Full microservices architecture
- Event-driven architecture
- CQRS pattern for read/write separation

---

## 📚 References

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://domainlanguage.com/ddd/)

---

**Maintained by:** MarifetBul Development Team  
**Last Review:** 2025-10-14  
**Next Review:** 2025-11-14
