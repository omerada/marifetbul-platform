# Sprint 4: İş İlanı & Paket Detay Sayfaları ve Teklif Sistemi - 2 hafta

## 🎯 Sprint Hedefleri

- İş ilanı detay sayfası ve teklif verme sistemi
- Paket detay sayfası ve satın alma işlemi
- Freelancer teklif oluşturma formu
- Employer teklif yönetimi sistemi
- Modal ve dialog sistemlerinin optimize edilmesi
- Multi-step form işlemlerinin geliştirilmesi

## 📱 Geliştirilecek Ekranlar

### İş İlanı Detay Sayfası

**Rol**: Both  
**Özellikler**:

- İş açıklaması, gereksinimler, beceriler
- Bütçe, süre, lokasyon bilgileri
- İşveren profil kartı ve istatistikleri
- Benzer iş ilanları önerileri
- Teklif verme formu (Freelancer için)
- Gelen teklifler listesi (Employer için)
- Favori ekleme/çıkarma
- Sosyal paylaşım butonları

### Paket Detay Sayfası

**Rol**: Both
**Özellikler**:

- Paket açıklaması, neler dahil, FAQ
- 3-tier pricing (Basic, Standard, Premium)
- Freelancer profil bilgileri ve portföyü
- Paket görselleri gallery
- Review ve rating sistemi
- Satın alma formu ve customize options
- Benzer paket önerileri
- Live chat/mesaj gönderme

### Teklif Oluşturma Modal

**Rol**: Freelancer
**Özellikler**:

- Multi-step form (Fiyat → Süre → Açıklama → Portfolio)
- Dosya ekleme (CV, portfolio örnekleri)
- Dinamik fiyat hesaplama
- Preview ve düzenleme
- Draft kaydetme özelliği
- Otomatik template önerileri

### Teklif Yönetimi Paneli

**Rol**: Employer
**Özellikler**:

- Gelen tekliflerin listelenmesi
- Teklif karşılaştırma tablosu
- Freelancer profil inceleme
- Mesajlaşma başlatma
- Teklif kabul/reddetme işlemleri
- Shortlist oluşturma

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `JobDetail` - İş ilanı detay sayfası
  - `ServiceDetail` - Paket detay sayfası
  - `ProposalForm` - Teklif oluşturma formu
  - `ProposalCard` - Teklif kartı
  - `PricingTiers` - 3-kademe fiyatlandırma
  - `ImageGallery` - Paket görselleri galerisi
  - `ReviewsSection` - Değerlendirmeler bölümü
  - `SimilarItems` - Benzer içerik önerileri
  - `ProposalManager` - Teklif yönetim paneli
  - `FileUploadArea` - Drag & drop dosya yükleme

- **Güncellenecek Component'lar**:
  - `Modal`, `Dialog` - Büyük form'lar için optimize
  - `Button` - Action button varyantları
  - `Card` - Detay sayfaları için extended layout
  - `Badge` - Status ve tag'ler için

- **UI Library Integration**:
  - `Tabs`, `Accordion`, `Carousel` (Shadcn/ui)
  - `RadioGroup`, `Checkbox`, `Select`
  - `Textarea`, `FileInput`, `Progress`

### User Flow

- **Freelancer Flow**: Marketplace → İş İlanı → Detay İnceleme → Teklif Ver → Confirmation → Takip
- **Employer Flow**: Marketplace → Paket → Detay İnceleme → Customize → Satın Al → Payment → Order Tracking

### States & Interactions

- **Loading States**: Detay yükleme, teklif gönderme, dosya upload
- **Error Handling**: Form validation, payment errors, network issues
- **Empty States**: Henüz teklif yok, boş portfolio
- **Success States**: Teklif gönderildi, satın alma tamamlandı
- **Interactive Elements**: Image zoom, pricing calculator, live preview

### Accessibility

- Image alt texts ve captions
- Form label associations
- Keyboard navigation for carousels
- Screen reader support for pricing tables
- Focus management in modals

## ⚙️ Fonksiyonel Özellikler

### Job Detail & Proposal System

**Açıklama**: İş ilanı detayları ile kapsamlı teklif oluşturma sistemi
**Employer Perspective**: İş detaylarını görüntüleme, gelen teklifleri yönetme
**Freelancer Perspective**: İş analizi, teklif hazırlama, portfolio ekleme
**Acceptance Criteria**:

- [ ] İş ilanı tüm detayları ile görüntülenir
- [ ] Freelancer kapsamlı teklif oluşturabilir
- [ ] Employer teklifleri karşılaştırabilir
- [ ] Dosya ekleme ve preview çalışır
- [ ] Real-time validation ve feedback

### Package Detail & Purchase System

**Açıklama**: Paket detayları ve esnek satın alma sistemi
**Employer Perspective**: Paket inceleme, customize, satın alma
**Freelancer Perspective**: Paket performansını görme, müşteri soruları
**Acceptance Criteria**:

- [ ] 3-tier pricing açık şekilde gösterilir
- [ ] Paket customization çalışır
- [ ] Review ve rating sistemi aktif
- [ ] Image gallery smooth navigation
- [ ] Purchase flow kesintisiz

### Proposal Management

**Açıklama**: Employer için teklif yönetimi ve karşılaştırma sistemi
**Employer Perspective**: Teklifleri listeleme, karşılaştırma, seçim yapma
**Freelancer Perspective**: Teklif durumunu takip etme, güncelleme
**Acceptance Criteria**:

- [ ] Teklifler organize şekilde listelenir
- [ ] Karşılaştırma tablosu functional
- [ ] Batch operations (toplu kabul/red)
- [ ] Freelancer ile direkt iletişim
- [ ] Status tracking ve notifications

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/jobs/:id`, `/api/v1/packages/:id`

#### GET /api/v1/jobs/:id

```typescript
interface JobDetailResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    budget: {
      min: number;
      max: number;
      type: 'fixed' | 'hourly';
    };
    duration: {
      value: number;
      unit: 'days' | 'weeks' | 'months';
    };
    location: string;
    category: string;
    employer: {
      id: string;
      name: string;
      companyName: string;
      avatar: string;
      rating: number;
      totalJobs: number;
      verificationStatus: 'verified' | 'unverified';
    };
    proposalsCount: number;
    proposals?: Proposal[]; // Sadece işveren görebilir
    postedAt: string;
    expiresAt: string;
    attachments: {
      id: string;
      name: string;
      url: string;
      type: string;
    }[];
    tags: string[];
    urgency: 'low' | 'medium' | 'high';
    status: 'active' | 'paused' | 'closed';
  };
  error?: string;
}

const mockJobDetail = {
  id: 'job-123',
  title: 'Modern E-ticaret Web Sitesi Geliştirme',
  description: `
    Şirketimiz için modern ve kullanıcı dostu bir e-ticaret web sitesi 
    geliştirmek istiyoruz. Site responsive olmalı ve mobil uyumlu olmalıdır.
    
    Teknik Gereksinimler:
    - React.js veya Next.js framework
    - Modern UI/UX tasarım
    - Ödeme sistemi entegrasyonu
    - Admin paneli
    - SEO optimizasyonu
  `,
  requirements: [
    '3+ yıl React/Next.js deneyimi',
    'E-ticaret projesi portfolio',
    'Responsive tasarım deneyimi',
    'Ödeme API entegrasyonu bilgisi',
    'Türkçe iletişim',
  ],
  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
  budget: {
    min: 15000,
    max: 25000,
    type: 'fixed' as const,
  },
  duration: {
    value: 6,
    unit: 'weeks' as const,
  },
  location: 'İstanbul (Remote OK)',
  category: 'Web Development',
  employer: {
    id: 'emp-456',
    name: 'Mehmet Kaya',
    companyName: 'TechCorp Solutions',
    avatar: '/avatars/employer-1.jpg',
    rating: 4.7,
    totalJobs: 23,
    verificationStatus: 'verified' as const,
  },
  proposalsCount: 12,
  postedAt: '2025-09-05T10:00:00Z',
  expiresAt: '2025-10-05T10:00:00Z',
  attachments: [
    {
      id: 'att-1',
      name: 'proje-detaylari.pdf',
      url: '/uploads/attachments/proje-detaylari.pdf',
      type: 'application/pdf',
    },
  ],
  tags: ['urgent', 'budget-flexible', 'remote-friendly'],
  urgency: 'high' as const,
  status: 'active' as const,
};
```

#### GET /api/v1/packages/:id

```typescript
interface PackageDetailResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    description: string;
    overview: string;
    whatIncluded: string[];
    faq: {
      question: string;
      answer: string;
    }[];
    pricing: {
      basic: {
        price: number;
        title: string;
        description: string;
        features: string[];
        deliveryTime: number;
        revisions: number;
      };
      standard: {
        price: number;
        title: string;
        description: string;
        features: string[];
        deliveryTime: number;
        revisions: number;
      };
      premium: {
        price: number;
        title: string;
        description: string;
        features: string[];
        deliveryTime: number;
        revisions: number;
      };
    };
    freelancer: {
      id: string;
      name: string;
      title: string;
      avatar: string;
      rating: number;
      totalReviews: number;
      responseTime: string;
      completedOrders: number;
      onlineStatus: 'online' | 'offline' | 'away';
    };
    images: string[];
    category: string;
    tags: string[];
    rating: number;
    totalOrders: number;
    reviews: Review[];
    relatedPackages: Package[];
    addOns: {
      id: string;
      title: string;
      price: number;
      deliveryTime: number;
    }[];
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

const mockPackageDetail = {
  id: 'pkg-789',
  title: 'Profesyonel Logo ve Kurumsal Kimlik Tasarımı',
  description: `
    Markanızın profesyonel görünümü için özel logo ve kurumsal kimlik 
    tasarımı hizmeti. 10+ yıllık deneyimim ile markanızı öne çıkaracak 
    yaratıcı çözümler sunuyorum.
  `,
  overview: 'Modern ve unutulmaz logo tasarımları ile markanızı güçlendirin.',
  whatIncluded: [
    'Logo konsept tasarımları (5 farklı versiyon)',
    'Revizyon hakları',
    'Tüm dosya formatları (AI, PNG, PDF, SVG)',
    'Kurumsal renk paleti',
    'Kullanım kılavuzu',
    'Telif hakkı transferi',
  ],
  faq: [
    {
      question: 'Kaç revizyon hakkım var?',
      answer:
        "Basic pakette 2, Standard'da 5, Premium'da unlimited revizyon hakkınız var.",
    },
    {
      question: 'Dosyaları hangi formatlarda alacağım?',
      answer:
        'AI, EPS, PDF, PNG, JPG formatlarında yüksek çözünürlüklü dosyalar.',
    },
  ],
  pricing: {
    basic: {
      price: 500,
      title: 'Temel Logo',
      description: 'Basit ve modern logo tasarımı',
      features: [
        '3 logo konsepti',
        '2 revizyon hakkı',
        'PNG ve JPG formatları',
        'Temel dosya paketi',
      ],
      deliveryTime: 3,
      revisions: 2,
    },
    standard: {
      price: 1200,
      title: 'Profesyonel Paket',
      description: 'Logo + kurumsal kimlik başlangıç paketi',
      features: [
        '5 logo konsepti',
        '5 revizyon hakkı',
        'Tüm dosya formatları',
        'Kurumsal renk paleti',
        'Kartvizit tasarımı',
      ],
      deliveryTime: 5,
      revisions: 5,
    },
    premium: {
      price: 2500,
      title: 'Tam Kimlik Paketi',
      description: 'Komple kurumsal kimlik çözümü',
      features: [
        '8 logo konsepti',
        'Unlimited revizyon',
        'Tam kurumsal kimlik seti',
        'Antetli kağıt tasarımı',
        'Sosyal medya kit',
        'Marka kullanım kılavuzu',
      ],
      deliveryTime: 7,
      revisions: -1, // Unlimited
    },
  },
  freelancer: {
    id: 'freelancer-321',
    name: 'Zeynep Demir',
    title: 'Grafik Tasarımcı & Brand Uzmanı',
    avatar: '/avatars/designer-1.jpg',
    rating: 4.9,
    totalReviews: 89,
    responseTime: '1 saat içinde',
    completedOrders: 156,
    onlineStatus: 'online' as const,
  },
  images: [
    '/packages/logo-1-main.jpg',
    '/packages/logo-1-gallery-1.jpg',
    '/packages/logo-1-gallery-2.jpg',
    '/packages/logo-1-gallery-3.jpg',
  ],
  category: 'Grafik Tasarım',
  tags: ['logo', 'kurumsal-kimlik', 'marka', 'tasarım'],
  rating: 4.8,
  totalOrders: 134,
  reviews: [
    {
      id: 'rev-1',
      userId: 'user-111',
      userName: 'Ahmet Yılmaz',
      userAvatar: '/avatars/user-111.jpg',
      rating: 5,
      comment: 'Harika bir çalışma oldu. Çok profesyonel ve yaratıcı.',
      createdAt: '2025-08-15T14:30:00Z',
      packageType: 'standard',
    },
  ],
  relatedPackages: [
    {
      id: 'pkg-790',
      title: 'Modern Web Sitesi Tasarımı',
      price: 1500,
      rating: 4.7,
      freelancerName: 'Zeynep Demir',
    },
  ],
  addOns: [
    {
      id: 'addon-1',
      title: 'Hızlı Teslimat (+1 gün)',
      price: 200,
      deliveryTime: -1,
    },
    {
      id: 'addon-2',
      title: 'Ekstra Revizyon (3 adet)',
      price: 150,
      deliveryTime: 0,
    },
  ],
  createdAt: '2025-07-01T00:00:00Z',
  updatedAt: '2025-09-01T10:00:00Z',
};
```

#### POST /api/v1/jobs/:id/proposals

```typescript
interface CreateProposalRequest {
  jobId: string;
  coverLetter: string;
  budget: {
    amount: number;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  milestones?: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }[];
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  questions?: {
    question: string;
    answer: string;
  }[];
}

interface CreateProposalResponse {
  success: boolean;
  data?: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
    submittedAt: string;
  };
  error?: string;
}

const mockProposalResponse = {
  success: true,
  data: {
    id: 'proposal-456',
    status: 'pending' as const,
    submittedAt: new Date().toISOString(),
  },
};
```

#### POST /api/v1/packages/:id/orders

```typescript
interface CreateOrderRequest {
  packageId: string;
  tier: 'basic' | 'standard' | 'premium';
  customizations?: {
    requirements: string;
    additionalInfo: string;
  };
  addOns?: string[]; // addon IDs
  urgentDelivery?: boolean;
}

interface CreateOrderResponse {
  success: boolean;
  data?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    estimatedDelivery: string;
    paymentRequired: boolean;
    paymentUrl?: string;
  };
  error?: string;
}

const mockOrderResponse = {
  success: true,
  data: {
    id: 'order-789',
    orderNumber: 'ORD-2025-001234',
    totalAmount: 1200,
    estimatedDelivery: '2025-09-20T00:00:00Z',
    paymentRequired: true,
    paymentUrl: '/payment/order-789',
  },
};
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/details.ts
export const detailHandlers = [
  http.get('/api/v1/jobs/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const job = mockJobs.find((j) => j.id === id);

    if (!job) {
      return HttpResponse.json(
        { success: false, error: 'İş ilanı bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: job,
    });
  }),

  http.get('/api/v1/packages/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 600));

    const packageDetail = mockPackages.find((p) => p.id === id);

    if (!packageDetail) {
      return HttpResponse.json(
        { success: false, error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: packageDetail,
    });
  }),

  http.post('/api/v1/jobs/:id/proposals', async ({ params, request }) => {
    const { id } = params;
    const proposalData = await request.json();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validation
    if (!proposalData.coverLetter || proposalData.coverLetter.length < 50) {
      return HttpResponse.json(
        { success: false, error: 'Kapak mektubu en az 50 karakter olmalıdır' },
        { status: 400 }
      );
    }

    if (!proposalData.budget || proposalData.budget.amount <= 0) {
      return HttpResponse.json(
        { success: false, error: 'Geçerli bir teklif tutarı giriniz' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: `proposal-${Date.now()}`,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
    });
  }),

  http.post('/api/v1/packages/:id/orders', async ({ params, request }) => {
    const { id } = params;
    const orderData = await request.json();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const packageDetail = mockPackages.find((p) => p.id === id);

    if (!packageDetail) {
      return HttpResponse.json(
        { success: false, error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    const tierPricing = packageDetail.pricing[orderData.tier];
    let totalAmount = tierPricing.price;

    // Add-on calculations
    if (orderData.addOns?.length) {
      const addOnCosts = orderData.addOns.reduce((sum, addonId) => {
        const addon = packageDetail.addOns.find((a) => a.id === addonId);
        return sum + (addon?.price || 0);
      }, 0);
      totalAmount += addOnCosts;
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: `order-${Date.now()}`,
        orderNumber: `ORD-2025-${Math.random().toString().substring(2, 8)}`,
        totalAmount,
        estimatedDelivery: new Date(
          Date.now() + tierPricing.deliveryTime * 24 * 60 * 60 * 1000
        ).toISOString(),
        paymentRequired: true,
        paymentUrl: `/payment/order-${Date.now()}`,
      },
    });
  }),

  http.get('/api/v1/jobs/:id/proposals', async ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    const proposals = mockProposals.filter((p) => p.jobId === id);

    return HttpResponse.json({
      success: true,
      data: proposals,
      meta: {
        total: proposals.length,
        pending: proposals.filter((p) => p.status === 'pending').length,
        accepted: proposals.filter((p) => p.status === 'accepted').length,
      },
    });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface JobDetailStore {
  // State properties
  currentJob: Job | null;
  proposals: Proposal[];
  isLoading: boolean;
  isSubmittingProposal: boolean;
  error: string | null;

  // Actions
  fetchJobDetail: (jobId: string) => Promise<void>;
  fetchProposals: (jobId: string) => Promise<void>;
  submitProposal: (proposalData: CreateProposalRequest) => Promise<void>;
  updateProposalStatus: (
    proposalId: string,
    status: 'accepted' | 'rejected'
  ) => Promise<void>;
  clearError: () => void;
}

interface PackageDetailStore {
  // State properties
  currentPackage: Package | null;
  reviews: Review[];
  isLoading: boolean;
  isOrdering: boolean;
  error: string | null;
  selectedTier: 'basic' | 'standard' | 'premium';
  selectedAddOns: string[];
  customizations: {
    requirements: string;
    additionalInfo: string;
  };

  // Actions
  fetchPackageDetail: (packageId: string) => Promise<void>;
  fetchReviews: (packageId: string) => Promise<void>;
  createOrder: (orderData: CreateOrderRequest) => Promise<string>; // Returns order ID
  setSelectedTier: (tier: 'basic' | 'standard' | 'premium') => void;
  toggleAddOn: (addOnId: string) => void;
  updateCustomizations: (
    customizations: Partial<{
      requirements: string;
      additionalInfo: string;
    }>
  ) => void;
  calculateTotal: () => number;
  clearError: () => void;
}

const useJobDetailStore = create<JobDetailStore>((set, get) => ({
  currentJob: null,
  proposals: [],
  isLoading: false,
  isSubmittingProposal: false,
  error: null,

  fetchJobDetail: async (jobId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`);
      const data = await response.json();

      if (data.success) {
        set({
          currentJob: data.data,
          isLoading: false,
        });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'İş ilanı yüklenemedi', isLoading: false });
    }
  },

  submitProposal: async (proposalData: CreateProposalRequest) => {
    set({ isSubmittingProposal: true, error: null });

    try {
      const response = await fetch(
        `/api/v1/jobs/${proposalData.jobId}/proposals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
          body: JSON.stringify(proposalData),
        }
      );

      const data = await response.json();

      if (data.success) {
        set({
          isSubmittingProposal: false,
        });

        // Show success notification
        useToast.getState().showToast({
          type: 'success',
          message: 'Teklifiniz başarıyla gönderildi!',
        });
      } else {
        set({ error: data.error, isSubmittingProposal: false });
      }
    } catch (error) {
      set({ error: 'Teklif gönderilemedi', isSubmittingProposal: false });
    }
  },
}));

const usePackageDetailStore = create<PackageDetailStore>((set, get) => ({
  currentPackage: null,
  reviews: [],
  isLoading: false,
  isOrdering: false,
  error: null,
  selectedTier: 'basic',
  selectedAddOns: [],
  customizations: {
    requirements: '',
    additionalInfo: '',
  },

  fetchPackageDetail: async (packageId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/v1/packages/${packageId}`);
      const data = await response.json();

      if (data.success) {
        set({
          currentPackage: data.data,
          reviews: data.data.reviews,
          isLoading: false,
        });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Paket detayları yüklenemedi', isLoading: false });
    }
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    set({ isOrdering: true, error: null });

    try {
      const response = await fetch(
        `/api/v1/packages/${orderData.packageId}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (data.success) {
        set({ isOrdering: false });

        // Navigate to payment or order confirmation
        useToast.getState().showToast({
          type: 'success',
          message: 'Sipariş başarıyla oluşturuldu!',
        });

        return data.data.id;
      } else {
        set({ error: data.error, isOrdering: false });
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: 'Sipariş oluşturulamadı', isOrdering: false });
      throw error;
    }
  },

  calculateTotal: () => {
    const { currentPackage, selectedTier, selectedAddOns } = get();

    if (!currentPackage) return 0;

    let total = currentPackage.pricing[selectedTier].price;

    selectedAddOns.forEach((addOnId) => {
      const addOn = currentPackage.addOns.find((a) => a.id === addOnId);
      if (addOn) {
        total += addOn.price;
      }
    });

    return total;
  },

  setSelectedTier: (tier) => set({ selectedTier: tier }),
  toggleAddOn: (addOnId) =>
    set((state) => ({
      selectedAddOns: state.selectedAddOns.includes(addOnId)
        ? state.selectedAddOns.filter((id) => id !== addOnId)
        : [...state.selectedAddOns, addOnId],
    })),
}));
```

### Custom Hooks

```typescript
// hooks/useJobDetail.ts
export function useJobDetail(jobId: string) {
  const store = useJobDetailStore();
  const { user } = useAuth();

  useEffect(() => {
    if (jobId) {
      store.fetchJobDetail(jobId);
      if (user?.userType === 'employer') {
        store.fetchProposals(jobId);
      }
    }
  }, [jobId, user?.userType]);

  const isJobOwner = user?.id === store.currentJob?.employer.id;
  const canPropose = user?.userType === 'freelancer' && !isJobOwner;

  return {
    ...store,
    isJobOwner,
    canPropose,
  };
}

// hooks/usePackageDetail.ts
export function usePackageDetail(packageId: string) {
  const store = usePackageDetailStore();
  const { user } = useAuth();

  useEffect(() => {
    if (packageId) {
      store.fetchPackageDetail(packageId);
      store.fetchReviews(packageId);
    }
  }, [packageId]);

  const isPackageOwner = user?.id === store.currentPackage?.freelancer.id;
  const canOrder = user?.userType === 'employer' && !isPackageOwner;

  return {
    ...store,
    isPackageOwner,
    canOrder,
  };
}

// hooks/useProposalForm.ts
export function useProposalForm(jobId: string) {
  const { submitProposal, isSubmittingProposal, error } = useJobDetailStore();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      jobId,
      budget: { type: 'fixed' },
      timeline: { unit: 'days' },
    },
  });

  const handleFileUpload = useCallback(async (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    for (const file of newFiles) {
      const fileId = file.name + file.size;

      // Progress simulation
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }, []);

  const onSubmit = async (data: ProposalFormData) => {
    try {
      // Upload files first if any
      const attachments = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          url: `/uploads/proposals/${file.name}`,
          type: file.type,
        }))
      );

      await submitProposal({
        ...data,
        attachments,
      });

      // Reset form on success
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Proposal submission error:', error);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isSubmittingProposal,
    error,
    files,
    uploadProgress,
    handleFileUpload,
    removeFile: (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    },
    budgetAmount: watch('budget.amount'),
    timelineValue: watch('timeline.value'),
  };
}
```

### Form Validation (Zod)

```typescript
// lib/validations/proposals.ts
export const proposalSchema = z.object({
  jobId: z.string().min(1, 'İş ID gereklidir'),
  coverLetter: z
    .string()
    .min(50, 'Kapak mektubu en az 50 karakter olmalıdır')
    .max(2000, 'Kapak mektubu en fazla 2000 karakter olabilir'),
  budget: z.object({
    amount: z
      .number()
      .min(1, 'Teklif tutarı en az 1 TL olmalıdır')
      .max(1000000, 'Teklif tutarı çok yüksek'),
    type: z.enum(['fixed', 'hourly'], {
      errorMap: () => ({ message: 'Geçerli bir ödeme türü seçiniz' }),
    }),
  }),
  timeline: z.object({
    value: z
      .number()
      .min(1, 'Süre en az 1 olmalıdır')
      .max(365, 'Süre çok uzun'),
    unit: z.enum(['days', 'weeks', 'months'], {
      errorMap: () => ({ message: 'Geçerli bir zaman birimi seçiniz' }),
    }),
  }),
  milestones: z
    .array(
      z.object({
        title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır'),
        description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
        amount: z.number().min(1, 'Tutar pozitif olmalıdır'),
        dueDate: z.string().refine((date) => new Date(date) > new Date(), {
          message: 'Teslim tarihi gelecekte olmalıdır',
        }),
      })
    )
    .optional(),
  questions: z
    .array(
      z.object({
        question: z.string().min(5),
        answer: z.string().min(5),
      })
    )
    .optional(),
});

export const orderSchema = z.object({
  packageId: z.string().min(1, 'Paket ID gereklidir'),
  tier: z.enum(['basic', 'standard', 'premium'], {
    errorMap: () => ({ message: 'Geçerli bir paket seviyesi seçiniz' }),
  }),
  customizations: z
    .object({
      requirements: z
        .string()
        .max(1000, 'Özel istekler en fazla 1000 karakter olabilir')
        .optional(),
      additionalInfo: z
        .string()
        .max(500, 'Ek bilgiler en fazla 500 karakter olabilir')
        .optional(),
    })
    .optional(),
  addOns: z.array(z.string()).optional(),
  urgentDelivery: z.boolean().optional(),
});

export type ProposalFormData = z.infer<typeof proposalSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
```

### Component Structure

```typescript
// components/features/JobDetail.tsx
interface JobDetailProps {
  jobId: string;
}

export function JobDetail({ jobId }: JobDetailProps) {
  const {
    currentJob,
    proposals,
    isLoading,
    error,
    isJobOwner,
    canPropose,
  } = useJobDetail(jobId);
  const [showProposalForm, setShowProposalForm] = useState(false);

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (error || !currentJob) {
    return (
      <ErrorState
        message={error || 'İş ilanı bulunamadı'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentJob.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(currentJob.postedAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {currentJob.location}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {currentJob.proposalsCount} teklif
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₺{currentJob.budget.min.toLocaleString()} - ₺
              {currentJob.budget.max.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {currentJob.budget.type === 'fixed' ? 'Sabit fiyat' : 'Saatlik'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {canPropose && (
            <Button
              size="lg"
              onClick={() => setShowProposalForm(true)}
              className="px-8"
            >
              <FileText className="h-4 w-4 mr-2" />
              Teklif Ver
            </Button>
          )}

          <Button variant="outline" size="lg">
            <Heart className="h-4 w-4 mr-2" />
            Favorilere Ekle
          </Button>

          <Button variant="outline" size="lg">
            <Share2 className="h-4 w-4 mr-2" />
            Paylaş
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>İş Açıklaması</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <ReactMarkdown>{currentJob.description}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Gereksinimler</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentJob.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Gerekli Beceriler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentJob.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proposals Section (for employer) */}
          {isJobOwner && proposals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gelen Teklifler ({proposals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onAccept={() => {}}
                      onReject={() => {}}
                      onMessage={() => {}}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Employer Info & Similar Jobs */}
        <div className="space-y-6">
          {/* Employer Card */}
          <Card>
            <CardHeader>
              <CardTitle>İşveren Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={currentJob.employer.avatar} />
                  <AvatarFallback>
                    {currentJob.employer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{currentJob.employer.name}</h3>
                  <p className="text-sm text-gray-600">
                    {currentJob.employer.companyName}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Değerlendirme:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{currentJob.employer.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Toplam İş:</span>
                  <span>{currentJob.employer.totalJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durum:</span>
                  <Badge
                    variant={
                      currentJob.employer.verificationStatus === 'verified'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {currentJob.employer.verificationStatus === 'verified'
                      ? 'Doğrulanmış'
                      : 'Doğrulanmamış'}
                  </Badge>
                </div>
              </div>

              <Button className="w-full mt-4" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Mesaj Gönder
              </Button>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Benzer İş İlanları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Similar job items would go here */}
                <div className="text-sm text-gray-600">
                  Benzer iş ilanları yükleniyor...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proposal Form Modal */}
      <ProposalModal
        isOpen={showProposalForm}
        onClose={() => setShowProposalForm(false)}
        jobId={jobId}
        job={currentJob}
      />
    </div>
  );
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] İş ilanı detay sayfası completely implemented with full information
- [ ] Paket detay sayfası 3-tier pricing ile functional
- [ ] Freelancer teklif oluşturma sistemi working smoothly
- [ ] Employer teklif yönetimi ve karşılaştırma sistemi
- [ ] File upload system proposals için implemented
- [ ] Package order creation ve customization options
- [ ] Responsive design (mobile, tablet, desktop) tested

### Technical Deliverables

- [ ] JobDetailStore ve PackageDetailStore Zustand stores
- [ ] useJobDetail, usePackageDetail, useProposalForm custom hooks
- [ ] Detail pages TypeScript interfaces completely defined
- [ ] Zod validation schemas for proposals ve orders
- [ ] MSW handlers for detail endpoints ve CRUD operations
- [ ] Modal ve dialog component system enhanced
- [ ] Unit tests for detail components ve forms

### Quality Deliverables

- [ ] Accessibility compliance for forms ve detail pages
- [ ] Cross-browser compatibility verified
- [ ] Performance optimized (detail page load <2s)
- [ ] Code review completed for proposal system
- [ ] File upload security ve validation implemented

## ✅ Test Scenarios

### User Journey Tests

- **Freelancer Journey**:
  1. Marketplace → İş İlanı Seç → Detay İncele
  2. Teklif Form Doldur → Dosya Ekle → Gönder
  3. Teklif Durumu Takip → Kabul/Red Bildirimi

- **Employer Journey**:
  1. Marketplace → Paket Seç → Detay İncele
  2. Tier Seç → Customize → Add-on Ekle
  3. Sipariş Oluştur → Payment → Confirmation

### Edge Cases

- **Large file uploads**: Progress indication, file type validation
- **Form abandonment**: Draft saving, data persistence
- **Network interruption**: Retry mechanisms, data recovery
- **Simultaneous proposals**: Race condition handling
- **Invalid pricing**: Real-time validation, error feedback

### Performance Tests

- Detail page load time: <2 seconds with full content
- Proposal form submission: <3 seconds end-to-end
- Image gallery navigation: Smooth 60fps transitions
- File upload progress: Accurate progress indication

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] İş ilanı detayları eksiksiz gösteriliyor
- [ ] Paket pricing tables interactive ve accurate
- [ ] Proposal form validation comprehensive ve user-friendly
- [ ] File upload works with progress indication
- [ ] Order creation seamless ve error-free
- [ ] Employer teklif karşılaştırması functional

### Design Acceptance

- [ ] Detail pages visually appealing ve consistent
- [ ] Forms responsive ve mobile-friendly
- [ ] Image galleries smooth ve accessible
- [ ] Loading states informative ve professional
- [ ] Error states clear ve actionable

### Technical Acceptance

- [ ] TypeScript strict mode compliance maintained
- [ ] Zero console errors or warnings
- [ ] API calls optimized ve efficient
- [ ] Store state management clean ve predictable
- [ ] Component reusability maximized
- [ ] Security best practices implemented

## 📊 Definition of Done

- [ ] All functional requirements implemented ve thoroughly tested
- [ ] Mobile responsiveness verified across all devices
- [ ] Browser compatibility confirmed (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility audit passed (WCAG 2.1 AA standards)
- [ ] Unit ve integration tests passing (%80+ coverage)
- [ ] Performance benchmarks met (Lighthouse >90)
- [ ] Security review completed for file uploads ve payments
- [ ] Code review approved by senior developer
- [ ] Technical documentation updated ve comprehensive
- [ ] User acceptance testing completed successfully
