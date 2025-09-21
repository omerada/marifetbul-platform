import { http, HttpResponse } from 'msw';

// Mock analytics data
const generateAnalyticsData = (dateRange: string) => {
  const now = new Date();
  const getDaysBack = (range: string) => {
    switch (range) {
      case '1d':
        return 1;
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        return 7;
    }
  };

  const days = getDaysBack(dateRange);
  const base = days === 1 ? 50 : days * 10;

  return {
    summary: {
      totalActions: Math.floor(base * (Math.random() * 0.4 + 0.8)),
      approved: Math.floor(base * 0.6 * (Math.random() * 0.3 + 0.7)),
      rejected: Math.floor(base * 0.25 * (Math.random() * 0.4 + 0.6)),
      escalated: Math.floor(base * 0.1 * (Math.random() * 0.5 + 0.5)),
      pending: Math.floor(base * 0.05 * (Math.random() * 0.8 + 0.2)),
      avgResponseTime: Math.floor(Math.random() * 120 + 30), // minutes
      automationRate: Math.floor(Math.random() * 30 + 60), // percentage
      accuracyRate: Math.floor(Math.random() * 10 + 88), // percentage
    },
    trends: {
      actions: Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        date: new Date(now.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        approved: Math.floor(Math.random() * 50 + 20),
        rejected: Math.floor(Math.random() * 30 + 10),
        escalated: Math.floor(Math.random() * 10 + 2),
        pending: Math.floor(Math.random() * 5 + 1),
      })),
      responseTime: Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        date: new Date(now.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        avgTime: Math.floor(Math.random() * 60 + 30),
        medianTime: Math.floor(Math.random() * 45 + 25),
      })),
      automation: Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        date: new Date(now.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        automated: Math.floor(Math.random() * 40 + 50),
        manual: Math.floor(Math.random() * 30 + 20),
      })),
    },
    moderators: [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        avatar: '/images/avatars/avatar1.jpg',
        totalActions: Math.floor(Math.random() * 200 + 100),
        approved: Math.floor(Math.random() * 150 + 80),
        rejected: Math.floor(Math.random() * 40 + 15),
        escalated: Math.floor(Math.random() * 10 + 3),
        avgResponseTime: Math.floor(Math.random() * 45 + 20),
        accuracyRate: Math.floor(Math.random() * 8 + 90),
        status: 'active' as const,
        lastActive: new Date(
          now.getTime() - Math.random() * 2 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: '2',
        name: 'Fatma Demir',
        avatar: '/images/avatars/avatar2.jpg',
        totalActions: Math.floor(Math.random() * 180 + 90),
        approved: Math.floor(Math.random() * 140 + 70),
        rejected: Math.floor(Math.random() * 35 + 12),
        escalated: Math.floor(Math.random() * 8 + 2),
        avgResponseTime: Math.floor(Math.random() * 40 + 25),
        accuracyRate: Math.floor(Math.random() * 6 + 92),
        status: 'active' as const,
        lastActive: new Date(
          now.getTime() - Math.random() * 1 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: '3',
        name: 'Mehmet Kaya',
        avatar: '/images/avatars/avatar3.jpg',
        totalActions: Math.floor(Math.random() * 160 + 80),
        approved: Math.floor(Math.random() * 120 + 60),
        rejected: Math.floor(Math.random() * 30 + 10),
        escalated: Math.floor(Math.random() * 12 + 5),
        avgResponseTime: Math.floor(Math.random() * 50 + 30),
        accuracyRate: Math.floor(Math.random() * 10 + 85),
        status: 'offline' as const,
        lastActive: new Date(
          now.getTime() - Math.random() * 6 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
    automation: {
      rulesTriggered: Math.floor(Math.random() * 1000 + 500),
      falsePositives: Math.floor(Math.random() * 50 + 10),
      falseNegatives: Math.floor(Math.random() * 30 + 5),
      accuracy: Math.floor(Math.random() * 15 + 80),
      topRules: [
        {
          id: '1',
          name: 'Spam Tespiti',
          triggers: Math.floor(Math.random() * 200 + 100),
          accuracy: Math.floor(Math.random() * 10 + 85),
          falsePositives: Math.floor(Math.random() * 15 + 5),
        },
        {
          id: '2',
          name: 'Küfür Filtresi',
          triggers: Math.floor(Math.random() * 150 + 80),
          accuracy: Math.floor(Math.random() * 8 + 90),
          falsePositives: Math.floor(Math.random() * 10 + 2),
        },
        {
          id: '3',
          name: 'Dolandırıcılık Tespiti',
          triggers: Math.floor(Math.random() * 100 + 50),
          accuracy: Math.floor(Math.random() * 12 + 82),
          falsePositives: Math.floor(Math.random() * 8 + 3),
        },
      ],
    },
    contentBreakdown: {
      byType: [
        {
          type: 'İş İlanı',
          count: Math.floor(Math.random() * 300 + 200),
          percentage: 45,
        },
        {
          type: 'Hizmet Paketi',
          count: Math.floor(Math.random() * 200 + 150),
          percentage: 30,
        },
        {
          type: 'Kullanıcı Yorumu',
          count: Math.floor(Math.random() * 150 + 100),
          percentage: 20,
        },
        {
          type: 'Profil Bilgisi',
          count: Math.floor(Math.random() * 50 + 25),
          percentage: 5,
        },
      ],
      byCategory: [
        {
          category: 'Teknoloji',
          count: Math.floor(Math.random() * 200 + 100),
          violations: Math.floor(Math.random() * 20 + 5),
        },
        {
          category: 'Ev & Yaşam',
          count: Math.floor(Math.random() * 180 + 90),
          violations: Math.floor(Math.random() * 15 + 8),
        },
        {
          category: 'Eğitim',
          count: Math.floor(Math.random() * 160 + 80),
          violations: Math.floor(Math.random() * 10 + 3),
        },
        {
          category: 'Sağlık',
          count: Math.floor(Math.random() * 140 + 70),
          violations: Math.floor(Math.random() * 12 + 4),
        },
      ],
    },
    riskMetrics: {
      highRiskContent: Math.floor(Math.random() * 50 + 10),
      suspiciousUsers: Math.floor(Math.random() * 30 + 5),
      reportedContent: Math.floor(Math.random() * 100 + 50),
      escalationRate: Math.floor(Math.random() * 10 + 5),
      riskCategories: [
        {
          category: 'Dolandırıcılık',
          risk: 'high',
          count: Math.floor(Math.random() * 20 + 5),
        },
        {
          category: 'Spam',
          risk: 'medium',
          count: Math.floor(Math.random() * 40 + 15),
        },
        {
          category: 'Uygunsuz İçerik',
          risk: 'low',
          count: Math.floor(Math.random() * 30 + 10),
        },
        {
          category: 'Telif Hakkı',
          risk: 'medium',
          count: Math.floor(Math.random() * 15 + 3),
        },
      ],
    },
  };
};

// Mock moderators data
const moderators = [
  { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@marifetbul.com' },
  { id: '2', name: 'Fatma Demir', email: 'fatma@marifetbul.com' },
  { id: '3', name: 'Mehmet Kaya', email: 'mehmet@marifetbul.com' },
];

// Mock categories
const categories = [
  'Teknoloji',
  'Ev & Yaşam',
  'Eğitim',
  'Sağlık',
  'Finans',
  'Pazarlama',
  'Tasarım',
];

// Mock content types
const contentTypes = [
  'İş İlanı',
  'Hizmet Paketi',
  'Kullanıcı Yorumu',
  'Profil Bilgisi',
  'Mesaj',
];

// Mock action types
const actionTypes = [
  'Onaylandı',
  'Reddedildi',
  'Yükseltildi',
  'Beklemede',
  'Otomatik Filtrelendi',
];

export const analyticsHandlers = [
  // Get analytics data
  http.get('/api/admin/analytics', ({ request }) => {
    const url = new URL(request.url);
    const dateRange = url.searchParams.get('dateRange') || '7d';
    const moderator = url.searchParams.get('moderator') || '';
    const contentType = url.searchParams.get('contentType') || '';

    const analytics = generateAnalyticsData(dateRange);

    // Apply filters if specified
    if (moderator) {
      analytics.moderators = analytics.moderators.filter(
        (m) =>
          m.id === moderator ||
          m.name.toLowerCase().includes(moderator.toLowerCase())
      );
    }

    if (contentType) {
      analytics.contentBreakdown.byType =
        analytics.contentBreakdown.byType.filter((c) =>
          c.type.toLowerCase().includes(contentType.toLowerCase())
        );
    }

    return HttpResponse.json(analytics);
  }),

  // Get filter options
  http.get('/api/admin/analytics/filters', () => {
    return HttpResponse.json({
      moderators,
      categories,
      contentTypes,
      actionTypes,
    });
  }),

  // Export analytics data
  http.post('/api/admin/analytics/export', async ({ request }) => {
    const body = (await request.json()) as {
      dateRange: string;
      format: 'csv' | 'excel' | 'pdf';
      filters?: {
        moderator?: string;
        contentType?: string;
        category?: string;
      };
    };

    // Simulate file generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return HttpResponse.json({
      success: true,
      downloadUrl: `/api/admin/analytics/download/${Date.now()}.${body.format}`,
      fileName: `moderation-analytics-${body.dateRange}.${body.format}`,
      size: Math.floor(Math.random() * 1000000 + 500000), // Random file size
    });
  }),

  // Download exported file
  http.get('/api/admin/analytics/download/:fileName', ({ params }) => {
    const { fileName } = params;

    // Simulate file download
    const mockFileContent = 'Mock analytics data...';

    return new HttpResponse(mockFileContent, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  }),

  // Get real-time metrics
  http.get('/api/admin/analytics/realtime', () => {
    return HttpResponse.json({
      activeUsers: Math.floor(Math.random() * 1000 + 500),
      activeModerators: Math.floor(Math.random() * 5 + 2),
      pendingActions: Math.floor(Math.random() * 20 + 5),
      automatedActions: Math.floor(Math.random() * 10 + 3),
      systemLoad: Math.floor(Math.random() * 30 + 40), // percentage
      lastUpdated: new Date().toISOString(),
    });
  }),

  // Get performance metrics
  http.get('/api/admin/analytics/performance', ({ request }) => {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '24h';

    const getDataPoints = (timeframe: string) => {
      switch (timeframe) {
        case '1h':
          return 12; // 5-minute intervals
        case '24h':
          return 24; // hourly
        case '7d':
          return 7; // daily
        case '30d':
          return 30; // daily
        default:
          return 24;
      }
    };

    const points = getDataPoints(timeframe);

    return HttpResponse.json({
      responseTime: Array.from({ length: points }, (_, i) => ({
        timestamp: new Date(
          Date.now() -
            (points - i) * (timeframe === '1h' ? 5 * 60 * 1000 : 60 * 60 * 1000)
        ).toISOString(),
        avg: Math.floor(Math.random() * 100 + 30),
        p95: Math.floor(Math.random() * 200 + 100),
        p99: Math.floor(Math.random() * 500 + 200),
      })),
      throughput: Array.from({ length: points }, (_, i) => ({
        timestamp: new Date(
          Date.now() -
            (points - i) * (timeframe === '1h' ? 5 * 60 * 1000 : 60 * 60 * 1000)
        ).toISOString(),
        actionsPerMinute: Math.floor(Math.random() * 20 + 5),
        automatedActionsPerMinute: Math.floor(Math.random() * 15 + 3),
      })),
      accuracy: Array.from({ length: points }, (_, i) => ({
        timestamp: new Date(
          Date.now() -
            (points - i) * (timeframe === '1h' ? 5 * 60 * 1000 : 60 * 60 * 1000)
        ).toISOString(),
        overall: Math.floor(Math.random() * 10 + 85),
        automated: Math.floor(Math.random() * 15 + 75),
        manual: Math.floor(Math.random() * 5 + 92),
      })),
    });
  }),

  // Get moderator leaderboard
  http.get('/api/admin/analytics/leaderboard', ({ request }) => {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'actions';

    const leaderboard = moderators
      .map((mod) => ({
        ...mod,
        score: Math.floor(Math.random() * 1000 + 100),
        actions: Math.floor(Math.random() * 200 + 50),
        accuracy: Math.floor(Math.random() * 15 + 80),
        responseTime: Math.floor(Math.random() * 60 + 20),
        streak: Math.floor(Math.random() * 30 + 1),
      }))
      .sort((a, b) => {
        switch (metric) {
          case 'actions':
            return b.actions - a.actions;
          case 'accuracy':
            return b.accuracy - a.accuracy;
          case 'responseTime':
            return a.responseTime - b.responseTime;
          case 'streak':
            return b.streak - a.streak;
          default:
            return b.score - a.score;
        }
      });

    return HttpResponse.json(leaderboard);
  }),

  // Get trend analysis
  http.get('/api/admin/analytics/trends', ({ request }) => {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'actions';
    const period = url.searchParams.get('period') || '30d';

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    const trendData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));

      const baseValue = Math.random() * 100 + 50;
      const trend = Math.sin((i / days) * Math.PI * 2) * 20; // Simulate seasonal trend

      return {
        date: date.toISOString().split('T')[0],
        value: Math.floor(baseValue + trend),
        change: Math.floor((Math.random() - 0.5) * 20), // percentage change
        predicted:
          i > days - 7
            ? Math.floor(baseValue + trend + Math.random() * 10)
            : null,
      };
    });

    return HttpResponse.json({
      metric,
      period,
      data: trendData,
      insights: [
        {
          type: 'trend',
          message: 'Moderasyon eylemlerinde %15 artış gözlemleniyor',
          severity: 'info',
        },
        {
          type: 'anomaly',
          message: 'Geçen hafta otomatik filtreleme oranında düşüş',
          severity: 'warning',
        },
        {
          type: 'prediction',
          message: 'Önümüzdeki hafta %10 daha fazla eylem bekleniyor',
          severity: 'info',
        },
      ],
    });
  }),
];
