# 🚀 MarifetBul - Production Deployment Guide

**Version:** 1.0.0  
**Date:** October 15, 2025  
**Status:** ✅ Ready for Production

---

## 📋 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/omerada/marifet.git
cd marifeto

# 2. Setup backend
cd marifetbul-backend
cp .env.example .env
# Edit .env with production values

# 3. Setup frontend
cd ..
cp .env.example .env.production
# Edit .env.production with production values

# 4. Deploy (choose one method below)
```

---

## 🎯 Deployment Methods

### Option 1: Docker Compose (Recommended)

**Prerequisites:**

- Docker 20.10+
- Docker Compose 2.0+

**Steps:**

```bash
cd marifetbul-backend

# 1. Build production images
docker-compose -f docker-compose.prod.yml build

# 2. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose -f docker-compose.prod.yml ps

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Services Started:**

- ✅ Backend API (Spring Boot) - Port 8080
- ✅ PostgreSQL Database - Port 5432
- ✅ Redis Cache - Port 6379
- ✅ Elasticsearch - Port 9200
- ✅ Nginx Reverse Proxy - Port 80/443
- ✅ Prometheus Monitoring - Port 9090
- ✅ Grafana Dashboards - Port 3001

### Option 2: Vercel + Heroku

**Frontend (Vercel):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1
# - NEXT_PUBLIC_APP_URL=https://marifetbul.com
```

**Backend (Heroku):**

```bash
# Login to Heroku
heroku login

# Create app
heroku create marifetbul-api

# Add buildpack
heroku buildpacks:set heroku/java

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set JWT_SECRET=your_secret_here
heroku config:set SPRING_PROFILES_ACTIVE=prod

# Deploy
git push heroku master

# Run migrations
heroku run java -jar target/marifetbul-api.jar --flyway.migrate
```

### Option 3: Manual VPS Deployment

**Server Requirements:**

- Ubuntu 22.04 LTS
- 4GB RAM minimum
- 2 CPU cores
- 40GB SSD storage

**Installation Steps:**

```bash
# 1. Install Java 17
sudo apt update
sudo apt install openjdk-17-jdk

# 2. Install PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb marifetbul_prod
sudo -u postgres createuser marifetbul -P

# 3. Install Redis
sudo apt install redis-server
sudo systemctl enable redis-server

# 4. Install Nginx
sudo apt install nginx
sudo systemctl enable nginx

# 5. Setup application user
sudo useradd -m -s /bin/bash marifetbul
sudo su - marifetbul

# 6. Deploy backend
cd /home/marifetbul
git clone <repo-url>
cd marifetbul-backend
./mvnw clean package -DskipTests
java -jar target/marifetbul-api-1.0.0.jar

# 7. Setup systemd service (see below)
```

---

## 🔧 Configuration Files

### 1. Backend Environment Variables (.env)

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/marifetbul_prod
DATABASE_USERNAME=marifetbul
DATABASE_PASSWORD=<strong-password>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# Elasticsearch
ELASTICSEARCH_URIS=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=<elastic-password>

# JWT
JWT_SECRET=<256-bit-random-key>
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# CORS
ALLOWED_ORIGINS=https://marifetbul.com,https://www.marifetbul.com

# Email (SendGrid)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=<sendgrid-api-key>

# AWS S3
AWS_S3_BUCKET=marifetbul-uploads
AWS_REGION=eu-central-1
AWS_ACCESS_KEY=<access-key>
AWS_SECRET_KEY=<secret-key>

# Sentry
SENTRY_DSN=<sentry-dsn>

# Server
SERVER_PORT=8080
```

### 2. Frontend Environment Variables (.env.production)

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=MarifetBul
NEXT_PUBLIC_APP_URL=https://marifetbul.com
NEXT_PUBLIC_BASE_URL=https://marifetbul.com

# Backend API
NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Sentry
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-token>
SENTRY_ORG=marifetbul
SENTRY_PROJECT=marifetbul-frontend

# Upload Provider
NEXT_PUBLIC_UPLOAD_PROVIDER=cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/marifetbul.com
server {
    listen 80;
    server_name marifetbul.com www.marifetbul.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name marifetbul.com www.marifetbul.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/marifetbul.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marifetbul.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Subdomain
server {
    listen 443 ssl http2;
    server_name api.marifetbul.com;

    # SSL Configuration (same as above)
    ssl_certificate /etc/letsencrypt/live/marifetbul.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marifetbul.com/privkey.pem;

    # Backend API
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers (if not handled by Spring Boot)
        add_header Access-Control-Allow-Origin https://marifetbul.com always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
}
```

### 4. Systemd Service

```ini
# /etc/systemd/system/marifetbul-api.service
[Unit]
Description=MarifetBul Backend API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=marifetbul
WorkingDirectory=/home/marifetbul/marifetbul-backend
ExecStart=/usr/bin/java -jar /home/marifetbul/marifetbul-backend/target/marifetbul-api-1.0.0.jar \
  --spring.profiles.active=prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=marifetbul-api
Environment="JAVA_OPTS=-Xms512m -Xmx2048m"

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable marifetbul-api
sudo systemctl start marifetbul-api
sudo systemctl status marifetbul-api
```

---

## 🔐 SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d marifetbul.com -d www.marifetbul.com -d api.marifetbul.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## 🗄️ Database Setup

### 1. Create Database

```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database
CREATE DATABASE marifetbul_prod;

-- Create user
CREATE USER marifetbul WITH ENCRYPTED PASSWORD 'your_strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE marifetbul_prod TO marifetbul;

-- Enable extensions
\c marifetbul_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

### 2. Run Migrations

```bash
# Backend will auto-run Flyway migrations on startup
# Or manually:
cd marifetbul-backend
./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/marifetbul_prod
```

### 3. Database Backups

```bash
# Setup automated daily backup (cron)
sudo crontab -e

# Add this line (backup at 2 AM daily)
0 2 * * * pg_dump -U marifetbul marifetbul_prod | gzip > /backups/marifetbul_$(date +\%Y\%m\%d).sql.gz

# Keep only last 30 days
0 3 * * * find /backups -name "marifetbul_*.sql.gz" -mtime +30 -delete
```

---

## 📊 Monitoring Setup

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'marifetbul-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

### 2. Grafana Setup

```bash
# Import MarifetBul Dashboard
# Dashboard ID: Available in grafana/ folder

# Add Prometheus data source
- URL: http://localhost:9090
- Access: Server (default)
```

### 3. Sentry Integration

Already configured in both frontend and backend. Ensure DSN is set in environment variables.

---

## ✅ Pre-Deployment Checklist

### Environment Variables

- [ ] All backend environment variables set
- [ ] All frontend environment variables set
- [ ] JWT_SECRET is strong 256-bit key
- [ ] Database credentials are secure
- [ ] API keys are valid (SendGrid, AWS, Cloudinary)

### SSL/HTTPS

- [ ] SSL certificate installed
- [ ] HTTP → HTTPS redirect configured
- [ ] HSTS header enabled
- [ ] Certificate auto-renewal configured

### Database

- [ ] Database created
- [ ] User and permissions configured
- [ ] Migrations run successfully
- [ ] Backup cron job configured
- [ ] Connection pooling configured

### Security

- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key-only authentication
- [ ] Non-root user for application
- [ ] Fail2ban installed (optional)
- [ ] Security headers verified
- [ ] **Admin default password changed** ⚠️ CRITICAL
- [ ] **2FA enabled for all admin accounts**
- [ ] Admin password policy enforced (12+ chars)
- [ ] IP whitelist configured for admin panel (optional)
- [ ] Audit logging enabled and monitored
- [ ] Session timeout configured (15 minutes)

**See [ADMIN_SECURITY_GUIDE.md](./docs/ADMIN_SECURITY_GUIDE.md) for complete admin security setup**

### Application

- [ ] Backend compiles without errors
- [ ] Frontend builds successfully
- [ ] Integration tests pass
- [ ] Health endpoints responding
- [ ] Logs directory created

### Monitoring

- [ ] Sentry error tracking configured
- [ ] Prometheus metrics collecting
- [ ] Grafana dashboards imported
- [ ] Alert rules configured
- [ ] Log rotation configured

---

## 🧪 Post-Deployment Testing

```bash
# 1. Health Check
curl https://api.marifetbul.com/actuator/health

# 2. CORS Test
curl -H "Origin: https://marifetbul.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.marifetbul.com/api/v1/auth/login

# 3. SSL Test
curl -I https://marifetbul.com

# 4. API Test
curl https://api.marifetbul.com/api/v1/categories

# 5. Run integration tests
cd scripts
./integration-test.ps1  # or ./integration-test.sh on Linux
```

---

## 🚨 Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u marifetbul-api -f

# Check port
sudo netstat -tlnp | grep 8080

# Check database connection
psql -U marifetbul -d marifetbul_prod -h localhost
```

### Frontend Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build

# Check environment variables
cat .env.production
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Reload PostgreSQL
sudo systemctl reload postgresql
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Backend**: Deploy multiple instances behind load balancer
2. **Frontend**: Use Vercel's automatic scaling
3. **Database**: PostgreSQL read replicas
4. **Redis**: Redis Cluster for high availability

### Vertical Scaling

- **Backend**: Increase JVM heap size (-Xmx)
- **Database**: Tune PostgreSQL settings (shared_buffers, work_mem)
- **Server**: Upgrade to higher-tier VPS

---

## 🔄 Update & Rollback

### Deploy New Version

```bash
# Pull latest code
git pull origin master

# Backend
cd marifetbul-backend
./mvnw clean package -DskipTests
sudo systemctl restart marifetbul-api

# Frontend
cd ..
npm run build
pm2 restart marifetbul-frontend
```

### Rollback

```bash
# Git rollback
git revert HEAD
git push

# Or restore from backup
sudo systemctl stop marifetbul-api
cp /backups/marifetbul-api.jar.backup target/marifetbul-api.jar
sudo systemctl start marifetbul-api
```

---

## 📞 Support

- **Technical Issues**: dev@marifetbul.com
- **Security Issues**: security@marifetbul.com
- **Emergency Hotline**: +90 XXX XXX XXXX

---

## 📝 Changelog

### Version 1.0.0 (October 15, 2025)

- ✅ Initial production deployment
- ✅ All core features implemented
- ✅ Security hardened
- ✅ Monitoring configured
- ✅ Documentation complete

---

**Document Version:** 1.0.0  
**Last Updated:** October 15, 2025  
**Next Review:** January 15, 2026
