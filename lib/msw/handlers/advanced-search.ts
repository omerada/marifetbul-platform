import { http, HttpResponse } from 'msw';

// Basit mock veri ve handler'lar
export const advancedSearchHandlers = [
  // Advanced search endpoint
  http.post('/api/search/advanced', async () => {
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
          page: 1,
          pageSize: 20,
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
          skills: [
            { name: 'React', count: 35 },
            { name: 'TypeScript', count: 28 },
            { name: 'Node.js', count: 22 },
          ],
          priceRanges: [
            { range: '0-50000', count: 8 },
            { range: '50000-100000', count: 15 },
            { range: '100000+', count: 7 },
          ],
          ratings: [
            { rating: 4.5, count: 25 },
            { rating: 4.0, count: 35 },
            { rating: 3.5, count: 8 },
          ],
          experienceLevels: [
            { level: 'Junior', count: 5 },
            { level: 'Mid-level', count: 18 },
            { level: 'Senior', count: 22 },
          ],
        },
        searchId: `search_${Date.now()}`,
      },
    });
  }),

  // Search suggestions endpoint
  http.get('/api/search/suggestions', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    if (query.length < 2) {
      return HttpResponse.json({
        success: true,
        data: {
          suggestions: [],
          trending: ['React', 'TypeScript', 'Node.js'],
          recent: [],
        },
      });
    }

    const allSuggestions = [
      'React',
      'TypeScript',
      'Node.js',
      'Python',
      'JavaScript',
      'Vue.js',
      'Angular',
    ];
    const filteredSuggestions = allSuggestions
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);

    return HttpResponse.json({
      success: true,
      data: {
        suggestions: filteredSuggestions,
        trending: ['React', 'TypeScript', 'Node.js'],
        recent: ['JavaScript', 'Python'],
      },
    });
  }),

  // Save search endpoint
  http.post('/api/search/save', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      query: string;
      filters?: Record<string, unknown>;
    };

    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({
      success: true,
      message: 'Arama başarıyla kaydedildi',
      data: {
        id: `search_${Date.now()}`,
        name: body.name,
        query: body.query,
        filters: body.filters || {},
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // Get saved searches
  http.get('/api/search/saved', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'search_1',
          name: 'React Developer İstanbul',
          query: 'React developer',
          createdAt: '2024-09-01T10:00:00Z',
        },
        {
          id: 'search_2',
          name: 'Frontend Jobs',
          query: 'frontend',
          createdAt: '2024-09-02T10:00:00Z',
        },
      ],
    });
  }),

  // Delete saved search
  http.delete('/api/search/saved/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Kayıtlı arama başarıyla silindi',
    });
  }),
];
