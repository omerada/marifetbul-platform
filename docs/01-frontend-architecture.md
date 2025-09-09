# Frontend Mimari Planı

## Teknoloji Stack

### Temel Framework

**Next.js 14 (App Router)** - Önerilen seçim

- **Neden?**
  - SSR/SSG desteği (SEO optimizasyonu)
  - File-based routing (kolay yönetim)
  - Built-in API routes (mock API hosting)
  - Image optimization
  - Performance optimizasyonları

### State Management

**Zustand** - Önerilen seçim

- **Neden?**
  - Minimal boilerplate
  - TypeScript desteği
  - Redux'tan daha basit
  - Küçük bundle size

**Alternatif:** React Context + useReducer (daha basit projeler için)

### UI Framework & Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Accessible UI components
- **React Hook Form**: Form yönetimi
- **Zod**: Form validation

### Veri Yönetimi

- **SWR** veya **TanStack Query**: Cache ve API state management
- **Mock Service Worker (MSW)**: Development için mock API

### Diğer Önemli Kütüphaneler

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "zustand": "^4.4.0",
    "swr": "^2.2.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "@headlessui/react": "^1.7.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0",
    "msw": "^1.3.0"
  }
}
```

## Proje Yapısı

```
marifeto/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── freelancer/
│   │   └── employer/
│   ├── jobs/                     # İş ilanları
│   ├── packages/                 # Freelancer paketleri
│   ├── profile/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   └── features/                # Feature-specific components
├── lib/                         # Utilities
│   ├── api/                     # API functions
│   ├── store/                   # Zustand stores
│   ├── utils/                   # Helper functions
│   └── validations/             # Zod schemas
├── public/                      # Static assets
├── types/                       # TypeScript type definitions
└── mocks/                       # Mock API handlers
```

## Component Hierarchy

### Layout Components

```
AppLayout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Main
│   └── [Page Content]
└── Footer
```

### Page-Specific Components

```
Dashboard (Freelancer)
├── StatsCards
├── RecentOffers
├── PackageList
└── QuickActions

Dashboard (Employer)
├── StatsCards
├── ActiveJobs
├── RecentProposals
└── QuickActions
```

## State Management Yapısı

### Zustand Store Organizasyonu

```typescript
// lib/store/index.ts
interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  userType: "freelancer" | "employer" | null;

  // UI state
  sidebarOpen: boolean;
  notifications: Notification[];

  // Data state
  jobs: Job[];
  packages: Package[];
  offers: Offer[];
}
```

### Store Slice'ları

- `authSlice`: Kullanıcı authentication
- `uiSlice`: UI state management
- `jobsSlice`: İş ilanları yönetimi
- `packagesSlice`: Freelancer paketleri
- `offersSlice`: Teklif yönetimi

## Mock API Integration

### API Service Layer

```typescript
// lib/api/client.ts
class ApiClient {
  async get<T>(url: string): Promise<T>;
  async post<T>(url: string, data: any): Promise<T>;
  async put<T>(url: string, data: any): Promise<T>;
  async delete(url: string): Promise<void>;
}
```

### SWR Integration

```typescript
// hooks/useJobs.ts
export function useJobs() {
  const { data, error, mutate } = useSWR("/api/jobs", fetcher);
  return { jobs: data, isLoading: !error && !data, error, mutate };
}
```

## Responsive Design Strategy

### Breakpoints (Tailwind)

- `sm`: 640px (Mobil landscape)
- `md`: 768px (Tablet)
- `lg`: 1024px (Desktop)
- `xl`: 1280px (Large desktop)

### Mobile-First Approach

1. **Mobil tasarım öncelik**
2. **Progressive enhancement**
3. **Touch-friendly UI elements**
4. **Simplified navigation**

## Performance Considerations

### Code Splitting

- Route-based splitting (Next.js otomatik)
- Component-based lazy loading
- Dynamic imports for heavy components

### Image Optimization

- Next.js Image component kullanımı
- WebP format desteği
- Lazy loading

### Bundle Optimization

- Tree shaking
- Minimal third-party libraries
- Bundle analyzer kullanımı
