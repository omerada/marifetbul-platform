# 🤖 AI Agent Geliştirme Talimat Dökümanı

**Marifet - Freelancer & İşveren Marketplace Platformu**

---

## 📋 Genel Proje Bilgileri

### Proje Tanımı

- **Platform Tipi**: Armut + Bionluk karması hibrit marketplace
- **Teknoloji Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + Zustand
- **Roller**: Normal Kullanıcı (İşveren) & Freelancer (Hizmet Veren)
- **Mimari**: Frontend-first yaklaşım, Mock API → Production Backend geçişi

### Mevcut Proje Yapısı

```
marifet/
├── app/                    # Next.js 15 App Router
├── components/             # React Bileşenleri
│   ├── features/          # Özellik bazlı bileşenler
│   ├── forms/             # Form bileşenleri
│   ├── layout/            # Layout bileşenleri
│   ├── ui/                # Temel UI bileşenleri
├── hooks/                 # Custom React Hooks
├── lib/                   # Yardımcı kütüphaneler
│   ├── store/             # Zustand stores
│   ├── api/               # API clients
│   ├── utils/             # Utility functions
├── types/                 # TypeScript tip tanımları
├── public/                # Statik dosyalar
└── docs/                  # Dökümantasyon
```

---

## 🎯 Geliştirme Kuralları ve Prensipler

### 🔧 Teknik Kurallar

1. **Framework**: Next.js 15 App Router kullan (pages router DEĞİL)
2. **State Management**: Zustand ile global state yönetimi
3. **Styling**: Tailwind CSS + shadcn/ui pattern
4. **API**: Mock Service Worker (MSW) ile mock API entegrasyonu
5. **Validation**: Zod ile form ve data validation
6. **Components**: Atomic Design pattern (atoms, molecules, organisms)
7. **TypeScript**: Strict mode, tüm tipler `types/index.ts`'de tanımlı

### 🎨 UI/UX Kuralları

1. **Design System**: Modern, temiz, mobile-first yaklaşım
2. **Accessibility**: WCAG 2.1 AA uyumlu
3. **Responsive**: Mobile, tablet, desktop breakpoint'leri
4. **Theme**: Dark/Light mode desteği
5. **Performance**: Lazy loading, code splitting, optimizasyon

### 📱 Platform Kuralları

1. **Rol Bazlı**: Employer ve Freelancer için farklı UI/UX akışları
2. **Dual Flow**: Her özellik her iki rol için düşünülmeli
3. **Real-time**: Mesajlaşma, bildirimler, durum güncellemeleri
4. **Security**: Güvenli ödeme, veri şifreleme, input validation

---

## 👥 Kullanıcı Rolleri ve Yetkiler

### 🏢 Normal Kullanıcı (İşveren/Employer)

**Ana Yetenekler:**

- Freelancer profillerini keşfet ve incele
- Paket hizmetleri satın al
- İş ilanları oluştur ve yönet
- Gelen teklifleri değerlendir ve seç
- Freelancer'larla mesajlaş
- Güvenli ödeme yap (escrow sistemi)
- İş tamamlandıktan sonra onay ver
- Freelancer'ları puanla ve değerlendir

### 👨‍💻 Freelancer (Hizmet Veren)

**Ana Yetenekler:**

- Detaylı profil oluştur ve yönet
- Paket hizmetler tanımla ve sat
- İş ilanlarını keşfet ve teklif ver
- Siparişleri yönet ve teslim et
- İşverenlerle mesajlaş
- Ödeme al ve gelir takibi yap
- İşverenleri puanla ve değerlendir
- Diğer freelancer'ları inceleyebilir

---

## 🔄 Ana İş Akışları

### İşveren Akışı

1. **Onboarding**: Kayıt → Profil → Doğrulama → Dashboard
2. **Freelancer Keşfi**: Arama → Filtre → Profil İnceleme → İletişim
3. **Paket Satın Alma**: Seçim → Ödeme → İş Takibi → Teslim → Değerlendirme
4. **İş İlanı**: Oluştur → Teklif Al → Seç → Takip → Tamamla → Puanla

### Freelancer Akışı

1. **Onboarding**: Kayıt → Profil → Portfolio → Yetenek → Paket
2. **İş Arama**: İlanlar → Teklif Ver → Kabul → Çalışma → Teslim
3. **Paket Satış**: Oluştur → Sipariş → Üret → Teslim → Puan Al
4. **Gelir**: Takip → Para Çek → Vergi → Raporlama

---

## 📱 Ekran Haritası ve Özellikler

### 🔐 Kimlik Doğrulama

- **Auth Flow**: Login/Register → Rol Seçimi → Email Verification
- **Features**: Password reset, 2FA, Social login, Remember me

### 🏠 Ana Sayfa & Keşfet

- **Layout**: Hero section, kategoriler, öne çıkan freelancer/paketler
- **Features**: Arama, filtreler, trending, personalized recommendations

### 👤 Profil Yönetimi

- **Freelancer**: Bio, skills, portfolio, packages, reviews, stats
- **Employer**: Company info, job history, reviews, payment methods
- **Features**: Avatar upload, skill verification, portfolio management

### 💼 İş Yönetimi

- **Job Creation**: Multi-step form, category selection, budget/timeline
- **Job Listing**: Advanced filters, search, sorting, saved jobs
- **Proposal System**: Create, send, track, negotiate proposals

### 📦 Paket Sistemi

- **Package Creation**: Title, description, pricing, delivery, features
- **Package Store**: Browse, filter, compare, purchase packages
- **Order Management**: Track orders, deliverables, revisions

### 💬 Mesajlaşma Sistemi

- **Real-time Chat**: WebSocket, file sharing, typing indicators
- **Features**: Message search, conversation archive, notification

### 💳 Ödeme Sistemi

- **Escrow System**: Secure payment holding, milestone payments
- **Payment Methods**: Credit card, PayPal, wallet, bank transfer
- **Features**: Invoice generation, payment history, tax reporting

### ⭐ Değerlendirme Sistemi

- **Dual Rating**: Both employer and freelancer rate each other
- **Features**: Star ratings, detailed reviews, response system

---

## 🛠 Sprint Bazlı Geliştirme Formatı

Her sprint aşağıdaki yapıyı takip etmeli:

### Sprint Başlığı

**Sprint X: [Feature Set Name] - [Duration: X weeks]**

### 🎯 Hedefler

- Sprint sonunda elde edilecek ana çıktılar
- Kullanıcı değeri yaratacak özellikler
- Teknik borç ve iyileştirmeler

### 📱 Ekranlar

**Ekran Adı** - Hangi özellikleri kapsayacağı

- [Roller için farklı görünümler belirtilmeli]
- [Mobile, tablet, desktop responsive requirements]

### 🎨 Ekran Tasarım Detayları

- **UI Components**: Hangi component'lar kullanılacak/oluşturulacak
- **User Flow**: Kullanıcı akış diyagramı
- **Interactions**: Hover, click, scroll davranışları
- **States**: Loading, error, empty, success states
- **Accessibility**: ARIA labels, keyboard navigation, screen reader

### ⚙️ Fonksiyonel Özellikler

- **Feature 1**: Detaylı açıklama ve acceptance criteria
- **Feature 2**: Detaylı açıklama ve acceptance criteria
- [Her özellik için rol bazlı farklılıklar]

### 🔌 Mock API Servisleri

**Endpoint Pattern**: `/api/v1/[resource]`

```typescript
// GET /api/users
interface GetUsersResponse {
  users: User[];
  pagination: PaginationMeta;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}
```

### 💻 Teknik Notlar

- **State Management**: Hangi store'lar oluşturulacak/güncellenecek
- **API Integration**: MSW handlers, SWR hooks, caching strategy
- **Performance**: Lazy loading, code splitting, image optimization
- **Security**: Input validation, XSS prevention, CSRF protection
- **Testing**: Unit tests, integration tests, E2E test scenarios

### 🚀 Deliverables (Teslim Edilebilirler)

- [ ] Functional screens with responsive design
- [ ] Mock API integration completed
- [ ] State management implemented
- [ ] Form validation with Zod schemas
- [ ] Error handling and loading states
- [ ] Unit tests for critical components
- [ ] Accessibility compliance
- [ ] Performance optimizations applied
- [ ] Documentation updated

### ✅ Test Planı ve Kabul Kriterleri

**Functional Tests:**

- [ ] User can complete [specific workflow]
- [ ] All forms validate correctly
- [ ] Error messages are user-friendly
- [ ] Loading states work properly

**UI/UX Tests:**

- [ ] Responsive design on all breakpoints
- [ ] Accessibility standards met
- [ ] Design system consistency
- [ ] Cross-browser compatibility

**Performance Tests:**

- [ ] Page load time < 3 seconds
- [ ] First contentful paint < 1.5 seconds
- [ ] No console errors or warnings

---

## 🏗 Geliştirme Best Practices

### 📁 Dosya ve Klasör Organizasyonu

```
components/
├── ui/                 # Basic UI components (Button, Input, etc.)
├── forms/              # Form components with validation
├── features/           # Feature-specific components
│   ├── auth/          # Authentication components
│   ├── jobs/          # Job-related components
│   ├── freelancers/   # Freelancer-related components
├── layout/             # Layout components (Header, Footer, Sidebar)
└── providers/          # Context providers

hooks/
├── api/               # API-specific hooks
├── auth/              # Authentication hooks
├── forms/             # Form-specific hooks
└── utils/             # Utility hooks

lib/
├── store/             # Zustand stores
├── api/               # API clients and utilities
├── validations/       # Zod schemas
└── utils/             # General utilities
```

### 🎯 Component Geliştirme Kuralları

1. **Single Responsibility**: Her component tek bir sorumluluğa sahip olmalı
2. **Props Interface**: TypeScript interface'i ile prop tipleri tanımlanmalı
3. **Default Props**: Varsayılan değerler tanımlanmalı
4. **Error Boundaries**: Hata yönetimi implement edilmeli
5. **Memoization**: Performance için React.memo, useMemo, useCallback kullanılmalı

### 📊 State Management Pattern

```typescript
// Zustand store örneği
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}
```

### 🔌 API Integration Pattern

```typescript
// SWR hook örneği
export function useJobs(filters?: JobFilters) {
  const { data, error, mutate } = useSWR(
    ['/api/jobs', filters],
    ([url, filters]) => apiClient.get(url, { params: filters }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    jobs: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

### 📝 Form Validation Pattern

```typescript
// Zod schema örneği
const jobSchema = z.object({
  title: z.string().min(10, 'Başlık en az 10 karakter olmalı'),
  description: z.string().min(50, 'Açıklama en az 50 karakter olmalı'),
  budget: z.object({
    type: z.enum(['fixed', 'hourly']),
    amount: z.number().min(1, "Bütçe 0'dan büyük olmalı"),
  }),
  skills: z.array(z.string()).min(1, 'En az bir yetenek seçmelisiniz'),
});
```

---

## 🚀 Sprint Önceliklendirme Stratejisi

### 🥇 Faz 1: MVP Core (4-5 Sprint)

**Öncelik**: Production'a çıkabilir minimum özellikler

- Sprint 1: Authentication & Core Setup
- Sprint 2: User Profiles & Role Management
- Sprint 3: Job/Package Core Features
- Sprint 4: Messaging & Communication
- Sprint 5: Payment & Review System

### 🥈 Faz 2: Enhanced Features (3-4 Sprint)

**Öncelik**: Kullanıcı deneyimini artıran özellikler

- Sprint 6: Advanced Search & Filters
- Sprint 7: Notifications & Real-time Updates
- Sprint 8: File Management & Portfolio
- Sprint 9: Dashboard & Analytics

### 🥉 Faz 3: Advanced & Scale (2-3 Sprint)

**Öncelik**: Büyüme ve optimizasyon

- Sprint 10: Performance & SEO Optimization
- Sprint 11: Admin Panel & Management Tools
- Sprint 12: Advanced Features & AI Integration

---

## 🎨 Design System Guidelines

### 🎯 Color Palette

```css
/* Primary Colors */
--primary: 220 70% 50%; /* Blue */
--primary-foreground: 210 20% 98%;

/* Secondary Colors */
--secondary: 210 40% 96%;
--secondary-foreground: 222.2 84% 4.9%;

/* Accent Colors */
--accent: 210 40% 96%;
--accent-foreground: 222.2 84% 4.9%;

/* Status Colors */
--success: 142 76% 36%;
--warning: 38 92% 50%;
--error: 0 84% 60%;
--info: 217 91% 60%;
```

### 📝 Typography

```css
/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 📐 Spacing System

```css
--spacing-0: 0;
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem; /* 8px */
--spacing-3: 0.75rem; /* 12px */
--spacing-4: 1rem; /* 16px */
--spacing-5: 1.25rem; /* 20px */
--spacing-6: 1.5rem; /* 24px */
--spacing-8: 2rem; /* 32px */
--spacing-10: 2.5rem; /* 40px */
--spacing-12: 3rem; /* 48px */
--spacing-16: 4rem; /* 64px */
```

---

## 🔧 Geliştirme Süreç Kuralları

### 🏃‍♂️ Sprint Süreci

1. **Sprint Planning**: Detaylı task breakdown ve estimate
2. **Daily Development**: Progressive feature implementation
3. **Code Review**: Self-review before completion
4. **Testing**: Unit, integration ve E2E testler
5. **Documentation**: Kod ve kullanıcı dökümantasyonu
6. **Sprint Review**: Demo ve stakeholder feedback

### ✅ Definition of Done

Her task için aşağıdaki kriterler tamamlanmış olmalı:

- [ ] Functional requirement implemented
- [ ] Responsive design completed (mobile, tablet, desktop)
- [ ] TypeScript types defined and used
- [ ] Form validation implemented (where applicable)
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Accessibility requirements met
- [ ] Unit tests written (critical components)
- [ ] Code reviewed and optimized
- [ ] Documentation updated

### 📊 Kalite Kontrol

1. **Code Quality**: ESLint, Prettier, TypeScript strict mode
2. **Performance**: Lighthouse score >90, Core Web Vitals
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
5. **Mobile Support**: iOS Safari, Chrome Android

---

## 🎯 AI Agent İçin Özel Talimatlar

### 🤖 Geliştirme Yaklaşımı

1. **Incremental Development**: Her sprint küçük, test edilebilir parçalar halinde
2. **No Assumptions**: Belirsiz durumlar için açıklama talep et
3. **Best Practices**: Yukarıdaki kuralları sıkı bir şekilde takip et
4. **Quality First**: Hızdan çok kaliteyi öncelikle
5. **User-Centric**: Her özellik kullanıcı değeri yaratmalı

### 📋 Her Sprint İçin Yapılacaklar

1. **Analysis**: Sprint gereksinimlerini detaylı analiz et
2. **Planning**: Task'ları mantıklı sırayla organize et
3. **Implementation**: Kodu temiz ve okunabilir şekilde yaz
4. **Testing**: Her özelliği test et ve edge case'leri kontrol et
5. **Documentation**: Değişiklikleri dokümante et

### 🚫 Yapmamanız Gerekenler

- Sprint gereksinimlerini atlama veya kısmi uygulama
- Existing code'u bozmak veya regression yaratmak
- Best practice'leri ignore etmek
- Accessibility gereksinimlerini atlama
- Test coverage'ı düşürmek
- Documentation güncellememeyi atlamak

### ✨ Başarı Kriterleri

Bir sprint başarılı sayılır eğer:

- ✅ Tüm functional requirements tamamlandı
- ✅ UI/UX tasarımı design system'a uygun
- ✅ Performance metrikleri hedefe ulaştı
- ✅ Accessibility standartları karşılandı
- ✅ Test coverage yeterli seviyede
- ✅ Code quality metrics positive
- ✅ Documentation güncel ve eksiksiz

---

## 📚 Referans Kaynakları

### 📖 Teknik Dokümantasyon

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Zod Documentation](https://zod.dev)

### 🎨 Design Resources

- [Shadcn/ui Components](https://ui.shadcn.com)
- [Headless UI Components](https://headlessui.com)
- [Lucide Icons](https://lucide.dev)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref)

### 🧪 Testing Resources

- [MSW Documentation](https://mswjs.io/docs)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

---

**🎯 Bu dokümanda belirtilen kurallar ve standartlar sıkı bir şekilde takip edilmelidir. Her sprint development öncesi bu dokümana referans yapılmalıdır.**
