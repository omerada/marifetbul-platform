import { http, HttpResponse } from 'msw';

// Mock data
const mockSEOMeta = {
  title: 'Freelancer Ara | Marifet Bul',
  description:
    "Türkiye'nin en büyük freelancer platformunda kaliteli hizmet sağlayıcıları bulun.",
  keywords: ['freelancer', 'iş', 'proje', 'hizmet'],
  openGraph: {
    title: 'Freelancer Ara | Marifet Bul',
    description: 'Kaliteli freelancerlar ile projelerinizi hayata geçirin.',
    image: 'https://marifetbul.com/og-image.jpg',
    url: 'https://marifetbul.com/marketplace',
    type: 'website',
    siteName: 'Marifet Bul',
  },
  twitterCard: {
    card: 'summary_large_image',
    title: 'Freelancer Ara | Marifet Bul',
    description: 'Kaliteli freelancerlar ile projelerinizi hayata geçirin.',
    image: 'https://marifetbul.com/twitter-image.jpg',
    site: '@marifetbul',
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Marifet Bul',
    url: 'https://marifetbul.com',
  },
  canonical: 'https://marifetbul.com/marketplace',
  robots: 'index,follow',
};

const mockPerformanceMetrics = {
  coreWebVitals: {
    lcp: 1.2, // seconds
    fid: 50, // milliseconds
    cls: 0.05, // score
    fcp: 800, // milliseconds
    ttfb: 200, // milliseconds
  },
  loadTimes: {
    ttfb: 200,
    fcp: 800,
    domReady: 1500,
    loadComplete: 2100,
  },
  bundleSize: {
    js: 245, // KB
    css: 45,
    images: 1200,
    fonts: 50,
    total: 1540,
  },
  cacheHitRate: 0.85,
  networkType: '4g',
  deviceType: 'desktop' as const,
  timestamp: new Date().toISOString(),
};

const mockSearchSuggestions = {
  suggestions: [
    {
      text: 'web tasarım',
      type: 'skill' as const,
      count: 145,
      category: 'Teknoloji',
    },
    {
      text: 'logo tasarımı',
      type: 'service' as const,
      count: 89,
      category: 'Tasarım',
    },
    {
      text: 'mobil uygulama',
      type: 'job' as const,
      count: 67,
      category: 'Teknoloji',
    },
    { text: 'istanbul', type: 'location' as const, count: 234 },
    {
      text: 'javascript',
      type: 'skill' as const,
      count: 156,
      category: 'Programlama',
    },
  ],
  trending: ['yapay zeka', 'e-ticaret', 'sosyal medya', 'dijital pazarlama'],
  recent: ['web tasarım', 'grafik tasarım', 'veri analizi'],
  categories: [
    { name: 'Teknoloji', count: 456 },
    { name: 'Tasarım', count: 234 },
    { name: 'Pazarlama', count: 178 },
    { name: 'Yazılım', count: 345 },
  ],
};

const mockSearchResults = {
  results: [
    {
      id: '1',
      type: 'job' as const,
      title: 'E-ticaret sitesi için React Developer',
      description:
        'Modern e-ticaret platformu için deneyimli React developer aranıyor.',
      price: 15000,
      currency: 'TRY',
      rating: 4.8,
      reviewCount: 24,
      location: 'İstanbul',
      skills: ['React', 'TypeScript', 'Node.js'],
      image: '/images/jobs/1.jpg',
      user: {
        id: '1',
        name: 'Ahmet Teknoloji Ltd.',
        avatar: '/images/users/1.jpg',
        rating: 4.9,
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      featured: true,
    },
    {
      id: '2',
      type: 'service' as const,
      title: 'Profesyonel Logo Tasarımı',
      description: 'Markanız için özel ve etkileyici logo tasarımları.',
      price: 500,
      currency: 'TRY',
      rating: 4.9,
      reviewCount: 156,
      location: 'Ankara',
      skills: ['Adobe Illustrator', 'Photoshop', 'Brand Design'],
      image: '/images/services/1.jpg',
      user: {
        id: '2',
        name: 'Ayşe Kaya',
        avatar: '/images/users/2.jpg',
        rating: 4.8,
      },
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-14T15:30:00Z',
    },
  ],
  facets: {
    categories: [
      { name: 'Teknoloji', count: 145, selected: false },
      { name: 'Tasarım', count: 89, selected: false },
      { name: 'Pazarlama', count: 67, selected: false },
    ],
    priceRanges: [
      { name: '0-1000 TL', count: 45, selected: false },
      { name: '1000-5000 TL', count: 78, selected: false },
      { name: '5000+ TL', count: 34, selected: false },
    ],
    locations: [
      { name: 'İstanbul', count: 234, selected: false },
      { name: 'Ankara', count: 123, selected: false },
      { name: 'İzmir', count: 89, selected: false },
    ],
    skills: [
      { name: 'React', count: 67, selected: false },
      { name: 'JavaScript', count: 89, selected: false },
      { name: 'Photoshop', count: 45, selected: false },
    ],
    ratings: [
      { name: '4+ Yıldız', count: 156, selected: false },
      { name: '3+ Yıldız', count: 234, selected: false },
    ],
    experience: [
      { name: 'Giriş Seviye', count: 45, selected: false },
      { name: 'Orta Seviye', count: 89, selected: false },
      { name: 'İleri Seviye', count: 67, selected: false },
    ],
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 234,
    pages: 12,
  },
  searchTime: 0.045,
  suggestions: ['web development', 'react developer'],
  didYouMean: undefined,
};

const mockSocialStats = {
  facebook: 145,
  twitter: 89,
  linkedin: 67,
  whatsapp: 234,
  total: 535,
};

export const seoPerformanceHandlers = [
  // SEO Meta Tags
  http.get('/api/v1/seo/meta', ({ request }) => {
    const url = new URL(request.url);
    const pageUrl = url.searchParams.get('url');

    // Customize meta based on URL
    const customMeta = { ...mockSEOMeta };

    if (pageUrl?.includes('marketplace')) {
      customMeta.title = 'Marketplace | Marifet Bul';
      customMeta.description = 'Binlerce freelancer ve iş fırsatı bir arada.';
    } else if (pageUrl?.includes('profile')) {
      customMeta.title = 'Freelancer Profili | Marifet Bul';
      customMeta.description = 'Deneyimli freelancer profili ve portfolio.';
    }

    return HttpResponse.json({ data: customMeta });
  }),

  // Performance Metrics
  http.get('/api/v1/performance/metrics', () => {
    // Simulate varying performance
    const variableMetrics = {
      ...mockPerformanceMetrics,
      coreWebVitals: {
        ...mockPerformanceMetrics.coreWebVitals,
        lcp: 1.0 + Math.random() * 0.8, // 1.0-1.8s
        fid: 30 + Math.random() * 40, // 30-70ms
        cls: 0.02 + Math.random() * 0.08, // 0.02-0.1
      },
      timestamp: new Date().toISOString(),
    };

    return HttpResponse.json({ data: variableMetrics });
  }),

  // Search Suggestions
  http.get('/api/v1/search/suggestions', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';

    // Filter suggestions based on query
    const filteredSuggestions = mockSearchSuggestions.suggestions.filter(
      (suggestion) => suggestion.text.toLowerCase().includes(query)
    );

    return HttpResponse.json({
      data: {
        ...mockSearchSuggestions,
        suggestions: filteredSuggestions.slice(0, 8),
      },
    });
  }),

  // Advanced Search
  http.post('/api/v1/search/advanced', async ({ request }) => {
    const body = (await request.json()) as {
      query: string;
      filters: { type?: string; location?: string };
      page?: number;
      limit?: number;
    };
    const { query, filters, page = 1, limit = 20 } = body;

    // Simulate search delay
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );

    // Filter results based on query and filters
    let filteredResults = [...mockSearchResults.results];

    if (query) {
      filteredResults = filteredResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.skills.some((skill) =>
            skill.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

    if (filters.type && filters.type !== 'all') {
      filteredResults = filteredResults.filter(
        (result) => result.type === filters.type
      );
    }

    if (filters.location) {
      filteredResults = filteredResults.filter((result) =>
        result.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedResults = filteredResults.slice(
      startIndex,
      startIndex + limit
    );

    const response = {
      ...mockSearchResults,
      results: paginatedResults,
      pagination: {
        page,
        limit,
        total: filteredResults.length,
        pages: Math.ceil(filteredResults.length / limit),
      },
      searchTime: 0.045 + Math.random() * 0.1,
    };

    return HttpResponse.json({ data: response });
  }),

  // Social Share Stats
  http.get('/api/v1/social/share-stats', ({ request }) => {
    const url = new URL(request.url);
    const shareUrl = url.searchParams.get('url');

    // Simulate different stats based on URL
    let stats = { ...mockSocialStats };

    if (shareUrl?.includes('job')) {
      stats = {
        facebook: 89,
        twitter: 156,
        linkedin: 234,
        whatsapp: 67,
        total: 546,
      };
    } else if (shareUrl?.includes('service')) {
      stats = {
        facebook: 234,
        twitter: 78,
        linkedin: 45,
        whatsapp: 123,
        total: 480,
      };
    }

    return HttpResponse.json({ data: stats });
  }),

  // Social Login (Mock)
  http.post('/api/v1/social/login/:provider', async ({ params }) => {
    const { provider } = params;

    // Simulate login delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      return HttpResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 400 }
      );
    }

    const mockUser = {
      id: `${provider}-${Date.now()}`,
      email: `user@${provider}.com`,
      name: `${provider} User`,
      avatar: `/images/avatars/${provider}.jpg`,
      provider: provider as string,
    };

    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  // Referral Tracking
  http.post('/api/v1/social/referral', async ({ request }) => {
    await request.json(); // Parse request body

    // Simulate tracking
    // Track referral data

    return HttpResponse.json({
      success: true,
      referralId: `ref_${Date.now()}`,
    });
  }),
];
