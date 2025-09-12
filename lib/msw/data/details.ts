import { Job, ServicePackage, Proposal, Review } from '@/types';

// Extended job details for detail page
export const mockJobDetail: Job & {
  requirements: string[];
  attachments: { id: string; name: string; url: string; type: string }[];
  tags: string[];
  urgency: 'low' | 'medium' | 'high';
  expiresAt: string;
} = {
  id: 'job-123',
  title: 'Modern E-ticaret Web Sitesi Geliştirme',
  description: `
Şirketimiz için modern ve kullanıcı dostu bir e-ticaret web sitesi geliştirmek istiyoruz. Site responsive olmalı ve mobil uyumlu olmalıdır.

**Teknik Gereksinimler:**
- React.js veya Next.js framework
- Modern UI/UX tasarım
- Ödeme sistemi entegrasyonu  
- Admin paneli
- SEO optimizasyonu
- Performans optimizasyonu

**Proje Kapsamı:**
- Ana sayfa ve kategori sayfaları
- Ürün detay sayfaları
- Sepet ve ödeme sistemleri
- Kullanıcı hesap yönetimi
- Admin dashboard
- Mobil responsive tasarım

**Beklentilerimiz:**
- Yüksek performans ve hız
- Modern ve kullanışlı arayüz
- SEO dostu yapı
- Güvenli ödeme entegrasyonları
  `,
  category: 'Web Development',
  subcategory: 'Full-stack Development',
  budget: {
    type: 'fixed',
    amount: 20000,
    maxAmount: 25000,
  },
  timeline: '6-8 hafta',
  duration: '6-8 hafta',
  skills: [
    'React',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Node.js',
    'MongoDB',
  ],
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
    'Proje yönetimi deneyimi',
  ],
  attachments: [
    {
      id: 'att-1',
      name: 'proje-detaylari.pdf',
      url: '/uploads/attachments/proje-detaylari.pdf',
      type: 'application/pdf',
    },
    {
      id: 'att-2',
      name: 'design-mockup.fig',
      url: '/uploads/attachments/design-mockup.fig',
      type: 'application/octet-stream',
    },
  ],
  tags: ['urgent', 'budget-flexible', 'remote-friendly'],
  urgency: 'high',
  expiresAt: '2025-10-05T10:00:00Z',
};

// Package detail with 3-tier pricing
export const mockPackageDetail: ServicePackage & {
  overview: string;
  whatIncluded: string[];
  faq: { question: string; answer: string }[];
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
  addOns: {
    id: string;
    title: string;
    price: number;
    deliveryTime: number;
  }[];
  totalOrders: number;
  detailedReviews: Review[];
  relatedPackages: Partial<ServicePackage>[];
} = {
  id: 'pkg-789',
  title: 'Profesyonel Logo ve Kurumsal Kimlik Tasarımı',
  description: `
Markanızın profesyonel görünümü için özel logo ve kurumsal kimlik tasarımı hizmeti. 10+ yıllık deneyimim ile markanızı öne çıkaracak yaratıcı çözümler sunuyorum.

**Neden Beni Seçmelisiniz?**
- 10+ yıllık profesyonel deneyim
- 500+ başarılı proje
- Unlimited revizyon (Premium pakette)
- Hızlı teslimat
- %100 memnuniyet garantisi
  `,
  category: 'Grafik Tasarım',
  subcategory: 'Logo Tasarım',
  price: 500, // Basic price
  deliveryTime: 3, // Basic delivery time
  revisions: 2, // Basic revisions
  features: [
    'Logo konsept tasarımları',
    'Revizyon hakları',
    'Tüm dosya formatları',
    'Kurumsal renk paleti',
  ],
  images: [
    '/packages/logo-1-main.jpg',
    '/packages/logo-1-gallery-1.jpg',
    '/packages/logo-1-gallery-2.jpg',
    '/packages/logo-1-gallery-3.jpg',
  ],
  freelancerId: 'freelancer-321',
  freelancer: {
    id: 'freelancer-321',
    email: 'zeynep@designer.com',
    firstName: 'Zeynep',
    lastName: 'Demir',
    userType: 'freelancer',
    avatar: '/avatars/designer-1.jpg',
    location: 'İstanbul, Türkiye',
    title: 'Grafik Tasarımcı & Brand Uzmanı',
    skills: ['Logo Design', 'Brand Identity', 'Adobe Illustrator', 'Photoshop'],
    hourlyRate: 75,
    experience: 'expert',
    rating: 4.9,
    totalReviews: 89,
    totalEarnings: 125000,
    completedJobs: 156,
    responseTime: '1 saat içinde',
    availability: 'available',
    portfolio: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  orders: 134,
  rating: 4.8,
  reviews: 89,
  isActive: true,
  createdAt: '2025-07-01T00:00:00Z',
  updatedAt: '2025-09-01T10:00:00Z',
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
    {
      question: 'Telif hakları bana mı geçiyor?',
      answer: 'Evet, ödeme tamamlandıktan sonra tüm telif hakları size aittir.',
    },
    {
      question: 'Projem ne kadar sürer?',
      answer: 'Basic 3 gün, Standard 5 gün, Premium 7 gün sürmektedir.',
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
        'Antetli kağıt tasarımı',
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
        'Email imza tasarımı',
        'Presentation template',
      ],
      deliveryTime: 7,
      revisions: -1, // Unlimited
    },
  },
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
    {
      id: 'addon-3',
      title: 'Sosyal Medya Avatarları',
      price: 300,
      deliveryTime: 1,
    },
  ],
  totalOrders: 134,
  detailedReviews: [
    {
      id: 'rev-1',
      rating: 5,
      comment:
        'Harika bir çalışma oldu. Çok profesyonel ve yaratıcı. Zamanında teslim etti ve revizyonlarda çok yardımcı oldu.',
      reviewer: {
        id: 'user-111',
        email: 'ahmet@company.com',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        userType: 'employer',
        avatar: '/avatars/user-111.jpg',
        location: 'Ankara, Türkiye',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      reviewee: {
        id: 'freelancer-321',
        email: 'zeynep@designer.com',
        firstName: 'Zeynep',
        lastName: 'Demir',
        userType: 'freelancer',
        avatar: '/avatars/designer-1.jpg',
        location: 'İstanbul, Türkiye',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2025-09-01T00:00:00Z',
      },
      packageId: 'pkg-789',
      createdAt: '2025-08-15T14:30:00Z',
    },
    {
      id: 'rev-2',
      rating: 5,
      comment:
        'Mükemmel iş! Logo tasarımı beklentilerimi aştı. İletişimi çok iyi, her şeyi detaylıca açıklıyor.',
      reviewer: {
        id: 'user-222',
        email: 'fatma@startup.com',
        firstName: 'Fatma',
        lastName: 'Özkan',
        userType: 'employer',
        avatar: '/avatars/user-222.jpg',
        location: 'İstanbul, Türkiye',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      },
      reviewee: {
        id: 'freelancer-321',
        email: 'zeynep@designer.com',
        firstName: 'Zeynep',
        lastName: 'Demir',
        userType: 'freelancer',
        avatar: '/avatars/designer-1.jpg',
        location: 'İstanbul, Türkiye',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2025-09-01T00:00:00Z',
      },
      packageId: 'pkg-789',
      createdAt: '2025-08-10T09:15:00Z',
    },
  ],
  relatedPackages: [
    {
      id: 'pkg-790',
      title: 'Modern Web Sitesi Tasarımı',
      price: 1500,
      rating: 4.7,
      freelancer: {
        id: 'freelancer-321',
        firstName: 'Zeynep',
        lastName: 'Demir',
      },
    },
    {
      id: 'pkg-791',
      title: 'Sosyal Medya Tasarım Paketi',
      price: 800,
      rating: 4.9,
      freelancer: {
        id: 'freelancer-321',
        firstName: 'Zeynep',
        lastName: 'Demir',
      },
    },
  ],
};

// Mock proposals for the job
export const mockProposals: (Proposal & {
  milestones?: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }[];
  questions?: {
    question: string;
    answer: string;
  }[];
})[] = [
  {
    id: 'proposal-1',
    jobId: 'job-123',
    freelancerId: 'freelancer-1',
    freelancer: {
      id: 'freelancer-1',
      email: 'ali@developer.com',
      firstName: 'Ali',
      lastName: 'Özkan',
      userType: 'freelancer',
      avatar: '/avatars/freelancer-1.jpg',
      location: 'İstanbul, Türkiye',
      title: 'Senior React Developer',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js'],
      hourlyRate: 85,
      experience: 'expert',
      rating: 4.9,
      totalReviews: 156,
      totalEarnings: 235000,
      completedJobs: 127,
      responseTime: '1 saat içinde',
      availability: 'available',
      portfolio: [],
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2025-09-01T00:00:00Z',
    },
    coverLetter: `Merhaba, E-ticaret platformu geliştirme konusunda 5+ yıllık deneyimim var. Projenizi detaylarıyla inceledim ve beklentilerinizi tam olarak karşılayabileceğime eminim.

**Neden ben?**
- 20+ e-ticaret projesi tamamladım
- React/Next.js konusunda uzmanım
- Ödeme sistemleri entegrasyonu deneyimim var
- SEO ve performans optimizasyonu yapabilirim

**Önerdiğim teknoloji yığını:**
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Ödeme: Stripe, PayPal entegrasyonu
- Hosting: Vercel/AWS

Proje süresince düzenli güncellemeler vereceğim ve size özel admin paneli ile kontrol sağlayacağım.`,
    proposedBudget: 22000,
    proposedTimeline: '7 hafta',
    attachments: ['/uploads/proposals/portfolio-ecommerce.pdf'],
    status: 'pending',
    createdAt: '2025-09-06T14:30:00Z',
    updatedAt: '2025-09-06T14:30:00Z',
    milestones: [
      {
        title: 'UI/UX Tasarım ve Planlama',
        description: 'Wireframe, mockup ve teknik dokümantasyon',
        amount: 4000,
        dueDate: '2025-09-20T00:00:00Z',
      },
      {
        title: 'Frontend Geliştirme',
        description: 'Ana sayfa, kategori ve ürün sayfaları',
        amount: 8000,
        dueDate: '2025-10-10T00:00:00Z',
      },
      {
        title: 'Backend ve Entegrasyonlar',
        description: 'API geliştirme ve ödeme entegrasyonu',
        amount: 7000,
        dueDate: '2025-10-25T00:00:00Z',
      },
      {
        title: 'Test ve Canlıya Alma',
        description: 'Testing, bug fixes ve deployment',
        amount: 3000,
        dueDate: '2025-11-05T00:00:00Z',
      },
    ],
    questions: [
      {
        question: 'Hangi ödeme yöntemlerini entegre etmek istiyorsunuz?',
        answer:
          "Stripe, PayPal ve Türkiye'deki yaygın ödeme sistemlerini desteklerim.",
      },
      {
        question: 'Mobil uygulama da gerekli mi?',
        answer:
          'Web sitesi öncelikli ama ileride React Native ile mobil uygulama da geliştirebilirim.',
      },
    ],
  },
  {
    id: 'proposal-2',
    jobId: 'job-123',
    freelancerId: 'freelancer-2',
    freelancer: {
      id: 'freelancer-2',
      email: 'murat@webdev.com',
      firstName: 'Murat',
      lastName: 'Kaya',
      userType: 'freelancer',
      avatar: '/avatars/freelancer-2.jpg',
      location: 'Ankara, Türkiye',
      title: 'Full Stack Developer',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      hourlyRate: 70,
      experience: 'expert',
      rating: 4.7,
      totalReviews: 89,
      totalEarnings: 145000,
      completedJobs: 78,
      responseTime: '3 saat içinde',
      availability: 'available',
      portfolio: [],
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2025-09-01T00:00:00Z',
    },
    coverLetter: `Projenizi inceledim ve e-ticaret deneyimimle birlikte kaliteli bir çözüm sunabilirim. 

**Öne çıkan özelliklerim:**
- 15+ e-ticaret projesi
- AWS deployment deneyimi  
- Performans optimizasyonu uzmanı
- 24/7 destek

Proje tamamlandıktan sonra 3 ay ücretsiz teknik destek sağlayacağım.`,
    proposedBudget: 18500,
    proposedTimeline: '8 hafta',
    status: 'pending',
    createdAt: '2025-09-07T09:15:00Z',
    updatedAt: '2025-09-07T09:15:00Z',
  },
];
