# Docker Compose ile Backend - Hızlı Başlangıç

## 🚀 En Sık Kullanılan Komutlar

### 1. **Temiz Başlangıç (Stop + Build + Run)**

```bash
cd marifetbul-backend

# Tüm servisleri durdur, rebuild et, ve başlat
docker-compose down && docker-compose up --build -d
```

**Bunu ne zaman kullanırım?**

- ✅ Başlangıçta
- ✅ Kod önemli değişiklikleri yapıldıktan sonra
- ✅ Kütüphane bağımlılıkları değiştirildiğinde (pom.xml)

---

### 2. **Sadece Backend Rebuild**

```bash
cd marifetbul-backend

# Backend'i durdur, rebuild et, başlat
docker-compose up -d --build backend
```

**Bunu ne zaman kullanırım?**

- ✅ Sadece backend kodu değişti
- ✅ Hızlı test için

---

### 3. **Hızlı Restart (Rebuild Yok)**

```bash
cd marifetbul-backend

# Container'ı sadece yeniden başlat
docker-compose restart backend
```

**Bunu ne zaman kullanırım?**

- ✅ Küçük ayar değişiklikleri (application-dev.yml)
- ✅ Environment değişkenleri değiştirildiğinde
- ⚠️ YAPMA: Kod değişiklikleri için (rebuild gerekli!)

---

### 4. **Log'ları Görmek**

```bash
cd marifetbul-backend

# Canlı log akışı
docker-compose logs -f backend

# Tüm servislerin log'larını görmek
docker-compose logs -f
```

---

## 🐳 Tüm Servisleri Yönetmek

### Start (Başlat)

```bash
# Tüm servisleri başlat
docker-compose up -d

# Sadece backend'i başlat (diğerleri çalışıyor varsayarak)
docker-compose up -d backend
```

### Stop (Durdur)

```bash
# Tüm servisleri durdur (container'ları tutarak)
docker-compose stop

# Container'ları da sil
docker-compose down

# Container'ları ve volume'leri sil (VERİ SİLİNİR!)
docker-compose down -v
```

### Status (Durum)

```bash
# Tüm servislerin durumunu görmek
docker-compose ps
```

---

## 💻 PowerShell Script Kullanımı

Script dosyasını hazırladık: `manage-backend.ps1`

### Kullanım Örnekleri

```powershell
# ✅ Başlat (tüm servisleri)
.\manage-backend.ps1 start all

# ✅ Backend'i rebuild et
.\manage-backend.ps1 rebuild backend

# ✅ Backend yeniden başlat
.\manage-backend.ps1 restart backend

# ✅ Log'ları görmek
.\manage-backend.ps1 logs

# ✅ Canlı log akışı
.\manage-backend.ps1 logs -Follow

# ✅ Servisleri durdur
.\manage-backend.ps1 stop all

# ✅ Durumları görmek
.\manage-backend.ps1 ps

# ✅ Temiz start (verileri sil!)
.\manage-backend.ps1 clean
```

---

## 📊 Docker Compose Mimarisi

```
┌─────────────────────────────────────────┐
│        Docker Network: marifetbul-net   │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Backend (marifetbul-backend)    │  │
│  │  Port: 8080                      │  │
│  │  Status: Java Spring Boot        │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  PostgreSQL (marifetbul-postgres)│  │
│  │  Port: 5432                      │  │
│  │  DB: marifetbul_dev              │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  Redis (marifetbul-redis)        │  │
│  │  Port: 6379                      │  │
│  │  Cache: 256MB max                │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │ Elasticsearch (marifetbul-es)    │  │
│  │  Port: 9200                      │  │
│  │  Search: Full-text               │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  MailPit (marifetbul-mailpit)    │  │
│  │  SMTP: 1025                      │  │
│  │  Web UI: 8025                    │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Health Check

Backend başarıyla çalışıyor mu kontrol et:

```bash
# Backend health endpoint
curl http://localhost:8080/actuator/health

# Response (başarılı):
# {"status":"UP","components":{"db":{"status":"UP"},"redis":{"status":"UP"}}}

# Database bağlantısı test et
docker-compose exec postgres psql -U postgres -d marifetbul_dev -c "SELECT 1"

# Redis test et
docker-compose exec redis redis-cli -a redis123 ping

# Elasticsearch test et
curl http://localhost:9200/_cluster/health
```

---

## 🐛 Troubleshooting

### Sorun: "Port 8080 is already in use"

```bash
# Çıkışta olan process'i bul
netstat -ano | findstr :8080

# PID ile process'i kapat (Windows)
taskkill /F /PID <PID>

# Veya docker container'ı force kill et
docker-compose rm -f backend
docker-compose up -d backend
```

### Sorun: "Database connection refused"

```bash
# PostgreSQL container log'larını kontrol et
docker-compose logs postgres

# PostgreSQL container'ını restart et
docker-compose restart postgres

# Backend'e bağlanması için beklemeyi uzat
docker-compose up -d --wait backend
```

### Sorun: "Backend başlamıyor - sonsuz loop"

```bash
# Container'a gir ve debug yap
docker-compose exec backend sh

# Backend log'larını kontrol et
docker-compose logs backend | tail -100

# Clean rebuild yap
docker-compose down -v
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

## 📚 Ilgili Dosyalar

- 📄 **docker-compose.yml** - Servis tanımları
- 📄 **Dockerfile** - Backend imaj tanımı
- 📄 **DOCKER_COMMANDS_GUIDE.md** - Detaylı komut rehberi
- 🐚 **manage-backend.ps1** - PowerShell yönetim scripti

---

## 🎯 Tipik Geliştirme Akışı

```bash
# 1. Morning: Servisleri başlat
cd marifetbul-backend
docker-compose up -d

# 2. Kod değişikliği yaptın
# ... edit src/main/java/com/marifetbul/...

# 3. Rebuild et
docker-compose up -d --build backend

# 4. Test et
curl http://localhost:8080/api/v1/health

# 5. Log'ları kontrol et
docker-compose logs -f backend

# 6. Evening: Servisleri durdur
docker-compose down
```

---

**Başlangıç için:** `docker-compose up -d` 🚀
