# 🔐 MarifetBul Test Kullanıcıları

Bu dokümanda frontend geliştirme ve test için kullanabileceğiniz hazır test kullanıcıları bulunmaktadır.

## 📋 Ana Test Kullanıcıları

Tüm test kullanıcıları **otomatik olarak** backend başlatıldığında Flyway migration sistemi ile oluşturulur.

### 👤 Admin Kullanıcısı

```
Email: admin@marifetbul.com
Password: Admin123!
Rol: ADMIN
```

**Kullanım Alanları:**

- Admin dashboard'a erişim
- Tüm yönetim işlemleri
- Sistem ayarları
- Kullanıcı yönetimi

### 💼 Freelancer Kullanıcısı

```
Email: freelancer@test.com
Password: Test123!
Rol: FREELANCER
Username: testfreelancer
```

**Profil Bilgileri:**

- İsim: Test Freelancer
- Lokasyon: İstanbul
- Bio: Full-stack web developer with 5+ years experience
- Telefon: +905551234567

**Kullanım Alanları:**

- Job başvuruları
- Proposal gönderme
- Freelancer dashboard
- Profil düzenleme

### 🏢 Employer Kullanıcısı

```
Email: employer@test.com
Password: Test123!
Rol: EMPLOYER
Username: testemployer
```

**Profil Bilgileri:**

- İsim: Test Employer
- Lokasyon: Ankara
- Bio: Tech company looking for quality freelancers
- Telefon: +905557654321

**Kullanım Alanları:**

- Job ilanı oluşturma
- Proposal inceleme
- Employer dashboard
- Freelancer arama

### 🛡️ Moderator Kullanıcısı

```
Email: moderator@test.com
Password: Test123!
Rol: MODERATOR
Username: moderator
```

**Kullanım Alanları:**

- İçerik moderasyonu
- Şikayet yönetimi
- Platform denetimi

---

## 👥 Ek Test Kullanıcıları

### Freelancer Kullanıcıları

Tüm freelancer test kullanıcıları **`Test123!`** şifresi ile giriş yapabilir:

| Email                | Username     | İsim         | Uzmanlik Alanı                 |
| -------------------- | ------------ | ------------ | ------------------------------ |
| freelancer1@test.com | developer1   | Ahmet Yılmaz | Senior Full-Stack Developer    |
| freelancer2@test.com | designer1    | Ayşe Kaya    | UI/UX Designer                 |
| freelancer3@test.com | mobile1      | Mehmet Demir | Mobile App Developer           |
| freelancer4@test.com | writer1      | Zeynep Şahin | Content Writer & SEO           |
| freelancer5@test.com | videoeditor1 | Can Arslan   | Video Editor & Motion Graphics |

### Employer Kullanıcıları

Tüm employer test kullanıcıları **`Test123!`** şifresi ile giriş yapabilir:

| Email              | Username | Şirket Adı     | Açıklama                    |
| ------------------ | -------- | -------------- | --------------------------- |
| employer1@test.com | company1 | TechCo Company | Fast-growing tech startup   |
| employer2@test.com | agency1  | Digital Agency | Full-service digital agency |
| employer3@test.com | startup1 | Startup Inc    | E-commerce startup          |

---

## 🚀 Hızlı Giriş

### Frontend'de Login Test Etmek İçin:

1. **Freelancer olarak giriş:**

   ```
   http://localhost:3000/login
   Email: freelancer@test.com
   Password: Test123!
   ```

2. **Employer olarak giriş:**

   ```
   http://localhost:3000/login
   Email: employer@test.com
   Password: Test123!
   ```

3. **Admin olarak giriş:**
   ```
   http://localhost:3000/admin/login
   Email: admin@marifetbul.com
   Password: Admin123!
   ```

---

## 🔧 Teknik Detaylar

### Otomatik Seed Sistemi

Test kullanıcıları aşağıdaki mekanizma ile otomatik oluşturulur:

1. **Flyway Migration**: `V43__seed_test_users.sql`
2. **Database**: PostgreSQL (marifetbul_dev)
3. **Şifreleme**: BCrypt (strength: 10)
4. **Durum**: Tüm kullanıcılar ACTIVE ve email verified

### Backend Migration Dosyası

```
Location: marifetbul-backend/src/main/resources/db/migration/V43__seed_test_users.sql
Auto-run: Database başlatıldığında otomatik çalışır
Idempotent: ON CONFLICT DO NOTHING ile güvenli
```

### Şifre Hash'leri

```sql
-- Test123! (BCrypt)
$2a$10$6Yy7JU6gQW8vP.xlWRJz9.wPhC.EqDNjQJj3rP8qdFZPmN8qRJYGO

-- Admin123! (BCrypt)
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

---

## 🐛 Sorun Giderme

### Login 401 Hatası Alıyorsanız:

1. **Backend çalışıyor mu kontrol edin:**

   ```bash
   cd marifetbul-backend
   docker-compose ps
   ```

2. **Kullanıcılar oluşturuldu mu kontrol edin:**

   ```bash
   docker-compose exec postgres psql -U postgres -d marifetbul_dev \
     -c "SELECT email, role FROM users WHERE email LIKE '%@test.com';"
   ```

3. **Backend loglarını kontrol edin:**
   ```bash
   docker-compose logs backend --tail=50
   ```

### Database'de Kullanıcılar Yoksa:

Migration'ı manuel çalıştırın:

```bash
cd marifetbul-backend/src/main/resources/db/migration
Get-Content V43__seed_test_users.sql | docker-compose exec -T postgres psql -U postgres -d marifetbul_dev
```

---

## 📚 İlgili Dokümantasyon

- [Backend README](./marifetbul-backend/README.md)
- [Test Data Seeding Guide](./marifetbul-backend/TEST_DATA_SEEDING_GUIDE.md)
- [Quick Start Guide](./marifetbul-backend/QUICK_START_SEEDING.md)

---

**Son Güncelleme:** 20 Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready
