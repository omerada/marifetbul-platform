# 🚀 Admin Panel Security & Production Setup Guide

## 🔒 Admin Güvenlik Best Practices

### Initial Setup (İlk Kurulum)

#### 1. Development Environment

```bash
# Development ortamında test admin hesabı otomatik oluşturulur
# Email: admin@marifetbul.com
# Password: Admin123!

# İlk giriş sonrası şifreyi değiştirin
```

#### 2. Production Deployment

**CRITICAL**: Production'a deploy etmeden önce:

```sql
-- Option 1: Migration'ı güncelleyin (Önerilen)
-- marifetbul-backend/src/main/resources/db/migration/V1__init_schema.sql
-- "SEED DATA" bölümünü yoruma alın veya silin

-- Option 2: İlk deploy sonrası hemen admin şifresini değiştirin
-- Database'de manuel olarak:
UPDATE users
SET password_hash = '$2a$10$YourNewSecureHashHere'
WHERE email = 'admin@marifetbul.com';

-- Option 3: Admin CLI tool kullanın (geliştirilecek)
java -jar marifetbul-backend.jar --create-admin
```

### 🛡️ Production Security Checklist

#### Frontend (.env.production)

```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=MarifetBul
NEXT_PUBLIC_APP_URL=https://marifetbul.com
NEXT_PUBLIC_API_URL=https://api.marifetbul.com/api/v1

# Disable debug features
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
NEXT_PUBLIC_LOG_LEVEL=error

# Enable production monitoring
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_SENTRY_DSN=your-production-dsn

# Security headers (handled by middleware)
# CSP, HSTS, X-Frame-Options automatically enabled
```

#### Backend (application-prod.properties)

```properties
# Production database
spring.datasource.url=jdbc:postgresql://production-db:5432/marifetbul_prod
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT Security
jwt.secret=${JWT_SECRET_256_BIT}
jwt.expiration=86400000

# Disable H2 console
spring.h2.console.enabled=false

# Enable security features
spring.security.require-ssl=true

# Rate limiting
rate-limit.enabled=true
rate-limit.max-requests=100
rate-limit.window-ms=900000
```

### 👤 Admin User Management

#### Şifre Gereksinimleri (Production)

- Minimum 12 karakter
- En az 1 büyük harf
- En az 1 küçük harf
- En az 1 rakam
- En az 1 özel karakter (@$!%\*?&)
- Son 5 şifre tekrar kullanılamaz

#### İlk Giriş Sonrası Yapılacaklar

1. **Şifre Değiştirme** (Zorunlu)

   ```
   Admin Panel → Settings → Security → Change Password
   ```

2. **2FA Aktivasyonu** (Şiddetle Önerilir)

   ```
   Admin Panel → Settings → Security → Enable 2FA
   ```

3. **API Key Oluşturma**

   ```
   Admin Panel → Settings → API Keys → Generate New Key
   ```

4. **Yedek Admin Oluşturma**
   ```
   Admin Panel → Users → Create Admin
   ```

### 🔐 Multi-Factor Authentication (2FA)

Production'da admin hesapları için 2FA zorunludur:

```typescript
// Backend: Enable 2FA enforcement for admins
@ConfigurationProperties(prefix = "security.admin")
public class AdminSecurityConfig {
    private boolean enforce2FA = true; // Production default
    private int maxLoginAttempts = 3;
    private long lockoutDurationMinutes = 30;
}
```

### 📊 Audit Logging

Tüm admin aksiyonları loglanır:

```sql
-- Admin actions audit log
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY,
    admin_user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🚨 Security Monitoring

#### Failed Login Attempts

```java
// Backend: Automatic account lockout
@Service
public class LoginSecurityService {
    private static final int MAX_FAILED_ATTEMPTS = 3;
    private static final long LOCKOUT_DURATION_MINUTES = 30;

    public void handleFailedLogin(String email) {
        // Increment failed attempts
        // Lock account after MAX_FAILED_ATTEMPTS
        // Send security alert email
    }
}
```

#### IP Whitelisting (Optional)

```properties
# Backend: Restrict admin access to specific IPs
admin.security.ip-whitelist=192.168.1.0/24,10.0.0.0/8
admin.security.enable-ip-restriction=true
```

### 📱 Admin Access Levels

```typescript
// Frontend: Role-based access control
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    level: 10,
    permissions: ['*'], // All permissions
  },
  ADMIN: {
    level: 5,
    permissions: [
      'users:read',
      'users:write',
      'content:moderate',
      'reports:view',
    ],
  },
  MODERATOR: {
    level: 2,
    permissions: ['content:moderate', 'reports:view'],
  },
} as const;
```

### 🔄 Password Rotation Policy

Production ortamında zorunlu şifre değiştirme:

```java
@Configuration
public class PasswordPolicyConfig {
    // Password expires after 90 days
    private int passwordExpiryDays = 90;

    // Warn user 7 days before expiry
    private int expiryWarningDays = 7;

    // Prevent reuse of last 5 passwords
    private int passwordHistoryCount = 5;
}
```

### 📧 Security Notifications

Admin hesabı için otomatik bildirimler:

1. **Başarılı Giriş** - Yeni cihazdan giriş
2. **Başarısız Giriş** - 3+ başarısız deneme
3. **Şifre Değişikliği** - Şifre değiştirildi
4. **Rol Değişikliği** - Yetki değişti
5. **API Key Oluşturma** - Yeni API key
6. **Kritik İşlemler** - Kullanıcı ban, silme vb.

### 🧪 Development vs Production

#### Development (Otomatik Görünür)

```typescript
// Admin login page - Development helper
{process.env.NODE_ENV === 'development' && (
  <div className="development-helper">
    <p>Test Admin: admin@marifetbul.com / Admin123!</p>
    <button onClick={autoFill}>Auto-fill credentials</button>
  </div>
)}
```

#### Production (Otomatik Gizli)

```typescript
// Production'da development helper gösterilmez
// NODE_ENV=production ise hiçbir test credential görünmez
// Yalnızca güvenli login formu aktif
```

### 🔍 Security Audit

Production deploy öncesi kontrol listesi:

- [ ] Default admin şifresi değiştirildi
- [ ] 2FA aktif
- [ ] SSL/TLS sertifikaları geçerli
- [ ] Rate limiting aktif
- [ ] CORS ayarları doğru
- [ ] CSP headers uygulandı
- [ ] SQL injection koruması aktif
- [ ] XSS prevention aktif
- [ ] Session timeout ayarlandı (15 dakika)
- [ ] Audit logging aktif
- [ ] Error messages generic (info leak yok)
- [ ] Development endpoints kapalı
- [ ] Test credentials kaldırıldı
- [ ] API rate limits ayarlandı
- [ ] File upload restrictions aktif
- [ ] Input validation comprehensive

### 📞 Security Incident Response

Güvenlik olayı tespit edilirse:

1. **Acil Durum**: Hemen tüm admin sessionları sonlandır
2. **Analiz**: Audit log'ları incele
3. **İzolasyon**: Etkilenen hesapları kilitle
4. **Bildirim**: Etkilenen kullanıcıları bilgilendir
5. **Düzeltme**: Güvenlik açığını kapat
6. **Doğrulama**: Sistemi yeniden test et

### 🎯 Production Deployment Steps

```bash
# 1. Frontend build (production)
npm run build
npm run test
npm run lint

# 2. Backend build (production)
cd marifetbul-backend
mvn clean package -P production -DskipTests=false

# 3. Database migration (production)
# Run migrations with backup
flyway migrate -configFiles=flyway-prod.conf

# 4. Change default admin password
# Login as admin and change immediately

# 5. Enable 2FA for all admin accounts

# 6. Configure monitoring and alerts

# 7. Run security scan
npm audit
mvn dependency:check

# 8. Deploy to production
# Use your deployment pipeline (Vercel, AWS, etc.)
```

### 📚 Related Documentation

- [SECURITY.md](./SECURITY.md) - Comprehensive security guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md) - Production checklist
- [API.md](./API.md) - API security guidelines

### ⚠️ Important Notes

1. **Seed Data**: V1\_\_init_schema.sql'deki admin seed data yalnızca initial setup içindir
2. **Password**: Default admin password production'da ASLA kullanılmamalı
3. **Environment**: Development helper'lar production'da otomatik gizlenir
4. **Monitoring**: Sentry, Google Analytics production'da aktif olmalı
5. **Backups**: Production database'i düzenli yedekleyin

### 🆘 Support

Güvenlik sorunları için:

- Email: security@marifetbul.com
- Acil: Slack #security-alerts kanalı
- Bug Bounty: hackerone.com/marifetbul

---

**Son Güncelleme**: 2025-10-16  
**Version**: 1.0.0  
**Statü**: ✅ Production-Ready
