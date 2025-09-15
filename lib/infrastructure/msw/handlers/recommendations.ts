import { http, HttpResponse } from 'msw';

// Mock recommendations data
const mockRecommendations = [
  {
    id: 'rec_1',
    score: 0.95,
    reasons: ['Similar skills', 'Good ratings', 'Available now'],
    item: {
      id: 'job_1',
      title: 'Senior React Developer',
      company: 'Tech Startup',
      location: 'İstanbul',
      salary: '80,000-120,000 TL',
      skills: ['React', 'TypeScript', 'Node.js'],
      rating: 4.8,
    },
    metadata: {
      category: 'jobs',
      featured: true,
      urgent: false,
    },
  },
  {
    id: 'rec_2',
    score: 0.88,
    reasons: ['Experience match', 'Location preference'],
    item: {
      id: 'freelancer_1',
      name: 'Ahmet Yılmaz',
      title: 'Full Stack Developer',
      location: 'İstanbul',
      hourlyRate: '300-500 TL',
      skills: ['React', 'Node.js', 'MongoDB'],
      rating: 4.9,
      avatar: '/avatars/ahmet.jpg',
    },
    metadata: {
      category: 'freelancers',
      featured: false,
      urgent: false,
    },
  },
  {
    id: 'rec_3',
    score: 0.82,
    reasons: ['Popular service', 'Good reviews'],
    item: {
      id: 'service_1',
      title: 'Modern Web Sitesi Tasarımı',
      provider: 'Zeynep Kaya',
      price: '15,000 TL',
      deliveryTime: '2 hafta',
      rating: 4.7,
      image: '/services/web-design.jpg',
    },
    metadata: {
      category: 'services',
      featured: true,
      urgent: false,
    },
  },
];

export const recommendationHandlers = [
  // Get recommendations
  http.get('/api/recommendations', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredRecommendations = mockRecommendations;

    if (type !== 'all') {
      filteredRecommendations = mockRecommendations.filter(
        (rec) => rec.metadata.category === type
      );
    }

    const limitedRecommendations = filteredRecommendations.slice(0, limit);

    return HttpResponse.json({
      success: true,
      data: {
        recommendations: limitedRecommendations,
        totalCount: filteredRecommendations.length,
        hasMore: filteredRecommendations.length > limit,
      },
    });
  }),

  // Post recommendations request
  http.post('/api/recommendations', async ({ request }) => {
    const body = (await request.json()) as {
      type: string;
      limit?: number;
      excludeIds?: string[];
      basedOn?: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredRecommendations = mockRecommendations;

    if (body.type && body.type !== 'all') {
      filteredRecommendations = mockRecommendations.filter(
        (rec) => rec.metadata.category === body.type
      );
    }

    if (body.excludeIds?.length) {
      filteredRecommendations = filteredRecommendations.filter(
        (rec) => !body.excludeIds?.includes(rec.id)
      );
    }

    const limit = body.limit || 10;
    const limitedRecommendations = filteredRecommendations.slice(0, limit);

    return HttpResponse.json({
      success: true,
      data: {
        recommendations: limitedRecommendations,
        totalCount: filteredRecommendations.length,
        hasMore: filteredRecommendations.length > limit,
        basedOn: body.basedOn || 'profile',
      },
    });
  }),

  // Provide recommendation feedback
  http.post('/api/recommendations/feedback', async ({ request }) => {
    const body = (await request.json()) as {
      recommendationId: string;
      type: 'like' | 'dislike' | 'not_interested' | 'applied';
      rating?: number;
      reason?: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Geri bildirim kaydedildi',
      data: {
        recommendationId: body.recommendationId,
        feedback: {
          type: body.type,
          rating: body.rating,
          reason: body.reason,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }),

  // Get recommendation analytics
  http.get('/api/recommendations/analytics', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalShown: 145,
        totalClicked: 32,
        totalApplied: 8,
        clickThroughRate: 0.22,
        conversionRate: 0.055,
        categories: {
          jobs: { shown: 85, clicked: 20, applied: 5 },
          freelancers: { shown: 35, clicked: 8, applied: 2 },
          services: { shown: 25, clicked: 4, applied: 1 },
        },
        topReasons: [
          { reason: 'Similar skills', count: 45 },
          { reason: 'Good ratings', count: 32 },
          { reason: 'Location match', count: 28 },
        ],
      },
    });
  }),

  // Refresh recommendations
  http.post('/api/recommendations/refresh', async ({ request }) => {
    const body = (await request.json()) as { type?: string };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Shuffle the recommendations to simulate new ones
    const shuffledRecommendations = [...mockRecommendations].sort(
      () => Math.random() - 0.5
    );

    let filteredRecommendations = shuffledRecommendations;

    if (body.type && body.type !== 'all') {
      filteredRecommendations = shuffledRecommendations.filter(
        (rec) => rec.metadata.category === body.type
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Öneriler yenilendi',
      data: {
        recommendations: filteredRecommendations.slice(0, 10),
        totalCount: filteredRecommendations.length,
        refreshedAt: new Date().toISOString(),
      },
    });
  }),
];
