import { JobDetail, PackageDetail, Proposal } from '@/types';import { JobDetail, PackageDetail, Proposal, Review } from '@/types';import { JobDetail, PackageDetail, Proposal, Review } from '@/types';



// Simple mock job detail

export const mockJobDetail: JobDetail = {

  id: 'job-123',// Extended job details for detail page// Extended job details for detail page

  title: 'Modern E-ticaret Web Sitesi Geliştirme',

  description: 'Şirketimiz için modern ve kullanıcı dostu bir e-ticaret web sitesi geliştirmek istiyoruz.',export const mockJobDetail: JobDetail = {export const mockJobDetail: JobDetail = {

  category: 'Web Development',

  subcategory: 'Full-stack Development',  id: 'job-123',  id: 'job-123',

  budget: {

    type: 'fixed',  title: 'Modern E-ticaret Web Sitesi Geliştirme',  title: 'Modern E-ticaret Web Sitesi Geliştirme',

    amount: 20000,

    maxAmount: 25000,  description: `  description: `

  },

  timeline: '6-8 hafta',Şirketimiz için modern ve kullanıcı dostu bir e-ticaret web sitesi geliştirmek istiyoruz. Site responsive olmalı ve mobil uyumlu olmalıdır.Şirketimiz için modern ve kullanıcı dostu bir e-ticaret web sitesi geliştirmek istiyoruz. Site responsive olmalı ve mobil uyumlu olmalıdır.

  duration: '6-8 hafta',

  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],

  experienceLevel: 'expert',

  location: 'İstanbul (Remote OK)',**Teknik Gereksinimler:****Teknik Gereksinimler:**

  isRemote: true,

  status: 'open',- React.js veya Next.js framework- React.js veya Next.js framework

  employerId: 'emp-456',

  employer: {- Modern UI/UX tasarım- Modern UI/UX tasarım

    id: 'emp-456',

    email: 'mehmet@techcorp.com',- Ödeme sistemi entegrasyonu  - Ödeme sistemi entegrasyonu  

    firstName: 'Mehmet',

    lastName: 'Kaya',- Admin paneli- Admin paneli

    userType: 'employer',

    avatar: '/avatars/employer-1.jpg',- SEO optimizasyonu- SEO optimizasyonu

    location: 'İstanbul, Türkiye',

    companyName: 'TechCorp Solutions',- Performans optimizasyonu- Performans optimizasyonu

    industry: 'Teknoloji',

    totalSpent: 150000,

    activeJobs: 5,

    completedJobs: 23,**Proje Kapsamı:****Proje Kapsamı:**

    rating: 4.7,

    totalReviews: 28,- Ana sayfa ve kategori sayfaları- Ana sayfa ve kategori sayfaları

    reviewsCount: 28,

    totalJobs: 28,- Ürün detay sayfaları- Ürün detay sayfaları

    createdAt: '2024-01-01T00:00:00Z',

    updatedAt: '2024-09-01T00:00:00Z',- Sepet ve ödeme sistemleri- Sepet ve ödeme sistemleri

  },

  proposalsCount: 12,- Kullanıcı hesap yönetimi- Kullanıcı hesap yönetimi

  createdAt: '2025-09-05T10:00:00Z',

  updatedAt: '2025-09-05T10:00:00Z',- Admin dashboard- Admin dashboard

  requirements: [

    '3+ yıl React/Next.js deneyimi',- Mobil responsive tasarım- Mobil responsive tasarım

    'E-ticaret projesi portfolio',

    'Responsive tasarım deneyimi',

    'Ödeme API entegrasyonu bilgisi',

    'Türkçe iletişim',**Beklentilerimiz:****Beklentilerimiz:**

  ],

  attachments: [- Yüksek performans ve hız- Yüksek performans ve hız

    {

      id: 'att-1',- Modern ve kullanışlı arayüz- Modern ve kullanışlı arayüz

      name: 'proje-detaylari.pdf',

      url: '/uploads/attachments/proje-detaylari.pdf',- SEO dostu yapı- SEO dostu yapı

      type: 'application/pdf',

    },- Güvenli ödeme entegrasyonları- Güvenli ödeme entegrasyonları

  ],

  tags: ['urgent', 'budget-flexible', 'remote-friendly'],  `,  `,

  urgency: 'high',

  expiresAt: '2025-10-05T10:00:00Z',  category: 'Web Development',  category: 'Web Development',

};

  subcategory: 'Full-stack Development',  subcategory: 'Full-stack Development',

// Simple mock proposals

export const mockProposals: Proposal[] = [  budget: {  budget: {

  {

    id: 'proposal-1',    type: 'fixed',    type: 'fixed',

    jobId: 'job-123',

    freelancerId: 'freelancer-456',    amount: 20000,    amount: 20000,

    freelancer: {

      id: 'freelancer-456',    maxAmount: 25000,    maxAmount: 25000,

      email: 'ali@developer.com',

      firstName: 'Ali',  },  },

      lastName: 'Güven',

      userType: 'freelancer',  timeline: '6-8 hafta',  timeline: '6-8 hafta',

      avatar: '/avatars/developer-1.jpg',

      location: 'Ankara, Türkiye',  duration: '6-8 hafta',  duration: '6-8 hafta',

      title: 'Full-stack Developer',

      skills: ['React', 'Node.js', 'TypeScript'],  skills: [  skills: [

      hourlyRate: 85,

      experience: 'expert',    'React',    'React',

      rating: 4.8,

      totalReviews: 67,    'Next.js',    'Next.js',

      totalEarnings: 95000,

      completedJobs: 89,    'TypeScript',    'TypeScript',

      responseTime: '2 saat içinde',

      availability: 'available',    'Tailwind CSS',    'Tailwind CSS',

      portfolio: [],

      createdAt: '2023-05-01T00:00:00Z',    'Node.js',    'Node.js',

      updatedAt: '2025-09-01T00:00:00Z',

    },    'MongoDB',    'MongoDB',

    coverLetter: 'Merhaba! E-ticaret projeniz için size mükemmel bir çözüm sunabilirim.',

    proposedBudget: 22000,  ],  ],

    proposedTimeline: '7 hafta',

    status: 'pending',  experienceLevel: 'expert',  experienceLevel: 'expert',

    createdAt: '2025-09-07T09:00:00Z',

    updatedAt: '2025-09-07T09:00:00Z',  location: 'İstanbul (Remote OK)',  location: 'İstanbul (Remote OK)',

  },

];  isRemote: true,  isRemote: true,



export const mockJobs: JobDetail[] = [mockJobDetail];  status: 'open',  status: 'open',

  employerId: 'emp-456',  employerId: 'emp-456',

  employer: {  employer: {

    id: 'emp-456',    id: 'emp-456',

    email: 'mehmet@techcorp.com',    email: 'mehmet@techcorp.com',

    firstName: 'Mehmet',    firstName: 'Mehmet',

    lastName: 'Kaya',    lastName: 'Kaya',

    userType: 'employer',    userType: 'employer',

    avatar: '/avatars/employer-1.jpg',    avatar: '/avatars/employer-1.jpg',

    location: 'İstanbul, Türkiye',    location: 'İstanbul, Türkiye',

    companyName: 'TechCorp Solutions',    companyName: 'TechCorp Solutions',

    industry: 'Teknoloji',    industry: 'Teknoloji',

    totalSpent: 150000,    totalSpent: 150000,

    activeJobs: 5,    activeJobs: 5,

    completedJobs: 23,    completedJobs: 23,

    rating: 4.7,    rating: 4.7,

    totalReviews: 28,    totalReviews: 28,

    reviewsCount: 28,    reviewsCount: 28,

    totalJobs: 28,    totalJobs: 28,

    createdAt: '2024-01-01T00:00:00Z',    createdAt: '2024-01-01T00:00:00Z',

    updatedAt: '2024-09-01T00:00:00Z',    updatedAt: '2024-09-01T00:00:00Z',

  },  },

  proposalsCount: 12,  proposalsCount: 12,

  createdAt: '2025-09-05T10:00:00Z',  createdAt: '2025-09-05T10:00:00Z',

  updatedAt: '2025-09-05T10:00:00Z',  updatedAt: '2025-09-05T10:00:00Z',

  requirements: [  requirements: [

    '3+ yıl React/Next.js deneyimi',    '3+ yıl React/Next.js deneyimi',

    'E-ticaret projesi portfolio',    'E-ticaret projesi portfolio',

    'Responsive tasarım deneyimi',    'Responsive tasarım deneyimi',

    'Ödeme API entegrasyonu bilgisi',    'Ödeme API entegrasyonu bilgisi',

    'Türkçe iletişim',    'Türkçe iletişim',

    'Proje yönetimi deneyimi',    'Proje yönetimi deneyimi',

  ],  ],

  attachments: [  attachments: [

    {    {

      id: 'att-1',      id: 'att-1',

      name: 'proje-detaylari.pdf',      name: 'proje-detaylari.pdf',

      url: '/uploads/attachments/proje-detaylari.pdf',      url: '/uploads/attachments/proje-detaylari.pdf',

      type: 'application/pdf',      type: 'application/pdf',

    },    },

    {    {

      id: 'att-2',      id: 'att-2',

      name: 'design-mockup.fig',      name: 'design-mockup.fig',

      url: '/uploads/attachments/design-mockup.fig',      url: '/uploads/attachments/design-mockup.fig',

      type: 'application/octet-stream',      type: 'application/octet-stream',

    },    },

  ],  ],

  tags: ['urgent', 'budget-flexible', 'remote-friendly'],  tags: ['urgent', 'budget-flexible', 'remote-friendly'],

  urgency: 'high',  urgency: 'high',

  expiresAt: '2025-10-05T10:00:00Z',  expiresAt: '2025-10-05T10:00:00Z',

};};



// Package detail with 3-tier pricing// Package detail with 3-tier pricing

export const mockPackageDetail: PackageDetail = {export const mockPackageDetail: PackageDetail = {

  id: 'pkg-789',  overview: string;

  title: 'Profesyonel Logo ve Kurumsal Kimlik Tasarımı',  whatIncluded: string[];

  description: `  faq: { question: string; answer: string }[];

Markanızın profesyonel görünümü için özel logo ve kurumsal kimlik tasarımı hizmeti. 10+ yıllık deneyimim ile markanızı öne çıkaracak yaratıcı çözümler sunuyorum.  pricing: {

    basic: {

**Neden Beni Seçmelisiniz?**      price: number;

- 10+ yıllık profesyonel deneyim      title: string;

- 500+ başarılı proje      description: string;

- Unlimited revizyon (Premium pakette)      features: string[];

- Hızlı teslimat      deliveryTime: number;

- %100 memnuniyet garantisi      revisions: number;

  `,    };

  category: 'Grafik Tasarım',    standard: {

  subcategory: 'Logo Tasarım',      price: number;

  price: 500,      title: string;

  deliveryTime: 3,      description: string;

  revisions: 2,      features: string[];

  features: [      deliveryTime: number;

    'Logo konsept tasarımları',      revisions: number;

    'Revizyon hakları',    };

    'Tüm dosya formatları',    premium: {

    'Kurumsal renk paleti',      price: number;

  ],      title: string;

  images: [      description: string;

    '/packages/logo-1-main.jpg',      features: string[];

    '/packages/logo-1-gallery-1.jpg',      deliveryTime: number;

    '/packages/logo-1-gallery-2.jpg',      revisions: number;

    '/packages/logo-1-gallery-3.jpg',    };

  ],  };

  freelancerId: 'freelancer-321',  addOns: {

  freelancer: {    id: string;

    id: 'freelancer-321',    title: string;

    email: 'zeynep@designer.com',    price: number;

    firstName: 'Zeynep',    deliveryTime: number;

    lastName: 'Demir',  }[];

    userType: 'freelancer',  totalOrders: number;

    avatar: '/avatars/designer-1.jpg',  detailedReviews: Review[];

    location: 'İstanbul, Türkiye',  relatedPackages: Partial<ServicePackage>[];

    title: 'Grafik Tasarımcı & Brand Uzmanı',} = {

    skills: ['Logo Design', 'Brand Identity', 'Adobe Illustrator', 'Photoshop'],  id: 'pkg-789',

    hourlyRate: 75,  title: 'Profesyonel Logo ve Kurumsal Kimlik Tasarımı',

    experience: 'expert',  description: `

    rating: 4.9,Markanızın profesyonel görünümü için özel logo ve kurumsal kimlik tasarımı hizmeti. 10+ yıllık deneyimim ile markanızı öne çıkaracak yaratıcı çözümler sunuyorum.

    totalReviews: 89,

    totalEarnings: 125000,**Neden Beni Seçmelisiniz?**

    completedJobs: 156,- 10+ yıllık profesyonel deneyim

    responseTime: '1 saat içinde',- 500+ başarılı proje

    availability: 'available',- Unlimited revizyon (Premium pakette)

    portfolio: [],- Hızlı teslimat

    createdAt: '2023-01-01T00:00:00Z',- %100 memnuniyet garantisi

    updatedAt: '2025-09-01T00:00:00Z',  `,

  },  category: 'Grafik Tasarım',

  orders: 134,  subcategory: 'Logo Tasarım',

  rating: 4.8,  price: 500, // Basic price

  reviews: 89,  deliveryTime: 3, // Basic delivery time

  isActive: true,  revisions: 2, // Basic revisions

  createdAt: '2025-07-01T00:00:00Z',  features: [

  updatedAt: '2025-09-01T10:00:00Z',    'Logo konsept tasarımları',

  overview: 'Modern ve unutulmaz logo tasarımları ile markanızı güçlendirin.',    'Revizyon hakları',

  whatIncluded: [    'Tüm dosya formatları',

    'Logo konsept tasarımları (5 farklı versiyon)',    'Kurumsal renk paleti',

    'Revizyon hakları',  ],

    'Tüm dosya formatları (AI, PNG, PDF, SVG)',  images: [

    'Kurumsal renk paleti',    '/packages/logo-1-main.jpg',

    'Kullanım kılavuzu',    '/packages/logo-1-gallery-1.jpg',

    'Telif hakkı transferi',    '/packages/logo-1-gallery-2.jpg',

  ],    '/packages/logo-1-gallery-3.jpg',

  faq: [  ],

    {  freelancerId: 'freelancer-321',

      question: 'Kaç revizyon hakkım var?',  freelancer: {

      answer: "Basic pakette 2, Standard'da 5, Premium'da unlimited revizyon hakkınız var.",    id: 'freelancer-321',

    },    email: 'zeynep@designer.com',

    {    firstName: 'Zeynep',

      question: 'Dosyaları hangi formatlarda alacağım?',    lastName: 'Demir',

      answer: 'AI, EPS, PDF, PNG, JPG formatlarında yüksek çözünürlüklü dosyalar.',    userType: 'freelancer',

    },    avatar: '/avatars/designer-1.jpg',

    {    location: 'İstanbul, Türkiye',

      question: 'Telif hakları bana mı geçiyor?',    title: 'Grafik Tasarımcı & Brand Uzmanı',

      answer: 'Evet, ödeme tamamlandıktan sonra tüm telif hakları size aittir.',    skills: ['Logo Design', 'Brand Identity', 'Adobe Illustrator', 'Photoshop'],

    },    hourlyRate: 75,

    {    experience: 'expert',

      question: 'Projem ne kadar sürer?',    rating: 4.9,

      answer: 'Basic 3 gün, Standard 5 gün, Premium 7 gün sürmektedir.',    totalReviews: 89,

    },    totalEarnings: 125000,

  ],    completedJobs: 156,

  pricing: {    responseTime: '1 saat içinde',

    basic: {    availability: 'available',

      price: 500,    portfolio: [],

      title: 'Temel Logo',    createdAt: '2023-01-01T00:00:00Z',

      description: 'Basit ve modern logo tasarımı',    updatedAt: '2025-09-01T00:00:00Z',

      features: [  },

        '3 logo konsepti',  orders: 134,

        '2 revizyon hakkı',  rating: 4.8,

        'PNG ve JPG formatları',  reviews: 89,

        'Temel dosya paketi',  isActive: true,

      ],  createdAt: '2025-07-01T00:00:00Z',

      deliveryTime: 3,  updatedAt: '2025-09-01T10:00:00Z',

      revisions: 2,  overview: 'Modern ve unutulmaz logo tasarımları ile markanızı güçlendirin.',

    },  whatIncluded: [

    standard: {    'Logo konsept tasarımları (5 farklı versiyon)',

      price: 1200,    'Revizyon hakları',

      title: 'Profesyonel Paket',    'Tüm dosya formatları (AI, PNG, PDF, SVG)',

      description: 'Logo + kurumsal kimlik başlangıç paketi',    'Kurumsal renk paleti',

      features: [    'Kullanım kılavuzu',

        '5 logo konsepti',    'Telif hakkı transferi',

        '5 revizyon hakkı',  ],

        'Tüm dosya formatları',  faq: [

        'Kurumsal renk paleti',    {

        'Kartvizit tasarımı',      question: 'Kaç revizyon hakkım var?',

      ],      answer:

      deliveryTime: 5,        "Basic pakette 2, Standard'da 5, Premium'da unlimited revizyon hakkınız var.",

      revisions: 5,    },

    },    {

    premium: {      question: 'Dosyaları hangi formatlarda alacağım?',

      price: 2500,      answer:

      title: 'Tam Kimlik Paketi',        'AI, EPS, PDF, PNG, JPG formatlarında yüksek çözünürlüklü dosyalar.',

      description: 'Komple kurumsal kimlik çözümü',    },

      features: [    {

        '8 logo konsepti',      question: 'Telif hakları bana mı geçiyor?',

        'Unlimited revizyon',      answer: 'Evet, ödeme tamamlandıktan sonra tüm telif hakları size aittir.',

        'Tam kurumsal kimlik seti',    },

        'Antetli kağıt tasarımı',    {

        'Sosyal medya kit',      question: 'Projem ne kadar sürer?',

        'Marka kullanım kılavuzu',      answer: 'Basic 3 gün, Standard 5 gün, Premium 7 gün sürmektedir.',

      ],    },

      deliveryTime: 7,  ],

      revisions: -1,  pricing: {

    },    basic: {

  },      price: 500,

  addOns: [      title: 'Temel Logo',

    {      description: 'Basit ve modern logo tasarımı',

      id: 'addon-1',      features: [

      title: 'Hızlı Teslimat (+1 gün)',        '3 logo konsepti',

      price: 200,        '2 revizyon hakkı',

      deliveryTime: -1,        'PNG ve JPG formatları',

    },        'Temel dosya paketi',

    {      ],

      id: 'addon-2',      deliveryTime: 3,

      title: 'Ekstra Revizyon (3 adet)',      revisions: 2,

      price: 150,    },

      deliveryTime: 0,    standard: {

    },      price: 1200,

    {      title: 'Profesyonel Paket',

      id: 'addon-3',      description: 'Logo + kurumsal kimlik başlangıç paketi',

      title: 'Sosyal Medya Kit',      features: [

      price: 300,        '5 logo konsepti',

      deliveryTime: 2,        '5 revizyon hakkı',

    },        'Tüm dosya formatları',

  ],        'Kurumsal renk paleti',

  totalOrders: 134,        'Kartvizit tasarımı',

  detailedReviews: [        'Antetli kağıt tasarımı',

    {      ],

      id: 'rev-1',      deliveryTime: 5,

      rating: 5,      revisions: 5,

      comment: 'Harika bir çalışma oldu. Çok profesyonel ve yaratıcı.',    },

      reviewer: {    premium: {

        id: 'user-111',      price: 2500,

        email: 'ahmet@company.com',      title: 'Tam Kimlik Paketi',

        firstName: 'Ahmet',      description: 'Komple kurumsal kimlik çözümü',

        lastName: 'Yılmaz',      features: [

        userType: 'employer',        '8 logo konsepti',

        avatar: '/avatars/user-111.jpg',        'Unlimited revizyon',

        createdAt: '2024-01-01T00:00:00Z',        'Tam kurumsal kimlik seti',

        updatedAt: '2024-01-01T00:00:00Z',        'Antetli kağıt tasarımı',

      },        'Sosyal medya kit',

      reviewee: {        'Marka kullanım kılavuzu',

        id: 'freelancer-321',        'Email imza tasarımı',

        email: 'zeynep@designer.com',        'Presentation template',

        firstName: 'Zeynep',      ],

        lastName: 'Demir',      deliveryTime: 7,

        userType: 'freelancer',      revisions: -1, // Unlimited

        avatar: '/avatars/designer-1.jpg',    },

        createdAt: '2023-01-01T00:00:00Z',  },

        updatedAt: '2025-09-01T00:00:00Z',  addOns: [

      },    {

      packageId: 'pkg-789',      id: 'addon-1',

      createdAt: '2025-08-15T14:30:00Z',      title: 'Hızlı Teslimat (+1 gün)',

    },      price: 200,

  ],      deliveryTime: -1,

  relatedPackages: [    },

    {    {

      id: 'pkg-790',      id: 'addon-2',

      title: 'Modern Web Sitesi Tasarımı',      title: 'Ekstra Revizyon (3 adet)',

      price: 1500,      price: 150,

      rating: 4.7,      deliveryTime: 0,

      freelancer: {    },

        id: 'freelancer-321',    {

        firstName: 'Zeynep',      id: 'addon-3',

        lastName: 'Demir',      title: 'Sosyal Medya Avatarları',

      },      price: 300,

    },      deliveryTime: 1,

  ],    },

};  ],

  totalOrders: 134,

// Mock proposals  detailedReviews: [

export const mockProposals: Proposal[] = [    {

  {      id: 'rev-1',

    id: 'proposal-1',      rating: 5,

    jobId: 'job-123',      comment:

    freelancerId: 'freelancer-456',        'Harika bir çalışma oldu. Çok profesyonel ve yaratıcı. Zamanında teslim etti ve revizyonlarda çok yardımcı oldu.',

    freelancer: {      reviewer: {

      id: 'freelancer-456',        id: 'user-111',

      email: 'ali@developer.com',        email: 'ahmet@company.com',

      firstName: 'Ali',        firstName: 'Ahmet',

      lastName: 'Güven',        lastName: 'Yılmaz',

      userType: 'freelancer',        userType: 'employer',

      avatar: '/avatars/developer-1.jpg',        avatar: '/avatars/user-111.jpg',

      location: 'Ankara, Türkiye',        location: 'Ankara, Türkiye',

      title: 'Full-stack Developer',        createdAt: '2024-01-01T00:00:00Z',

      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],        updatedAt: '2024-01-01T00:00:00Z',

      hourlyRate: 85,      },

      experience: 'expert',      reviewee: {

      rating: 4.8,        id: 'freelancer-321',

      totalReviews: 67,        email: 'zeynep@designer.com',

      totalEarnings: 95000,        firstName: 'Zeynep',

      completedJobs: 89,        lastName: 'Demir',

      responseTime: '2 saat içinde',        userType: 'freelancer',

      availability: 'available',        avatar: '/avatars/designer-1.jpg',

      portfolio: [],        location: 'İstanbul, Türkiye',

      createdAt: '2023-05-01T00:00:00Z',        createdAt: '2023-01-01T00:00:00Z',

      updatedAt: '2025-09-01T00:00:00Z',        updatedAt: '2025-09-01T00:00:00Z',

    },      },

    coverLetter: 'Merhaba! E-ticaret projeniz için size mükemmel bir çözüm sunabilirim.',      packageId: 'pkg-789',

    proposedBudget: 22000,      createdAt: '2025-08-15T14:30:00Z',

    proposedTimeline: '7 hafta',    },

    status: 'pending',    {

    createdAt: '2025-09-07T09:00:00Z',      id: 'rev-2',

    updatedAt: '2025-09-07T09:00:00Z',      rating: 5,

  },      comment:

];        'Mükemmel iş! Logo tasarımı beklentilerimi aştı. İletişimi çok iyi, her şeyi detaylıca açıklıyor.',

      reviewer: {

// Additional exports        id: 'user-222',

export const mockJobs: JobDetail[] = [mockJobDetail];        email: 'fatma@startup.com',

export const mockPackages: PackageDetail[] = [mockPackageDetail];        firstName: 'Fatma',
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
