# Marifeto - Hızlı Başlangıç

## Proje Özeti

"Marifeto" - Freelancer ve İşveren eşleştirme platformu (Bionluk + Armut hibrit model)

**Teknoloji Stack:** Next.js 14, TypeScript, Tailwind CSS, Zustand, SWR, Mock API

---

## Hızlı Kurulum

```bash
# 1. Proje oluştur
npx create-next-app@latest marifeto --typescript --tailwind --eslint --app
cd marifeto

# 2. Bağımlılıkları yükle
npm install zustand swr react-hook-form zod @headlessui/react lucide-react date-fns clsx tailwind-merge
npm install -D msw @types/node prettier prettier-plugin-tailwindcss

# 3. MSW init
npx msw init public/ --save

# 4. Projeyi başlat
npm run dev
```

---

## MVP Özellikler Listesi

### ✅ Phase 1: Foundation (2 hafta)

- [x] Proje kurulumu
- [ ] Authentication (Login/Register)
- [ ] User profiles
- [ ] Basic layout components

### 🚧 Phase 2: Core Features (3 hafta)

- [ ] Job listings & detail pages
- [ ] Freelancer packages
- [ ] Proposal system
- [ ] Order management

### 📋 Phase 3: Polish (2 hafta)

- [ ] Dashboards
- [ ] Mobile optimization
- [ ] Testing & bug fixes

---

## Geliştirme Komutları

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run format       # Prettier format
```

---

## Klasör Yapısı

```
marifeto/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── jobs/              # Job pages
│   └── packages/          # Package pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature components
├── lib/                  # Utilities
│   ├── api/             # API functions
│   ├── store/           # Zustand stores
│   └── utils/           # Helper functions
├── types/               # TypeScript types
├── mocks/              # Mock API handlers
└── docs/               # Documentation
```

---

## Mock API Endpoints

### Authentication

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `GET /api/auth/me` - Mevcut kullanıcı

### Jobs

- `GET /api/jobs` - İş ilanları listesi
- `GET /api/jobs/{id}` - İş ilanı detayı
- `POST /api/jobs` - Yeni iş ilanı

### Packages

- `GET /api/packages` - Freelancer paketleri
- `GET /api/packages/{id}` - Paket detayı
- `POST /api/packages` - Yeni paket

### Proposals

- `GET /api/proposals` - Teklifler
- `POST /api/proposals` - Yeni teklif

---

## Kullanıcı Tipleri

### Freelancer Kullanıcısı

- Profil oluşturma
- Hizmet paketi yayınlama
- İş ilanlarına teklif verme
- Sipariş yönetimi

### İşveren Kullanıcısı

- Şirket profili oluşturma
- İş ilanı yayınlama
- Teklif değerlendirme
- Freelancer seçimi

---

## Component Library

### Base Components

- `Button` - Buton bileşeni
- `Input` - Form input
- `Card` - Kart container
- `Modal` - Modal dialog

### Layout Components

- `Header` - Site başlığı
- `Sidebar` - Yan navigasyon
- `Footer` - Site altlığı

### Feature Components

- `JobCard` - İş ilanı kartı
- `PackageCard` - Hizmet paketi kartı
- `UserProfile` - Kullanıcı profili
- `ProposalForm` - Teklif formu

---

## State Management

### Auth Store

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
}
```

### UI Store

```typescript
interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  showNotifications: () => void;
}
```

---

## API Integration

### SWR Hooks

```typescript
// Jobs data fetching
const { data: jobs, error } = useJobs();

// Packages data fetching
const { data: packages, error } = usePackages();

// User profile
const { data: user, mutate } = useUser();
```

---

## Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach

- Touch-friendly buttons
- Simplified navigation
- Optimized forms
- Swipe gestures

---

## Development Workflow

### Feature Development

1. Create feature branch
2. Implement components
3. Add mock API endpoints
4. Write tests
5. Create pull request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Component documentation
- Responsive design
- Accessibility (WCAG)

---

## Team Organization

### Frontend Developer Görevleri

- React component development
- TypeScript implementation
- Responsive design
- Mock API integration
- Testing

### Review Process

- Code review (PR)
- Design review
- Accessibility check
- Performance check
- Mobile testing

---

## Backend Integration Hazırlığı

### API Structure

- RESTful endpoints
- JWT authentication
- File upload support
- Real-time updates (Socket.io)

### Database Models

- Users (freelancer/employer)
- Jobs
- Packages
- Proposals
- Orders
- Reviews

---

## Deployment Strategy

### Development

- Vercel deployment
- Preview deployments
- Environment variables

### Production

- Custom domain
- Performance monitoring
- Error tracking
- Analytics

---

## Sonraki Adımlar

### Hafta 1-2: Foundation

1. Authentication sistemi
2. User profil sayfaları
3. Basic layout implementation

### Hafta 3-4: Core Features

1. Job listing & details
2. Package marketplace
3. Proposal system

### Hafta 5-6: Polish

1. Dashboard implementation
2. Mobile optimization
3. Testing & bug fixes

---

## Kaynaklar

- **Dokümantasyon**: `/docs` klasörü
- **Mock API**: `/mocks` klasörü
- **Components**: `/components` klasörü
- **Types**: `/types` klasörü

### Dış Kaynaklar

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [SWR](https://swr.vercel.app/)

---

Bu doküman ile frontend ekibi direkt olarak geliştirmeye başlayabilir. Tüm technical detaylar `docs/` klasöründe mevcuttur.
