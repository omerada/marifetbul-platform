# Sprint 8: Çift Taraflı Puanlama, İnceleme Sistemi & Analytics Dashboard - 2 hafta

## 🎯 Sprint Hedefleri

- Çift taraflı puanlama ve detaylı inceleme sistemi
- Employer ve freelancer için review akışı
- Review moderation ve yanıt sistemi
- Analytics dashboard (kazanç, harcama, performans, büyüme)
- Platform reputation ve güvenlik iyileştirmeleri
- Review/analytics ile ilgili notification entegrasyonu

## 📱 Geliştirilecek Ekranlar

### Review & Rating Ekranları

**Rol**: Both  
**Özellikler**:

- Sipariş tamamlandığında review prompt
- 5 yıldızlı puanlama, detaylı yorum
- Kategori bazlı rating (iletişim, kalite, zamanlama, vb.)
- Public/private yorum seçeneği
- Review yanıtla (freelancer/işveren)
- Moderasyon ve şikayet bildirimi
- Review geçmişi ve filtreleme
- Review notification

### Analytics Dashboard

**Rol**: Both
**Özellikler**:

- Freelancer için kazanç, sipariş, müşteri memnuniyeti, tekrar müşteri oranı
- Employer için harcama, iş ilanı başarısı, teklif kalitesi, proje tamamlama oranı
- Zaman bazlı grafikler (haftalık, aylık, yıllık)
- Growth insights ve trend analizleri
- Export ve paylaşım seçenekleri
- KPI ve metrik kartları

### Reputation & Güvenlik

**Rol**: Both
**Özellikler**:

- Platform reputation score gösterimi
- Güvenlik uyarıları ve doğrulama rozetleri
- Review spam/abuse detection
- Kullanıcı şikayet ve raporlama akışı
- Güvenlik notification

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `ReviewForm` - Review ve rating formu
  - `ReviewCard` - Review kartı
  - `ReviewList` - Review geçmişi
  - `ReviewReply` - Yanıt formu
  - `AnalyticsDashboard` - Analytics ana ekranı
  - `DashboardStats` - KPI kartları
  - `DashboardCharts` - Grafikler
  - `GrowthInsights` - Trend ve büyüme bölümü
  - `ReputationScore` - Platform güven puanı
  - `SecurityAlert` - Güvenlik uyarı bileşeni
- **Güncellenecek Component'lar**:
  - `NotificationCenter` - Review/analytics notification
  - `Badge`, `Card`, `Button` (review/analytics varyantları)
  - `Modal`, `Dialog` (review yanıtı, şikayet bildirimi)
- **UI Library Integration**:
  - `Tooltip`, `Tabs`, `Progress`, `Alert`, `Chart` (Shadcn/ui)

### User Flow

- **Freelancer Flow**: Sipariş Tamamlandı → Review Prompt → Yorum Yaz → Analytics Dashboard
- **Employer Flow**: Sipariş Tamamlandı → Review Prompt → Yorum Yaz → Analytics Dashboard

### States & Interactions

- **Loading States**: Review gönderme, analytics yükleme
- **Error Handling**: Review validation, analytics fetch error
- **Empty States**: Hiç review yok, hiç veri yok
- **Success States**: Review gönderildi, analytics yüklendi
- **Interactive Elements**: Review yanıtı, grafik filtreleme, export

### Accessibility

- ARIA labels for review/analytics inputs
- Keyboard navigation for review list
- Screen reader support for charts
- Focus management in modals

## ⚙️ Fonksiyonel Özellikler

### Dual Rating & Review System

**Açıklama**: Sipariş sonrası çift taraflı puanlama ve detaylı inceleme
**Employer Perspective**: Freelancer’a puan ve yorum verme, review geçmişi
**Freelancer Perspective**: Employer’a puan ve yorum verme, review geçmişi
**Acceptance Criteria**:

- [ ] Sipariş tamamlandığında review prompt gösterilir
- [ ] 5 yıldızlı rating ve detaylı yorum
- [ ] Kategori bazlı rating (iletişim, kalite, zamanlama)
- [ ] Review yanıtı ve moderasyon akışı
- [ ] Review notification ve geçmişi

### Analytics Dashboard

**Açıklama**: Kazanç, harcama, performans ve büyüme analizleri
**Employer Perspective**: Harcama, iş ilanı başarısı, teklif kalitesi
**Freelancer Perspective**: Kazanç, müşteri memnuniyeti, tekrar müşteri oranı
**Acceptance Criteria**:

- [ ] Zaman bazlı grafikler ve KPI kartları
- [ ] Growth insights ve trend analizleri
- [ ] Export ve paylaşım seçenekleri
- [ ] KPI ve metrikler doğru hesaplanıyor
- [ ] Analytics notification

### Reputation & Security

**Açıklama**: Platform reputation score ve güvenlik iyileştirmeleri
**Employer Perspective**: Güvenlik uyarıları, doğrulama rozetleri
**Freelancer Perspective**: Reputation score, şikayet bildirimi
**Acceptance Criteria**:

- [ ] Reputation score ve rozetler gösteriliyor
- [ ] Güvenlik notification ve uyarılar
- [ ] Review spam/abuse detection
- [ ] Şikayet ve raporlama akışı
- [ ] Moderasyon paneli (opsiyonel)

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/reviews`, `/api/v1/analytics`, `/api/v1/reputation`

#### POST /api/v1/reviews

```typescript
interface CreateReviewRequest {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  categories: {
    communication: number;
    quality: number;
    timing: number;
  };
  comment: string;
  isPublic: boolean;
}

interface CreateReviewResponse {
  success: boolean;
  data?: Review;
  error?: string;
}

const mockReviewResponse = {
  success: true,
  data: {
    id: 'rev-123',
    orderId: 'order-123',
    reviewerId: 'user-1',
    revieweeId: 'user-2',
    rating: 5,
    categories: { communication: 5, quality: 5, timing: 5 },
    comment: 'Çok memnun kaldım, hızlı ve kaliteli iş!',
    isPublic: true,
    createdAt: '2025-09-11T10:00:00Z',
    reply: null,
    status: 'active',
  },
};
```

#### GET /api/v1/reviews?userId=xxx

```typescript
interface GetReviewsResponse {
  data: Review[];
}

const mockReviews = [
  {
    id: 'rev-123',
    orderId: 'order-123',
    reviewerId: 'user-1',
    revieweeId: 'user-2',
    rating: 5,
    categories: { communication: 5, quality: 5, timing: 5 },
    comment: 'Çok memnun kaldım, hızlı ve kaliteli iş!',
    isPublic: true,
    createdAt: '2025-09-11T10:00:00Z',
    reply: null,
    status: 'active',
  },
  // ...
];
```

#### POST /api/v1/reviews/:id/reply

```typescript
interface CreateReplyRequest {
  reviewId: string;
  reply: string;
}

interface CreateReplyResponse {
  success: boolean;
  data?: Review;
  error?: string;
}
```

#### GET /api/v1/analytics

```typescript
interface GetAnalyticsResponse {
  data: AnalyticsData;
}

const mockAnalytics = {
  earnings: 125000,
  orders: 89,
  satisfaction: 4.9,
  repeatCustomers: 0.32,
  growth: [
    { month: '2025-01', value: 8000 },
    { month: '2025-02', value: 9500 },
    // ...
  ],
  kpis: [
    { label: 'Toplam Kazanç', value: 125000 },
    { label: 'Tamamlanan Sipariş', value: 89 },
    { label: 'Müşteri Memnuniyeti', value: '4.9/5' },
  ],
};
```

#### GET /api/v1/reputation?userId=xxx

```typescript
interface GetReputationResponse {
  data: {
    score: number;
    badges: string[];
    securityAlerts: string[];
  };
}

const mockReputation = {
  score: 92,
  badges: ['verified', 'top-rated'],
  securityAlerts: ['2FA önerisi', 'Profilde eksik bilgi'],
};
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/reviews-analytics.ts
export const reviewsAnalyticsHandlers = [
  http.post('/api/v1/reviews', ({ request }) => {
    // Review creation logic
    return HttpResponse.json(mockReviewResponse);
  }),
  http.get('/api/v1/reviews', ({ request }) => {
    return HttpResponse.json({ data: mockReviews });
  }),
  http.post('/api/v1/reviews/:id/reply', ({ request }) => {
    // Reply logic
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/v1/analytics', () => {
    return HttpResponse.json({ data: mockAnalytics });
  }),
  http.get('/api/v1/reputation', () => {
    return HttpResponse.json({ data: mockReputation });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface ReviewStore {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  fetchReviews: (userId: string) => Promise<void>;
  createReview: (data: CreateReviewRequest) => Promise<void>;
  replyToReview: (reviewId: string, reply: string) => Promise<void>;
  clearError: () => void;
}

interface AnalyticsStore {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
  clearError: () => void;
}

interface ReputationStore {
  reputation: ReputationData | null;
  isLoading: boolean;
  error: string | null;
  fetchReputation: (userId: string) => Promise<void>;
  clearError: () => void;
}
```

### Custom Hooks

```typescript
// hooks/useReviews.ts
export function useReviews(userId: string) {
  // State, fetch, create, reply logic
}

// hooks/useAnalytics.ts
export function useAnalytics() {
  // State, fetch logic
}

// hooks/useReputation.ts
export function useReputation(userId: string) {
  // State, fetch logic
}
```

### Form Validation (Zod)

```typescript
// lib/validations/reviews.ts
export const reviewSchema = z.object({
  orderId: z.string().min(1, 'Sipariş ID gereklidir'),
  reviewerId: z.string().min(1, 'Reviewer ID gereklidir'),
  revieweeId: z.string().min(1, 'Reviewee ID gereklidir'),
  rating: z.number().min(1).max(5),
  categories: z.object({
    communication: z.number().min(1).max(5),
    quality: z.number().min(1).max(5),
    timing: z.number().min(1).max(5),
  }),
  comment: z.string().min(10).max(2000),
  isPublic: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
```

### Component Structure

```typescript
// components/features/ReviewForm.tsx
interface ReviewFormProps {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
}

export function ReviewForm({
  orderId,
  reviewerId,
  revieweeId,
}: ReviewFormProps) {
  // Implementation
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Çift taraflı puanlama ve review sistemi implemented
- [ ] Review prompt ve geçmişi ekranı
- [ ] Review yanıtı ve moderasyon akışı
- [ ] Analytics dashboard ve KPI kartları
- [ ] Growth insights ve trend analizleri
- [ ] Reputation score ve güvenlik uyarıları
- [ ] Responsive design (mobile, tablet, desktop)

### Technical Deliverables

- [ ] ReviewStore, AnalyticsStore, ReputationStore Zustand stores
- [ ] useReviews, useAnalytics, useReputation custom hooks
- [ ] TypeScript types ve Zod validation schemas
- [ ] MSW handlers for reviews/analytics/reputation
- [ ] Unit tests for review/analytics components
- [ ] Integration tests for review flows

### Quality Deliverables

- [ ] Accessibility (WCAG 2.1 AA) for review/analytics
- [ ] Cross-browser compatibility
- [ ] Performance optimized (dashboard load <2s)
- [ ] Code review completed
- [ ] Documentation updated

## ✅ Test Scenarios

### User Journey Tests

- **Freelancer Journey**:
  1. Sipariş tamamlandı → Review prompt → Yorum yaz → Analytics dashboard
  2. Review yanıtı → Moderasyon bildirimi
  3. Reputation score ve güvenlik uyarısı görüntüleme

- **Employer Journey**:
  1. Sipariş tamamlandı → Review prompt → Yorum yaz → Analytics dashboard
  2. Review geçmişi → Filtreleme → Yanıtla
  3. Güvenlik uyarısı ve rozet görüntüleme

### Edge Cases

- **Review spam/abuse**: Moderasyon, şikayet bildirimi
- **Eksik review**: Prompt tekrar gösterimi
- **Analytics fetch error**: Retry, error state
- **Reputation düşük**: Güvenlik önerisi, badge kaybı
- **Çoklu review**: Pagination, filtreleme

### Performance Tests

- Review gönderme süresi <1s
- Analytics dashboard yüklenme <2s
- Reputation fetch <1s

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Review prompt ve geçmişi eksiksiz
- [ ] Analytics dashboard ve KPI kartları doğru
- [ ] Reputation score ve güvenlik uyarıları gösteriliyor
- [ ] Moderasyon ve yanıt akışı problemsiz
- [ ] Notification entegrasyonu çalışıyor

### Design Acceptance

- [ ] Review ve analytics ekranları responsive
- [ ] Loading ve error states kullanıcı dostu
- [ ] UI consistency ve accessibility sağlandı

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
