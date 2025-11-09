# 🔐 Environment Variables Documentation

**Last Updated:** November 9, 2025  
**Version:** 1.0.0

---

## 📋 Overview

This document describes all environment variables used in the MarifetBul application (Frontend & Backend).

---

## 🎯 FRONTEND ENVIRONMENT VARIABLES

### Required Variables (Production)

These variables **MUST** be set for production deployment. Build will fail if missing or misconfigured.

| Variable              | Required | Description            | Example                             | Validation                   |
| --------------------- | -------- | ---------------------- | ----------------------------------- | ---------------------------- |
| `NEXT_PUBLIC_APP_ENV` | ✅       | Environment name       | `production`                        | Must be 'production'         |
| `NEXT_PUBLIC_API_URL` | ✅       | Backend API URL        | `https://api.marifetbul.com/api/v1` | Must be HTTPS, not localhost |
| `NEXT_PUBLIC_WS_URL`  | ✅       | WebSocket URL          | `wss://api.marifetbul.com/ws`       | Must be WSS, not localhost   |
| `NEXT_PUBLIC_APP_URL` | ✅       | Frontend URL           | `https://marifetbul.com`            | Must be HTTPS                |
| `SESSION_SECRET`      | ✅       | Session encryption key | (32+ chars random string)           | Min 32 characters            |
| `NODE_ENV`            | ✅       | Node environment       | `production`                        | Auto-set by platform         |

### Feature Flags

| Variable                           | Default | Description          | Production Value   |
| ---------------------------------- | ------- | -------------------- | ------------------ |
| `NEXT_PUBLIC_ENABLE_DEBUG`         | `false` | Debug mode           | ❌ Must be `false` |
| `NEXT_PUBLIC_WS_DEBUG`             | `false` | WebSocket debug logs | ❌ Must be `false` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS`     | `true`  | Google Analytics     | ✅ `true`          |
| `NEXT_PUBLIC_ENABLE_SENTRY`        | `true`  | Error tracking       | ✅ `true`          |
| `NEXT_PUBLIC_ENABLE_WEBSOCKET`     | `true`  | Real-time features   | ✅ `true`          |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | `true`  | Push notifications   | ✅ `true`          |

### Security Settings

| Variable                       | Required | Description         | Example           |
| ------------------------------ | -------- | ------------------- | ----------------- |
| `NEXT_PUBLIC_CSRF_ENABLED`     | ✅       | CSRF protection     | `true`            |
| `NEXT_PUBLIC_COOKIE_SECURE`    | ✅       | Secure cookies only | `true`            |
| `NEXT_PUBLIC_COOKIE_SAME_SITE` | ✅       | SameSite policy     | `strict`          |
| `NEXT_PUBLIC_COOKIE_DOMAIN`    | ⚠️       | Cookie domain       | `.marifetbul.com` |

### Monitoring & Analytics

| Variable                     | Required | Description           | Example                                |
| ---------------------------- | -------- | --------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`     | ⚠️       | Sentry error tracking | `https://xxx@xxx.ingest.sentry.io/xxx` |
| `SENTRY_AUTH_TOKEN`          | ⚠️       | Sentry upload token   | (CI/CD only)                           |
| `SENTRY_ORG`                 | ⚠️       | Sentry organization   | `your-org`                             |
| `SENTRY_PROJECT`             | ⚠️       | Sentry project name   | `marifetbul-frontend`                  |
| `NEXT_PUBLIC_GA_TRACKING_ID` | ⚠️       | Google Analytics      | `G-XXXXXXXXXX`                         |

### Optional Variables

| Variable                         | Default  | Description        |
| -------------------------------- | -------- | ------------------ |
| `NEXT_PUBLIC_CACHE_TTL`          | `300000` | Cache TTL (ms)     |
| `NEXT_PUBLIC_API_TIMEOUT`        | `30000`  | API timeout (ms)   |
| `NEXT_PUBLIC_RETRY_MAX_ATTEMPTS` | `3`      | Max retry attempts |

---

## 🔧 BACKEND ENVIRONMENT VARIABLES

### Required Variables (Production)

| Variable                 | Required | Description       | Example                          | Validation             |
| ------------------------ | -------- | ----------------- | -------------------------------- | ---------------------- |
| `SPRING_PROFILES_ACTIVE` | ✅       | Spring profile    | `prod`                           | Must be 'prod'         |
| `DB_URL`                 | ✅       | PostgreSQL URL    | `jdbc:postgresql://host:5432/db` | Must be valid JDBC URL |
| `DB_USERNAME`            | ✅       | Database user     | `marifetbul_user`                | -                      |
| `DB_PASSWORD`            | ✅       | Database password | (strong password)                | -                      |
| `JWT_SECRET`             | ✅       | JWT signing key   | (64+ chars random)               | Min 32 characters      |
| `REDIS_HOST`             | ✅       | Redis host        | `redis.example.com`              | -                      |
| `REDIS_PASSWORD`         | ✅       | Redis password    | (strong password)                | -                      |

### Security & Auth

| Variable                 | Required | Description              | Example                                             |
| ------------------------ | -------- | ------------------------ | --------------------------------------------------- |
| `JWT_EXPIRATION`         | ⚠️       | JWT expiration (ms)      | `86400000` (24h)                                    |
| `JWT_REFRESH_EXPIRATION` | ⚠️       | Refresh token expiration | `604800000` (7d)                                    |
| `ALLOWED_ORIGINS`        | ✅       | CORS origins             | `https://marifetbul.com,https://www.marifetbul.com` |

### Payment Integration

| Variable            | Required | Description     | Example                   |
| ------------------- | -------- | --------------- | ------------------------- |
| `IYZICO_API_KEY`    | ✅       | Iyzico API key  | (production key)          |
| `IYZICO_SECRET_KEY` | ✅       | Iyzico secret   | (production secret)       |
| `IYZICO_BASE_URL`   | ✅       | Iyzico endpoint | `https://api.iyzipay.com` |

### Email Service

| Variable           | Required | Description        | Example                  |
| ------------------ | -------- | ------------------ | ------------------------ |
| `SENDGRID_API_KEY` | ✅       | SendGrid API key   | `SG.xxxxx`               |
| `MAIL_FROM`        | ✅       | From email address | `noreply@marifetbul.com` |

### Cloud Storage

| Variable         | Required | Description    | Example           |
| ---------------- | -------- | -------------- | ----------------- |
| `AWS_S3_BUCKET`  | ✅       | S3 bucket name | `marifetbul-prod` |
| `AWS_REGION`     | ✅       | AWS region     | `eu-central-1`    |
| `AWS_ACCESS_KEY` | ✅       | AWS access key | -                 |
| `AWS_SECRET_KEY` | ✅       | AWS secret key | -                 |

### Search (Elasticsearch)

| Variable                 | Required | Description    | Example                       |
| ------------------------ | -------- | -------------- | ----------------------------- |
| `ELASTICSEARCH_URIS`     | ✅       | ES cluster URL | `https://es.example.com:9200` |
| `ELASTICSEARCH_USERNAME` | ⚠️       | ES username    | `elastic`                     |
| `ELASTICSEARCH_PASSWORD` | ⚠️       | ES password    | -                             |

### Monitoring

| Variable     | Required | Description        | Example                                |
| ------------ | -------- | ------------------ | -------------------------------------- |
| `SENTRY_DSN` | ⚠️       | Sentry backend DSN | `https://xxx@xxx.ingest.sentry.io/xxx` |

### Test Data Configuration

| Variable                        | Required | Description        | Production Value   |
| ------------------------------- | -------- | ------------------ | ------------------ |
| `app.test-data.enabled`         | ✅       | Enable test data   | ❌ Must be `false` |
| `app.test-data.seed-on-startup` | ⚠️       | Auto-seed on start | ❌ Must be `false` |

### Payment Provider Selection

| Variable                            | Required | Description            | Production Value      |
| ----------------------------------- | -------- | ---------------------- | --------------------- |
| `marifetbul.bank.transfer.provider` | ✅       | Bank transfer provider | `iyzico` (NOT `mock`) |
| `marifetbul.payment.test-mode`      | ✅       | Payment test mode      | ❌ Must be `false`    |

---

## 🚀 SETUP INSTRUCTIONS

### Development Environment

1. **Copy example files:**

   ```bash
   # Frontend
   cp .env.example .env.local

   # Backend
   cp src/main/resources/application-dev.yml.example application-dev.yml
   ```

2. **Fill in development values:**
   - Use localhost URLs
   - Use test API keys
   - Enable debug flags

### Staging Environment

1. **Copy production example:**

   ```bash
   cp .env.production.example .env.staging
   ```

2. **Use staging resources:**
   - Staging database
   - Test payment gateway
   - Staging S3 bucket

### Production Environment

1. **Never use .env files in production!**
   - Use platform environment variables (Vercel, AWS, etc.)
   - Use secrets management (AWS Secrets Manager, Azure Key Vault)

2. **Validation checklist:**

   ```bash
   # Frontend
   npm run build
   # Look for: ✅ Production safety checks passed

   # Backend
   mvn clean package -Pprod
   # Look for: ✅ Production Safety Validation PASSED
   ```

---

## ⚠️ SECURITY BEST PRACTICES

### 🔴 NEVER

- ❌ Commit `.env.production` to git
- ❌ Use weak secrets (< 32 chars)
- ❌ Share secrets in Slack/Email
- ❌ Use development keys in production
- ❌ Enable debug mode in production
- ❌ Use HTTP URLs in production

### ✅ ALWAYS

- ✅ Use strong random secrets (64+ chars)
- ✅ Rotate secrets regularly
- ✅ Use HTTPS/WSS in production
- ✅ Enable all security flags
- ✅ Use secrets management service
- ✅ Test in staging first
- ✅ Monitor for leaked secrets

---

## 🧪 VALIDATION

### Build-Time Validation

Both frontend and backend validate critical environment variables during build:

**Frontend (Next.js):**

```bash
npm run build
# Fails if:
# - NEXT_PUBLIC_APP_ENV != 'production'
# - Debug flags enabled
# - HTTP URLs used
# - Weak session secret
```

**Backend (Spring Boot):**

```bash
mvn clean package -Pprod
# Fails if:
# - Test data enabled
# - Payment test mode enabled
# - Mock services configured
# - Weak JWT secret
```

### Runtime Validation

**Backend startup validation:**

```
ProductionSafetyValidator checks:
✅ Profile is 'prod'
✅ Test data disabled
✅ Payment live mode
✅ JWT secret strong
✅ Swagger disabled
```

---

## 📝 TEMPLATES

### .env.production Template

See: `.env.production.example`

### application-prod.yml Template

See: `marifetbul-backend/src/main/resources/application-prod.yml`

---

## 🔍 TROUBLESHOOTING

### Build Fails: "API URL points to localhost"

**Problem:** `NEXT_PUBLIC_API_URL` is set to localhost  
**Solution:** Set to production HTTPS URL

### Build Fails: "Debug mode is ENABLED"

**Problem:** `NEXT_PUBLIC_ENABLE_DEBUG=true`  
**Solution:** Set to `false` or remove variable

### Backend Fails: "Test data seeding is ENABLED"

**Problem:** `app.test-data.enabled=true` in production  
**Solution:** Set to `false` in application-prod.yml

### Backend Fails: "JWT secret is not properly configured"

**Problem:** JWT_SECRET is weak or using default  
**Solution:** Generate strong secret:

```bash
openssl rand -base64 64
```

---

## 📞 SUPPORT

For questions or issues:

- **Development:** Check `.env.example` files
- **Deployment:** Review this document
- **Security:** Contact security team
- **Emergency:** Check runbooks

---

**Document Version:** 1.0.0  
**Last Review:** November 9, 2025  
**Next Review:** Before each major release
