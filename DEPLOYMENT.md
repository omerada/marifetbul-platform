# MarifetBul - Production Deployment Guide

## 🚀 Production-Ready Architecture

MarifetBul is now fully optimized for production deployment with:

- ✅ Spring Boot 3.4.1 + Java 17
- ✅ Next.js 15 + React 19
- ✅ Clean architecture with no mock data
- ✅ Security hardened
- ✅ Docker optimized
- ✅ CI/CD ready

## 📋 Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Environment Variables](#environment-variables)
4. [Docker Deployment](#docker-deployment)
5. [CI/CD Setup](#cicd-setup)
6. [Security Checklist](#security-checklist)

---

## 🔧 Backend Deployment

### Prerequisites

- Java 17+
- PostgreSQL 16+
- Redis 7+
- (Optional) Elasticsearch 8+

### Environment Setup

1. **Copy environment template:**

   ```bash
   cd marifetbul-backend
   cp .env.example .env
   ```

2. **Configure production variables:**

   ```bash
   # Database
   DB_URL=jdbc:postgresql://your-db-host:5432/marifetbul_prod
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_secure_password

   # Redis
   REDIS_HOST=your-redis-host
   REDIS_PASSWORD=your_secure_redis_password
   REDIS_SSL=true

   # JWT (Generate secure 512-bit key)
   JWT_SECRET=your_base64_encoded_512bit_secret

   # CORS
   ALLOWED_ORIGINS=https://marifetbul.com,https://www.marifetbul.com

   # Email (SendGrid)
   SENDGRID_API_KEY=your_sendgrid_api_key

   # Payment (Stripe)
   STRIPE_API_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Storage (AWS S3)
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY=your_access_key
   AWS_SECRET_KEY=your_secret_key

   # Monitoring (Sentry)
   SENTRY_DSN=your_sentry_dsn
   ```

### Build & Deploy

#### Option 1: JAR Deployment

```bash
cd marifetbul-backend
mvn clean package -DskipTests -Pprod
java -jar target/marifetbul-api.jar
```

#### Option 2: Docker Deployment

```bash
cd marifetbul-backend
docker build -f Dockerfile.prod -t marifetbul-backend:prod .
docker run -p 8080:8080 --env-file .env marifetbul-backend:prod
```

#### Option 3: Docker Compose

```bash
cd marifetbul-backend
docker-compose up -d
```

---

## 🌐 Frontend Deployment

### Vercel Deployment (Recommended)

1. **Connect GitHub repository to Vercel**

2. **Configure environment variables in Vercel:**

   ```bash
   NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1
   NEXT_PUBLIC_APP_URL=https://marifetbul.com
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

3. **Deploy:**
   - Push to `main` branch triggers automatic deployment
   - Or use Vercel CLI: `vercel --prod`

### Alternative: Docker Deployment

```bash
# Build
docker build -t marifetbul-frontend:prod .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1 \
  marifetbul-frontend:prod
```

---

## 🔐 Environment Variables

### Backend Critical Variables

| Variable           | Description                   | Required          |
| ------------------ | ----------------------------- | ----------------- |
| `JWT_SECRET`       | 512-bit base64 encoded secret | ✅ Yes            |
| `DB_URL`           | PostgreSQL connection URL     | ✅ Yes            |
| `REDIS_HOST`       | Redis server host             | ✅ Yes            |
| `ALLOWED_ORIGINS`  | CORS allowed origins          | ✅ Yes            |
| `SENDGRID_API_KEY` | Email service API key         | ⚠️ For email      |
| `STRIPE_API_KEY`   | Payment gateway key           | ⚠️ For payments   |
| `AWS_S3_BUCKET`    | File storage bucket           | ⚠️ For uploads    |
| `SENTRY_DSN`       | Error tracking DSN            | ⚠️ For monitoring |

### Frontend Critical Variables

| Variable              | Description          | Required |
| --------------------- | -------------------- | -------- |
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | ✅ Yes   |
| `NEXT_PUBLIC_APP_URL` | Frontend base URL    | ✅ Yes   |

---

## 🐳 Docker Deployment

### Full Stack Deployment

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Individual Services

```bash
# Backend only
docker run -d -p 8080:8080 \
  --name marifetbul-backend \
  --env-file .env \
  marifetbul-backend:prod

# Frontend only
docker run -d -p 3000:3000 \
  --name marifetbul-frontend \
  -e NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1 \
  marifetbul-frontend:prod
```

---

## 🔄 CI/CD Setup

### GitHub Actions

Workflows are configured for:

- ✅ Backend build and test
- ✅ Frontend build and lint
- ✅ Docker image creation
- ✅ Automated deployments

### Secrets Configuration

Add these secrets to your GitHub repository:

**Backend CI/CD:**

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `JWT_SECRET_TEST`

**Frontend CI/CD:**

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_API_URL`

---

## ✅ Security Checklist

### Backend Security

- [x] JWT secret is 512+ bits
- [x] Database credentials are secure
- [x] CORS properly configured
- [x] SQL injection protected (JPA/Hibernate)
- [x] Input validation enabled
- [x] Rate limiting configured
- [x] HTTPS enforced
- [x] Security headers set
- [x] Swagger disabled in production

### Frontend Security

- [x] Environment variables secured
- [x] CSP headers configured
- [x] XSS protection enabled
- [x] CSRF protection active
- [x] Secure cookies (httpOnly)
- [x] No sensitive data in client
- [x] API calls authenticated

---

## 📊 Monitoring & Logging

### Application Monitoring

- **Backend:** `/actuator/health`, `/actuator/metrics`
- **Sentry:** Error tracking configured
- **Prometheus:** Metrics exposed at `/actuator/prometheus`

### Logging

- **Backend:** Logs to `logs/marifetbul-backend.log`
- **Frontend:** Vercel logs or Docker logs

---

## 🆘 Troubleshooting

### Backend Issues

**Database connection failed:**

```bash
# Check connection
psql -h your-db-host -U your-db-user -d marifetbul_prod

# Verify Flyway migrations
mvn flyway:info
```

**Redis connection failed:**

```bash
# Test Redis connection
redis-cli -h your-redis-host -a your-redis-password ping
```

### Frontend Issues

**Build fails:**

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**API connection failed:**

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration in backend
- Ensure backend is accessible

---

## 📝 Maintenance

### Database Backups

```bash
# Backup
pg_dump -h your-db-host -U your-db-user marifetbul_prod > backup.sql

# Restore
psql -h your-db-host -U your-db-user marifetbul_prod < backup.sql
```

### Update Dependencies

**Backend:**

```bash
mvn versions:display-dependency-updates
mvn versions:use-latest-releases
```

**Frontend:**

```bash
npm outdated
npm update
```

---

## 📞 Support

For deployment support:

- Email: devops@marifetbul.com
- Documentation: https://docs.marifetbul.com
- GitHub Issues: https://github.com/marifetbul/marifet/issues

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-10-14
**Version:** 1.0.0
