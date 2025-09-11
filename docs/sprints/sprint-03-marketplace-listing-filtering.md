# Sprint 3: Marketplace (İş İlanı ve Paket Listeleme) & Gelişmiş Filtreleme - 2 hafta

## 🎯 Sprint Hedefleri

- Marketplace ana ekranı ve mobil/desktop varyantlarının geliştirilmesi
- İş ilanı ve hizmet paketlerinin listelenmesi
- Gelişmiş arama ve filtreleme sisteminin kurulması
- Pagination, boş durumlar, loading/error state yönetimi
- Rol bazlı marketplace erişimi ve görünüm farklılıkları

## 📱 Geliştirilecek Ekranlar

### Marketplace Ana Ekranı

**Rol**: Both  
**Özellikler**:

- İş ilanı/paket toggle (jobs/services)
- Arama çubuğu (kategori, anahtar kelime)
- Gelişmiş filtreler (fiyat, kategori, teslimat süresi, rating, konum)
- Grid/list görünüm seçenekleri
- Sonuç sayısı, pagination
- Responsive (mobile-first, tablet, desktop)

### İş İlanı Kartı

**Rol**: Both
**Özellikler**:

- Başlık, açıklama özeti, beceriler, bütçe
- Teklif sayısı, yayın tarihi
- Favoriye ekleme
- Detay sayfasına yönlendirme

### Paket Kartı

**Rol**: Both
**Özellikler**:

- Paket başlığı, freelancer bilgisi, fiyat, rating
- Hızlı bakış (quick view), sepete ekle
- Detay sayfasına yönlendirme

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `MarketplaceList` (ana grid/list)
  - `JobCard` (iş ilanı kartı)
  - `ServiceCard` (paket kartı)
  - `MarketplaceHeader` (arama & filtre barı)
  - `EnhancedFilters` (gelişmiş filtre paneli)
  - `MobileMarketplace` / `EnhancedMobileMarketplace`
- **Güncellenecek Component'lar**:
  - `Button`, `Input`, `Badge`, `Card` (varyantlar)
  - `Pagination` (yeni component veya mevcut güncelleme)
- **UI Library Integration**:
  - Shadcn/ui: `Card`, `Button`, `Input`, `Badge`, `Pagination`, `Dialog`

### User Flow

- **Freelancer Flow**: Dashboard → Marketplace → İş ilanı ara → Filtrele → Detay → Teklif ver
- **Employer Flow**: Dashboard → Marketplace → Paket ara → Filtrele → Detay → Satın al

### States & Interactions

- **Loading States**: Liste yükleniyor, filtre uygulanıyor
- **Error Handling**: API/network hatası, boş sonuç
- **Empty States**: Sonuç bulunamadı, filtre temizleme
- **Success States**: Sonuçlar başarıyla yüklendi

### Accessibility

- ARIA labels for search/filter inputs
- Keyboard navigation for grid/list
- Screen reader support for cards
- Focus management on filter open/close

## ⚙️ Fonksiyonel Özellikler

### Marketplace Listing System

**Açıklama**: İş ilanı ve paketlerin filtrelenebilir, aratılabilir şekilde listelenmesi
**Freelancer Perspective**: İş ilanı arama, filtreleme, detay görüntüleme
**Employer Perspective**: Paket arama, filtreleme, detay görüntüleme
**Acceptance Criteria**:

- [ ] İş ilanı ve paketler ayrı tablarda listelenir
- [ ] Arama ve filtreler gerçek zamanlı çalışır
- [ ] Grid/list görünüm değiştirilebilir
- [ ] Sonuç sayısı ve pagination gösterilir
- [ ] Boş ve hata durumları kullanıcı dostu

### Advanced Filtering

**Açıklama**: Kategori, fiyat, teslimat süresi, rating, konum bazlı filtreleme
**Freelancer Perspective**: İş ilanı filtreleme
**Employer Perspective**: Paket filtreleme
**Acceptance Criteria**:

- [ ] Çoklu filtre kombinasyonu desteklenir
- [ ] Filtreler temizlenebilir
- [ ] Mobilde filtre paneli sheet/modal olarak açılır
- [ ] Filtreler URL parametrelerine yansır (isteğe bağlı)

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/jobs`, `/api/v1/packages`

#### GET /api/v1/jobs

```typescript
interface GetJobsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  skills?: string[];
}

interface GetJobsResponse {
  data: Job[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const mockJobs = [
  {
    id: 'job-1',
    title: 'React Native Mobil Uygulama',
    description: 'Sıfırdan modern bir mobil uygulama geliştirilmesi...',
    budget: 15000,
    location: 'İstanbul',
    skills: ['React Native', 'TypeScript'],
    proposalsCount: 7,
    postedAt: '2025-09-01',
  },
  // ...
];
```

#### GET /api/v1/packages

```typescript
interface GetPackagesRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  rating?: number;
}

interface GetPackagesResponse {
  data: ServicePackage[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const mockPackages = [
  {
    id: 'pkg-1',
    title: 'Kurumsal Web Sitesi Paketi',
    freelancer: {
      id: 'freelancer-1',
      name: 'Ayşe Demir',
      avatar: '/avatars/freelancer-1.jpg',
      rating: 4.8,
    },
    price: 8000,
    rating: 4.8,
    deliveryTime: 7,
    image: '/packages/web-1.jpg',
  },
  // ...
];
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/marketplace.ts
export const marketplaceHandlers = [
  http.get('/api/v1/jobs', ({ request }) => {
    // Query parse, filtreleme, pagination logic
    return HttpResponse.json({ data: mockJobs, pagination: { ... } });
  }),
  http.get('/api/v1/packages', ({ request }) => {
    // Query parse, filtreleme, pagination logic
    return HttpResponse.json({ data: mockPackages, pagination: { ... } });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface MarketplaceStore {
  jobs: Job[];
  packages: ServicePackage[];
  filters: MarketplaceFilters;
  isLoading: boolean;
  error: string | null;
  fetchJobs: (filters: MarketplaceFilters) => Promise<void>;
  fetchPackages: (filters: MarketplaceFilters) => Promise<void>;
  setFilters: (filters: MarketplaceFilters) => void;
}
```

### Custom Hooks

```typescript
// hooks/useMarketplace.ts
export function useMarketplace() {
  // State, fetch, filter logic
}
```

### Form Validation (Zod)

```typescript
// lib/validations/marketplace.ts
export const marketplaceFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  deliveryTime: z.number().optional(),
  rating: z.number().min(1).max(5).optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export type MarketplaceFilters = z.infer<typeof marketplaceFilterSchema>;
```

### Component Structure

```typescript
// components/marketplace/MarketplaceList.tsx
interface MarketplaceListProps {
  mode: 'jobs' | 'services';
  filters: MarketplaceFilters;
  onFilterChange: (filters: MarketplaceFilters) => void;
}

export function MarketplaceList({
  mode,
  filters,
  onFilterChange,
}: MarketplaceListProps) {
  // Implementation
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Marketplace ana ekranı (jobs/services toggle) tamamlandı
- [ ] İş ilanı ve paket kartları grid/list olarak gösteriliyor
- [ ] Gelişmiş filtreleme ve arama çalışıyor
- [ ] Pagination, boş ve hata durumları yönetiliyor
- [ ] Mobil ve desktop responsive tasarım

### Technical Deliverables

- [ ] MarketplaceStore Zustand store oluşturuldu
- [ ] useMarketplace custom hook yazıldı
- [ ] TypeScript tipleri ve Zod şemaları tanımlandı
- [ ] MSW mock API handler'ları yazıldı
- [ ] Component unit testleri
- [ ] Integration testler (arama, filtre, pagination)

### Quality Deliverables

- [ ] Accessibility (WCAG 2.1 AA) için grid/list ve filtreler
- [ ] Cross-browser compatibility
- [ ] Performance optimized (Lighthouse >90)
- [ ] Code review completed
- [ ] Documentation updated

## ✅ Test Scenarios

### User Journey Tests

- **Freelancer Journey**: Marketplace → İş ilanı ara → Filtrele → Detay → Teklif ver
- **Employer Journey**: Marketplace → Paket ara → Filtrele → Detay → Satın al

### Edge Cases

- Çoklu filtre kombinasyonu
- Boş sonuçlar (arama/filtre)
- API/network error
- Pagination son sayfa/ilk sayfa

### Performance Tests

- Liste yüklenme süresi <1.5s
- Filtre değişiminde hızlı response
- Mobilde scroll ve touch performansı

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] İş ilanı/paket listesi doğru ve filtrelenmiş gösteriliyor
- [ ] Arama ve filtreler gerçek zamanlı
- [ ] Boş ve hata durumları kullanıcı dostu
- [ ] Pagination ve responsive tasarım eksiksiz

### Design Acceptance

- [ ] Design system tutarlılığı
- [ ] Mobile-first responsive
- [ ] Grid/list ve filtreler erişilebilir

### Technical Acceptance

- [ ] TypeScript strict mode hatası yok
- [ ] ESLint/Prettier uyumlu
- [ ] Test coverage %80+
- [ ] Console error/warning yok
- [ ] Performance hedefleri karşılandı

## 📊 Definition of Done

- [ ] Tüm fonksiyonel gereksinimler tamamlandı
- [ ] Responsive ve cross-browser test edildi
- [ ] Accessibility audit geçti
- [ ] Unit ve integration testler başarılı
- [ ] Code review ve dokümantasyon tamamlandı
- [ ] Performance metrikleri sağlandı
