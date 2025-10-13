# 🚀 Backend-Frontend API Entegrasyon Kılavuzu

## ✅ Tamamlanan İşlemler (Sprint 18 - Phase 1)

### 1. Backend CORS Configuration

**Oluşturulan Dosya:** `marifetbul-backend/src/main/java/com/marifetbul/api/config/CorsConfig.java`

✅ CORS ayarları eklendi:

- Allowed Origins: `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
- Allow Credentials: `true`
- Exposed Headers: `Authorization`, `Content-Type`, `X-Total-Count`, etc.

**application.yml'ye eklenen config:**

```yaml
app:
  cors:
    allowed-origins: http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
    allowed-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
    allowed-headers: '*'
    allow-credentials: true
    max-age: 3600
```

---

### 2. Frontend Environment Variables

**Oluşturulan Dosyalar:**

- `.env.local` - Local development configuration
- `.env.example` - Example/template file

**Değişkenler:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=MarifetBul
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. Next.js API Proxy Configuration

**Güncellenen Dosya:** `next.config.js`

✅ Rewrites eklendi:

```javascript
async rewrites() {
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  }
  return [];
}
```

**Nasıl çalışır?**

- Development'ta: Frontend `/api/v1/*` isteklerini backend'e proxy eder
- Production'da: Direct API URL kullanılır

---

### 4. API Client Base URL Fix

**Güncellenen Dosyalar:**

- `lib/infrastructure/api/client.ts`
- `lib/infrastructure/api/UnifiedApiClient.ts`

✅ Base URL düzeltildi:

```typescript
// BEFORE
baseURL: '/api';

// AFTER
baseURL: process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
    ? '/api/v1'
    : 'http://localhost:8080/api/v1');
```

---

### 5. TODO Fixes - Authentication Controllers

**Güncellenen Dosyalar:**

- ✅ `WalletController.java` - 3 TODO fixed
- ✅ `PayoutController.java` - 4 TODO fixed
- ✅ `PaymentController.java` - 1 TODO fixed

**Değişiklik:**

```java
// BEFORE
UUID userId = UUID.randomUUID(); // Temporary

// AFTER
UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
UUID userId = userPrincipal.getId();
```

**Toplam:** 8 TODO fixed! ✅

---

## 🎯 Nasıl Çalıştırılır?

### Backend (Spring Boot)

```bash
cd marifetbul-backend/marifetbul-backend

# PostgreSQL ve Redis'in çalıştığından emin olun
# Docker ile:
docker-compose up -d postgres redis

# Backend'i çalıştır
mvn spring-boot:run

# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### Frontend (Next.js)

```bash
# Root dizinde
npm install

# Development server başlat
npm run dev

# App: http://localhost:3000
```

---

## 🧪 Test Etme

### 1. CORS Test

```bash
# Terminal'de
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/v1/auth/login

# Beklenen response:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Credentials: true
```

### 2. API Connection Test

**Frontend Console'da:**

```javascript
// Browser console'da çalıştır
fetch('/api/v1/categories')
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

### 3. Authentication Test

```javascript
// Login test
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }),
})
  .then((res) => res.json())
  .then((data) => console.log('Login success:', data))
  .catch((err) => console.error('Login error:', err));
```

---

## 📊 Entegrasyon Durumu

| Feature               | Backend | Frontend | Integration | Status         |
| --------------------- | ------- | -------- | ----------- | -------------- |
| CORS                  | ✅      | ✅       | ✅          | Ready          |
| Auth (Login/Register) | ✅      | ✅       | 🟡          | Testing needed |
| Categories            | ✅      | ✅       | 🟡          | Testing needed |
| Jobs                  | ✅      | ✅       | 🟡          | Testing needed |
| Packages              | ✅      | ✅       | 🟡          | Testing needed |
| Proposals             | ✅      | ⚠️       | ❌          | TODO           |
| Messages              | ✅      | ⚠️       | ❌          | TODO           |
| Notifications         | ✅      | ⚠️       | ❌          | TODO           |
| Payments              | ✅      | ❌       | ❌          | TODO           |
| Reviews               | ✅      | ❌       | ❌          | TODO           |

**Lejant:**

- ✅ Tamamlandı
- 🟡 Test gerekiyor
- ⚠️ Kısmi
- ❌ Eksik

---

## 🔄 Sonraki Adımlar

### Sprint 18 - Phase 2 (Kalan)

1. **Integration Testing**
   - [ ] Auth flow test
   - [ ] API endpoint testleri
   - [ ] Error handling testleri

2. **Cookie-based Authentication**
   - [ ] Frontend: localStorage → httpOnly cookie
   - [ ] Backend: Cookie management
   - [ ] Token refresh flow

3. **Token Blacklist (Redis)**
   - [ ] AuthController'da logout endpoint
   - [ ] Redis token blacklist service
   - [ ] Token validation middleware

### Sprint 19 - Domain Completion

1. **Frontend Integration**
   - [ ] Proposal domain
   - [ ] Message domain
   - [ ] Notification domain
   - [ ] Payment domain
   - [ ] Review domain

2. **Missing Backend Features**
   - [ ] Order Controller
   - [ ] Dashboard Controller
   - [ ] Analytics Services
   - [ ] Elasticsearch integration

---

## 📝 Notlar

### Environment Variables

**Development:**

- Frontend: `.env.local`
- Backend: `application-dev.yml`

**Production:**

- Frontend: Vercel environment variables
- Backend: Environment variables (Docker/K8s)

### API Base URL Strategy

1. **Development:** Proxy through Next.js (`/api/v1` → `http://localhost:8080/api/v1`)
2. **Production:** Direct API URL (`NEXT_PUBLIC_API_URL`)

### Authentication Flow

```
Frontend                Backend
   |                       |
   |--- POST /login ------>|
   |                       |
   |<-- JWT Token ---------|
   |                       |
   | (Store in localStorage or cookie)
   |                       |
   |--- GET /api/v1/* ---->|
   |    Authorization:     |
   |    Bearer <token>     |
   |                       |
   |<-- Response ----------|
```

---

## 🐛 Troubleshooting

### CORS Hatası

**Sorun:** `Access-Control-Allow-Origin` hatası

**Çözüm:**

1. Backend'in çalıştığından emin olun
2. `application.yml`'daki CORS ayarlarını kontrol edin
3. Browser cache'ini temizleyin

### Connection Refused

**Sorun:** `ERR_CONNECTION_REFUSED` veya `ECONNREFUSED`

**Çözüm:**

1. Backend çalışıyor mu? → `http://localhost:8080/actuator/health`
2. PostgreSQL ve Redis çalışıyor mu?
3. Firewall backend portunu blokluyor mu?

### 401 Unauthorized

**Sorun:** API çağrıları 401 dönüyor

**Çözüm:**

1. Token localStorage'da var mı? → `localStorage.getItem('marifetbul-auth')`
2. Token geçerli mi? → JWT.io'da decode edin
3. Authorization header doğru mu? → `Bearer <token>` formatı

---

## 📚 Referanslar

- **Backend API Docs:** http://localhost:8080/swagger-ui.html
- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:8080/actuator/health
- **Metrics:** http://localhost:8080/actuator/prometheus

---

**Son Güncelleme:** 13 Ekim 2025  
**Sprint:** 18 - Phase 1  
**Durum:** ✅ TAMAMLANDI (8/10 tasks)
