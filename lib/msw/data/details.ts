import { JobDetail, PackageDetail, Proposal, Review } from '@/types';

// Simple mock job detail
export const mockJobDetail: JobDetail = {
  id: 'job-123',
  title: 'Modern E-ticaret Web Sitesi Geliştirme',
  description: `Şirketimiz için modern ve kullanıcı dostu bir e-ticaret web sitesi geliştirmek istiyoruz. Site responsive olmalı ve mobil uyumlu olmalıdır.

**Teknik Gereksinimler:**
- React.js veya Next.js framework
- Modern UI/UX tasarım
- Ödeme sistemi entegrasyonu
- Admin paneli
- SEO optimize
- Hızlı yükleme süresi`,
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
    firstName: 'Mehmet',
    lastName: 'Kaya',
    avatar: '/avatars/employer-1.jpg',
  },
  proposals: [],
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
      id: '1',
      name: 'proje-detaylari.pdf',
      type: 'application/pdf',
      filename: 'proje-detaylari.pdf',
      size: 2048576,
      mimetype: 'application/pdf',
      url: '/attachments/proje-detaylari.pdf',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'wireframes.fig',
      type: 'application/octet-stream',
      filename: 'wireframes.fig',
      size: 1024768,
      mimetype: 'application/octet-stream',
      url: '/attachments/wireframes.fig',
      uploadedAt: new Date().toISOString(),
    },
  ],
};

// Package detail data
export const mockPackageDetail: PackageDetail = {
  id: 'pkg-789',
  title: 'Profesyonel Logo ve Kurumsal Kimlik Tasarımı',
  description: `Markanız için modern ve etkileyici logo tasarımı. Kurumsal kimlik paketiniz ile birlikte, markanızın tüm ihtiyaçlarını karşıladığımız kapsamlı bir hizmet sunuyoruz.

Uzun yıllardır grafik tasarım alanında faaliyet göstermekteyiz ve birçok başarılı proje gerçekleştirdik.`,
  category: 'Grafik Tasarım',
  categoryId: 'cat-design',
  subcategory: 'Logo Tasarım',
  skillIds: ['logo-design', 'brand-identity'],
  price: 500, // Basic price
  deliveryTime: 3, // Basic delivery time
  revisions: 2, // Basic revisions
  features: [
    'Logo konsept tasarımları',
    'Revizyon hakları',
    'Tüm dosya formatları',
    'Kurumsal renk paleti',
    'Kullanım kılavuzu',
    'Telif hakkı transferi',
  ],
  images: [
    '/packages/logo-portfolio-1.jpg',
    '/packages/logo-portfolio-2.jpg',
    '/packages/logo-portfolio-3.jpg',
  ],
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
      question: 'Hangi dosya formatlarını alırım?',
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
      description:
        'Projenizi normal teslimat süresinden 1 gün önce teslim alalım',
      price: 200,
      deliveryTime: -1,
    },
    {
      id: 'addon-2',
      title: 'Ekstra Revizyon (3 adet)',
      description: '3 adet ek revizyon hakkı ekler',
      price: 150,
      deliveryTime: 0,
    },
    {
      id: 'addon-3',
      title: 'Animasyonlu Logo',
      description: 'Logonuzun animasyonlu versiyonunu da alın',
      price: 300,
      deliveryTime: 2,
    },
  ],
  freelancerId: 'freelancer-321',
  freelancer: {
    id: 'freelancer-321',
    firstName: 'Zeynep',
    lastName: 'Demir',
    avatar: '/avatars/designer-1.jpg',
    rating: 4.8,
    reviewCount: 89,
  },
  orders: 134,
  rating: 4.8,
  reviews: [],
};

export const mockProposals: Proposal[] = [
  {
    id: 'prop-1',
    jobId: 'job-123',
    freelancerId: 'freelancer-456',
    freelancer: {
      id: 'freelancer-456',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      skills: ['React', 'Next.js', 'TypeScript'],
      rating: 4.9,
    },
    coverLetter: 'Bu proje için çok uygun deneyimim var...',
    proposedBudget: 18000,
    proposedRate: 200,
    proposedTimeline: '45 gün',
    deliveryTime: 45,
    status: 'pending',
    createdAt: '2025-09-06T10:00:00Z',
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    rating: 5,
    comment:
      'Harika bir çalışma oldu. Çok profesyonel ve yaratıcı. Zamanında teslim etti ve revizyonlarda çok yardımcı oldu.',
    reviewerId: 'user-222',
    revieweeId: 'freelancer-321',
    packageId: 'pkg-789',
    createdAt: '2025-08-10T09:15:00Z',
  },
];

export const mockPackages: PackageDetail[] = [mockPackageDetail];
