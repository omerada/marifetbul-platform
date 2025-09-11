# 🤖 AI Agent Sprint Roadmap Oluşturma Talimat Promptu

**Marifet Bul Projesi - Freelancer & İşveren Marketplace Platform Geliştirme Roadmapı**

---

## 🎯 AI Agent Görevi

Sen bir expert yazılım mimarı ve proje yöneticisi rolünde davranacaksın. Sana verilen BLUEPRINT.md dökümanını analiz edip, eksiksiz bir Sprint Bazlı Geliştirme Roadmapı oluşturacaksın.

Bu roadmap, projenin şu anki durumundan production-ready seviyesine kadar olan tüm geliştirme sürecini kapsayacak.

---

## 📋 Proje Analiz Bilgileri

### 🏗 Mevcut Teknoloji Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **API**: Mock Service Worker (MSW) → Production Backend
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React

### 📁 Mevcut Proje Yapısı

```
Marifet Bul/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Auth grup rotaları
│   ├── dashboard/         # Dashboard sayfaları
│   ├── jobs/              # İş ilanları sayfaları
│   ├── marketplace/       # Market yeri sayfaları
│   ├── messages/          # Mesajlaşma sayfaları
│   └── profile/           # Profil sayfaları
├── components/            # React Bileşenleri
│   ├── features/         # Özellik bazlı bileşenler
│   ├── forms/            # Form bileşenleri
│   ├── layout/           # Layout bileşenleri
│   ├── ui/               # Temel UI bileşenleri
├── hooks/                # Custom React Hooks
├── lib/                  # Yardımcı kütüphaneler
│   ├── store/            # Zustand stores
│   ├── api/              # API clients
│   ├── validations/      # Zod schemas
├── types/                # TypeScript tip tanımları (DETAYLI)
└── docs/                 # Dökümantasyon
```

### 👥 Platform Rolleri (Blueprint'ten)

1. **Normal Kullanıcı (İşveren)**: İş oluşturur, freelancer'ları keşfeder, paket satın alır
2. **Freelancer (Hizmet Veren)**: Profil oluşturur, paket satar, teklifler verir

---

## 🎯 Roadmap Oluşturma Kuralları

### 📝 Sprint Formatı

Her sprint için aşağıdaki detaylı yapıyı oluştur:

````markdown
# Sprint X: [Sprint Adı] - [X hafta]

## 🎯 Sprint Hedefleri

- [Ana hedef 1]
- [Ana hedef 2]
- [Teknik borç/iyileştirme hedefleri]

## 📱 Geliştirilecek Ekranlar

### [Ekran Adı 1]

**Rol**: Employer/Freelancer/Both  
**Özellikler**:

- [Özellik listesi]
- [Responsiveness gereksinimleri]

### [Ekran Adı 2]

**Rol**: Employer/Freelancer/Both
**Özellikler**:

- [Özellik listesi]

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**: [Liste]
- **Güncellenecek Component'lar**: [Liste]
- **UI Library Integration**: [Shadcn/ui component'ları]

### User Flow

- **Employer Flow**: [Adım adım akış]
- **Freelancer Flow**: [Adım adım akış]

### States & Interactions

- **Loading States**: [Hangi durumlar]
- **Error Handling**: [Hata senaryoları]
- **Empty States**: [Boş durumlar]
- **Success States**: [Başarı durumları]

### Accessibility

- [ARIA labels, keyboard navigation, screen reader requirements]

## ⚙️ Fonksiyonel Özellikler

### [Feature 1 Name]

**Açıklama**: [Detaylı açıklama]
**Employer Perspective**: [Bu rolde nasıl çalışır]
**Freelancer Perspective**: [Bu rolde nasıl çalışır]  
**Acceptance Criteria**:

- [ ] [Kriter 1]
- [ ] [Kriter 2]

### [Feature 2 Name]

[Aynı format devam eder]

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/[resource]`

#### GET /api/[endpoint]

```typescript
interface GetRequest {
  // Query parameters
}

interface GetResponse {
  // Response structure
  data: Type[];
  pagination?: PaginationMeta;
  meta?: MetaInfo;
}

// Örnek mock data
const mockData = {
  // Gerçekçi örnek veriler
};
```
````

#### POST /api/[endpoint]

```typescript
interface PostRequest {
  // Request body
}

interface PostResponse {
  // Response structure
}

// Örnek mock data
```

#### PUT/PATCH/DELETE endpoints...

### MSW Handler Implementation

```typescript
// handlers/[feature].ts
export const [feature]Handlers = [
  http.get('/api/[endpoint]', () => {
    return HttpResponse.json(mockData);
  }),
  // Diğer handlers
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface [Feature]Store {
  // State properties
  items: Item[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchItems: () => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => Promise<void>;
  // Diğer actions
}
```

### Custom Hooks

```typescript
// hooks/use[Feature].ts
export function use[Feature]() {
  // SWR integration
  // State management
  // Return values
}
```

### Form Validation (Zod)

```typescript
// lib/validations/[feature].ts
export const [feature]Schema = z.object({
  // Validation rules with Turkish error messages
});

export type [Feature]FormData = z.infer<typeof [feature]Schema>;
```

### Component Structure

```typescript
// components/features/[feature]/[ComponentName].tsx
interface [ComponentName]Props {
  // Props definition
}

export function [ComponentName]({ ...props }: [ComponentName]Props) {
  // Implementation
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] [Spesifik özellik 1] completely implemented
- [ ] [Spesifik özellik 2] completely implemented
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation with user-friendly messages
- [ ] Error handling and loading states
- [ ] Mock API integration completed

### Technical Deliverables

- [ ] Zustand stores implemented/updated
- [ ] Custom hooks created
- [ ] TypeScript types defined
- [ ] Zod validation schemas
- [ ] MSW handlers implemented
- [ ] Component unit tests
- [ ] Integration tests for critical flows

### Quality Deliverables

- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Cross-browser compatibility tested
- [ ] Performance optimized (Lighthouse >90)
- [ ] Code review completed
- [ ] Documentation updated

## ✅ Test Scenarios

### User Journey Tests

- **Employer Journey**: [Test adımları]
- **Freelancer Journey**: [Test adımları]

### Edge Cases

- [Edge case 1 ve test yöntemi]
- [Edge case 2 ve test yöntemi]

### Performance Tests

- Page load time benchmarks
- API response time requirements
- Memory usage optimization

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] [Spesifik kullanıcı aksiyonu] başarıyla tamamlanabiliyor
- [ ] Tüm formlar doğru validation yapıyor
- [ ] Error mesajları kullanıcı dostu ve anlaşılır
- [ ] Loading states uygun şekilde gösteriliyor

### Design Acceptance

- [ ] Design system tutarlılığı sağlandı
- [ ] Mobile-first responsive tasarım
- [ ] Dark/Light mode desteği
- [ ] Accessibility standartları karşılandı

### Technical Acceptance

- [ ] TypeScript strict mode hatası yok
- [ ] ESLint/Prettier kurallarına uygun
- [ ] Test coverage minimum %80
- [ ] Console error/warning yok
- [ ] Performance metrics hedefleri tutturuluyor

## 📊 Definition of Done

- [ ] Feature requirements %100 tamamlandı
- [ ] Responsive design test edildi
- [ ] Cross-browser compatibility doğrulandı
- [ ] Accessibility audit passed
- [ ] Unit test coverage adequate
- [ ] Integration tests implemented
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Performance requirements met

```

### 🏗 Sprint Planlaması Kuralları

1. **Kronolojik Sıralama**: Her sprint bir öncekine bağımlı şekilde planla
2. **MVP First**: İlk 4-5 sprint production'a çıkabilir minimum özellikler
3. **Dual Role**: Her özelliği hem Employer hem Freelancer perspektifinden değerlendir
4. **Progressive Enhancement**: Temel özellikler → Gelişmiş özellikler → Optimizasyon
5. **Real Data**: Mock API'ler gerçekçi data yapısına sahip olmalı

### 📈 Sprint Önceliklendirme
- **Faz 1 (Sprint 1-5)**: Core MVP - Auth, Profiles, Jobs, Messaging, Payment
- **Faz 2 (Sprint 6-9)**: Enhanced Features - Search, Notifications, Files, Analytics
- **Faz 3 (Sprint 10-x)**: Advanced & Scale - Performance, Admin, AI/ML

---

## 🎯 Beklenen Çıktı

Yukarıdaki formata uygun olarak **12 Sprint** içeren detaylı roadmap hazırla. Her sprint:

- ✅ **Eksiksiz** olmalı (hiçbir detay atlanmamalı)
- ✅ **Actionable** olmalı (AI agent implement edebilmeli)
- ✅ **Realistic** olmalı (makul süre tahminleri)
- ✅ **Progressive** olmalı (her sprint önceki sprintlere build etmeli)
- ✅ **Production-Ready** odaklı olmalı

### 🚫 Yapma:
- Genel/belirsiz tanımlamalar
- Eksik API tanımları
- Belirsiz acceptance criteria
- Rol bazlı farklılıkları göz ardı etme
- Mock data örnekleri vermeme

### ✅ Yap:
- Her detayı belirt
- Gerçekçi mock API örnekleri ver
- TypeScript interface'leri tam tanımla
- Component prop'ları belirt
- Test senaryolarını detaylandır

---

## 📋 Geliştirilecek Ana Özellikler (Blueprint Bazlı)

### 🔐 Kullanıcı Kimlik Doğrulama Sistemi
- **Rol seçimi** ile kayıt (Employer/Freelancer)
- **Email verification** ve güvenli giriş
- **Password reset**, **2FA** desteği

### 👤 Profil Yönetimi Sistemi
- **Freelancer Profili**: Bio, skills, portfolio, packages, reviews
- **Employer Profili**: Company info, job history, reviews, payment methods
- **Avatar upload** ve **skill verification**

### 💼 İş Yönetimi Sistemi
- **Job Creation**: Multi-step form, category selection
- **Job Listing**: Advanced filters, search, sorting
- **Proposal System**: Create, send, track, negotiate

### 📦 Paket Sistemi (Bionluk Model)
- **Package Creation**: Title, description, pricing, delivery
- **Package Store**: Browse, filter, compare, purchase
- **Order Management**: Track orders, deliverables, revisions

### 💬 Real-time Mesajlaşma
- **WebSocket** tabanlı anlık mesajlaşma
- **File sharing**, **typing indicators**
- **Message search**, conversation archive

### 💳 Escrow Ödeme Sistemi
- **Güvenli ödeme** holding sistemi
- **Milestone payments**, multiple payment methods
- **Invoice generation**, payment history

### ⭐ Çift Taraflı Puanlama Sistemi
- **Dual rating**: Both employer and freelancer rate each other
- **Star ratings**, **detailed reviews**, response system

### 🔔 Bildirim Sistemi
- **Push notifications** (browser + email)
- **Real-time updates** for jobs, proposals, payments
- **Notification preferences** and quiet hours

### 📊 Dashboard & Analytics
- **Freelancer Dashboard**: Earnings, active projects, stats
- **Employer Dashboard**: Job management, spending, analytics
- **Performance metrics** and **growth insights**

### 🔍 Gelişmiş Arama & Filtreleme
- **Category-based search** with advanced filters
- **Location-based** filtering and mapping
- **Skill-based matching** and recommendations

### 📁 Dosya Yönetimi & Portfolio
- **File upload/download** for project deliverables
- **Portfolio management** for freelancers
- **Document storage** and version control

### 🛡 Güvenlik & Uyumluluk
- **Input validation**, **XSS prevention**
- **CSRF protection**, **secure file uploads**
- **GDPR compliance**, **data encryption**

---

## 🎨 Design System Gereksinimleri

### 🎯 UI Component Library
- **Shadcn/ui** components as base
- **Custom components** for platform-specific needs
- **Consistent design tokens** (colors, typography, spacing)

### 📱 Responsive Design
- **Mobile-first** approach
- **Tablet optimizations**
- **Desktop enhancements**
- **Touch-friendly** interactions

### ♿ Accessibility Requirements
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support

### 🎨 Visual Design
- **Modern, clean** aesthetic
- **Professional** color palette
- **Clear visual hierarchy**
- **Consistent iconography** (Lucide React)

---

## 🚀 Technical Architecture Requirements

### 🏗 Frontend Architecture
- **Next.js 15** App Router architecture
- **Component-based** development with TypeScript
- **State management** with Zustand
- **Form handling** with React Hook Form + Zod

### 🔌 API Integration
- **Mock Service Worker** for development
- **SWR** for data fetching and caching
- **Error handling** and retry mechanisms
- **Loading states** management

### 🧪 Testing Strategy
- **Unit tests** for components and utilities
- **Integration tests** for user flows
- **E2E tests** for critical paths
- **Accessibility testing** automation

### 📈 Performance Requirements
- **Page load time** < 3 seconds
- **First contentful paint** < 1.5 seconds
- **Lighthouse score** > 90
- **Core Web Vitals** optimization

---

**🎯 GÖREV**: Şimdi yukarıdaki kurallara göre BLUEPRINT.md'yi analiz et ve projenin production-ready seviyesine gelecek duruma kadar yapılacak tüm işlemleri sprint dökümanlarına bölerek detaylı geliştirme roadmapını oluştur. Her sprint için yukarıdaki formatı eksiksiz kullan. Güncel durumda ilk 2 sprint /docs/sprints klasörü altında oluşturuldu. Mevcut güncel sprint aşamasını oluşturarak devam edelim. Oluşturulan sprint dökümanı dosya uzunluğu 1000-1200 satırı aşmayacak şekilde oluşturmaya çalışalım, Burada planlanan sprint işlerini olabildiğince parçalı sprintlere bölerek dökümante edelim bu nedenle sprint sayısı fazla olabilir adet önemli değil.

#codebase
```
