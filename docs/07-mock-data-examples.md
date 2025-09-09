# Ekstra Mock API Data Yapıları

## Örnek Veri Setleri

### Mock Users Data

```typescript
// mocks/data/users.ts
export const mockUsers = [
  {
    id: "user_001",
    email: "ahmet.yilmaz@email.com",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    userType: "freelancer",
    isVerified: true,
    profile: {
      avatar: "/avatars/ahmet.jpg",
      title: "Full Stack Developer",
      bio: "5+ yıl deneyimli web geliştirici. React, Node.js ve TypeScript konularında uzmanım.",
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL"],
      rating: 4.8,
      reviewCount: 127,
      completedJobs: 89,
      location: "İstanbul, Türkiye",
      hourlyRate: 150,
      availability: "available",
      responseTime: "2 saat",
      languages: ["Türkçe", "İngilizce"],
      joinDate: "2023-01-15T00:00:00Z",
      level: "level_2",
      portfolio: [
        {
          id: "portfolio_1",
          title: "E-ticaret Web Sitesi",
          description: "Modern e-ticaret platformu",
          image: "/portfolio/ecommerce.jpg",
          url: "https://example-ecommerce.com",
        },
      ],
    },
  },
  {
    id: "user_002",
    email: "zeynep.kaya@email.com",
    firstName: "Zeynep",
    lastName: "Kaya",
    userType: "employer",
    isVerified: true,
    profile: {
      avatar: "/avatars/zeynep.jpg",
      company: "TechStart Şirketi",
      title: "Proje Yöneticisi",
      bio: "Startup şirketinde teknoloji projeleri yöneticisi",
      location: "Ankara, Türkiye",
      memberSince: "2023-06-01T00:00:00Z",
      jobsPosted: 15,
      rating: 4.6,
      reviewCount: 28,
    },
  },
];
```

### Mock Jobs Data

```typescript
// mocks/data/jobs.ts
export const mockJobs = [
  {
    id: "job_001",
    title: "Modern E-ticaret Web Sitesi Geliştirilmesi",
    description: `Firmamız için modern ve kullanıcı dostu bir e-ticaret web sitesi geliştirmek istiyoruz.

**Gereksinimler:**
- Responsive tasarım (mobil uyumlu)
- Ürün kataloğu ve arama sistemi
- Sepet ve ödeme entegrasyonu
- Kullanıcı hesap yönetimi
- Admin paneli
- SEO optimizasyonu

**Teknik Detaylar:**
- React veya Vue.js frontend
- Node.js backend
- Veritabanı: PostgreSQL
- Ödeme: İyzico entegrasyonu
- Hosting: AWS veya benzer

Proje süresi 6-8 hafta olarak planlanmaktadır. Deneyimli ve referansları olan geliştiricilerle çalışmak istiyoruz.`,
    category: "web-development",
    subcategory: "fullstack",
    employer: {
      id: "user_002",
      firstName: "Zeynep",
      lastName: "Kaya",
      company: "TechStart Şirketi",
      avatar: "/avatars/zeynep.jpg",
      rating: 4.6,
      reviewCount: 28,
      jobsPosted: 15,
      memberSince: "2023-06-01T00:00:00Z",
      location: "Ankara, Türkiye",
    },
    budget: {
      type: "fixed",
      min: 8000,
      max: 15000,
      currency: "TRY",
    },
    deadline: "2025-11-15T00:00:00Z",
    skills: ["React", "Node.js", "PostgreSQL", "İyzico", "AWS", "SEO"],
    experienceLevel: "intermediate",
    projectDuration: "1-3 months",
    workType: "remote",
    proposalCount: 12,
    status: "open",
    attachments: [
      {
        id: "file_001",
        name: "proje-gereksinimleri.pdf",
        url: "/files/job_001/requirements.pdf",
        size: 2048000,
      },
    ],
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2025-09-02T14:30:00Z",
    featured: true,
  },
  {
    id: "job_002",
    title: "Mobil Uygulama UI/UX Tasarımı",
    description: `Yeni mobil uygulamamız için modern ve kullanıcı dostu UI/UX tasarımına ihtiyacımız var.

**Beklentilerimiz:**
- Material Design veya Human Interface Guidelines
- Wireframe ve mockup tasarımları
- Prototype oluşturma
- Kullanıcı deneyimi optimizasyonu
- Dark/Light tema desteği

**Çıktılar:**
- Figma dosyaları
- Design system
- Prototype
- Export edilmiş görseller

Tecrübeli UI/UX tasarımcılarla çalışmak istiyoruz.`,
    category: "design",
    subcategory: "mobile-design",
    employer: {
      id: "user_003",
      firstName: "Mehmet",
      lastName: "Özdemir",
      company: "MobileApp Inc.",
      avatar: "/avatars/mehmet.jpg",
      rating: 4.9,
      reviewCount: 45,
      jobsPosted: 8,
      memberSince: "2023-03-20T00:00:00Z",
      location: "İzmir, Türkiye",
    },
    budget: {
      type: "fixed",
      min: 3000,
      max: 6000,
      currency: "TRY",
    },
    deadline: "2025-10-30T00:00:00Z",
    skills: ["UI/UX", "Figma", "Mobile Design", "Prototyping", "User Research"],
    experienceLevel: "expert",
    projectDuration: "2-4 weeks",
    workType: "remote",
    proposalCount: 8,
    status: "open",
    createdAt: "2025-09-05T09:15:00Z",
    updatedAt: "2025-09-05T09:15:00Z",
    featured: false,
  },
];
```

### Mock Packages Data

```typescript
// mocks/data/packages.ts
export const mockPackages = [
  {
    id: "package_001",
    title: "Profesyonel React Web Sitesi Geliştirme",
    description: `Modern ve responsive web siteleri geliştiriyorum. 5+ yıl deneyimim ile kaliteli çözümler sunuyorum.

**Hizmetlerim:**
- Modern React uygulamaları
- Responsive tasarım
- SEO optimizasyonu
- Performance optimizasyonu
- Cross-browser uyumluluk
- Kod dokümantasyonu

**Teknolojiler:**
- React 18, TypeScript
- Next.js, Tailwind CSS
- Node.js, Express
- MongoDB, PostgreSQL
- Git, CI/CD

Müşteri memnuniyeti önceliğim. Projelerinizde kaliteli çözümler için benimle iletişime geçin.`,
    category: "web-development",
    subcategory: "frontend",
    freelancer: {
      id: "user_001",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      avatar: "/avatars/ahmet.jpg",
      title: "Full Stack Developer",
      rating: 4.8,
      reviewCount: 127,
      level: "level_2",
      completedOrders: 89,
      responseTime: "2 saat",
      location: "İstanbul, Türkiye",
    },
    pricing: {
      basic: {
        price: 1200,
        title: "Temel Web Sitesi",
        deliveryDays: 7,
        features: [
          "5 sayfa",
          "Responsive tasarım",
          "İletişim formu",
          "Temel SEO",
          "2 revizyon hakkı",
        ],
      },
      standard: {
        price: 2200,
        title: "Standart Web Sitesi",
        deliveryDays: 14,
        features: [
          "10 sayfa",
          "Responsive tasarım",
          "İletişim formu",
          "Gelişmiş SEO",
          "İçerik yönetimi",
          "Sosyal medya entegrasyonu",
          "5 revizyon hakkı",
        ],
      },
      premium: {
        price: 3500,
        title: "Premium Web Sitesi",
        deliveryDays: 21,
        features: [
          "Sınırsız sayfa",
          "Responsive tasarım",
          "İletişim formu",
          "Gelişmiş SEO",
          "İçerik yönetimi",
          "Sosyal medya entegrasyonu",
          "E-ticaret fonksiyonları",
          "Performance optimizasyonu",
          "Sınırsız revizyon",
        ],
      },
    },
    images: [
      "/packages/package_001/image1.jpg",
      "/packages/package_001/image2.jpg",
      "/packages/package_001/image3.jpg",
    ],
    video: "/packages/package_001/demo.mp4",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
    faq: [
      {
        question: "Kaynak kodunu teslim ediyor musunuz?",
        answer:
          "Evet, tüm projelerimde kaynak kodunu ve dokümantasyonu teslim ediyorum.",
      },
      {
        question: "Mevcut tasarımımla çalışabilir misiniz?",
        answer:
          "Tabii ki! Mevcut tasarımınızla çalışabilirim veya yeni tasarım önerileri sunabilirim.",
      },
      {
        question: "Proje sonrası destek veriyor musunuz?",
        answer:
          "30 gün ücretsiz teknik destek veriyorum. Sonrasında uygun fiyatlarla destek hizmeti mevcuttur.",
      },
    ],
    extras: [
      {
        id: "extra_1",
        title: "Ek sayfa",
        price: 150,
        deliveryDays: 1,
      },
      {
        id: "extra_2",
        title: "Mobil uygulama versiyonu",
        price: 1200,
        deliveryDays: 7,
      },
      {
        id: "extra_3",
        title: "Çoklu dil desteği",
        price: 800,
        deliveryDays: 3,
      },
    ],
    reviews: [
      {
        id: "review_001",
        user: {
          firstName: "Ayşe",
          lastName: "Demir",
          avatar: "/avatars/ayse.jpg",
        },
        rating: 5,
        comment:
          "Mükemmel iş çıkardı! Zamanında teslim etti ve çok profesyonel yaklaştı. Kesinlikle tavsiye ederim.",
        createdAt: "2025-08-25T10:00:00Z",
      },
      {
        id: "review_002",
        user: {
          firstName: "Can",
          lastName: "Yıldız",
          avatar: "/avatars/can.jpg",
        },
        rating: 5,
        comment:
          "Harika bir çalışma. Kodlar çok temiz ve dokümantasyon mükemmel. Teşekkürler Ahmet!",
        createdAt: "2025-08-20T15:30:00Z",
      },
    ],
    orderCount: 89,
    inQueue: 3,
    status: "active",
    createdAt: "2025-08-01T09:00:00Z",
    updatedAt: "2025-09-01T12:00:00Z",
  },
  {
    id: "package_002",
    title: "Logo ve Kurumsal Kimlik Tasarımı",
    description: `Markanız için özgün ve etkileyici logo tasarımları yapıyorum.

**Hizmetlerim:**
- Logo konsept geliştirme
- Kurumsal renk paleti
- Tipografi seçimi
- Kartvizit tasarımı
- Antetli kağıt tasarımı
- Sosyal medya görselleri

10+ yıl deneyimim ile markanıza değer katacak tasarımlar oluşturuyorum.`,
    category: "design",
    subcategory: "logo-design",
    freelancer: {
      id: "user_004",
      firstName: "Elif",
      lastName: "Çetin",
      avatar: "/avatars/elif.jpg",
      title: "Grafik Tasarımcı",
      rating: 4.9,
      reviewCount: 203,
      level: "top_rated",
      completedOrders: 156,
      responseTime: "1 saat",
      location: "Antalya, Türkiye",
    },
    pricing: {
      basic: {
        price: 400,
        title: "Temel Logo",
        deliveryDays: 3,
        features: [
          "3 logo konsepti",
          "2 revizyon hakkı",
          "PNG ve JPG formatları",
          "Web kullanım lisansı",
        ],
      },
      standard: {
        price: 750,
        title: "Standart Paket",
        deliveryDays: 5,
        features: [
          "5 logo konsepti",
          "5 revizyon hakkı",
          "Tüm formatlar (PNG, JPG, PDF, SVG)",
          "Kaynak dosyalar",
          "Kartvizit tasarımı",
          "Ticari kullanım lisansı",
        ],
      },
      premium: {
        price: 1200,
        title: "Premium Paket",
        deliveryDays: 7,
        features: [
          "7 logo konsepti",
          "Sınırsız revizyon",
          "Tüm formatlar",
          "Kaynak dosyalar",
          "Kurumsal kimlik paketi",
          "Sosyal medya kit",
          "Marka kullanım kılavuzu",
          "Ticari kullanım lisansı",
        ],
      },
    },
    images: [
      "/packages/package_002/logo1.jpg",
      "/packages/package_002/logo2.jpg",
      "/packages/package_002/logo3.jpg",
      "/packages/package_002/logo4.jpg",
    ],
    skills: [
      "Logo Design",
      "Adobe Illustrator",
      "Brand Identity",
      "Typography",
    ],
    orderCount: 156,
    inQueue: 2,
    status: "active",
    createdAt: "2025-07-15T10:00:00Z",
    updatedAt: "2025-09-01T16:00:00Z",
  },
];
```

### Mock Proposals Data

```typescript
// mocks/data/proposals.ts
export const mockProposals = [
  {
    id: "proposal_001",
    job: {
      id: "job_001",
      title: "Modern E-ticaret Web Sitesi Geliştirilmesi",
      budget: { min: 8000, max: 15000, currency: "TRY" },
    },
    freelancer: {
      id: "user_001",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      avatar: "/avatars/ahmet.jpg",
      title: "Full Stack Developer",
      rating: 4.8,
      completedJobs: 89,
    },
    coverLetter: `Merhaba Zeynep Hanım,

E-ticaret web sitesi projenizi inceledim ve tam olarak aradığınız deneyime sahibim. 5+ yıldır React ve Node.js teknolojileri ile e-ticaret projeleri geliştiriyorum.

**Deneyimim:**
- 15+ e-ticaret projesi tamamladım
- React, Node.js, PostgreSQL uzmanlığı
- İyzico ödeme entegrasyonu deneyimi
- AWS cloud deployment tecrübesi
- SEO optimizasyonu uzmanlığı

**Proje Yaklaşımım:**
1. Detaylı analiz ve planlama (1 hafta)
2. UI/UX tasarım onayı (1 hafta)
3. Frontend geliştirme (3 hafta)
4. Backend ve entegrasyonlar (2 hafta)
5. Test ve deployment (1 hafta)

**Teslim Edeceğim:**
- Modern ve responsive web sitesi
- Admin paneli
- Kullanıcı dokümantasyonu
- 3 ay ücretsiz teknik destek

Projenizi zamanında ve kaliteli şekilde teslim edeceğime eminm. Portfolio örneklerimi inceleyebilirsiniz.

İyi çalışmalar dilerim.`,
    proposedBudget: 12000,
    deliveryTime: 45, // gün
    attachments: [
      {
        name: "portfolio-ecommerce.pdf",
        url: "/files/proposal_001/portfolio.pdf",
        size: 3145728,
      },
      {
        name: "reference-projects.pdf",
        url: "/files/proposal_001/references.pdf",
        size: 2097152,
      },
    ],
    status: "pending",
    createdAt: "2025-09-02T14:30:00Z",
    updatedAt: "2025-09-02T14:30:00Z",
  },
  {
    id: "proposal_002",
    job: {
      id: "job_002",
      title: "Mobil Uygulama UI/UX Tasarımı",
      budget: { min: 3000, max: 6000, currency: "TRY" },
    },
    freelancer: {
      id: "user_005",
      firstName: "Deniz",
      lastName: "Akar",
      avatar: "/avatars/deniz.jpg",
      title: "UI/UX Designer",
      rating: 4.7,
      completedJobs: 67,
    },
    coverLetter: `Merhaba,

Mobil uygulama UI/UX tasarımı projeniz için teklif sunuyorum. 8+ yıl mobil tasarım deneyimim var.

**Uzmanlık Alanlarım:**
- iOS ve Android tasarım standartları
- User experience research
- Wireframing ve prototyping
- Figma, Sketch, Adobe XD
- Design system oluşturma

**Süreç:**
1. User research ve analiz
2. Wireframe tasarımı
3. Visual design
4. Prototype oluşturma
5. Revizyon ve final

Portfolio örneklerimi görüntüleyebilirsiniz.`,
    proposedBudget: 4500,
    deliveryTime: 21,
    attachments: [
      {
        name: "mobile-design-portfolio.pdf",
        url: "/files/proposal_002/portfolio.pdf",
        size: 5242880,
      },
    ],
    status: "accepted",
    createdAt: "2025-09-06T11:00:00Z",
    updatedAt: "2025-09-07T09:30:00Z",
  },
];
```

### Mock Orders Data

```typescript
// mocks/data/orders.ts
export const mockOrders = [
  {
    id: "order_001",
    package: {
      id: "package_001",
      title: "Profesyonel React Web Sitesi Geliştirme",
      selectedTier: "standard",
    },
    freelancer: {
      id: "user_001",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      avatar: "/avatars/ahmet.jpg",
      title: "Full Stack Developer",
    },
    client: {
      id: "user_006",
      firstName: "Fatma",
      lastName: "Yıldırım",
      avatar: "/avatars/fatma.jpg",
      company: "Dijital Çözümler Ltd.",
    },
    amount: 2200,
    deliveryDate: "2025-09-23T00:00:00Z",
    status: "in_progress",
    requirements: `Şirket web sitemizi yenilemek istiyoruz. 

**İhtiyaçlarımız:**
- Ana sayfa, hakkımızda, hizmetler, iletişim sayfaları
- Modern ve profesyonel tasarım
- Mobil uyumlu
- İletişim formu
- Google Maps entegrasyonu
- Blog bölümü

**Mevcut Domain:** digitalcozumler.com
**Hosting:** Zaten mevcut

Referans siteler ve logo dosyalarını proje başlangıcında paylaşacağım.`,
    extras: [
      {
        id: "extra_1",
        title: "Çoklu dil desteği",
        price: 800,
      },
    ],
    totalAmount: 3000,
    progress: 60,
    messages: [
      {
        id: "msg_001",
        from: "client",
        message: "Proje nasıl gidiyor? Bir güncelleme alabilir miyim?",
        timestamp: "2025-09-08T10:30:00Z",
      },
      {
        id: "msg_002",
        from: "freelancer",
        message:
          "Proje çok iyi gidiyor! Ana sayfa tasarımı tamamlandı, sizin onayınızı bekliyorum.",
        timestamp: "2025-09-08T11:15:00Z",
      },
    ],
    milestones: [
      {
        id: "milestone_1",
        title: "Tasarım Onayı",
        status: "completed",
        completedAt: "2025-09-12T14:00:00Z",
      },
      {
        id: "milestone_2",
        title: "Frontend Geliştirme",
        status: "in_progress",
        progress: 60,
      },
      {
        id: "milestone_3",
        title: "İçerik Entegrasyonu",
        status: "pending",
      },
    ],
    createdAt: "2025-09-09T10:00:00Z",
    updatedAt: "2025-09-08T11:15:00Z",
  },
];
```

### Mock Categories Data

```typescript
// mocks/data/categories.ts
export const mockCategories = [
  {
    id: "web-development",
    name: "Web Geliştirme",
    description: "Web sitesi ve web uygulaması geliştirme",
    icon: "/icons/web-dev.svg",
    subcategories: [
      {
        id: "frontend",
        name: "Frontend Geliştirme",
        description: "Kullanıcı arayüzü geliştirme",
      },
      {
        id: "backend",
        name: "Backend Geliştirme",
        description: "Sunucu tarafı geliştirme",
      },
      {
        id: "fullstack",
        name: "Full Stack Geliştirme",
        description: "Tam kapsamlı web geliştirme",
      },
      {
        id: "ecommerce",
        name: "E-ticaret",
        description: "Online mağaza geliştirme",
      },
    ],
    packageCount: 245,
    jobCount: 89,
    averagePrice: 2500,
  },
  {
    id: "design",
    name: "Tasarım",
    description: "Grafik tasarım ve kullanıcı deneyimi",
    icon: "/icons/design.svg",
    subcategories: [
      {
        id: "logo-design",
        name: "Logo Tasarımı",
        description: "Marka kimliği ve logo oluşturma",
      },
      {
        id: "web-design",
        name: "Web Tasarımı",
        description: "Web sitesi tasarımı ve UI/UX",
      },
      {
        id: "mobile-design",
        name: "Mobil Tasarım",
        description: "Mobil uygulama tasarımı",
      },
      {
        id: "print-design",
        name: "Baskı Tasarımı",
        description: "Katalog, broşür, kartvizit tasarımı",
      },
    ],
    packageCount: 189,
    jobCount: 56,
    averagePrice: 1200,
  },
  {
    id: "mobile-development",
    name: "Mobil Geliştirme",
    description: "iOS ve Android uygulama geliştirme",
    icon: "/icons/mobile-dev.svg",
    subcategories: [
      {
        id: "ios",
        name: "iOS Geliştirme",
        description: "iPhone ve iPad uygulamaları",
      },
      {
        id: "android",
        name: "Android Geliştirme",
        description: "Android uygulamaları",
      },
      {
        id: "react-native",
        name: "React Native",
        description: "Cross-platform mobil uygulamalar",
      },
      {
        id: "flutter",
        name: "Flutter",
        description: "Dart ile mobil geliştirme",
      },
    ],
    packageCount: 134,
    jobCount: 67,
    averagePrice: 5000,
  },
];
```

Bu örnek veri setleri ile frontend geliştirme süreci boyunca gerçekçi verilerle çalışılabilir ve backend entegrasyonu sırasında kolayca gerçek API'ye geçiş yapılabilir.
