# AI AGENT TALİMAT DÖKÜMANÜ

## MARKETPLACE KATEGORİLER SAYFASI GELİŞTİRME

**Proje:** MarifetBul Freelance Platform  
**Hedef Sayfa:** `/marketplace/categories`  
**Tarih:** 4 Ekim 2025  
**Statü:** Production-Ready Geliştirme Talimatı

---

## 🎯 GÖREVİN TANIMI

Türkiye'nin önde gelen freelance platformu MarifetBul için, Armut benzeri kullanıcı deneyimi sunan kategoriler sayfasını eksiksiz olarak geliştirin. Sayfa, 16 ana kategori ve 800+ hizmet türünü optimize edilmiş şekilde sunmalı ve production-ready kalitede olmalıdır.

---

## 📋 PROJE YAPISI VE CONTEXT

### Mevcut Teknoloji Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **TypeScript:** Strict mode enabled
- **State Management:** Zustand + React Query
- **UI Components:** Unified Design System (@/components/ui)
- **SEO:** Optimized metadata system

### Proje Dizin Yapısı

```
app/marketplace/
├── layout.tsx           # Marketplace ana layout
├── page.tsx            # Marketplace ana sayfa
├── categories/
│   ├── page.tsx        # ⭐ GELİŞTİRİLECEK SAYFA
│   └── [categoryId]/
│       └── page.tsx    # Kategori detay sayfası
├── jobs/              # İş ilanları
├── packages/          # Hizmet paketleri
└── search/            # Arama sonuçları

components/
├── ui/                # Design system components
├── domains/           # Business domain components
├── shared/            # Cross-domain components
└── layout/            # Layout components

types/business/features/marketplace.ts  # Type definitions
lib/domains/           # Business logic
```

---

## 🎨 TASARIM REQUİREMENTLARI

### Ana Tasarım Konsepti

- **Modern, temiz ve profesyonel görünüm**
- **Armut benzeri grid layout sistemi**
- **Responsive design (Mobile-first)**
- **Accessibility (WCAG 2.1 AA) uyumlu**
- **Performance optimized (Core Web Vitals)**

### Renk Paleti

```css
Primary: #3B82F6 (Blue-500)
Secondary: #8B5CF6 (Purple-500)
Accent: #10B981 (Green-500)
Background: #F9FAFB (Gray-50)
Text: #111827 (Gray-900)
Muted: #6B7280 (Gray-500)
```

### Typography

- **Başlıklar:** Inter Bold (32px-48px)
- **Alt başlıklar:** Inter SemiBold (18px-24px)
- **Body text:** Inter Regular (14px-16px)
- **Caption:** Inter Medium (12px-14px)

---

## 📊 KATEGORİ VERİ YAPISI

### 16 Ana Kategori (CATEGORY_ANALYSIS.md'den)

```typescript
interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  subcategories: SubCategory[];
  serviceCount: number;
  averagePrice: number;
  topSkills: string[];
  popularServices: string[];
  trending: boolean;
  featured: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  description: string;
  serviceCount: number;
  averagePrice: number;
  popularServices: string[];
}
```

### Kategoriler Listesi

1. **Teknoloji & Yazılım** (Code icon, Blue) - 200+ hizmet
2. **Tasarım & Kreatif** (Palette icon, Purple) - 150+ hizmet
3. **Pazarlama & Reklam** (Megaphone icon, Green) - 120+ hizmet
4. **Ev & Yaşam Hizmetleri** (Home icon, Orange) - 280+ hizmet
5. **Eğitim & Danışmanlık** (GraduationCap icon, Indigo) - 80+ hizmet
6. **Sağlık & Kişisel Bakım** (Heart icon, Pink) - 50+ hizmet
7. **Otomotiv** (Car icon, Red) - 30+ hizmet
8. **Finans & Muhasebe** (DollarSign icon, Yellow) - 25+ hizmet
9. **Çevre & Enerji** (Leaf icon, Green) - 15+ hizmet
10. **Gıda & İçecek** (ChefHat icon, Orange) - 20+ hizmet
11. **Etkinlik & Eğlence** (PartyPopper icon, Purple) - 40+ hizmet
12. **Spor & Rekreasyon** (Dumbbell icon, Blue) - 25+ hizmet
13. **Çocuk & Bebek** (Baby icon, Pink) - 30+ hizmet
14. **Yaşlı Bakım** (Users icon, Gray) - 15+ hizmet
15. **Hukuk & Kamu** (Scale icon, Dark) - 35+ hizmet
16. **Turizm & Seyahat** (MapPin icon, Teal) - 25+ hizmet

---

## 🛠️ COMPONENT GELİŞTİRME REQUİREMENTLARI

### 1. Ana Categories Page Component

**Dosya:** `app/marketplace/categories/page.tsx`

#### Bileşenler:

- **Hero Section** - Gradient background + arama
- **Category Grid** - Ana kategoriler showcase
- **Featured Categories** - Trend kategoriler
- **Statistics Section** - Platform istatistikleri
- **CTA Section** - İş verme teşviki

#### Özellikler:

- Responsive grid layout (1-2-3-4 columns)
- Arama ve filtreleme
- Kategory hover effects
- Loading states
- Error boundaries
- SEO optimization

### 2. CategoryCard Component

**Dosya:** `components/domains/marketplace/CategoryCard.tsx`

```typescript
interface CategoryCardProps {
  category: Category;
  variant: 'default' | 'featured' | 'compact';
  showStats: boolean;
  onClick: (categoryId: string) => void;
}
```

#### Features:

- Icon ve renk customization
- Hover animations (Framer Motion)
- Service count badge
- Average price display
- Quick action buttons
- Responsive design

### 3. CategoryFilter Component

**Dosya:** `components/domains/marketplace/CategoryFilter.tsx`

#### Filtering Options:

- Kategori tipine göre (service type)
- Fiyat aralığına göre (price range)
- Popülerlik sıralaması (popularity)
- Alfabetik sıralama (alphabetical)
- Hizmet sayısına göre (service count)

### 4. SearchBar Component

**Dosya:** `components/domains/marketplace/CategorySearch.tsx`

#### Features:

- Real-time arama
- Autocomplete önerileri
- Recent searches
- Popular searches
- Voice search (gelecek)

---

## 🎯 KULLANICI DENEYİMİ REQUİREMENTLARI

### Navigation Flow

1. **Ana sayfa** → Kategoriler butonu
2. **Kategoriler** → Kategori seçimi
3. **Kategori detay** → Hizmet listesi
4. **Hizmet detay** → Freelancer iletişim

### Interaktif Özellikler

- **Hover Effects:** Smooth transitions
- **Category Preview:** Modal/drawer önizleme
- **Quick Actions:** Direk iş verme
- **Breadcrumbs:** Navigation yolu
- **Share:** Sosyal medya paylaşım

### Performance Targets

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3s

---

## 📱 RESPONSİVE DESIGN REQUİREMENTLARI

### Breakpoints

- **Mobile:** 320px - 768px (1 column)
- **Tablet:** 768px - 1024px (2 columns)
- **Desktop:** 1024px - 1440px (3 columns)
- **Large:** 1440px+ (4 columns)

### Mobile-Specific Features

- Touch-friendly buttons (44px+)
- Swipe gestures
- Bottom sheet modals
- Simplified navigation
- Optimized images

---

## 🔧 TEKNİK İMPLEMENTASYON REQUİREMENTLARI

### State Management

```typescript
// Zustand store structure
interface CategoryStore {
  categories: Category[];
  filters: CategoryFilters;
  searchTerm: string;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  updateFilters: (filters: Partial<CategoryFilters>) => void;
  searchCategories: (term: string) => void;
  resetFilters: () => void;
}
```

### API Integration

```typescript
// API endpoints to implement
GET /api/v1/marketplace/categories
GET /api/v1/marketplace/categories/:id
GET /api/v1/marketplace/categories/search?q=term
GET /api/v1/marketplace/categories/featured
GET /api/v1/marketplace/categories/stats
```

### Data Fetching

- React Query for caching
- SSR for initial load
- Progressive loading
- Error retry logic
- Optimistic updates

### TypeScript Types

- Strict type definitions
- Proper interfaces
- Generic components
- Type-safe API calls
- Error type handling

---

## 🎨 ANIMATION & MICRO-INTERACTIONS

### Framer Motion Animations

```typescript
// Animation variants
const categoryCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, y: -5 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
```

### Micro-interactions

- Card hover effects
- Button press feedback
- Loading spinners
- Success animations
- Error shake effects

---

## 🔍 SEO & PERFORMANCE REQUİREMENTLARI

### SEO Metadata

```typescript
export const metadata: Metadata = {
  title: 'Hizmet Kategorileri | MarifetBul',
  description: 'Teknolojiden tasarıma, ev hizmetlerinden eğitime kadar 800+ hizmet kategorisinde uzman freelancerlar bul.',
  keywords: 'freelance, hizmet kategorileri, uzman, teknoloji, tasarım, ev hizmetleri',
  openGraph: { /* Open Graph tags */ },
  robots: 'index,follow',
  alternates: { canonical: '/marketplace/categories' }
};
```

### Structured Data

- Category schema markup
- Service schema
- Breadcrumb markup
- Rating/review markup

### Performance Optimizations

- Image optimization (Next.js Image)
- Code splitting
- Lazy loading
- Bundle analysis
- CDN integration

---

## 🧪 TEST REQUİREMENTLARI

### Unit Tests (Jest + Testing Library)

```typescript
// Test cases to implement
describe('CategoryCard', () => {
  it('renders category information correctly');
  it('handles click events properly');
  it('displays service count badge');
  it('shows loading state');
  it('handles error states');
});
```

### Integration Tests

- Category filtering
- Search functionality
- Navigation flow
- API integration
- State management

### E2E Tests (Playwright)

- Full user journey
- Mobile interactions
- Performance testing
- Accessibility testing

---

## 🚀 DEPLOYMENT & MONİTORİNG

### Deployment Checklist

- [ ] TypeScript compilation
- [ ] ESLint/Prettier formatting
- [ ] Unit test coverage > 80%
- [ ] E2E test passing
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] SEO audit
- [ ] Security scan

### Analytics Tracking

```typescript
// Analytics events to implement
trackEvent('category_view', { categoryId });
trackEvent('category_click', { categoryId, source });
trackEvent('search_category', { searchTerm, results });
trackEvent('filter_apply', { filters });
```

### Error Monitoring

- Sentry integration
- Performance monitoring
- User session recording
- Error boundary reporting

---

## 📋 GELİŞTİRME ADIMLARı

### Phase 1: Temel Yapı (1-2 gün)

1. TypeScript interfaces tanımlama
2. Basic component structure
3. Layout implementation
4. Routing setup

### Phase 2: UI Development (2-3 gün)

1. CategoryCard component
2. CategoryGrid layout
3. SearchBar implementation
4. Filter components
5. Responsive design

### Phase 3: Functionality (2-3 gün)

1. State management (Zustand)
2. API integration
3. Search & filter logic
4. Error handling
5. Loading states

### Phase 4: Enhancement (1-2 gün)

1. Animations (Framer Motion)
2. Performance optimization
3. SEO implementation
4. Accessibility improvements

### Phase 5: Testing & Polish (1-2 gün)

1. Unit tests
2. Integration tests
3. E2E tests
4. Performance testing
5. Final polish

---

## 🎯 BAŞARILI TAMAMLAMA KRİTERLERİ

### Fonksiyonel Gereksinimler

- ✅ Tüm 16 kategori doğru şekilde gösteriliyor
- ✅ Arama fonksiyonu çalışıyor
- ✅ Filtreleme sistemi aktif
- ✅ Responsive design tamamlandı
- ✅ Navigation akışı sorunsuz

### Teknik Gereksinimler

- ✅ TypeScript strict mode uyumlu
- ✅ Performance targets karşılandı
- ✅ Accessibility AA compliance
- ✅ SEO optimization tamamlandı
- ✅ Test coverage > 80%

### UX Gereksinimler

- ✅ Loading states implemented
- ✅ Error boundaries working
- ✅ Animations smooth
- ✅ Mobile experience optimal
- ✅ User feedback positive

---

## 🔗 KAYNAKLAR VE REFERANSLAR

### Dosya Referansları

- `docs/CATEGORY_ANALYSIS.md` - Kategori detayları
- `docs/PROJECT_STRUCTURE.md` - Proje yapısı
- `types/business/features/marketplace.ts` - Type definitions
- `components/ui/index.ts` - UI components
- `app/marketplace/categories/page.tsx` - Mevcut implementasyon

### External References

- [Armut.com](https://armut.com) - UX reference
- [Fiverr Categories](https://fiverr.com) - Feature inspiration
- [Upwork Categories](https://upwork.com) - Structure reference

### Design System

- Tailwind CSS Utility Classes
- Lucide React Icons
- Framer Motion Animations
- Next.js 14 App Router Patterns

---

## ⚠️ ÖNEMLİ NOTLAR

### Proje Specific Dikkat Edilecekler

1. **Mevcut component yapısını bozmayın** - Unified UI system kullanın
2. **Type safety prioritize edin** - Strict TypeScript mode
3. **Performance first yaklaşım** - Core Web Vitals optimize
4. **Mobile-first development** - Responsive design öncelik
5. **Accessibility mandatory** - WCAG 2.1 AA compliance

### Code Quality Standards

- ESLint + Prettier formatı
- Conventional Commits
- Component composition pattern
- Custom hooks kullanımı
- Error boundary implementation

### Production Considerations

- Environment variables
- API rate limiting
- Caching strategies
- Security headers
- SEO metadata

---

**Bu talimat dokümantasyonu, AI agent'ın MarifetBul platformu için production-ready `/marketplace/categories` sayfasını eksiksiz olarak geliştirmesi için gerekli tüm bilgileri içermektedir. Geliştiricinin bu dökümanı takip ederek, kullanıcı deneyimi odaklı, performanslı ve ölçeklenebilir bir kategori sayfası oluşturması beklenmektedir.**
