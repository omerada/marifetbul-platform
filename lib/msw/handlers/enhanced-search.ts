import { http, HttpResponse } from 'msw';
import { SearchResult } from '@/types/search';

// Enhanced search interfaces
interface SearchRequest {
  query: string;
  filters: {
    categories?: string[];
    location?: string;
    budget?: [number, number];
    rating?: string;
    availability?: string;
    jobType?: string[];
    deliveryTime?: string;
    experience?: string;
  };
  facets?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'rating' | 'price';
  mode?: 'jobs' | 'services' | 'freelancers' | 'all';
}

interface SearchAnalytics {
  query: string;
  timestamp: string;
  resultCount: number;
  filters: Record<string, string | string[] | number | boolean>;
  userAgent: string;
  sessionId: string;
}

// Utility functions for generating mock data
const generateId = () => Math.random().toString(36).substring(2, 9);

const generateRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomFloat = (min: number, max: number, decimals: number) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const generateRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

const getRandomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Mock data
const categories = [
  'Web Geliştirme',
  'Mobil Geliştirme',
  'UI/UX Tasarım',
  'Grafik Tasarım',
  'İçerik Yazımı',
  'Dijital Pazarlama',
  'SEO',
  'Proje Yönetimi',
];

const locations = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Gaziantep',
  'Remote',
];

const skills = [
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'PHP',
  'Python',
  'Java',
  'TypeScript',
  'JavaScript',
  'HTML',
  'CSS',
  'Bootstrap',
  'Tailwind',
];

const titles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Grafik Tasarımcı',
  'İçerik Yazarı',
  'SEO Uzmanı',
  'Proje Yöneticisi',
  'Sistem Yöneticisi',
  'DevOps Engineer',
];

const names = [
  'Ahmet Yılmaz',
  'Mehmet Demir',
  'Ayşe Kaya',
  'Fatma Şahin',
  'Mustafa Çelik',
  'Emine Öztürk',
  'Ali Vural',
  'Zeynep Kurt',
];

const descriptions = [
  'Profesyonel ve kaliteli hizmet sunuyorum.',
  'Modern teknolojiler ile projelerinizi hayata geçiriyorum.',
  'Zamanında teslim, mükemmel sonuç garantisi.',
  'Deneyimli ekibimizle sizin için çalışıyoruz.',
];

// Generate mock search result
const generateMockResult = (
  type: 'job' | 'service' | 'freelancer'
): SearchResult => {
  const baseResult = {
    id: generateId(),
    title: getRandomElement(titles),
    description: getRandomElement(descriptions),
    type,
    category: getRandomElement(categories),
    location: getRandomElement(locations),
    budget: {
      min: generateRandomInt(500, 2000),
      max: generateRandomInt(2000, 10000),
      currency: 'TRY',
    },
    rating: generateRandomFloat(3, 5, 1),
    reviews: generateRandomInt(5, 200),
    featured: Math.random() < 0.2,
    urgent: Math.random() < 0.15,
    verified: Math.random() < 0.8,
    postedAt: generateRandomDate(30),
    skills: getRandomElements(skills, generateRandomInt(2, 5)),
    metrics: {
      views: generateRandomInt(10, 500),
      applications: generateRandomInt(0, 50),
      responseTime: getRandomElement(['1 saat', '2 saat', '1 gün', '2 gün']),
    },
    user: {
      id: generateId(),
      name: getRandomElement(names),
      avatar: '/images/avatar-placeholder.png',
      rating: generateRandomFloat(3, 5, 1),
    },
    createdAt: generateRandomDate(30),
    updatedAt: generateRandomDate(7),
    price: generateRandomInt(500, 5000),
    currency: 'TRY',
    reviewCount: generateRandomInt(5, 200),
    image: '/images/service-placeholder.jpg',
  };

  if (type === 'job') {
    return {
      ...baseResult,
      deadline: generateRandomDate(-30),
      employer: {
        id: generateId(),
        name: getRandomElement([
          'TechCorp',
          'DesignStudio',
          'StartupTR',
          'DigitalAgency',
        ]),
        avatar: '/images/avatar-placeholder.png',
        verified: Math.random() < 0.7,
        rating: generateRandomFloat(3, 5, 1),
      },
    };
  }

  if (type === 'freelancer') {
    return {
      ...baseResult,
      freelancer: {
        id: generateId(),
        name: getRandomElement(names),
        avatar: '/images/avatar-placeholder.png',
        title:
          'Freelance ' +
          getRandomElement(['Developer', 'Designer', 'Writer', 'Marketer']),
        hourlyRate: generateRandomInt(50, 500),
        availability: getRandomElement(['Şimdi Müsait', 'Bu Hafta', 'Bu Ay']),
        level: getRandomElement(['Başlangıç', 'Orta', 'Uzman', 'En İyi']),
      },
    };
  }

  return baseResult;
};

// Enhanced search handlers
export const enhancedSearchHandlers = [
  // Enhanced search endpoint
  http.post('/api/search/enhanced', async ({ request }) => {
    const body = (await request.json()) as SearchRequest;
    const { query, filters = {}, page = 1, limit = 20, mode = 'all' } = body;

    // Simulate search delay
    await new Promise((resolve) =>
      setTimeout(resolve, generateRandomInt(100, 500))
    );

    // Generate results based on mode
    let results: SearchResult[] = [];
    const totalResults = generateRandomInt(50, 500);

    if (mode === 'all') {
      results = Array.from({ length: limit }, () => {
        const type = getRandomElement([
          'job',
          'service',
          'freelancer',
        ] as const);
        return generateMockResult(type);
      });
    } else {
      const typeMap = {
        jobs: 'job' as const,
        services: 'service' as const,
        freelancers: 'freelancer' as const,
      };
      results = Array.from({ length: limit }, () =>
        generateMockResult(typeMap[mode as keyof typeof typeMap])
      );
    }

    return HttpResponse.json({
      results,
      facets: {
        categories: categories.map((cat) => ({
          name: cat,
          count: generateRandomInt(1, 50),
          selected: filters.categories?.includes(cat) || false,
        })),
        locations: locations.map((loc) => ({
          name: loc,
          count: generateRandomInt(1, 30),
          selected: filters.location === loc,
        })),
        skills: skills.slice(0, 10).map((skill) => ({
          name: skill,
          count: generateRandomInt(1, 40),
          selected: false,
        })),
        priceRanges: [
          { name: '0-50000', count: generateRandomInt(5, 25) },
          { name: '50000-100000', count: generateRandomInt(10, 35) },
          { name: '100000+', count: generateRandomInt(1, 15) },
        ],
        ratings: [
          { name: '4.5+', count: generateRandomInt(20, 80) },
          { name: '4.0+', count: generateRandomInt(30, 100) },
          { name: '3.5+', count: generateRandomInt(10, 40) },
        ],
        experience: [
          { name: 'Başlangıç', count: generateRandomInt(5, 20) },
          { name: 'Orta', count: generateRandomInt(15, 40) },
          { name: 'Uzman', count: generateRandomInt(10, 30) },
        ],
      },
      pagination: {
        page,
        limit,
        total: totalResults,
        pages: Math.ceil(totalResults / limit),
      },
      searchTime: generateRandomInt(50, 300),
      query,
      suggestions: [
        `${query} uzmanı`,
        `${query} freelancer`,
        `${query} projesi`,
      ],
    });
  }),

  // Advanced search endpoint (consolidated from advanced-search.ts)
  http.post('/api/search/advanced', async ({ request }) => {
    const searchBody = (await request.json()) as {
      query?: string;
      filters?: Record<string, unknown>;
      page?: number;
      limit?: number;
    };

    // Use searchBody for potential future enhancements
    console.log('Advanced search request:', searchBody);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return HttpResponse.json({
      success: true,
      data: {
        results: [
          {
            id: '1',
            title: 'Frontend Developer',
            description:
              'React ve TypeScript ile modern web uygulamaları geliştirme',
            type: 'job',
          },
          {
            id: '2',
            title: 'Ahmet Yılmaz',
            description: 'Senior React Developer',
            type: 'freelancer',
          },
        ],
        pagination: {
          page: searchBody.page || 1,
          pageSize: searchBody.limit || 20,
          total: 45,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
        facets: {
          categories: [
            { name: 'Web Geliştirme', count: 15 },
            { name: 'Mobil Geliştirme', count: 8 },
            { name: 'Tasarım', count: 12 },
          ],
          locations: [
            { name: 'İstanbul', count: 25 },
            { name: 'Ankara', count: 12 },
            { name: 'İzmir', count: 8 },
          ],
        },
        searchId: `search_${Date.now()}`,
      },
    });
  }),

  // Save search endpoint (consolidated from advanced-search.ts)
  http.post('/api/search/save', async ({ request }) => {
    const saveBody = (await request.json()) as {
      query: string;
      filters: Record<string, unknown>;
      name?: string;
    };

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        query: saveBody.query,
        filters: saveBody.filters,
        name: saveBody.name || `Saved Search ${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // Search analytics endpoint
  http.post('/api/search/analytics', async ({ request }) => {
    const body = (await request.json()) as SearchAnalytics;

    // Store analytics (in real app, this would go to database)
    console.log('Search Analytics:', body);

    return HttpResponse.json({
      success: true,
      message: 'Analytics recorded',
    });
  }),

  // Search suggestions endpoint
  http.get('/api/search/suggestions', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const suggestions = [
      {
        text: `${query} jobs`,
        type: 'jobs',
        count: generateRandomInt(20, 100),
      },
      {
        text: `${query} services`,
        type: 'services',
        count: generateRandomInt(15, 80),
      },
      {
        text: `${query} freelancers`,
        type: 'freelancers',
        count: generateRandomInt(10, 60),
      },
    ];

    return HttpResponse.json({
      suggestions,
      trending: [
        'React Developer',
        'UI/UX Design',
        'Content Marketing',
        'Python Programming',
        'WordPress Development',
      ],
    });
  }),
];
