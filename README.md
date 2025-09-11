# Marifeto - AI Agent Geliştirme Projesi

## 🎯 Proje Özeti

"Marifeto" - Freelancer ve İşveren eşleştirme platformu (Bionluk + Armut hibrit model)

### 🚀 Temel Özellikler

- **Freelancer Modu**: Hizmet paketi oluşturma ve yönetimi
- **İşveren Modu**: İş ilanı açma ve teklif toplama
- **Hibrit Görüntüleme**: Tek platformda hem freelancer hem işveren content'i
- **Akıllı Sayfa Yönlendirme**: Kullanıcı tipine göre optimize edilmiş deneyim
- **Mobil-First Responsive Tasarım**
- **Mock API Tabanlı Geliştirme** (Backend sonradan entegre edilecek)

### 🔮 Gelecek Özellikler (Backend Gerekli)

- AI destekli eşleşme
- Rozet/Puan sistemi
- Escrow ödeme sistemi

---

## 🏃‍♂️ Hızlı Başlangıç

### � Gereksinimler

- Node.js 18+
- npm veya yarn

### 🚀 Kurulum

```bash
# Projeyi klonla
git clone <repo-url>
cd marifeto

# Bağımlılıkları yükle
npm install

# Environment değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle

# Development sunucusunu başlat
npm run dev
```

### 🔨 Build & Deploy

```bash
# Production build
npm run build

# Build'i test et
npm run start

# Vercel'e deploy (otomatik)
vercel --prod
```

### 🧪 Test & Lint

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Lint ve düzelt
npm run lint:fix
```

---

## �📚 AI Agent Geliştirme Dokümantasyonu

### 🏗️ Mimari ve Yapı

1. [Component Yapısı](docs/05-component-structure.md) - Tasarım sistemi ve UI kütüphanesi

### 🎨 Kullanıcı Deneyimi

2. [Kullanıcı Akışları & Ekranlar](docs/02-user-flows-screens.md) - Detaylı UX/UI spesifikasyonları
3. [Gelişmiş Sayfa Yapısı](docs/08-advanced-page-structure.md) - Hibrit görüntüleme sistemi

### 🔗 API ve Veri

4. [Mock API Servisleri](docs/03-mock-api-services.md) - Endpoint'ler ve veri yapıları

### 📅 Geliştirme Süreci

5. [Part-Part Geliştirme Planı](docs/04-development-plan.md) - Sprint planı ve görevler

---

## 🔧 Teknik Detaylar

### 🛠️ Teknoloji Stack'i

- **Framework**: Next.js 15 (App Router)
- **UI**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Form Management**: React Hook Form + Zod
- **Icons**: Lucide React
- **Mock API**: MSW (Mock Service Worker)
- **Build Tool**: Vercel
- **Type Safety**: TypeScript strict mode

### 📁 Proje Yapısı

```
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── features/       # Feature-specific components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── lib/                # Utilities, stores, API
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── public/             # Static assets
└── docs/               # Documentation
```

### 🎯 Production-Ready Özellikler

- ✅ SSR/SSG optimizasyonu
- ✅ Suspense boundary wrapping
- ✅ Type-safe environment variables
- ✅ Security headers
- ✅ Performance optimizations
- ✅ Bundle optimization
- ✅ Error boundaries
- ✅ Loading states
- ✅ Responsive design
- ✅ SEO optimizations

---

## 📝 Lisans

MIT License
