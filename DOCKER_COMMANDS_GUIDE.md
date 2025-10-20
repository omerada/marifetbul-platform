# Docker Compose ile Backend Yönetimi

## 📋 Hızlı Komutlar

### 1. **Stop - Build - Run (Tümü Bir Komutta)**

```bash
# Backend'i durdur, yeniden build et, ve çalıştır
cd marifetbul-backend
docker-compose down ; docker-compose up --build -d backend

# Tüm servisleri (PostgreSQL, Redis, Elasticsearch dahil) başlat
docker-compose down ; docker-compose up --build -d
```

### 2. **Adım Adım**

#### Stop (Durdur)

```bash
cd marifetbul-backend

# Sadece backend'i durdur
docker-compose stop backend

# Tüm servisleri durdur
docker-compose stop

# Durdur ve container'ları sil
docker-compose down

# Durdur, container'ları sil ve volume'leri de sil (UYARI: Veriler silinir!)
docker-compose down -v
```

#### Build (İnşa Et)

```bash
cd marifetbul-backend

# Sadece backend'i rebuild et
docker-compose build backend

# Tüm servisleri rebuild et
docker-compose build

# Cache'siz rebuild (temiz build)
docker-compose build --no-cache backend
```

#### Run (Çalıştır)

```bash
cd marifetbul-backend

# Sadece backend'i başlat (servisleri arka planda çalıştırarak)
docker-compose up -d backend

# Tüm servisleri başlat
docker-compose up -d

# Detached mode olmadan başlat (log'ları görmek için)
docker-compose up backend
```

---

## 🚀 Yaygın Senaryo Komutları

### Senaryо 1: Temiz Start (Sıfırdan Başlamak)

```bash
cd marifetbul-backend

# Temiz başlat - tüm container'ları kaldır, volume'leri sil, rebuild et
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Kontrol et
docker-compose ps
```

### Senaryo 2: Kod Değişikliğinden Sonra

```bash
cd marifetbul-backend

# Backend kodu değişti, rebuild et ve restart et
docker-compose stop backend
docker-compose build backend
docker-compose up -d backend

# Veya tek komutta:
docker-compose up -d --build backend
```

### Senaryo 3: Hızlı Restart (Kod Değişmedi)

```bash
cd marifetbul-backend

# Container'ı yeniden başlat (rebuild yok)
docker-compose restart backend

# Veya stop + start
docker-compose stop backend
docker-compose start backend
```

### Senaryo 4: Debug Modunda

```bash
cd marifetbul-backend

# Log'ları canlı görmek için:
docker-compose logs -f backend

# Son 100 satırı görmek:
docker-compose logs --tail=100 backend

# Tüm servislerin log'larını görmek:
docker-compose logs -f
```

---

## 🔧 Gelişmiş Komutlar

### Container'a SSH Bağlan

```bash
# Backend container'ına gir
docker-compose exec backend sh

# PostgreSQL container'ına gir
docker-compose exec postgres psql -U postgres -d marifetbul_dev
```

### Health Check

```bash
# Servislerin durumunu kontrol et
docker-compose ps

# Backend'in health endpoint'ini test et
curl http://localhost:8080/actuator/health

# Database'e bağlantı test et
docker-compose exec postgres pg_isready -U postgres

# Redis test et
docker-compose exec redis redis-cli -a redis123 ping
```

### Cleanup (Temizleme)

```bash
cd marifetbul-backend

# Yalnızca unused image'ları sil
docker image prune -f

# Tüm stopped container'ları sil
docker container prune -f

# Tüm unused volume'leri sil
docker volume prune -f

# Tümünü temizle (UYARI!)
docker system prune -a --volumes
```

---

## 📊 Docker Compose Komut Özeti Tablosu

| Görev                      | Komut                                                 | Açıklama                       |
| -------------------------- | ----------------------------------------------------- | ------------------------------ |
| **Stop + Build + Run**     | `docker-compose down && docker-compose up --build -d` | Temiz başlat                   |
| **Sadece Backend Rebuild** | `docker-compose up -d --build backend`                | Kod değişikliğinden sonra      |
| **Backend'i Durdur**       | `docker-compose stop backend`                         | Çalışan container'ı durdur     |
| **Backend'i Başlat**       | `docker-compose start backend`                        | Durdurulmuş container'ı başlat |
| **Backend'i Restart**      | `docker-compose restart backend`                      | Baştan başlat                  |
| **Log'ları Görmek**        | `docker-compose logs -f backend`                      | Canlı log akışı                |
| **Container Durumu**       | `docker-compose ps`                                   | Tüm servislerin durumu         |
| **Container'a Girmek**     | `docker-compose exec backend sh`                      | SSH benzeri erişim             |

---

## 🎯 Windows PowerShell İçin Komutlar

```powershell
# Stop - Build - Run
cd marifetbul-backend; docker-compose down; docker-compose up --build -d backend

# Log'ları Görmek
docker-compose logs -f backend

# Durdurmak
docker-compose down

# Cleanup
docker system prune -a --volumes -f
```

---

## ✅ Başarılı Başlangıç Kontrol Listesi

Backend başarıyla çalıştıktan sonra kontrol et:

```bash
# 1. Container'ın çalıştığını kontrol et
docker-compose ps

# 2. Backend health check
curl http://localhost:8080/actuator/health

# 3. Database bağlantısını kontrol et
docker-compose exec backend curl http://localhost:8080/api/v1/auth/login

# 4. Log'larda hata aranır
docker-compose logs backend | grep -i error
```

---

## 🐛 Sık Karşılaşılan Sorunlar

### Port Hatası: "Port is already allocated"

```bash
# Port'u kullanan process'i bul ve durdur
netstat -ano | findstr :8080
taskkill /F /PID <PID>

# Veya başka port kullan
docker-compose -f docker-compose.yml up -d -p 8081:8080 backend
```

### Container Başlamazsa

```bash
# Log'ları kontrol et
docker-compose logs backend

# Container'a gir ve debug yap
docker-compose exec backend sh
```

### Database Bağlantı Hatası

```bash
# PostgreSQL'in hazır olduğunu kontrol et
docker-compose logs postgres

# Container'ı yeniden başlat
docker-compose restart postgres
docker-compose restart backend
```

---

## 📚 Ek Kaynaklar

- [Docker Compose Resmi Docs](https://docs.docker.com/compose/)
- [Spring Boot Docker Docs](https://spring.io/guides/gs/spring-boot-docker/)
- [PostgreSQL Docker Docs](https://hub.docker.com/_/postgres/)
