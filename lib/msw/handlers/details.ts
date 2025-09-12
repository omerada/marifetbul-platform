import { http, HttpResponse } from 'msw';

// Mock job detail data
const mockJobDetail = {
  id: 'job-123',
  title: 'Modern E-ticaret Web Sitesi Geliştirme',
  description:
    'Şirketimiz için modern ve kullanıcı dostu bir e-ticaret web sitesi geliştirmek istiyoruz.',
  category: 'Web Development',
  subcategory: 'Full-stack Development',
  budget: {
    type: 'fixed',
    amount: 20000,
    maxAmount: 25000,
  },
  timeline: '6-8 hafta',
  duration: '6-8 hafta',
  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
  experienceLevel: 'expert',
  location: 'İstanbul (Remote OK)',
  isRemote: true,
  status: 'open',
  employerId: 'emp-456',
  employer: {
    id: 'emp-456',
    email: 'mehmet@techcorp.com',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    userType: 'employer',
    avatar: '/avatars/employer-1.jpg',
    location: 'İstanbul, Türkiye',
    companyName: 'TechCorp Solutions',
    industry: 'Teknoloji',
    totalSpent: 150000,
    activeJobs: 5,
    completedJobs: 23,
    rating: 4.7,
    totalReviews: 28,
    reviewsCount: 28,
    totalJobs: 28,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
  proposalsCount: 12,
  createdAt: '2025-09-05T10:00:00Z',
  updatedAt: '2025-09-05T10:00:00Z',
  requirements: [
    '3+ yıl React/Next.js deneyimi',
    'E-ticaret projesi portfolio',
    'Responsive tasarım deneyimi',
    'Ödeme API entegrasyonu bilgisi',
    'Türkçe iletişim',
  ],
  attachments: [
    {
      id: 'att-1',
      name: 'proje-detaylari.pdf',
      url: '/uploads/attachments/proje-detaylari.pdf',
      type: 'application/pdf',
    },
  ],
  tags: ['urgent', 'budget-flexible', 'remote-friendly'],
  urgency: 'high',
  expiresAt: '2025-10-05T10:00:00Z',
};

// Mock proposals
const mockProposals = [
  {
    id: 'proposal-1',
    jobId: 'job-123',
    freelancerId: 'freelancer-456',
    freelancer: {
      id: 'freelancer-456',
      email: 'ali@developer.com',
      firstName: 'Ali',
      lastName: 'Güven',
      userType: 'freelancer',
      avatar: '/avatars/developer-1.jpg',
      location: 'Ankara, Türkiye',
      title: 'Full-stack Developer',
      skills: ['React', 'Node.js', 'TypeScript'],
      hourlyRate: 85,
      experience: 'expert',
      rating: 4.8,
      totalReviews: 67,
      totalEarnings: 95000,
      completedJobs: 89,
      responseTime: '2 saat içinde',
      availability: 'available',
      portfolio: [],
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2025-09-01T00:00:00Z',
    },
    coverLetter:
      'Merhaba! E-ticaret projeniz için size mükemmel bir çözüm sunabilirim.',
    proposedBudget: 22000,
    proposedTimeline: '7 hafta',
    status: 'pending',
    createdAt: '2025-09-07T09:00:00Z',
    updatedAt: '2025-09-07T09:00:00Z',
  },
];

// Mock package detail data
const mockPackageDetail = {
  id: 'pkg-789',
  title: 'Profesyonel Logo ve Kurumsal Kimlik Tasarımı',
  description:
    'Markanız için modern ve etkileyici logo tasarımı. Kurumsal kimlik paketiniz ile birlikte, markanızın tüm ihtiyaçlarını karşıladığımız kapsamlı bir hizmet sunuyoruz.',
  category: 'Grafik Tasarım',
  subcategory: 'Logo Tasarımı',
  images: [
    '/packages/logo-portfolio-1.jpg',
    '/packages/logo-portfolio-2.jpg',
    '/packages/logo-portfolio-3.jpg',
  ],
  price: 500, // Basic tier price for compatibility
  rating: 4.9,
  reviews: 247,
  orders: 1840,
  freelancerId: 'freelancer-789',
  freelancer: {
    id: 'freelancer-789',
    email: 'ayse@design.com',
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    userType: 'freelancer',
    avatar: '/avatars/freelancer-2.jpg',
    location: 'Ankara, Türkiye',
    skills: ['Adobe Illustrator', 'Photoshop', 'Brand Design', 'Typography'],
    rating: 4.9,
    totalReviews: 247,
    completedJobs: 312,
    responseTime: '2 saat içinde',
    createdAt: '2023-03-15T00:00:00Z',
    hourlyRate: 150,
    availability: 'available',
    portfolioUrl: 'https://aysedesign.com',
    about:
      'Grafik tasarım alanında 8 yıllık deneyime sahip profesyonel tasarımcıyım.',
    languages: ['Türkçe', 'İngilizce'],
    education: [],
    certifications: [],
    portfolio: [],
  },
  deliveryTime: 3,
  revisions: 3,
  features: [
    'Özgün ve modern logo tasarımı',
    'Yüksek çözünürlükte dosyalar',
    'Farklı format seçenekleri (PNG, JPG, SVG)',
    'Sınırsız renk seçeneği',
    'Telif hakkı devri',
  ],
  tags: ['logo', 'tasarım', 'brand', 'kurumsal'],
  isActive: true,
  totalOrders: 1840,
  faq: [
    {
      question: 'Kaç gün içinde teslim edilir?',
      answer: 'Seçtiğiniz pakete göre 3-7 gün arasında teslim ediyoruz.',
    },
    {
      question: 'Revizyon hakkım var mı?',
      answer:
        'Evet, her pakette belirtilen sayıda ücretsiz revizyon hakkınız bulunmaktadır.',
    },
  ],
  pricing: {
    basic: {
      price: 500,
      title: 'Temel Logo',
      description: 'Basit ve etkili logo tasarımı',
      features: [
        '1 logo konsepti',
        '3 revizyon hakkı',
        'PNG ve JPG formatları',
        'Yüksek çözünürlük dosyalar',
      ],
      deliveryTime: 3,
      revisions: 3,
    },
    standard: {
      price: 1200,
      title: 'Standart Paket',
      description: 'Logo + temel kurumsal kimlik',
      features: [
        '3 logo konsepti',
        '5 revizyon hakkı',
        'Tüm formatlar (PNG, JPG, SVG, AI)',
        'Kartvizit tasarımı',
        'Antetli kağıt tasarımı',
        'Sosyal medya profil fotoğrafları',
      ],
      deliveryTime: 5,
      revisions: 5,
    },
    premium: {
      price: 2500,
      title: 'Premium Kimlik Paketi',
      description: 'Komple kurumsal kimlik çözümü',
      features: [
        '5 logo konsepti',
        'Sınırsız revizyon',
        'Tüm formatlar + kaynak dosyalar',
        'Kartvizit, antetli kağıt, zarf tasarımı',
        'Sosyal medya kit (Facebook, Instagram, LinkedIn)',
        'Marka rehberi (Brand guideline)',
        'Favicon tasarımı',
        'E-posta imza tasarımı',
      ],
      deliveryTime: 7,
      revisions: -1, // Unlimited
    },
  },
  addOns: [
    {
      id: 'addon-1',
      title: 'Hızlı Teslimat (24 saat)',
      price: 300,
      deliveryTime: -2, // Reduces delivery time by 2 days
    },
    {
      id: 'addon-2',
      title: 'Ekstra Revizyon (+3 adet)',
      price: 150,
      deliveryTime: 0,
    },
    {
      id: 'addon-3',
      title: 'Animasyonlu Logo',
      price: 450,
      deliveryTime: 2,
    },
  ],
  detailedReviews: [
    {
      id: 'review-1',
      rating: 5,
      comment:
        'Harika bir çalışma oldu. Tam istediğim gibi modern ve etkileyici bir logo tasarladı.',
      reviewer: {
        id: 'user-1',
        firstName: 'Mehmet',
        lastName: 'Öz',
        avatar: '/avatars/user-1.jpg',
      },
      reviewee: {
        id: 'freelancer-789',
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
      },
      packageId: 'pkg-789',
      createdAt: '2024-11-15T14:30:00Z',
    },
    {
      id: 'review-2',
      rating: 5,
      comment:
        'Çok profesyonel yaklaşım, zamanında teslimat ve mükemmel kalite. Kesinlikle tavsiye ederim.',
      reviewer: {
        id: 'user-2',
        firstName: 'Fatma',
        lastName: 'Kara',
        avatar: '/avatars/user-2.jpg',
      },
      reviewee: {
        id: 'freelancer-789',
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
      },
      packageId: 'pkg-789',
      createdAt: '2024-11-10T09:15:00Z',
    },
  ],
  relatedPackages: [
    {
      id: 'pkg-790',
      title: 'Web Sitesi Tasarımı',
      price: 2000,
      rating: 4.8,
      freelancer: {
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
      },
    },
  ],
  createdAt: '2024-05-20T00:00:00Z',
  updatedAt: '2024-12-01T00:00:00Z',
};

export const detailHandlers = [
  // Get job detail
  http.get('/api/v1/jobs/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (id === 'job-123') {
      return HttpResponse.json({
        success: true,
        data: mockJobDetail,
      });
    }

    return HttpResponse.json(
      { success: false, error: 'İş ilanı bulunamadı' },
      { status: 404 }
    );
  }),

  // Get package detail
  http.get('/api/v1/packages/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (id === 'pkg-789') {
      return HttpResponse.json({
        success: true,
        data: mockPackageDetail,
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Paket bulunamadı' },
      { status: 404 }
    );
  }),

  // Submit proposal
  http.post('/api/v1/jobs/:id/proposals', async ({ params, request }) => {
    const jobId = params.id;
    const proposalData = (await request.json()) as {
      coverLetter: string;
      budget: { amount: number; type: string };
      timeline: { value: number; unit: string };
    };

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

    // Simulate success
    return HttpResponse.json({
      success: true,
      data: {
        id: `proposal-${Date.now()}`,
        jobId: jobId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
    });
  }),

  // Get job proposals (for employers)
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

    if (id === 'job-123') {
      return HttpResponse.json({
        success: true,
        data: mockProposals,
        meta: {
          total: mockProposals.length,
          pending: mockProposals.filter((p) => p.status === 'pending').length,
          accepted: mockProposals.filter((p) => p.status === 'accepted').length,
        },
      });
    }

    return HttpResponse.json({
      success: true,
      data: [],
      meta: { total: 0, pending: 0, accepted: 0 },
    });
  }),

  // Create order for package
  http.post('/api/v1/packages/:id/orders', async ({ params, request }) => {
    const { id } = params;
    const orderData = (await request.json()) as {
      tier: 'basic' | 'standard' | 'premium';
      addOns?: string[];
      customizations?: {
        requirements: string;
        additionalInfo: string;
      };
    };

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (id !== 'pkg-789') {
      return HttpResponse.json(
        { success: false, error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    // Calculate total based on tier and add-ons
    let totalAmount = mockPackageDetail.pricing[orderData.tier].price;

    if (orderData.addOns?.length) {
      const addOnCosts = orderData.addOns.reduce(
        (sum: number, addonId: string) => {
          const addon = mockPackageDetail.addOns.find((a) => a.id === addonId);
          return sum + (addon?.price || 0);
        },
        0
      );
      totalAmount += addOnCosts;
    }

    const estimatedDelivery = new Date(
      Date.now() +
        mockPackageDetail.pricing[orderData.tier].deliveryTime *
          24 *
          60 *
          60 *
          1000
    );

    return HttpResponse.json({
      success: true,
      data: {
        id: `order-${Date.now()}`,
        orderNumber: `ORD-2025-${Math.random().toString().substring(2, 8)}`,
        totalAmount,
        estimatedDelivery: estimatedDelivery.toISOString(),
        paymentRequired: true,
        paymentUrl: `/payment/order-${Date.now()}`,
      },
    });
  }),

  // Update proposal status (accept/reject)
  http.patch('/api/v1/proposals/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = (await request.json()) as {
      status: 'accepted' | 'rejected';
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!['accepted', 'rejected'].includes(status)) {
      return HttpResponse.json(
        { success: false, error: 'Geçersiz durum' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id,
        status,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Get package reviews
  http.get('/api/v1/packages/:id/reviews', async ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '5');

    await new Promise((resolve) => setTimeout(resolve, 400));

    if (id === 'pkg-789') {
      const startIndex = (page - 1) * limit;
      const reviews = mockPackageDetail.detailedReviews.slice(
        startIndex,
        startIndex + limit
      );

      return HttpResponse.json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total: mockPackageDetail.detailedReviews.length,
          totalPages: Math.ceil(
            mockPackageDetail.detailedReviews.length / limit
          ),
        },
      });
    }

    return HttpResponse.json({
      success: true,
      data: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
    });
  }),

  // File upload simulation
  http.post('/api/v1/upload', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random upload success/failure
    if (Math.random() > 0.1) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      return HttpResponse.json({
        success: true,
        data: {
          id: `file-${Date.now()}`,
          name: file?.name || 'uploaded-file',
          url: `/uploads/${file?.name || 'file.pdf'}`,
          type: file?.type || 'application/octet-stream',
          size: file?.size || 1024,
          uploadedAt: new Date().toISOString(),
        },
      });
    } else {
      return HttpResponse.json(
        { success: false, error: 'Dosya yüklenemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }
  }),
];
