import { http, HttpResponse } from 'msw';
import type { GetAnalyticsResponse } from '@/types/features/analytics';

// Mock Analytics Data
const mockFreelancerAnalytics = {
  profileViews: 1250,
  jobApplications: 45,
  jobsCompleted: 89,
  totalEarnings: 125000,
  averageRating: 4.9,
  responseTime: 2,
  clientSatisfaction: 4.9,
  skillDemand: [
    { skill: 'React', demand: 95 },
    { skill: 'Node.js', demand: 90 },
    { skill: 'TypeScript', demand: 88 },
  ],
  monthlyStats: [
    { month: '2025-01', applications: 15, earnings: 8000, completedJobs: 8 },
    { month: '2025-02', applications: 18, earnings: 9500, completedJobs: 9 },
    { month: '2025-03', applications: 20, earnings: 11000, completedJobs: 11 },
    { month: '2025-04', applications: 25, earnings: 13500, completedJobs: 12 },
    { month: '2025-05', applications: 22, earnings: 12000, completedJobs: 10 },
    { month: '2025-06', applications: 28, earnings: 14000, completedJobs: 13 },
    { month: '2025-07', applications: 30, earnings: 16000, completedJobs: 15 },
    { month: '2025-08', applications: 32, earnings: 18000, completedJobs: 16 },
    { month: '2025-09', applications: 28, earnings: 15000, completedJobs: 14 },
  ],
};

const mockEmployerAnalytics = {
  jobsPosted: 25,
  totalSpent: 75000,
  activeJobs: 3,
  completedJobs: 22,
  averageJobValue: 3400,
  timeToHire: 5,
  freelancerRetention: 0.8,
  projectSuccessRate: 0.95,
  monthlyStats: [
    { month: '2025-01', jobsPosted: 2, spent: 6000, hired: 2 },
    { month: '2025-02', jobsPosted: 3, spent: 8500, hired: 3 },
    { month: '2025-03', jobsPosted: 4, spent: 12000, hired: 4 },
    { month: '2025-04', jobsPosted: 3, spent: 9500, hired: 3 },
    { month: '2025-05', jobsPosted: 2, spent: 7000, hired: 2 },
    { month: '2025-06', jobsPosted: 4, spent: 13000, hired: 4 },
    { month: '2025-07', jobsPosted: 3, spent: 10000, hired: 3 },
    { month: '2025-08', jobsPosted: 2, spent: 6000, hired: 2 },
    { month: '2025-09', jobsPosted: 2, spent: 5000, hired: 1 },
  ],
};

export const reviewsAnalyticsHandlers = [
  // Analytics endpoints
  http.get('/api/v1/analytics', ({ request }) => {
    const url = new URL(request.url);
    const userType = url.searchParams.get('userType');

    const response: GetAnalyticsResponse = {
      success: true,
      data:
        userType === 'freelancer'
          ? {
              freelancer:
                mockFreelancerAnalytics as import('@/types/features/analytics').FreelancerAnalytics,
              employer: undefined,
            }
          : {
              freelancer: undefined,
              employer:
                mockEmployerAnalytics as import('@/types/features/analytics').EmployerAnalytics,
            },
      timeframe: 'month',
      lastUpdated: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      requestId: 'req-analytics-123',
      version: '1.0',
    };

    return HttpResponse.json(response);
  }),

  // Reviews endpoints - basic mock
  http.get('/api/v1/reviews', () => {
    return HttpResponse.json({
      success: true,
      data: {
        reviews: [],
        summary: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {},
        },
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-reviews-123',
      version: '1.0',
    });
  }),

  http.post('/api/v1/reviews', async ({ request }) => {
    await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        id: 'review-123',
        message: 'Review created successfully',
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-create-review-123',
      version: '1.0',
    });
  }),

  // Reputation endpoints - basic mock
  http.get('/api/v1/reputation/:userId', ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      success: true,
      data: {
        score: {
          userId: userId as string,
          score: 4.9,
          level: 'platinum',
          badges: ['verified-freelancer', 'top-rated'],
          reviews: {
            total: 89,
            average: 4.9,
            breakdown: { 5: 67, 4: 18, 3: 3, 2: 1, 1: 0 },
          },
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: new Date().toISOString(),
        },
        status: 'secure',
        trustIndicators: {
          isVerified: true,
          hasCompletedJobs: true,
          hasPositiveReviews: true,
          isFreelancerPlus: false,
          securityScore: 95,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-reputation-123',
      version: '1.0',
    });
  }),

  // Security alerts endpoints - basic mock
  http.get('/api/v1/security/alerts', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'alert-1',
          type: 'login',
          severity: 'medium',
          title: 'Şüpheli Giriş Denemesi',
          description: 'Farklı bir lokasyondan giriş denemesi tespit edildi.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'active',
          metadata: {
            location: 'İstanbul, Türkiye',
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
          },
        },
      ],
      timestamp: new Date().toISOString(),
      requestId: 'req-security-123',
      version: '1.0',
    });
  }),
];
