# ORDER & PAYMENT CHECKOUT - DEPLOYMENT GUIDE

## Production Deployment Checklist

### Prerequisites

#### 1. Stripe Account Setup

- [ ] Create Stripe production account (https://dashboard.stripe.com)
- [ ] Complete business verification
- [ ] Enable payment methods (card, digital wallets)
- [ ] Set up tax settings
- [ ] Configure statement descriptor
- [ ] Enable 3D Secure 2 (SCA compliance)

#### 2. Environment Configuration

- [ ] Production Stripe API keys obtained
- [ ] Webhook endpoint configured
- [ ] Database migrations ready
- [ ] SSL certificate installed
- [ ] Domain verified

#### 3. Security Requirements

- [ ] HTTPS enabled (mandatory for Stripe)
- [ ] PCI DSS compliance reviewed
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] Environment variables secured

---

## Environment Variables

### Frontend (.env.production)

```bash
# Stripe Configuration (PRODUCTION)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# API Configuration
NEXT_PUBLIC_API_URL=https://api.marifetbul.com
NEXT_PUBLIC_APP_URL=https://marifetbul.com

# Feature Flags
NEXT_PUBLIC_STRIPE_ENABLED=true
NEXT_PUBLIC_ESCROW_ENABLED=true

# Security
NEXT_PUBLIC_CSP_NONCE=auto
```

### Backend (application-prod.properties)

```properties
# Stripe Configuration
stripe.api.key=sk_live_xxxxxxxxxxxxx
stripe.webhook.secret=whsec_xxxxxxxxxxxxx
stripe.api.version=2024-10-28

# Payment Configuration
payment.platform.fee.percentage=15
payment.escrow.release.days=7
payment.refund.processing.days=14
payment.minimum.amount=5000
payment.maximum.amount=5000000

# Currency
payment.default.currency=TRY

# Webhook Configuration
stripe.webhook.endpoint=/api/v1/webhooks/stripe
stripe.webhook.tolerance=300

# Security
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12
```

---

## Stripe Configuration

### 1. Obtain API Keys

1. Log in to **Stripe Dashboard** → https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Toggle to **Production** mode (top-right)
4. Copy keys:
   - **Publishable key**: `pk_live_xxxxx` (frontend)
   - **Secret key**: `sk_live_xxxxx` (backend, KEEP SECRET)

**Security**:

- Never commit secret keys to Git
- Use environment variables or secrets manager
- Rotate keys if compromised
- Restrict API key permissions

### 2. Configure Webhooks

#### Why Webhooks?

Webhooks notify your backend when payment events occur (success, failure, refund, dispute).

#### Setup Steps:

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Configure:
   ```
   Endpoint URL: https://api.marifetbul.com/api/v1/webhooks/stripe
   Description: Production payment webhooks
   Events to send:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - payment_intent.canceled
   - charge.refunded
   - charge.dispute.created
   - customer.subscription.updated (if subscriptions)
   ```
4. Click **Add endpoint**
5. Copy **Signing secret**: `whsec_xxxxx`
6. Add to backend environment: `STRIPE_WEBHOOK_SECRET`

#### Test Webhook:

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local backend
stripe listen --forward-to https://api.marifetbul.com/api/v1/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

### 3. Enable Payment Methods

**Stripe Dashboard** → **Settings** → **Payment methods**

Enable:

- [x] Card payments (Visa, Mastercard, Amex)
- [x] Digital wallets (Apple Pay, Google Pay)
- [x] 3D Secure 2 (mandatory in EU/TR)

### 4. Configure Statement Descriptor

**Settings** → **Business settings** → **Customer emails**

Set statement descriptor to: **MARIFETBUL.COM**

This appears on customer's bank statement.

---

## Database Setup

### 1. Run Migrations

Ensure all order and payment tables are created:

```bash
cd marifetbul-backend

# Check migration status
./mvnw flyway:info

# Run migrations
./mvnw flyway:migrate

# Verify tables
psql -U postgres -d marifetbul -c "\dt orders payments"
```

### 2. Verify Schema

Check tables exist:

- `orders` (with order_status enum)
- `payments` (with payment_status, transaction_type)
- `order_events` (timeline tracking)
- `payment_events` (payment history)

### 3. Indexes for Performance

```sql
-- Orders table indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Payments table indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

---

## Backend Deployment

### 1. Build Application

```bash
cd marifetbul-backend

# Run tests
./mvnw clean test

# Build production JAR
./mvnw clean package -Pprod -DskipTests

# Verify build
ls -lh target/marifetbul-*.jar
```

### 2. Docker Deployment

```dockerfile
# Dockerfile.prod
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/marifetbul-*.jar app.jar

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

```bash
# Build Docker image
docker build -f Dockerfile.prod -t marifetbul-backend:latest .

# Run container
docker run -d \
  --name marifetbul-backend \
  -p 8080:8080 \
  -e STRIPE_API_KEY=${STRIPE_SECRET_KEY} \
  -e STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET} \
  -e DATABASE_URL=${DATABASE_URL} \
  -e SSL_KEYSTORE_PASSWORD=${SSL_KEYSTORE_PASSWORD} \
  --restart unless-stopped \
  marifetbul-backend:latest
```

### 3. Kubernetes Deployment (Optional)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marifetbul-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: marifetbul-backend
  template:
    metadata:
      labels:
        app: marifetbul-backend
    spec:
      containers:
        - name: backend
          image: marifetbul-backend:latest
          ports:
            - containerPort: 8080
          env:
            - name: STRIPE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: stripe-secrets
                  key: api-key
            - name: STRIPE_WEBHOOK_SECRET
              valueFrom:
                secretKeyRef:
                  name: stripe-secrets
                  key: webhook-secret
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          resources:
            requests:
              memory: '512Mi'
              cpu: '500m'
            limits:
              memory: '1Gi'
              cpu: '1000m'
```

---

## Frontend Deployment

### 1. Build Next.js Application

```bash
cd marifeto

# Install dependencies
npm ci --production

# Build for production
npm run build

# Test production build locally
npm start
```

### 2. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Redeploy with new env vars
vercel --prod
```

**Vercel Configuration** (`vercel.json`):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key-prod",
    "STRIPE_SECRET_KEY": "@stripe-secret-key-prod",
    "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret-prod"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### 3. Alternative: Docker Deployment

```dockerfile
# Dockerfile (frontend)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## SSL/TLS Configuration

### 1. Obtain SSL Certificate

**Option A: Let's Encrypt (Free)**

```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d marifetbul.com -d www.marifetbul.com -d api.marifetbul.com

# Certificates saved to:
# /etc/letsencrypt/live/marifetbul.com/fullchain.pem
# /etc/letsencrypt/live/marifetbul.com/privkey.pem

# Auto-renewal (runs twice daily)
sudo certbot renew --dry-run
```

**Option B: Commercial Certificate**

- Purchase from DigiCert, GoDaddy, etc.
- Follow provider's installation guide

### 2. Configure Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/marifetbul.com

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name marifetbul.com www.marifetbul.com;
    return 301 https://$server_name$request_uri;
}

# Frontend (Next.js)
server {
    listen 443 ssl http2;
    server_name marifetbul.com www.marifetbul.com;

    ssl_certificate /etc/letsencrypt/live/marifetbul.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marifetbul.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.marifetbul.com;

    ssl_certificate /etc/letsencrypt/live/marifetbul.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marifetbul.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Stripe webhook endpoint (no rate limiting)
    location /api/v1/webhooks/stripe {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/marifetbul.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Security Configuration

### 1. Rate Limiting

**Backend (Spring Boot):**

```java
// RateLimitConfig.java
@Configuration
public class RateLimitConfig {

    @Bean
    public RateLimiter paymentRateLimiter() {
        return RateLimiter.of("payment", RateLimiterConfig.custom()
            .limitForPeriod(5) // 5 requests
            .limitRefreshPeriod(Duration.ofMinutes(1)) // per minute
            .timeoutDuration(Duration.ofSeconds(5))
            .build());
    }
}
```

**Nginx:**

```nginx
# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=payment:10m rate=10r/m;

location /api/v1/payments {
    limit_req zone=payment burst=5;
    proxy_pass http://localhost:8080;
}
```

### 2. CORS Configuration

```java
// CorsConfig.java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("https://marifetbul.com"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
```

### 3. Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com; style-src 'self' 'unsafe-inline';"
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## Monitoring & Logging

### 1. Application Monitoring

**Sentry (Error Tracking):**

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

### 2. Stripe Dashboard Monitoring

Monitor in **Stripe Dashboard**:

- **Payments**: View all transactions
- **Disputes**: Track chargebacks
- **Logs**: API request logs
- **Events**: Webhook delivery status

Set up alerts for:

- Failed payments
- Webhook failures
- High refund rates
- Unusual activity

### 3. Backend Logging

```properties
# application-prod.properties

# Logging configuration
logging.level.root=INFO
logging.level.com.marifetbul=INFO
logging.level.org.springframework.web=WARN

# Log file
logging.file.name=/var/log/marifetbul/application.log
logging.file.max-size=10MB
logging.file.max-history=30

# Payment-specific logging
logging.level.com.marifetbul.service.payment=DEBUG
logging.level.com.stripe=DEBUG
```

**Log Payment Events:**

```java
@Slf4j
@Service
public class PaymentService {

    public void processPayment(PaymentRequest request) {
        log.info("Payment initiated: orderId={}, amount={}",
            request.getOrderId(), request.getAmount());

        try {
            // Process payment
            PaymentIntent intent = stripe.paymentIntents.create(params);

            log.info("Payment successful: orderId={}, stripeId={}",
                request.getOrderId(), intent.getId());
        } catch (Exception e) {
            log.error("Payment failed: orderId={}, error={}",
                request.getOrderId(), e.getMessage(), e);
        }
    }
}
```

### 4. Metrics & Analytics

**Prometheus + Grafana:**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  prometheus-data:
  grafana-data:
```

**Key Metrics to Track:**

- Payment success rate
- Average checkout time
- Failed payment reasons
- Refund rate
- Escrow release time
- API response times

---

## Testing in Production

### 1. Smoke Tests

Run after deployment:

```bash
# Health check
curl https://api.marifetbul.com/actuator/health

# Frontend
curl https://marifetbul.com

# Stripe connection
curl https://api.marifetbul.com/api/v1/payments/health
```

### 2. End-to-End Test (Stripe Test Mode)

Temporarily enable test mode to verify:

1. Create test order
2. Complete checkout with test card: `4242 4242 4242 4242`
3. Verify order created
4. Check webhook received
5. Verify escrow status
6. Test refund flow

### 3. Load Testing

```bash
# Install k6
brew install k6  # macOS
# or
sudo apt-get install k6  # Linux

# Run load test
k6 run load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
};

export default function () {
  let res = http.get('https://marifetbul.com/checkout/1');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```

---

## Rollback Plan

### If Issues Occur

#### 1. Frontend Rollback

**Vercel:**

```bash
# List deployments
vercel list

# Rollback to previous
vercel rollback [deployment-url]
```

**Docker:**

```bash
# Stop current container
docker stop marifetbul-frontend

# Start previous version
docker run -d --name marifetbul-frontend marifetbul-frontend:previous
```

#### 2. Backend Rollback

```bash
# Kubernetes
kubectl rollout undo deployment/marifetbul-backend

# Docker
docker stop marifetbul-backend
docker run -d --name marifetbul-backend marifetbul-backend:previous

# Verify
curl https://api.marifetbul.com/actuator/health
```

#### 3. Database Rollback

```bash
# Rollback migration
cd marifetbul-backend
./mvnw flyway:undo

# Or restore from backup
psql -U postgres -d marifetbul < backup-$(date +%Y%m%d).sql
```

---

## Post-Deployment

### Immediate Actions (Day 1)

- [ ] Monitor error rates (Sentry)
- [ ] Check webhook delivery (Stripe Dashboard)
- [ ] Verify SSL certificate (SSLLabs.com)
- [ ] Test critical user flows
- [ ] Review server logs
- [ ] Check payment success rate

### Week 1 Actions

- [ ] Analyze payment conversion rate
- [ ] Review failed payment reasons
- [ ] Monitor refund requests
- [ ] Check escrow release times
- [ ] Performance optimization
- [ ] User feedback collection

### Ongoing Maintenance

- [ ] Weekly: Review Stripe Dashboard
- [ ] Monthly: Security audit
- [ ] Monthly: Performance review
- [ ] Quarterly: Dependency updates
- [ ] Yearly: SSL certificate renewal
- [ ] Yearly: Stripe compliance review

---

## Support & Troubleshooting

### Common Issues

#### Payment Intent Creation Fails

**Symptoms**: Error creating payment intent

**Causes**:

- Invalid Stripe API key
- Amount below minimum (₺50)
- Currency not supported

**Solution**:

```bash
# Check logs
tail -f /var/log/marifetbul/application.log | grep payment

# Verify Stripe key
curl https://api.stripe.com/v1/charges \
  -u ${STRIPE_SECRET_KEY}:
```

#### Webhooks Not Received

**Symptoms**: Payments succeed but order status not updated

**Causes**:

- Webhook endpoint unreachable
- Incorrect webhook secret
- Firewall blocking Stripe IPs

**Solution**:

```bash
# Test webhook endpoint
curl -X POST https://api.marifetbul.com/api/v1/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded"}'

# Check Stripe webhook logs
# Dashboard → Developers → Webhooks → [endpoint] → Events
```

#### 3D Secure Not Working

**Symptoms**: Card authentication fails

**Causes**:

- Incorrect return URL
- Browser blocking popup
- Missing Stripe.js script

**Solution**:

- Verify return URL in code
- Check browser console for errors
- Ensure Stripe.js loaded: `window.Stripe`

### Getting Help

**Stripe Support**:

- Email: support@stripe.com
- Chat: Available in Stripe Dashboard
- Docs: https://stripe.com/docs

**Internal Team**:

- Backend issues: backend-team@marifetbul.com
- Frontend issues: frontend-team@marifetbul.com
- DevOps: devops@marifetbul.com

---

## Compliance & Legal

### PCI DSS Compliance

**Stripe handles PCI compliance**, but you must:

- ✅ Use Stripe.js (never handle card data directly)
- ✅ Use HTTPS for all pages
- ✅ Don't store card numbers, CVV, or PINs
- ✅ Keep Stripe.js library up to date

### GDPR Compliance (EU Users)

- [ ] Privacy policy includes payment data handling
- [ ] Users can request data deletion
- [ ] Payment data retained per legal requirements
- [ ] Cookie consent for Stripe cookies

### Turkish Regulations

- [ ] MASAK (Financial Crimes Investigation Board) compliance
- [ ] KVK (Personal Data Protection) compliance
- [ ] Invoice generation for all payments
- [ ] Tax reporting for platform fees

---

## Conclusion

### Deployment Summary

After completing this guide, you will have:

- ✅ Production Stripe account configured
- ✅ Frontend deployed with HTTPS
- ✅ Backend deployed with webhooks
- ✅ Database optimized with indexes
- ✅ Security headers configured
- ✅ Monitoring and logging enabled
- ✅ SSL certificates installed
- ✅ Rate limiting implemented

### Next Steps

1. **Go Live**: Switch from test mode to production
2. **Monitor**: Watch metrics for first week
3. **Optimize**: Improve based on real data
4. **Scale**: Add resources as needed

### Support Contacts

- **Technical Issues**: devops@marifetbul.com
- **Payment Issues**: payments@marifetbul.com
- **Emergency**: +90 XXX XXX XX XX

---

**Deployment Date**: ******\_******
**Deployed By**: ******\_******
**Verified By**: ******\_******

**Last Updated**: October 25, 2025
**Version**: 1.0.0
