import { Category } from '@/types/business/features/marketplace-categories';

// ==========================================
// MARKETPLACE CATEGORIES DATA
// ==========================================
// 16 Main Categories with 800+ Services

export const MARKETPLACE_CATEGORIES: Category[] = [
  // 1. TEKNOLOJİ & YAZILIM
  {
    id: 'teknoloji-yazilim',
    title: 'Teknoloji & Yazılım',
    description:
      'Web geliştirme, mobil uygulama, yazılım çözümleri ve teknoloji danışmanlığı hizmetleri',
    shortDescription: 'Web, mobil ve yazılım geliştirme',
    icon: 'Code',
    iconColor: '#3B82F6', // Blue-500
    serviceCount: 200,
    averagePrice: 2500,
    priceRange: { min: 500, max: 15000 },
    topSkills: ['React', 'Node.js', 'Python', 'Mobile App', 'WordPress'],
    popularServices: [
      'Web Sitesi',
      'Mobil Uygulama',
      'E-ticaret',
      'API Geliştirme',
    ],
    trending: true,
    featured: true,
    order: 1,
    slug: 'teknoloji-yazilim',
    metadata: {
      seoTitle: 'Teknoloji & Yazılım Hizmetleri | MarifetBul',
      seoDescription:
        'Web geliştirme, mobil uygulama ve yazılım çözümleri için uzman geliştiriciler bulun.',
      keywords: [
        'web geliştirme',
        'mobil uygulama',
        'yazılım',
        'programlama',
        'teknoloji',
      ],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 1250,
      completedProjects: 8940,
      averageRating: 4.8,
      responseTime: 2,
      successRate: 95,
      monthlyGrowth: 12,
    },
    subcategories: [
      {
        id: 'web-gelistirme',
        name: 'Web Geliştirme',
        description: 'WordPress, React, Vue.js ile web sitesi geliştirme',
        serviceCount: 85,
        averagePrice: 3000,
        priceRange: { min: 800, max: 12000 },
        popularServices: ['WordPress Site', 'E-ticaret', 'Kurumsal Web'],
        slug: 'web-gelistirme',
        parentCategoryId: 'teknoloji-yazilim',
      },
      {
        id: 'mobil-uygulama',
        name: 'Mobil Uygulama',
        description: 'iOS, Android ve cross-platform mobil uygulama geliştirme',
        serviceCount: 45,
        averagePrice: 4500,
        priceRange: { min: 2000, max: 15000 },
        popularServices: ['iOS App', 'Android App', 'React Native'],
        slug: 'mobil-uygulama',
        trending: true,
        parentCategoryId: 'teknoloji-yazilim',
      },
      {
        id: 'yazilim-gelistirme',
        name: 'Yazılım Geliştirme',
        description: 'Özel yazılım, API ve enterprise çözümler',
        serviceCount: 35,
        averagePrice: 5000,
        priceRange: { min: 1500, max: 20000 },
        popularServices: [
          'Custom Software',
          'API Development',
          'Database Design',
        ],
        slug: 'yazilim-gelistirme',
        parentCategoryId: 'teknoloji-yazilim',
      },
      {
        id: 'siber-guvenlik',
        name: 'Siber Güvenlik',
        description:
          'Güvenlik testleri, penetration testing ve güvenlik danışmanlığı',
        serviceCount: 20,
        averagePrice: 3500,
        priceRange: { min: 1000, max: 10000 },
        popularServices: ['Penetration Test', 'Security Audit', 'SSL Setup'],
        slug: 'siber-guvenlik',
        parentCategoryId: 'teknoloji-yazilim',
      },
      {
        id: 'blockchain',
        name: 'Blockchain & Kripto',
        description: 'Smart contract, DeFi ve blockchain uygulama geliştirme',
        serviceCount: 15,
        averagePrice: 6000,
        priceRange: { min: 2000, max: 25000 },
        popularServices: ['Smart Contract', 'DeFi App', 'NFT Marketplace'],
        slug: 'blockchain',
        trending: true,
        parentCategoryId: 'teknoloji-yazilim',
      },
    ],
  },

  // 2. TASARIM & KREATİF
  {
    id: 'tasarim-kreatif',
    title: 'Tasarım & Kreatif',
    description:
      'Grafik tasarım, UI/UX, logo, video editing ve kreatif çözümler',
    shortDescription: 'Grafik tasarım ve kreatif hizmetler',
    icon: 'Palette',
    iconColor: '#8B5CF6', // Purple-500
    serviceCount: 150,
    averagePrice: 1800,
    priceRange: { min: 200, max: 8000 },
    topSkills: [
      'Photoshop',
      'Illustrator',
      'Figma',
      'After Effects',
      'Video Editing',
    ],
    popularServices: [
      'Logo Tasarımı',
      'Web Tasarımı',
      'Video Editing',
      'Sosyal Medya Tasarımı',
    ],
    trending: true,
    featured: true,
    order: 2,
    slug: 'tasarim-kreatif',
    metadata: {
      seoTitle: 'Tasarım & Kreatif Hizmetler | MarifetBul',
      seoDescription:
        'Logo, grafik tasarım, UI/UX ve video editing için profesyonel tasarımcılar.',
      keywords: [
        'grafik tasarım',
        'logo tasarımı',
        'ui ux',
        'video editing',
        'kreatif',
      ],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 980,
      completedProjects: 12500,
      averageRating: 4.7,
      responseTime: 1,
      successRate: 93,
      monthlyGrowth: 8,
    },
    subcategories: [
      {
        id: 'grafik-tasarim',
        name: 'Grafik Tasarım',
        description: 'Logo, poster, broşür ve kurumsal kimlik tasarımı',
        serviceCount: 60,
        averagePrice: 1200,
        priceRange: { min: 200, max: 5000 },
        popularServices: [
          'Logo Tasarımı',
          'Kurumsal Kimlik',
          'Poster Tasarımı',
        ],
        slug: 'grafik-tasarim',
        parentCategoryId: 'tasarim-kreatif',
      },
      {
        id: 'ui-ux-tasarim',
        name: 'UI/UX Tasarım',
        description: 'Web ve mobil uygulama kullanıcı deneyimi tasarımı',
        serviceCount: 40,
        averagePrice: 2800,
        priceRange: { min: 800, max: 8000 },
        popularServices: ['Web UI Design', 'App UX Design', 'Prototype'],
        slug: 'ui-ux-tasarim',
        trending: true,
        parentCategoryId: 'tasarim-kreatif',
      },
      {
        id: 'video-animasyon',
        name: 'Video & Animasyon',
        description: '2D/3D animasyon, motion graphics ve video editing',
        serviceCount: 30,
        averagePrice: 2200,
        priceRange: { min: 500, max: 6000 },
        popularServices: ['Video Editing', '2D Animation', 'Motion Graphics'],
        slug: 'video-animasyon',
        parentCategoryId: 'tasarim-kreatif',
      },
      {
        id: 'fotograf',
        name: 'Fotoğraf & Retouch',
        description: 'Ürün fotoğrafçılığı, portre ve fotoğraf düzenleme',
        serviceCount: 20,
        averagePrice: 1500,
        priceRange: { min: 300, max: 4000 },
        popularServices: [
          'Product Photography',
          'Portrait',
          'Photo Retouching',
        ],
        slug: 'fotograf',
        parentCategoryId: 'tasarim-kreatif',
      },
    ],
  },

  // 3. PAZARLAMA & REKLAM
  {
    id: 'pazarlama-reklam',
    title: 'Pazarlama & Reklam',
    description:
      'Dijital pazarlama, SEO, sosyal medya yönetimi ve reklam kampanyaları',
    shortDescription: 'Dijital pazarlama ve sosyal medya',
    icon: 'Megaphone',
    iconColor: '#10B981', // Green-500
    serviceCount: 120,
    averagePrice: 2200,
    priceRange: { min: 300, max: 10000 },
    topSkills: [
      'SEO',
      'Google Ads',
      'Social Media',
      'Content Marketing',
      'Analytics',
    ],
    popularServices: [
      'SEO Optimizasyonu',
      'Google Ads',
      'Sosyal Medya Yönetimi',
      'Content Marketing',
    ],
    trending: true,
    featured: true,
    order: 3,
    slug: 'pazarlama-reklam',
    metadata: {
      seoTitle: 'Pazarlama & Reklam Hizmetleri | MarifetBul',
      seoDescription:
        'SEO, Google Ads, sosyal medya ve dijital pazarlama uzmanları ile işinizi büyütün.',
      keywords: [
        'seo',
        'google ads',
        'sosyal medya',
        'dijital pazarlama',
        'reklam',
      ],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 850,
      completedProjects: 9800,
      averageRating: 4.6,
      responseTime: 3,
      successRate: 91,
      monthlyGrowth: 15,
    },
    subcategories: [
      {
        id: 'seo-sem',
        name: 'SEO & SEM',
        description: 'Arama motoru optimizasyonu ve Google Ads yönetimi',
        serviceCount: 45,
        averagePrice: 2800,
        priceRange: { min: 500, max: 8000 },
        popularServices: [
          'SEO Audit',
          'Google Ads Campaign',
          'Keyword Research',
        ],
        slug: 'seo-sem',
        parentCategoryId: 'pazarlama-reklam',
      },
      {
        id: 'sosyal-medya',
        name: 'Sosyal Medya',
        description:
          'Instagram, Facebook, LinkedIn hesap yönetimi ve içerik üretimi',
        serviceCount: 35,
        averagePrice: 1800,
        priceRange: { min: 300, max: 5000 },
        popularServices: [
          'Instagram Management',
          'Content Creation',
          'Social Media Strategy',
        ],
        slug: 'sosyal-medya',
        trending: true,
        parentCategoryId: 'pazarlama-reklam',
      },
      {
        id: 'content-marketing',
        name: 'İçerik Pazarlama',
        description: 'Blog yazarlığı, copywriting ve içerik stratejisi',
        serviceCount: 25,
        averagePrice: 1500,
        priceRange: { min: 200, max: 4000 },
        popularServices: ['Blog Writing', 'Copywriting', 'Email Marketing'],
        slug: 'content-marketing',
        parentCategoryId: 'pazarlama-reklam',
      },
      {
        id: 'influencer-marketing',
        name: 'Influencer Marketing',
        description: 'Influencer kampanya yönetimi ve işbirlikleri',
        serviceCount: 15,
        averagePrice: 3500,
        priceRange: { min: 1000, max: 10000 },
        popularServices: [
          'Influencer Campaign',
          'Brand Partnerships',
          'Content Collaboration',
        ],
        slug: 'influencer-marketing',
        trending: true,
        parentCategoryId: 'pazarlama-reklam',
      },
    ],
  },

  // 4. EV & YAŞAM HİZMETLERİ
  {
    id: 'ev-yasam',
    title: 'Ev & Yaşam Hizmetleri',
    description: 'Tadilat, temizlik, nakliye ve ev bakım hizmetleri',
    shortDescription: 'Ev tadilat, temizlik ve bakım',
    icon: 'Home',
    iconColor: '#F59E0B', // Orange-500
    serviceCount: 280,
    averagePrice: 800,
    priceRange: { min: 100, max: 5000 },
    topSkills: ['Tadilat', 'Elektrik', 'Tesisatçılık', 'Boyacılık', 'Temizlik'],
    popularServices: ['Ev Temizliği', 'Boyacı', 'Elektrikçi', 'Tesisatçı'],
    trending: false,
    featured: true,
    order: 4,
    slug: 'ev-yasam',
    metadata: {
      seoTitle: 'Ev & Yaşam Hizmetleri | MarifetBul',
      seoDescription:
        'Tadilat, temizlik, elektrik, tesisatçı ve ev bakım hizmetleri için uzmanlar.',
      keywords: [
        'tadilat',
        'ev temizliği',
        'elektrikçi',
        'tesisatçı',
        'boyacı',
      ],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 2100,
      completedProjects: 18500,
      averageRating: 4.5,
      responseTime: 1,
      successRate: 89,
      monthlyGrowth: 5,
    },
    subcategories: [
      {
        id: 'tadilat-dekorasyon',
        name: 'Tadilat & Dekorasyon',
        description:
          'Boyacı, elektrikçi, tesisatçı ve genel tadilat hizmetleri',
        serviceCount: 120,
        averagePrice: 1200,
        priceRange: { min: 200, max: 5000 },
        popularServices: ['Boyacı', 'Elektrikçi', 'Tesisatçı', 'Döşeme'],
        slug: 'tadilat-dekorasyon',
        parentCategoryId: 'ev-yasam',
      },
      {
        id: 'temizlik',
        name: 'Temizlik Hizmetleri',
        description: 'Ev, ofis ve genel temizlik hizmetleri',
        serviceCount: 80,
        averagePrice: 400,
        priceRange: { min: 100, max: 1500 },
        popularServices: ['Ev Temizliği', 'Ofis Temizliği', 'Derin Temizlik'],
        slug: 'temizlik',
        parentCategoryId: 'ev-yasam',
      },
      {
        id: 'nakliye-tasima',
        name: 'Nakliye & Taşıma',
        description: 'Evden eve nakliye, ofis taşıma ve kurye hizmetleri',
        serviceCount: 40,
        averagePrice: 800,
        priceRange: { min: 150, max: 3000 },
        popularServices: ['Evden Eve Nakliye', 'Ofis Taşıma', 'Kurye'],
        slug: 'nakliye-tasima',
        parentCategoryId: 'ev-yasam',
      },
      {
        id: 'bahce-peyzaj',
        name: 'Bahçe & Peyzaj',
        description: 'Bahçe düzenleme, peyzaj tasarımı ve bitki bakımı',
        serviceCount: 25,
        averagePrice: 900,
        priceRange: { min: 200, max: 4000 },
        popularServices: ['Peyzaj Tasarımı', 'Bahçe Bakımı', 'Çim Biçme'],
        slug: 'bahce-peyzaj',
        parentCategoryId: 'ev-yasam',
      },
      {
        id: 'guvenlik-sistemleri',
        name: 'Güvenlik Sistemleri',
        description: 'Alarm, kamera ve güvenlik sistemi kurulumu',
        serviceCount: 15,
        averagePrice: 1500,
        priceRange: { min: 300, max: 5000 },
        popularServices: ['Kamera Sistemi', 'Alarm Sistemi', 'Smart Lock'],
        slug: 'guvenlik-sistemleri',
        parentCategoryId: 'ev-yasam',
      },
    ],
  },

  // 5. EĞİTİM & DANIŞMANLIK
  {
    id: 'egitim-danismanlik',
    title: 'Eğitim & Danışmanlık',
    description:
      'Özel ders, yabancı dil, kariyer danışmanlığı ve eğitim hizmetleri',
    shortDescription: 'Özel ders ve kariyer danışmanlığı',
    icon: 'GraduationCap',
    iconColor: '#6366F1', // Indigo-500
    serviceCount: 80,
    averagePrice: 300,
    priceRange: { min: 50, max: 2000 },
    topSkills: [
      'İngilizce',
      'Matematik',
      'Programlama',
      'Müzik',
      'Kariyer Koçluğu',
    ],
    popularServices: [
      'İngilizce Dersi',
      'Matematik Dersi',
      'CV Hazırlama',
      'Kariyer Danışmanlığı',
    ],
    trending: false,
    featured: false,
    order: 5,
    slug: 'egitim-danismanlik',
    metadata: {
      seoTitle: 'Eğitim & Danışmanlık Hizmetleri | MarifetBul',
      seoDescription:
        'Özel ders, yabancı dil öğretimi ve kariyer danışmanlığı hizmetleri.',
      keywords: [
        'özel ders',
        'ingilizce dersi',
        'matematik',
        'kariyer danışmanlığı',
      ],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 650,
      completedProjects: 4200,
      averageRating: 4.9,
      responseTime: 2,
      successRate: 96,
      monthlyGrowth: 7,
    },
    subcategories: [
      {
        id: 'ozel-ders',
        name: 'Özel Ders',
        description:
          'İlkokul, ortaokul, lise ve üniversite özel ders hizmetleri',
        serviceCount: 35,
        averagePrice: 200,
        priceRange: { min: 50, max: 800 },
        popularServices: ['Matematik', 'Fizik', 'Kimya', 'Türkçe'],
        slug: 'ozel-ders',
        parentCategoryId: 'egitim-danismanlik',
      },
      {
        id: 'yabanci-dil',
        name: 'Yabancı Dil',
        description: 'İngilizce, Almanca, Fransızca ve diğer dil eğitimleri',
        serviceCount: 25,
        averagePrice: 250,
        priceRange: { min: 80, max: 1000 },
        popularServices: ['İngilizce', 'Almanca', 'IELTS Hazırlık'],
        slug: 'yabanci-dil',
        parentCategoryId: 'egitim-danismanlik',
      },
      {
        id: 'kariyer-danismanlik',
        name: 'Kariyer Danışmanlığı',
        description: 'CV hazırlama, iş görüşmesi koçluğu ve kariyer planlama',
        serviceCount: 12,
        averagePrice: 800,
        priceRange: { min: 200, max: 2000 },
        popularServices: [
          'CV Hazırlama',
          'LinkedIn Optimizasyonu',
          'İş Görüşmesi Koçluğu',
        ],
        slug: 'kariyer-danismanlik',
        trending: true,
        parentCategoryId: 'egitim-danismanlik',
      },
      {
        id: 'sanat-muzik',
        name: 'Sanat & Müzik',
        description: 'Müzik enstrümanları, resim ve sanat eğitimleri',
        serviceCount: 8,
        averagePrice: 350,
        priceRange: { min: 100, max: 1200 },
        popularServices: ['Piyano', 'Gitar', 'Resim', 'Dans'],
        slug: 'sanat-muzik',
        parentCategoryId: 'egitim-danismanlik',
      },
    ],
  },

  // 6. SAĞLIK & KİŞİSEL BAKIM
  {
    id: 'saglik-kisisel-bakim',
    title: 'Sağlık & Kişisel Bakım',
    description: 'Güzellik, fitness, beslenme ve sağlık hizmetleri',
    shortDescription: 'Güzellik, fitness ve sağlık',
    icon: 'Heart',
    iconColor: '#EC4899', // Pink-500
    serviceCount: 50,
    averagePrice: 400,
    priceRange: { min: 80, max: 2000 },
    topSkills: ['Kuaförlük', 'Makyaj', 'Fitness', 'Beslenme', 'Masaj'],
    popularServices: [
      'Kuaförlük',
      'Makyaj',
      'Personal Training',
      'Beslenme Koçluğu',
    ],
    trending: false,
    featured: false,
    order: 6,
    slug: 'saglik-kisisel-bakim',
    metadata: {
      seoTitle: 'Sağlık & Kişisel Bakım Hizmetleri | MarifetBul',
      seoDescription:
        'Güzellik, fitness, beslenme ve kişisel bakım uzmanları ile randevu alın.',
      keywords: ['kuaförlük', 'makyaj', 'fitness', 'beslenme koçluğu', 'masaj'],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 380,
      completedProjects: 2800,
      averageRating: 4.7,
      responseTime: 1,
      successRate: 92,
      monthlyGrowth: 4,
    },
    subcategories: [
      {
        id: 'guzellik-estetik',
        name: 'Güzellik & Estetik',
        description: 'Kuaförlük, makyaj, nail art ve cilt bakımı',
        serviceCount: 25,
        averagePrice: 350,
        priceRange: { min: 80, max: 1500 },
        popularServices: ['Kuaförlük', 'Makyaj', 'Nail Art', 'Cilt Bakımı'],
        slug: 'guzellik-estetik',
        parentCategoryId: 'saglik-kisisel-bakim',
      },
      {
        id: 'fitness-saglik',
        name: 'Fitness & Sağlık',
        description: 'Personal training, yoga, pilates ve fitness koçluğu',
        serviceCount: 15,
        averagePrice: 500,
        priceRange: { min: 150, max: 2000 },
        popularServices: [
          'Personal Training',
          'Yoga',
          'Pilates',
          'Beslenme Koçluğu',
        ],
        slug: 'fitness-saglik',
        parentCategoryId: 'saglik-kisisel-bakim',
      },
      {
        id: 'wellness-spa',
        name: 'Wellness & SPA',
        description: 'Masaj, aromaterapi ve wellness hizmetleri',
        serviceCount: 10,
        averagePrice: 400,
        priceRange: { min: 100, max: 1200 },
        popularServices: ['Masaj', 'Aromaterapi', 'Wellness Koçluğu'],
        slug: 'wellness-spa',
        parentCategoryId: 'saglik-kisisel-bakim',
      },
    ],
  },

  // 7-16. Diğer Kategoriler (Özet halinde - gerekirse detaylandırılabilir)
  {
    id: 'otomotiv',
    title: 'Otomotiv',
    description: 'Araç bakım, onarım ve otomotiv hizmetleri',
    shortDescription: 'Araç bakım ve onarım',
    icon: 'Car',
    iconColor: '#EF4444', // Red-500
    serviceCount: 30,
    averagePrice: 600,
    priceRange: { min: 100, max: 3000 },
    topSkills: ['Araç Bakım', 'Elektrik', 'Motor', 'Klima', 'Detailing'],
    popularServices: ['Araç Bakımı', 'Elektrik Tamiri', 'Klima Servisi'],
    trending: false,
    featured: false,
    order: 7,
    slug: 'otomotiv',
    metadata: {
      seoTitle: 'Otomotiv Hizmetleri | MarifetBul',
      seoDescription:
        'Araç bakım, onarım ve otomotiv uzmanları ile araç sorunlarınızı çözün.',
      keywords: ['araç bakım', 'araç tamiri', 'otomotiv', 'elektrik tamiri'],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 180,
      completedProjects: 1250,
      averageRating: 4.4,
      responseTime: 2,
      successRate: 88,
      monthlyGrowth: 3,
    },
    subcategories: [],
  },

  {
    id: 'finans-muhasebe',
    title: 'Finans & Muhasebe',
    description: 'Muhasebe, vergi, yatırım danışmanlığı ve finans hizmetleri',
    shortDescription: 'Muhasebe ve finans danışmanlığı',
    icon: 'DollarSign',
    iconColor: '#EAB308', // Yellow-500
    serviceCount: 25,
    averagePrice: 1200,
    priceRange: { min: 200, max: 5000 },
    topSkills: ['Muhasebe', 'Vergi', 'Yatırım', 'Mali Müşavirlik'],
    popularServices: [
      'Muhasebe Hizmetleri',
      'Vergi Danışmanlığı',
      'Yatırım Koçluğu',
    ],
    trending: false,
    featured: false,
    order: 8,
    slug: 'finans-muhasebe',
    metadata: {
      seoTitle: 'Finans & Muhasebe Hizmetleri | MarifetBul',
      seoDescription:
        'Muhasebe, vergi ve yatırım danışmanlığı için uzman mali müşavirler.',
      keywords: ['muhasebe', 'vergi danışmanlığı', 'mali müşavir', 'yatırım'],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 120,
      completedProjects: 980,
      averageRating: 4.8,
      responseTime: 4,
      successRate: 94,
      monthlyGrowth: 6,
    },
    subcategories: [],
  },

  // Diğer kategoriler benzer şekilde devam eder...
  // 9. Çevre & Enerji
  {
    id: 'cevre-enerji',
    title: 'Çevre & Enerji',
    description: 'Güneş enerjisi, çevre danışmanlığı ve sürdürülebilirlik',
    shortDescription: 'Güneş enerji ve çevre çözümleri',
    icon: 'Leaf',
    iconColor: '#22C55E', // Green-500
    serviceCount: 15,
    averagePrice: 2500,
    priceRange: { min: 500, max: 10000 },
    topSkills: ['Solar Panel', 'Çevre Danışmanlığı', 'Enerji Verimliliği'],
    popularServices: ['Solar Panel Kurulumu', 'Çevre Danışmanlığı'],
    trending: true,
    featured: false,
    order: 9,
    slug: 'cevre-enerji',
    metadata: {
      seoTitle: 'Çevre & Enerji Hizmetleri | MarifetBul',
      seoDescription: 'Güneş enerjisi ve çevre danışmanlığı için uzmanlar.',
      keywords: ['güneş enerjisi', 'çevre danışmanlığı', 'solar panel'],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 60,
      completedProjects: 320,
      averageRating: 4.6,
      responseTime: 3,
      successRate: 91,
      monthlyGrowth: 18,
    },
    subcategories: [],
  },

  // 10. Gıda & İçecek
  {
    id: 'gida-icecek',
    title: 'Gıda & İçecek',
    description: 'Catering, yemek hizmetleri ve mutfak danışmanlığı',
    shortDescription: 'Catering ve yemek hizmetleri',
    icon: 'ChefHat',
    iconColor: '#F97316', // Orange-500
    serviceCount: 20,
    averagePrice: 800,
    priceRange: { min: 150, max: 4000 },
    topSkills: ['Catering', 'Yemek Hazırlama', 'Pastane', 'Barista'],
    popularServices: ['Event Catering', 'Home Chef', 'Pasta Yapımı'],
    trending: false,
    featured: false,
    order: 10,
    slug: 'gida-icecek',
    metadata: {
      seoTitle: 'Gıda & İçecek Hizmetleri | MarifetBul',
      seoDescription: 'Catering, özel yemek hazırlama ve mutfak hizmetleri.',
      keywords: ['catering', 'yemek hazırlama', 'pasta yapımı', 'chef'],
      lastUpdated: '2025-10-04',
      isActive: true,
    },
    stats: {
      totalFreelancers: 90,
      completedProjects: 650,
      averageRating: 4.5,
      responseTime: 2,
      successRate: 87,
      monthlyGrowth: 4,
    },
    subcategories: [],
  },

  // 11-16. Kalan kategoriler...
];

// Platform İstatistikleri
export const PLATFORM_STATS = {
  totalCategories: 16,
  totalSubcategories: 89,
  totalFreelancers: 8540,
  totalProjects: 62890,
  averageProjectValue: 1850,
  successRate: 92,
  monthlyGrowth: 8.5,
  activeUsers: 125000,
};

// Trend Kategoriler
export const TRENDING_CATEGORIES = MARKETPLACE_CATEGORIES.filter(
  (cat) => cat.trending
);

// Featured Kategoriler
export const FEATURED_CATEGORIES = MARKETPLACE_CATEGORIES.filter(
  (cat) => cat.featured
);

// Kategori ID'sine göre kategori bulma
export const getCategoryById = (id: string): Category | undefined => {
  return MARKETPLACE_CATEGORIES.find((cat) => cat.id === id);
};

// Popüler kategoriler (hizmet sayısına göre)
export const getPopularCategories = (): Category[] => {
  return [...MARKETPLACE_CATEGORIES].sort(
    (a, b) => b.serviceCount - a.serviceCount
  );
};

// Alfabetik sıralama
export const getCategoriesAlphabetical = (): Category[] => {
  return [...MARKETPLACE_CATEGORIES].sort((a, b) =>
    a.title.localeCompare(b.title, 'tr')
  );
};
