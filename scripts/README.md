# 🚀 Production-Ready Geliştirme Scriptleri

Bu klasördeki scriptler, projeyi production'a hazır hale getirmek için geliştirilmiştir.

## 📁 Script Listesi

### 1. `cleanup-mocks.ps1` - Mock Data ve Test Utilities Temizliği

**Amaç:** Production kodundan mock data, test utilities ve gereksiz kodları temizler.

**Yapılanlar:**

- Mock data içeren dosyaları tespit eder ve raporlar
- Legacy API routes'ları tespit eder ve (istenirse) siler
- Test utilities'i test klasörüne taşır
- Mock packages API route'unu kontrol eder
- Auth utilities'deki mock implementation'ı tespit eder
- Component'lerdeki mock data'yı tespit eder

**Kullanım:**

```powershell
# PowerShell'de çalıştırın (Admin yetkisi gerekmez)
cd c:\Projects\marifeto
.\scripts\cleanup-mocks.ps1
```

**Çıktı:**

- `mock-files-report.txt` - Mock data içeren tüm dosyaların listesi
- Console'da detaylı rapor

**Önemli Notlar:**

- ⚠️ Değişiklikleri commit etmeden önce test edin!
- 🔍 `mock-files-report.txt` dosyasını manuel olarak inceleyin
- ✅ Script çalıştırıldıktan sonra `npm test` ve `npm run build` yapın

---

### 2. `setup-env.ps1` - Environment Variables Kurulumu

**Amaç:** Development ve production environment variables'larını kurar.

**Yapılanlar:**

- Frontend `.env.local` dosyasını oluşturur (`.env.example`'dan)
- Backend `.env` dosyasını oluşturur (JWT secret otomatik generate eder)
- `.gitignore` kontrol eder ve eksik kuralları ekler
- Production template'lerini kontrol eder
- Gerekli environment değişkenlerini doğrular

**Kullanım:**

```powershell
# PowerShell'de çalıştırın (Admin yetkisi gerekmez)
cd c:\Projects\marifeto
.\scripts\setup-env.ps1
```

**Çıktı:**

- `.env.local` (Frontend environment variables)
- `marifetbul-backend\.env` (Backend environment variables)
- Güncellenmiş `.gitignore` (eğer gerekirse)

**Önemli Notlar:**

- 🔑 JWT Secret otomatik oluşturulur (güvenli)
- ⚠️ API keys'leri manuel olarak güncellemeniz gerekir
- 🚫 `.env` dosyalarını ASLA commit etmeyin!

---

## 🎯 Hızlı Başlangıç

### İlk Kurulum (Yeni Developer Onboarding)

```powershell
# 1. Repository'yi clone edin
git clone https://github.com/omerada/marifet.git
cd marifet

# 2. Dependencies'leri yükleyin
npm install
cd marifetbul-backend
mvn clean install
cd ..

# 3. Environment variables'ları kurun
.\scripts\setup-env.ps1

# 4. .env dosyalarını güncelleyin
# - .env.local (Frontend)
# - marifetbul-backend\.env (Backend)

# 5. Database'i başlatın (Docker)
cd marifetbul-backend
docker-compose up -d postgres redis
cd ..

# 6. Database migration'ları çalıştırın
cd marifetbul-backend
mvn flyway:migrate
cd ..

# 7. Projeyi çalıştırın
# Terminal 1: Backend
cd marifetbul-backend
mvn spring-boot:run

# Terminal 2: Frontend
npm run dev
```

### Production'a Hazırlık

```powershell
# 1. Mock data'yı temizleyin
.\scripts\cleanup-mocks.ps1

# 2. Manuel cleanup yapın
# - mock-files-report.txt dosyasını inceleyin
# - PRODUCTION_READINESS_ANALYSIS.md'deki önerileri uygulayın

# 3. Build test edin
npm run build
npm test

# 4. Backend test edin
cd marifetbul-backend
mvn clean verify
cd ..

# 5. Production environment'ı hazırlayın
# - Vercel'de environment variables'ları set edin
# - Backend production config'i güncelleyin
```

---

## 📊 Script Çıktıları

### `cleanup-mocks.ps1` Örnek Çıktı

```
🧹 Mock Data ve Test Utilities Temizliği Başlatılıyor...

📋 Step 1: Mock data içeren dosyaları tespit ediliyor...
✅ 15 dosyada mock data bulundu
   Rapor kaydedildi: mock-files-report.txt

📋 Step 2: Legacy API routes kontrol ediliyor...
⚠️  Legacy routes bulundu: app\api\legacy
Bu legacy routes'ları silmek ister misiniz? (y/n): y
✅ Legacy routes silindi

📋 Step 3: Test utilities'i organize ediliyor...
✅ Test utilities taşındı
   Yeni konum: __tests__\utilities

...

📊 ÖZET
✅ Temizlik işlemi tamamlandı!
```

### `setup-env.ps1` Örnek Çıktı

```
🔧 Environment Variables Setup Başlatılıyor...

📋 Step 1: Frontend .env.local kontrol ediliyor...
✅ .env.local oluşturuldu (.env.example'dan)
   ⚠️  Lütfen .env.local'i kendi değerlerinizle güncelleyin

📋 Step 2: Backend .env kontrol ediliyor...
✅ Backend .env oluşturuldu
   📍 Konum: marifetbul-backend\.env
   🔑 JWT Secret otomatik oluşturuldu

...

📊 ÖZET
✅ Environment setup tamamlandı!
```

---

## 🔧 Troubleshooting

### Script Çalışmıyor

**Sorun:** PowerShell execution policy hatası

```
.\scripts\cleanup-mocks.ps1 : File cannot be loaded because running scripts is disabled
```

**Çözüm:**

```powershell
# Execution policy'yi değiştirin (sadece current user için)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Veya script'i bypass ile çalıştırın
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-mocks.ps1
```

### Environment Değişkenleri Yüklenmiyor

**Sorun:** `.env.local` dosyası var ama değişkenler yüklenmiyor

**Çözüm:**

```powershell
# 1. Next.js'i yeniden başlatın
npm run dev

# 2. .env.local formatını kontrol edin
# Doğru format:
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Yanlış format (tırnak işareti kullanmayın):
NEXT_PUBLIC_API_URL="http://localhost:8080/api/v1"
```

### Mock Files Report Boş

**Sorun:** `mock-files-report.txt` boş veya hiç dosya bulunmuyor

**Çözüm:**

- Bu iyi bir şey! Demek ki mock data zaten temizlenmiş
- Eğer mock data olduğundan eminseniz, manuel grep yapın:

```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String -Pattern "mock"
```

---

## 📚 İlgili Dökümanlar

- [PRODUCTION_READINESS_ANALYSIS.md](../PRODUCTION_READINESS_ANALYSIS.md) - Detaylı analiz raporu
- [BACKEND DEV TALIMAT PROMPT.md](../BACKEND%20DEV%20TALIMAT%20PROMPT.md) - Backend geliştirme talimatları
- [marifetbul-backend/DEPLOYMENT.md](../marifetbul-backend/DEPLOYMENT.md) - Deployment guide
- [marifetbul-backend/DEVOPS.md](../marifetbul-backend/DEVOPS.md) - DevOps guide

---

## 🤝 Katkıda Bulunma

Script'lere katkıda bulunmak isterseniz:

1. Script'i test edin
2. Dokümantasyonu güncelleyin
3. Pull request oluşturun

---

## 📞 Destek

Sorular için:

- Technical Lead ile iletişime geçin
- GitHub Issues kullanın
- Team chat'te `#devops` kanalını kullanın

---

**Son Güncelleme:** 13 Ekim 2025  
**Maintainer:** DevOps Team
