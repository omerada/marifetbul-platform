# Gelişmiş Sayfa Yapısı - Hibrit Görüntüleme Sistemi

## Proje Yaklaşımı

Marifeto'da hem freelancer hem işveren content'ini tek platformda optimize edilmiş şekilde sunuyoruz. Bu yaklaşım kullanıcı deneyimini artırır ve platform etkinliğini maksimize eder.

---

## Ana Sayfa Tasarımı (Landing Page)

### 🎯 Hibrit Ana Sayfa Yaklaşımı

Tek ana sayfada hem freelancer hem işveren için optimize edilmiş content sunuyoruz.

#### Layout Yapısı

```
[Header: Logo + Navigation + CTA Buttons]
[Hero Section: Smart Toggle Interface]
[Value Propositions: Side-by-side comparison]
[Featured Content: Dynamic showcase]
[How It Works: Parallel workflows]
[Success Stories: Both user types]
[CTA Section: Smart routing]
[Footer]
```

### Hero Section - Akıllı Toggle Interface

#### Desktop Layout

```
┌─────────────────────────────────────────────────────────┐
│  [İş Arıyorum] [İş Veriyorum] Toggle Buttons             │
│                                                         │
│  ┌─ İş Arıyorum Aktif ─┐  ┌─ İş Veriyorum ─┐             │
│  │ "Yeteneklerini      │  │ "Projeni hayata │             │
│  │  paraya çevir"      │  │  geçir"         │             │
│  │                     │  │                 │             │
│  │ [Hemen Başla]       │  │ [İlan Ver]      │             │
│  └─────────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

#### Mobil Layout

```
┌─────────────────────────┐
│ [İş Arıyorum][İş Veriyorum] │
│                         │
│ "Yeteneklerini          │
│  paraya çevir"          │
│                         │
│ [Hemen Başla]           │
│                         │
│ → Kaydır: İş Veriyorum  │
└─────────────────────────┘
```

### Value Propositions - Karşılaştırmalı Sunum

#### Side-by-Side Feature Comparison

```typescript
interface ValueProposition {
  freelancer: {
    title: string;
    description: string;
    benefits: string[];
    cta: string;
  };
  employer: {
    title: string;
    description: string;
    benefits: string[];
    cta: string;
  };
}

const valueProps = {
  freelancer: {
    title: "Freelancer olarak",
    description: "Yeteneklerini sergileyip kazanmaya başla",
    benefits: [
      "Kendi fiyatını belirle",
      "Esnek çalışma saatleri",
      "Global müşteri ağı",
      "Güvenli ödeme sistemi",
    ],
    cta: "Freelancer Ol",
  },
  employer: {
    title: "İşveren olarak",
    description: "Doğru yetenekleri bul, projeni tamamla",
    benefits: [
      "Geniş yetenek havuzu",
      "Hızlı teklif alma",
      "Kaliteli sonuçlar",
      "Bütçe kontrolü",
    ],
    cta: "İş Ver",
  },
};
```

---

## Browse/Marketplace Sayfaları

### 🔄 Tek Sayfa - Çift Görünüm Yaklaşımı

#### URL Yapısı

```
/marketplace - Ana marketplace
/marketplace?view=services - Freelancer paketleri
/marketplace?view=jobs - İş ilanları
/marketplace?type=freelancer - Freelancer odaklı view
/marketplace?type=employer - İşveren odaklı view
```

#### Header Toggle Interface

```
┌─────────────────────────────────────────────────────┐
│ [Hizmetler] [İş İlanları] Toggle + Category Filters  │
└─────────────────────────────────────────────────────┘
```

### Hizmet Paketleri Görünümü (/marketplace?view=services)

#### Layout

```
[Filters Sidebar]  [Content Grid]                [Right Panel]
┌──────────────┐  ┌─────────────────────────┐    ┌─────────────┐
│ Kategori     │  │ Package Cards Grid      │    │ Trending    │
│ Fiyat Aralığı│  │                         │    │ Categories  │
│ Teslimat     │  │ [Package][Package]      │    │             │
│ Rating       │  │ [Package][Package]      │    │ Popular     │
│ Konum        │  │ [Package][Package]      │    │ Freelancers │
│              │  │                         │    │             │
│ [Temizle]    │  │ [Load More]             │    │ Success     │
└──────────────┘  └─────────────────────────┘    │ Stories     │
                                                 └─────────────┘
```

#### Package Card Design

```typescript
interface PackageCard {
  // Visual
  thumbnail: string;
  gallery: string[];

  // Content
  title: string;
  freelancerInfo: {
    name: string;
    avatar: string;
    rating: number;
    level: string;
  };

  // Pricing
  startingPrice: number;
  deliveryTime: string;

  // Social Proof
  orderCount: number;
  rating: number;
  reviewCount: number;

  // Quick Info
  skills: string[];
  inQueue: number;
}
```

### İş İlanları Görünümü (/marketplace?view=jobs)

#### Layout

```
[Filters Sidebar]  [Content List]               [Right Panel]
┌──────────────┐  ┌─────────────────────────┐    ┌─────────────┐
│ Kategori     │  │ Job Cards List          │    │ Post a Job  │
│ Bütçe        │  │                         │    │ Quick Form  │
│ Proje Süresi │  │ [Job Card]              │    │             │
│ Deneyim      │  │ [Job Card]              │    │ Hiring Tips │
│ Konum        │  │ [Job Card]              │    │             │
│              │  │ [Job Card]              │    │ Featured    │
│ [Temizle]    │  │                         │    │ Freelancers │
└──────────────┘  │ [Load More]             │    │             │
                  └─────────────────────────┘    └─────────────┘
```

#### Job Card Design

```typescript
interface JobCard {
  // Content
  title: string;
  description: string; // truncated
  category: string;

  // Employer
  employerInfo: {
    name: string;
    company?: string;
    avatar: string;
    rating: number;
    jobsPosted: number;
  };

  // Project Details
  budget: {
    type: "fixed" | "hourly";
    range: { min: number; max: number };
  };
  deadline: string;
  skills: string[];

  // Engagement
  proposalCount: number;
  timePosted: string;
  featured: boolean;
  verified: boolean;
}
```

---

## Responsive Geçişler

### Mobil Marketplace Design

#### Stack Layout Approach

```
┌─────────────────────────┐
│ [Services][Jobs] Toggle │
├─────────────────────────┤
│ [🔍] Search Input       │
├─────────────────────────┤
│ [Filter] [Sort] Buttons │
├─────────────────────────┤
│                         │
│ Card 1                  │
│ ├─ Image                │
│ ├─ Title                │
│ ├─ User Info            │
│ └─ Price/Budget         │
│                         │
│ Card 2                  │
│ ...                     │
└─────────────────────────┘
```

#### Bottom Sheet Filters

```typescript
interface MobileFilters {
  isOpen: boolean;
  sections: {
    category: FilterSection;
    price: FilterSection;
    delivery: FilterSection;
    rating: FilterSection;
  };
}

// Usage
<BottomSheet isOpen={showFilters}>
  <FilterSections />
</BottomSheet>;
```

---

## Sayfa Geçiş Animasyonları

### Smooth Toggle Transitions

#### CSS Animations

```css
.marketplace-toggle {
  .content-container {
    transition: transform 0.3s ease-in-out;
  }

  .slide-enter {
    transform: translateX(100%);
  }

  .slide-enter-active {
    transform: translateX(0);
  }

  .slide-exit {
    transform: translateX(0);
  }

  .slide-exit-active {
    transform: translateX(-100%);
  }
}
```

#### React Transition Component

```typescript
function MarketplaceView({ view }: { view: "services" | "jobs" }) {
  return (
    <TransitionGroup>
      <CSSTransition key={view} timeout={300} classNames="marketplace-toggle">
        {view === "services" ? <ServicesGrid /> : <JobsList />}
      </CSSTransition>
    </TransitionGroup>
  );
}
```

---

## Smart Content Recommendation

### Contextual Content Switching

#### User Journey Based Display

```typescript
interface SmartDisplay {
  userType?: "freelancer" | "employer" | "new";
  currentView: "services" | "jobs";
  recommendedContent: {
    services: Package[];
    jobs: Job[];
    trending: Category[];
  };
}

// Example: New user sees both, returning users see personalized
function getRecommendedContent(userType: string) {
  if (userType === "freelancer") {
    return {
      primary: "jobs", // Show jobs first
      secondary: "popular-services", // Show what's trending
    };
  } else if (userType === "employer") {
    return {
      primary: "services", // Show available freelancers
      secondary: "similar-jobs", // Show competitive analysis
    };
  }
  return {
    primary: "mixed", // Show both equally
    secondary: "getting-started",
  };
}
```

### Cross-Pollination Strategy

```typescript
// Show relevant opportunities across user types
interface CrossPromotion {
  // For freelancers browsing jobs
  showSimilarServices: boolean;

  // For employers browsing services
  showSimilarJobs: boolean;

  // General discovery
  showTrendingCategories: boolean;
  showSuccessStories: boolean;
}
```

---

## Dashboard Integration

### Unified Dashboard Approach

#### Single Dashboard - Multiple Views

```
/dashboard - Smart routing based on user type
/dashboard?view=freelancer - Freelancer specific
/dashboard?view=employer - Employer specific
/dashboard?view=overview - Combined view
```

#### Layout Structure

```
[Top Navigation: Overview | My View | Switch View]
[Stats Row: Universal metrics]
[Quick Actions: Context aware]
[Content Grid: Personalized for user type]
[Recent Activity: Mixed or filtered]
```

#### Smart Stats Display

```typescript
interface UniversalStats {
  // For Freelancers
  activeProposals?: number;
  monthlyEarnings?: number;
  profileViews?: number;

  // For Employers
  activeJobs?: number;
  pendingProposals?: number;
  monthlyBudget?: number;

  // Universal
  messages: number;
  notifications: number;
  completedProjects: number;
}
```

---

## Search & Discovery Enhancement

### Universal Search Interface

#### Smart Search Bar

```typescript
interface SmartSearch {
  query: string;
  context: "services" | "jobs" | "freelancers" | "all";
  suggestions: {
    services: string[];
    jobs: string[];
    skills: string[];
    locations: string[];
  };
  recentSearches: string[];
  trendingSearches: string[];
}
```

#### Search Results Layout

```
[Search: "web development"]
┌─────────────────────────────────────────┐
│ Results for "web development"           │
├─────────────────────────────────────────┤
│ [Services (45)] [Jobs (23)] [People (12)]│
├─────────────────────────────────────────┤
│ Services Results:                       │
│ ├─ [Service Card]                       │
│ ├─ [Service Card]                       │
│ └─ [View All Services]                  │
│                                         │
│ Jobs Results:                           │
│ ├─ [Job Card]                          │
│ ├─ [Job Card]                          │
│ └─ [View All Jobs]                     │
└─────────────────────────────────────────┘
```

---

## Performance Optimization

### Lazy Loading Strategy

```typescript
// Component-based lazy loading
const ServicesGrid = lazy(() => import("./ServicesGrid"));
const JobsList = lazy(() => import("./JobsList"));
const UserProfiles = lazy(() => import("./UserProfiles"));

// Route-based code splitting
const MarketplacePage = lazy(() => import("./pages/Marketplace"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
```

### Caching Strategy

```typescript
// SWR-based caching with smart invalidation
const { data: services } = useSWR("/api/packages", fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 300000, // 5 minutes
});

const { data: jobs } = useSWR("/api/jobs", fetcher, {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 180000, // 3 minutes (more frequent for jobs)
});
```

### Infinite Scroll Implementation

```typescript
function useInfiniteContent<T>(endpoint: string, itemsPerPage: number = 20) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${endpoint}?page=${
          Math.floor(items.length / itemsPerPage) + 1
        }&limit=${itemsPerPage}`
      );
      const data = await response.json();

      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, items.length, itemsPerPage, loading, hasMore]);

  return { items, loading, hasMore, loadMore };
}
```

Bu gelişmiş sayfa yapısı ile Marifeto platformu hem freelancer hem işveren kullanıcıları için optimize edilmiş, verimli ve kullanıcı dostu bir deneyim sunacak.
