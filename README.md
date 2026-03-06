<p align="center">
  <img src="public/icons/icon-192x192.png" alt="MarifetBul Logo" width="80" height="80" />
</p>

<h1 align="center">MarifetBul</h1>

<p align="center">
  <strong>Türkiye'nin Açık Kaynak Freelance Platformu</strong>
</p>

<p align="center">
  Freelancer'lar ve işverenler arasında güvenli, şeffaf ve düşük komisyonlu bir köprü kuran modern freelance pazaryeri.
</p>

<p align="center">
  <a href="#kurulum">Kurulum</a> •
  <a href="#özellikler">Özellikler</a> •
  <a href="#mimari">Mimari</a> •
  <a href="#api-entegrasyonu">API</a> •
  <a href="#katkıda-bulunma">Katkıda Bulunma</a>
</p>

---

## Genel Bakış

MarifetBul, Türkiye pazarına yönelik uçtan uca bir freelance platformudur. Proje iki ana bileşenden oluşur:

| Bileşen      | Teknoloji                            | Dizin                                        |
| ------------ | ------------------------------------ | -------------------------------------------- |
| **Frontend** | Next.js 16, React 19, TypeScript     | `/` (kök dizin)                              |
| **Backend**  | Spring Boot 3.4, Java 17, PostgreSQL | [`/marifetbul-backend`](marifetbul-backend/) |

## Teknoloji Yığını

### Frontend

- **Framework:** Next.js 16 (App Router) + React 19
- **Dil:** TypeScript 5.7 (strict mode)
- **Stil:** Tailwind CSS 4.1 + Framer Motion
- **State Yönetimi:** Zustand 5 + SWR + React Query
- **Form:** React Hook Form + Zod 4
- **Gerçek Zamanlı:** STOMP WebSocket (@stomp/stompjs)
- **Bildirim:** Firebase Cloud Messaging
- **Görsel CDN:** Cloudinary
- **Monitoring:** Sentry, Google Analytics
- **Test:** Jest + Playwright

### Backend

- **Framework:** Spring Boot 3.4.1 + Java 17
- **Veritabanı:** PostgreSQL 16 + Flyway migrasyonları
- **Cache:** Redis 7
- **Arama:** Elasticsearch 8.16
- **Güvenlik:** Spring Security 6 + JWT (HS512)
- **Ödeme:** Iyzico
- **E-posta:** SendGrid + Thymeleaf şablonları
- **Push:** Firebase Admin SDK
- **SMS:** Netgsm
- **Depolama:** Cloudinary + AWS S3
- **Dayanıklılık:** Resilience4j (circuit breaker, retry, bulkhead)
- **Monitoring:** Sentry, Prometheus, OpenTelemetry

---

## Özellikler

### Pazaryeri

- İş ilanı oluşturma ve paket hizmet sunma
- Gelişmiş arama ve filtreleme (Elasticsearch destekli)
- Kategori bazlı keşif
- Favori listeleri ve klasörleme

### Sipariş Yönetimi

- Milestone bazlı sipariş akışı
- Escrow (güvenli ödeme) ve Manuel IBAN ödeme desteği
- Teslimat, revizyon ve onay süreçleri
- Otomatik sipariş tamamlama

### Ödeme Sistemi

- Iyzico ile güvenli kredi kartı ödemesi
- Cüzdan sistemi (bakiye, escrow, çekim)
- Komisyon hesaplama ve iade yönetimi

### İletişim

- Gerçek zamanlı WebSocket mesajlaşma
- Yazıyor göstergesi ve okundu bilgisi
- Mesaj tepkileri ve dosya paylaşımı
- Push bildirimler (web + mobil)

### Kullanıcı Sistemi

- Rol bazlı erişim: Alıcı, Satıcı, Moderatör, Admin
- İki faktörlü kimlik doğrulama (2FA)
- Profil ve portföy yönetimi
- Takip sistemi

### Yönetim Paneli

- Admin kontrol paneli (analitik, moderasyon, kullanıcı yönetimi)
- Moderasyon araçları (içerik, yorum, inceleme)
- Blog yönetimi (yazı, kategori, etiket)
- Destek bilet sistemi
- Raporlama ve PDF/CSV dışa aktarma

### Güvenlik

- JWT tabanlı kimlik doğrulama (httpOnly cookie)
- CSRF koruması
- XSS sanitizasyonu (DOMPurify)
- Rate limiting
- CSP, HSTS, X-Frame-Options güvenlik başlıkları
- Hassas veri maskeleme

---

## Kurulum

### Önkoşullar

- **Node.js** 20+
- **Java** 17+
- **Docker** ve Docker Compose
- **Maven** 3.8+

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/your-username/marifetbul.git
cd marifetbul
```

### 2. Backend'i Başlatın

```bash
cd marifetbul-backend

# Altyapı servislerini başlatın (PostgreSQL, Redis, Elasticsearch)
docker compose up -d

# Yapılandırma
cp .env.example .env
# .env dosyasını kendi değerlerinizle düzenleyin

# Uygulamayı çalıştırın
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend `http://localhost:8080` adresinde başlar.

### 3. Frontend'i Başlatın

```bash
# Kök dizine dönün
cd ..

# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini yapılandırın
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_SENTRY=false
```

```bash
# Geliştirme sunucusunu başlatın
npm run dev
```

Frontend `http://localhost:3000` adresinde açılır.

### 4. Doğrulama

| Servis        | URL                                   | Beklenen           |
| ------------- | ------------------------------------- | ------------------ |
| Frontend      | http://localhost:3000                 | Ana sayfa          |
| Backend API   | http://localhost:8080/actuator/health | `{"status":"UP"}`  |
| Swagger UI    | http://localhost:8080/swagger-ui.html | API dokümantasyonu |
| PostgreSQL    | localhost:5432                        |                    |
| Redis         | localhost:6379                        |                    |
| Elasticsearch | http://localhost:9200                 |                    |

---

## Mimari

### Frontend Dizin Yapısı

```
├── app/                        # Next.js App Router sayfaları
│   ├── (auth)/                 # Kimlik doğrulama (giriş, kayıt)
│   ├── admin/                  # Admin paneli
│   ├── api/                    # API proxy route'ları
│   ├── dashboard/              # Kullanıcı paneli
│   ├── marketplace/            # Pazaryeri sayfaları
│   ├── messages/               # Mesajlaşma
│   └── ...
├── components/
│   ├── domains/                # Alan bazlı bileşenler
│   ├── shared/                 # Paylaşılan bileşenler
│   ├── ui/                     # UI temel bileşenleri (button, card, ...)
│   └── providers/              # Context sağlayıcıları
├── hooks/                      # Özel React hook'ları
├── lib/
│   ├── api/                    # 50+ API istemci modülü
│   ├── core/store/             # 40+ Zustand mağazası
│   ├── infrastructure/         # Altyapı servisleri
│   │   ├── security/           # Auth, guard'lar, izinler
│   │   ├── websocket/          # WebSocket istemcisi
│   │   └── monitoring/         # Yapılandırılmış logger
│   ├── domains/                # İş mantığı katmanı
│   └── validation/             # Zod doğrulama şemaları
├── types/                      # TypeScript tip tanımları
└── middleware.ts                # Route koruması + güvenlik başlıkları
```

### Backend Dizin Yapısı

```
marifetbul-backend/src/main/java/com/marifetbul/api/
├── config/                     # Spring yapılandırma sınıfları
├── security/                   # JWT, UserPrincipal, filtreler
├── domain/                     # Domain-Driven Design katmanları
│   ├── auth/                   # Kimlik doğrulama servisleri
│   ├── job/                    # İş ilanları
│   ├── packages/               # Hizmet paketleri
│   ├── proposal/               # Teklifler
│   ├── order/                  # Sipariş yönetimi
│   ├── payment/                # Ödeme, cüzdan, iade, komisyon
│   ├── message/                # Mesajlaşma
│   ├── notification/           # Bildirim sistemi (multi-channel)
│   ├── review/                 # Değerlendirmeler
│   ├── dispute/                # Anlaşmazlık çözümü
│   ├── blog/                   # Blog sistemi
│   ├── moderation/             # İçerik moderasyonu
│   ├── analytics/              # Analitik
│   └── ...
├── infrastructure/             # Altyapı entegrasyonları
│   ├── payment/iyzico/         # Iyzico ödeme
│   ├── email/                  # SendGrid e-posta
│   ├── push/                   # Firebase push bildirimleri
│   ├── search/                 # Elasticsearch
│   ├── websocket/              # STOMP WebSocket sunucusu
│   ├── storage/                # Dosya depolama (Cloudinary, S3)
│   └── security/               # Rate limiting, XSS koruması
└── presentation/rest/v1/       # REST API controller'ları
```

---

## API Entegrasyonu

Tüm API endpoint'leri `/api/v1` prefix'i altında sunulur.

### Kimlik Doğrulama

```
POST   /api/v1/auth/register          # Kayıt
POST   /api/v1/auth/login             # Giriş (JWT cookie döner)
POST   /api/v1/auth/refresh           # Token yenileme
POST   /api/v1/auth/logout            # Çıkış
```

### Temel Endpoint'ler

```
# İş İlanları
GET    /api/v1/jobs                    # Listele
POST   /api/v1/jobs                    # Oluştur

# Paketler
GET    /api/v1/packages                # Listele
POST   /api/v1/packages                # Oluştur

# Teklifler
POST   /api/v1/proposals               # Teklif ver
PUT    /api/v1/proposals/:id/accept    # Kabul et

# Siparişler
POST   /api/v1/orders/package          # Paket siparişi
POST   /api/v1/orders/job              # İş siparişi
PUT    /api/v1/orders/:id/deliver      # Teslimat

# Ödeme & Cüzdan
POST   /api/v1/payments                # Ödeme başlat
GET    /api/v1/wallet                  # Cüzdan bilgisi

# Mesajlar
GET    /api/v1/conversations           # Konuşmalar
POST   /api/v1/messages                # Mesaj gönder

# WebSocket
WS     /ws                             # STOMP bağlantısı
```

Backend çalışırken detaylı API dokümantasyonu Swagger UI üzerinden erişilebilir: `http://localhost:8080/swagger-ui.html`

---

## Ortam Değişkenleri

### Frontend

Tüm ortam değişkenleri [`.env.example`](.env.example) dosyasında tanımlıdır.

| Değişken                            | Açıklama                | Zorunlu            |
| ----------------------------------- | ----------------------- | ------------------ |
| `NEXT_PUBLIC_API_URL`               | Backend API URL'i       | Evet               |
| `NEXT_PUBLIC_APP_URL`               | Frontend URL'i          | Evet               |
| `NEXT_PUBLIC_IYZICO_API_KEY`        | Iyzico API anahtarı     | Evet               |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary bulut adı    | Evet               |
| `NEXT_PUBLIC_FIREBASE_*`            | Firebase yapılandırması | Push bildirim için |
| `NEXT_PUBLIC_SENTRY_DSN`            | Sentry DSN              | Hata izleme için   |
| `NEXT_PUBLIC_GA_TRACKING_ID`        | Google Analytics ID     | Analitik için      |

### Backend

Backend ortam değişkenleri için [`marifetbul-backend/README.md`](marifetbul-backend/README.md) dosyasına bakın.

---

## Scriptler

### Frontend

| Komut                | Açıklama                 |
| -------------------- | ------------------------ |
| `npm run dev`        | Geliştirme sunucusu      |
| `npm run build`      | Üretim derlemesi         |
| `npm run start`      | Üretim sunucusu          |
| `npm run lint`       | ESLint kontrolü          |
| `npm run lint:fix`   | ESLint otomatik düzeltme |
| `npm run type-check` | TypeScript tip kontrolü  |
| `npm run test`       | Jest birim testleri      |
| `npm run test:e2e`   | Playwright E2E testleri  |
| `npm run format`     | Prettier kod formatlama  |

### Backend

| Komut                                                   | Açıklama           |
| ------------------------------------------------------- | ------------------ |
| `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` | Geliştirme         |
| `./mvnw test`                                           | Testler            |
| `./mvnw package -DskipTests`                            | Derleme            |
| `docker compose up -d`                                  | Altyapı servisleri |

---

## Dağıtım

### Frontend — Vercel

```bash
vercel --prod
```

`vercel.json` dosyası yapılandırılmıştır. Vercel dashboard'dan ortam değişkenlerini tanımlayın.

### Backend — Docker

```bash
cd marifetbul-backend
docker build -f Dockerfile.prod -t marifetbul-api:latest .
docker compose -f docker-compose.prod.yml up -d
```

### Kubernetes

Manifest dosyaları `marifetbul-backend/k8s/` dizinindedir. HPA, Ingress ve PersistentVolume yapılandırmaları hazırdır.

---

## Test

```bash
# Frontend birim testleri
npm run test

# Frontend E2E testleri
npm run test:e2e

# Backend testleri
cd marifetbul-backend && ./mvnw test
```

---

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Projeyi fork'layın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik ekle'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

### Geliştirme Kuralları

- TypeScript strict mode kullanın
- `console.log` yerine yapılandırılmış `logger` kullanın
- API yanıtlarını Zod ile doğrulayın
- Yeni bileşenler için testler yazın
- [Conventional Commits](https://www.conventionalcommits.org/) formatını kullanın

---

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

<p align="center">
  Türkiye'de ❤️ ile geliştirildi
</p>
