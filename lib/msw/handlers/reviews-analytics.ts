import { http, HttpResponse } from 'msw';
import type {
  ReviewData,
  CreateReviewRequest,
  CreateReviewResponse,
  ReviewsResponse,
  FreelancerAnalytics,
  EmployerAnalytics,
  GetAnalyticsResponse,
  ReputationScore,
  SecurityStatus,
  TrustIndicators,
  GetReputationResponse,
  SecurityAlert,
  GetSecurityAlertsResponse,
} from '@/types';

// Mock Reviews Data
const mockReviews: ReviewData[] = [
  {
    id: 'rev-123',
    orderId: 'order-123',
    reviewerId: 'user-1',
    revieweeId: 'user-2',
    reviewer: {
      id: 'user-1',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      avatar: '/images/avatars/avatar-1.jpg',
      userType: 'employer',
    },
    reviewee: {
      id: 'user-2',
      firstName: 'Ayşe',
      lastName: 'Kaya',
      avatar: '/images/avatars/avatar-2.jpg',
      userType: 'freelancer',
    },
    rating: 5,
    categories: {
      communication: 5,
      quality: 5,
      timing: 5,
      professionalism: 5,
      value: 4,
    },
    comment: 'Çok memnun kaldım, hızlı ve kaliteli iş! Tavsiye ederim.',
    isPublic: true,
    status: 'active',
    helpfulCount: 12,
    reportCount: 0,
    verifiedPurchase: true,
    projectTitle: 'Website Tasarımı',
    projectCategory: 'Web Development',
    createdAt: '2025-09-11T10:00:00Z',
  },
  {
    id: 'rev-124',
    orderId: 'order-124',
    reviewerId: 'user-3',
    revieweeId: 'user-2',
    reviewer: {
      id: 'user-3',
      firstName: 'Mehmet',
      lastName: 'Öz',
      avatar: '/images/avatars/avatar-3.jpg',
      userType: 'employer',
    },
    reviewee: {
      id: 'user-2',
      firstName: 'Ayşe',
      lastName: 'Kaya',
      avatar: '/images/avatars/avatar-2.jpg',
      userType: 'freelancer',
    },
    rating: 4,
    categories: {
      communication: 4,
      quality: 5,
      timing: 3,
      professionalism: 4,
      value: 4,
    },
    comment: 'İyi bir çalışma oldu, sadece teslimat biraz gecikti.',
    isPublic: true,
    reply: {
      id: 'reply-1',
      reviewId: 'rev-124',
      userId: 'user-2',
      user: {
        id: 'user-2',
        firstName: 'Ayşe',
        lastName: 'Kaya',
        avatar: '/images/avatars/avatar-2.jpg',
      },
      content:
        'Teşekkür ederim. Gecikme için özür dilerim, bir sonraki projede daha dikkatli olacağım.',
      createdAt: '2025-09-10T16:30:00Z',
    },
    status: 'active',
    helpfulCount: 5,
    reportCount: 0,
    verifiedPurchase: true,
    projectTitle: 'Logo Tasarımı',
    projectCategory: 'Graphic Design',
    createdAt: '2025-09-10T14:00:00Z',
  },
];

// Mock Analytics Data
const mockFreelancerAnalytics: FreelancerAnalytics = {
  overview: {
    totalEarnings: 125000,
    currentMonthEarnings: 15000,
    averageOrderValue: 2500,
    completedOrders: 89,
    activeOrders: 5,
    clientSatisfaction: 4.9,
    repeatClientRate: 0.32,
    responseTime: '2 saat',
    profileViews: 1250,
    proposalAcceptanceRate: 0.75,
  },
  earnings: {
    timeframe: { period: 'month' },
    totalEarnings: 125000,
    earningsTrend: [
      { date: '2025-01', value: 8000 },
      { date: '2025-02', value: 9500 },
      { date: '2025-03', value: 11000 },
      { date: '2025-04', value: 13500 },
      { date: '2025-05', value: 12000 },
      { date: '2025-06', value: 14000 },
      { date: '2025-07', value: 16000 },
      { date: '2025-08', value: 18000 },
      { date: '2025-09', value: 15000 },
    ],
    earningsByCategory: [
      { category: 'Web Development', amount: 45000, percentage: 36 },
      { category: 'Graphic Design', amount: 35000, percentage: 28 },
      { category: 'Content Writing', amount: 25000, percentage: 20 },
      { category: 'Mobile Development', amount: 20000, percentage: 16 },
    ],
    monthlyRecurring: 8500,
    projectedEarnings: 180000,
  },
  orders: {
    total: 94,
    completed: 89,
    inProgress: 5,
    cancelled: 0,
    averageOrderValue: 2500,
    ordersTrend: [
      { date: '2025-01', value: 8 },
      { date: '2025-02', value: 12 },
      { date: '2025-03', value: 10 },
      { date: '2025-04', value: 15 },
      { date: '2025-05', value: 9 },
      { date: '2025-06', value: 11 },
      { date: '2025-07', value: 13 },
      { date: '2025-08', value: 14 },
      { date: '2025-09', value: 12 },
    ],
    ordersByCategory: [
      { category: 'Web Development', count: 35, percentage: 37 },
      { category: 'Graphic Design', count: 28, percentage: 30 },
      { category: 'Content Writing', count: 20, percentage: 21 },
      { category: 'Mobile Development', count: 11, percentage: 12 },
    ],
    averageDeliveryTime: 5.2,
    onTimeDeliveryRate: 0.94,
  },
  clients: {
    totalClients: 67,
    newClients: 8,
    repeatClients: 21,
    repeatClientRate: 0.31,
    clientSatisfaction: 4.9,
    clientRetentionRate: 0.78,
    topClients: [
      {
        clientId: 'client-1',
        name: 'TechCorp Ltd.',
        avatar: '/images/companies/techcorp.jpg',
        totalSpent: 25000,
        orderCount: 8,
        lastOrderDate: '2025-09-10',
      },
      {
        clientId: 'client-2',
        name: 'Creative Agency',
        avatar: '/images/companies/creative.jpg',
        totalSpent: 18000,
        orderCount: 6,
        lastOrderDate: '2025-09-08',
      },
    ],
  },
  performance: {
    rating: 4.9,
    totalReviews: 89,
    ratingTrend: [
      { date: '2025-01', value: 4.7 },
      { date: '2025-02', value: 4.8 },
      { date: '2025-03', value: 4.8 },
      { date: '2025-04', value: 4.9 },
      { date: '2025-05', value: 4.9 },
      { date: '2025-06', value: 5.0 },
      { date: '2025-07', value: 4.9 },
      { date: '2025-08', value: 4.9 },
      { date: '2025-09', value: 4.9 },
    ],
    reviewsByRating: [
      { rating: 5, count: 67, percentage: 75 },
      { rating: 4, count: 18, percentage: 20 },
      { rating: 3, count: 3, percentage: 3 },
      { rating: 2, count: 1, percentage: 1 },
      { rating: 1, count: 0, percentage: 1 },
    ],
    skills: [
      {
        skillName: 'React',
        proficiency: 95,
        demandScore: 90,
        earningsContribution: 35000,
      },
      {
        skillName: 'Node.js',
        proficiency: 90,
        demandScore: 85,
        earningsContribution: 28000,
      },
      {
        skillName: 'TypeScript',
        proficiency: 88,
        demandScore: 80,
        earningsContribution: 25000,
      },
    ],
    responseTime: 2,
    proposalWinRate: 0.75,
  },
  growth: {
    profileViews: [
      { date: '2025-01', value: 120 },
      { date: '2025-02', value: 145 },
      { date: '2025-03', value: 180 },
      { date: '2025-04', value: 220 },
      { date: '2025-05', value: 195 },
      { date: '2025-06', value: 240 },
      { date: '2025-07', value: 280 },
      { date: '2025-08', value: 320 },
      { date: '2025-09', value: 350 },
    ],
    proposalsSent: [
      { date: '2025-01', value: 15 },
      { date: '2025-02', value: 18 },
      { date: '2025-03', value: 20 },
      { date: '2025-04', value: 25 },
      { date: '2025-05', value: 22 },
      { date: '2025-06', value: 28 },
      { date: '2025-07', value: 30 },
      { date: '2025-08', value: 32 },
      { date: '2025-09', value: 28 },
    ],
    conversionRate: [
      { date: '2025-01', value: 0.6 },
      { date: '2025-02', value: 0.65 },
      { date: '2025-03', value: 0.7 },
      { date: '2025-04', value: 0.75 },
      { date: '2025-05', value: 0.72 },
      { date: '2025-06', value: 0.78 },
      { date: '2025-07', value: 0.8 },
      { date: '2025-08', value: 0.82 },
      { date: '2025-09', value: 0.85 },
    ],
    marketShare: 0.08,
    rankInCategory: 12,
    growthRate: 0.15,
    opportunities: [
      {
        id: 'opp-1',
        type: 'skill',
        title: 'AI/ML Becerisi Ekle',
        description: 'Yapay zeka projelerinde %30 daha fazla kazanç fırsatı',
        potentialImpact: 'high',
        effort: 'medium',
        priority: 1,
        actionItems: [
          'Online kurs al',
          'Portfolio projesi yap',
          'Sertifika al',
        ],
        estimatedValue: 25000,
        timeframe: '3 ay',
      },
    ],
  },
};

// Mock Reputation Data
const mockReputationScore: ReputationScore = {
  userId: 'user-2',
  overallScore: 92,
  level: 'gold',
  badges: [
    {
      id: 'badge-1',
      name: 'Doğrulanmış Profil',
      description: 'Kimlik doğrulaması tamamlandı',
      icon: 'verified',
      color: 'blue',
      category: 'verification',
      earnedAt: '2025-08-15T10:00:00Z',
      isVisible: true,
    },
    {
      id: 'badge-2',
      name: 'Top Rated',
      description: '4.8+ ortalama puan',
      icon: 'star',
      color: 'gold',
      category: 'quality',
      earnedAt: '2025-09-01T10:00:00Z',
      isVisible: true,
    },
  ],
  factors: [
    {
      name: 'Profil Tamamlama',
      currentValue: 95,
      maxValue: 100,
      weight: 0.2,
      trend: 'stable',
      description: 'Profil bilgilerinin eksiksizliği',
    },
    {
      name: 'Müşteri Memnuniyeti',
      currentValue: 4.9,
      maxValue: 5,
      weight: 0.3,
      trend: 'improving',
      description: 'Ortalama müşteri puanı',
    },
    {
      name: 'Zamanında Teslimat',
      currentValue: 94,
      maxValue: 100,
      weight: 0.25,
      trend: 'stable',
      description: 'Projeler zamanında teslim edilme oranı',
    },
    {
      name: 'İletişim Kalitesi',
      currentValue: 88,
      maxValue: 100,
      weight: 0.15,
      trend: 'improving',
      description: 'Müşteri iletişim değerlendirmesi',
    },
    {
      name: 'Platform Aktivitesi',
      currentValue: 82,
      maxValue: 100,
      weight: 0.1,
      trend: 'stable',
      description: 'Platform kullanım sıklığı',
    },
  ],
  history: [
    {
      date: '2025-08',
      score: 88,
      change: +3,
      reason: 'Yeni pozitif incelemeler',
      factors: [],
    },
    {
      date: '2025-09',
      score: 92,
      change: +4,
      reason: 'Kimlik doğrulama tamamlandı',
      factors: [],
    },
  ],
  nextLevelRequirements: [
    {
      name: '10+ Proje Tamamla',
      description: 'Platinum seviye için',
      currentProgress: 8,
      targetValue: 10,
      isCompleted: false,
    },
  ],
  calculatedAt: '2025-09-12T10:00:00Z',
  expiresAt: '2025-09-19T10:00:00Z',
};

// Mock Security Alerts
const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: 'alert-1',
    userId: 'user-2',
    type: 'verification',
    severity: 'medium',
    title: '2FA Güvenlik Önerisi',
    description:
      'Hesabınızın güvenliği için iki faktörlü kimlik doğrulamayı etkinleştirin.',
    recommendations: ['SMS doğrulama ekle', 'Authenticator uygulaması kullan'],
    actionRequired: false,
    actionUrl: '/profile/security',
    actionText: 'Güvenlik Ayarları',
    dismissible: true,
    isDismissed: false,
    createdAt: '2025-09-10T10:00:00Z',
  },
  {
    id: 'alert-2',
    userId: 'user-2',
    type: 'account',
    severity: 'low',
    title: 'Profil Eksik Bilgi',
    description:
      'Profilinizde eksik bilgiler var. Tamamlayarak daha fazla iş fırsatı yakalayın.',
    recommendations: [
      'Portfolio örnekleri ekle',
      'Deneyim bilgilerini güncelle',
    ],
    actionRequired: false,
    actionUrl: '/profile/edit',
    actionText: 'Profili Düzenle',
    dismissible: true,
    isDismissed: false,
    createdAt: '2025-09-08T10:00:00Z',
  },
];

// MSW Handlers
export const reviewsAnalyticsHandlers = [
  // Reviews endpoints
  http.post('/api/v1/reviews', async ({ request }) => {
    const body = (await request.json()) as CreateReviewRequest;

    const newReview: ReviewData = {
      id: `rev-${Date.now()}`,
      orderId: body.orderId,
      reviewerId: body.reviewerId,
      revieweeId: body.revieweeId,
      reviewer: mockReviews[0].reviewer,
      reviewee: mockReviews[0].reviewee,
      rating: body.rating,
      categories: body.categories,
      comment: body.comment,
      isPublic: body.isPublic,
      status: 'active',
      helpfulCount: 0,
      reportCount: 0,
      verifiedPurchase: true,
      projectTitle: 'Yeni Proje',
      projectCategory: 'Web Development',
      createdAt: new Date().toISOString(),
    };

    const response: CreateReviewResponse = {
      success: true,
      data: newReview,
    };

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/reviews', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'User ID gereklidir' },
        { status: 400 }
      );
    }

    const response: ReviewsResponse = {
      success: true,
      data: {
        reviews: mockReviews,
        summary: {
          averageRating: 4.6,
          totalReviews: mockReviews.length,
          categoryAverages: {
            communication: 4.5,
            quality: 5.0,
            timing: 4.0,
            professionalism: 4.5,
            value: 4.0,
          },
          ratingDistribution: {
            5: 1,
            4: 1,
            3: 0,
            2: 0,
            1: 0,
          },
          recentReviews: mockReviews.slice(0, 3),
          verifiedPurchasePercentage: 100,
        },
        pagination: {
          page: 1,
          pageSize: 10,
          total: mockReviews.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/v1/reviews/:id/reply', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { content: string };

    const reply = {
      id: `reply-${Date.now()}`,
      reviewId: id as string,
      userId: 'current-user',
      user: {
        id: 'current-user',
        firstName: 'Current',
        lastName: 'User',
        avatar: '/images/avatars/current-user.jpg',
      },
      content: body.content,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true, data: reply });
  }),

  http.post('/api/v1/reviews/:id/helpful', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/v1/reviews/:id/report', async ({ request }) => {
    (await request.json()) as { reason: string; description?: string };
    return HttpResponse.json({ success: true });
  }),

  // Analytics endpoints
  http.get('/api/v1/analytics', ({ request }) => {
    const url = new URL(request.url);
    const userType = url.searchParams.get('userType');

    const response: GetAnalyticsResponse = {
      success: true,
      data:
        userType === 'freelancer'
          ? mockFreelancerAnalytics
          : ({} as EmployerAnalytics),
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/v1/analytics/export', async ({ request }) => {
    await request.json();

    return HttpResponse.json({
      success: true,
      data: {
        downloadUrl: '/downloads/analytics-export.pdf',
        filename: 'analytics-2025-09.pdf',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }),

  // Reputation endpoints
  http.get('/api/v1/reputation', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'User ID gereklidir' },
        { status: 400 }
      );
    }

    const mockSecurityStatus: SecurityStatus = {
      userId,
      overallScore: 85,
      level: 'good',
      verifications: [
        {
          type: 'email',
          status: 'verified',
          verifiedAt: '2025-08-01T10:00:00Z',
          retryCount: 0,
          maxRetries: 3,
        },
        {
          type: 'phone',
          status: 'verified',
          verifiedAt: '2025-08-02T10:00:00Z',
          retryCount: 0,
          maxRetries: 3,
        },
        { type: 'identity', status: 'pending', retryCount: 1, maxRetries: 3 },
        { type: '2fa', status: 'not_started', retryCount: 0, maxRetries: 3 },
      ],
      alerts: mockSecurityAlerts,
      recommendations: [
        {
          id: 'rec-1',
          type: '2fa',
          priority: 'high',
          title: 'İki Faktörlü Kimlik Doğrulama',
          description: 'Hesabınızın güvenliği için 2FA etkinleştirin',
          impact: 'Hesap güvenliğini %80 artırır',
          actionText: 'Etkinleştir',
          actionUrl: '/profile/security/2fa',
          isCompleted: false,
          estimatedTime: '5 dakika',
        },
      ],
      lastAssessment: '2025-09-12T10:00:00Z',
      nextAssessment: '2025-09-19T10:00:00Z',
    };

    const mockTrustIndicators: TrustIndicators = {
      userId,
      profileCompletion: 95,
      verificationLevel: 75,
      activityScore: 88,
      reviewScore: 92,
      responseReliability: 94,
      paymentHistory: 100,
      communityStanding: 85,
      overallTrustScore: 89,
      publicBadges: mockReputationScore.badges,
      calculatedAt: new Date().toISOString(),
    };

    const response: GetReputationResponse = {
      success: true,
      data: {
        score: mockReputationScore,
        status: mockSecurityStatus,
        trustIndicators: mockTrustIndicators,
      },
    };

    return HttpResponse.json(response);
  }),

  // Security endpoints
  http.get('/api/v1/security/alerts', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'User ID gereklidir' },
        { status: 400 }
      );
    }

    const response: GetSecurityAlertsResponse = {
      success: true,
      data: mockSecurityAlerts,
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/v1/security/alerts/:id/dismiss', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/v1/security/verification/start', async ({ request }) => {
    (await request.json()) as { type: string };
    return HttpResponse.json({ success: true });
  }),
];
