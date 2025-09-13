import { http, HttpResponse } from 'msw';

// Mock data generators
const generateModerationStats = () => ({
  totalReports: 1247,
  pendingReports: 89,
  resolvedToday: 34,
  autoFlagged: 156,
  averageResponseTime: 2.4,
  moderationAccuracy: 94.2,
  trendsData: [
    { date: '2025-09-07', reports: 45, resolved: 38 },
    { date: '2025-09-08', reports: 52, resolved: 47 },
    { date: '2025-09-09', reports: 38, resolved: 41 },
    { date: '2025-09-10', reports: 61, resolved: 55 },
    { date: '2025-09-11', reports: 44, resolved: 39 },
    { date: '2025-09-12', reports: 57, resolved: 52 },
    { date: '2025-09-13', reports: 34, resolved: 34 },
  ],
  categoryBreakdown: [
    { category: 'Spam', count: 45, percentage: 35.2 },
    { category: 'Uygunsuz İçerik', count: 32, percentage: 25.0 },
    { category: 'Sahte Profil', count: 28, percentage: 21.9 },
    { category: 'Taciz', count: 18, percentage: 14.1 },
    { category: 'Diğer', count: 5, percentage: 3.8 },
  ],
});

const generateModerationItems = () => [
  {
    id: '1',
    type: 'user_report',
    contentType: 'job_post',
    title: 'Şüpheli İş İlanı',
    description: 'Gerçekçi olmayan maaş ve koşullar sunuluyor',
    reportedBy: {
      id: 'user1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
    },
    reportedUser: {
      id: 'user2',
      name: 'Fake Company Ltd.',
      email: 'contact@fakecompany.com',
    },
    reportReason: 'Yanıltıcı bilgiler ve gerçekçi olmayan teklifler',
    severity: 'high',
    status: 'pending',
    createdAt: new Date('2025-09-13T08:30:00').toISOString(),
    content: {
      text: 'Aylık 50.000 TL maaşla junior developer arıyoruz. Hiç deneyim gerekmez, evden çalışma imkanı.',
      metadata: {
        jobId: 'job_123',
        category: 'Yazılım Geliştirme',
        location: 'İstanbul',
      },
    },
    autoFlags: {
      spam: true,
      inappropriate: false,
      fake: true,
      harassment: false,
      score: 0.85,
    },
  },
  {
    id: '2',
    type: 'auto_flagged',
    contentType: 'user_profile',
    title: 'Sahte Profil Şüphesi',
    description: 'Otomatik sistem tarafından sahte profil olarak işaretlendi',
    reportedUser: {
      id: 'user3',
      name: 'Dr. Mehmet Profesör',
      email: 'fake@tempmail.com',
    },
    reportReason: 'Sahte kimlik bilgileri ve çalıntı fotoğraflar',
    severity: 'critical',
    status: 'pending',
    createdAt: new Date('2025-09-13T07:15:00').toISOString(),
    content: {
      text: "Harvard mezunu doktor, NASA'da çalıştım, şimdi freelance danışman",
      images: ['profile1.jpg', 'certificate1.jpg'],
      metadata: {
        registrationDate: '2025-09-12',
        ipAddress: '185.x.x.x',
        deviceInfo: 'Mobile - Android',
      },
    },
    autoFlags: {
      spam: false,
      inappropriate: false,
      fake: true,
      harassment: false,
      score: 0.92,
    },
  },
  {
    id: '3',
    type: 'user_report',
    contentType: 'message',
    title: 'Taciz İçerikli Mesaj',
    description: 'Kullanıcı uygunsuz mesajlar gönderiyor',
    reportedBy: {
      id: 'user4',
      name: 'Ayşe Demir',
      email: 'ayse@example.com',
    },
    reportedUser: {
      id: 'user5',
      name: 'Problematic User',
      email: 'problem@example.com',
    },
    reportReason: 'Cinsel taciz içerikli mesajlar',
    severity: 'critical',
    status: 'escalated',
    createdAt: new Date('2025-09-13T06:45:00').toISOString(),
    reviewedAt: new Date('2025-09-13T09:00:00').toISOString(),
    reviewedBy: 'admin1',
    content: {
      text: '[Uygunsuz içerik - moderatör tarafından gizlendi]',
      metadata: {
        conversationId: 'conv_789',
        messageCount: 15,
        timeSpan: '2 gün',
      },
    },
    autoFlags: {
      spam: false,
      inappropriate: true,
      fake: false,
      harassment: true,
      score: 0.78,
    },
  },
  {
    id: '4',
    type: 'auto_flagged',
    contentType: 'package',
    title: 'Şüpheli Hizmet Paketi',
    description: 'Otomatik spam algılaması tetiklendi',
    reportedUser: {
      id: 'user6',
      name: 'Quick Money Services',
      email: 'money@fastservices.com',
    },
    reportReason: 'Spam içerik ve gerçekçi olmayan vaatler',
    severity: 'medium',
    status: 'pending',
    createdAt: new Date('2025-09-13T05:20:00').toISOString(),
    content: {
      text: 'Günde 1000 TL kazanın! Hiçbir şey yapmadan para kazanmanın yolu. Sadece 100 TL başlangıç yatırımı.',
      metadata: {
        packageId: 'pkg_456',
        category: 'Finans',
        price: 100,
      },
    },
    autoFlags: {
      spam: true,
      inappropriate: false,
      fake: true,
      harassment: false,
      score: 0.73,
    },
  },
  {
    id: '5',
    type: 'user_report',
    contentType: 'review',
    title: 'Sahte Değerlendirme',
    description: 'Kullanıcı sahte olumlu değerlendirmeler yazıyor',
    reportedBy: {
      id: 'user7',
      name: 'Güvenilir Müşteri',
      email: 'guvenilir@example.com',
    },
    reportedUser: {
      id: 'user8',
      name: 'Fake Reviewer',
      email: 'fake.review@example.com',
    },
    reportReason: 'Birden fazla hesaptan sahte pozitif review',
    severity: 'medium',
    status: 'pending',
    createdAt: new Date('2025-09-13T04:10:00').toISOString(),
    content: {
      text: 'Mükemmel hizmet! 5 yıldız! Kesinlikle tavsiye ederim! En iyi freelancer!',
      metadata: {
        reviewId: 'rev_789',
        targetUserId: 'user9',
        rating: 5,
      },
    },
    autoFlags: {
      spam: true,
      inappropriate: false,
      fake: true,
      harassment: false,
      score: 0.68,
    },
  },
];

const generateContentFilters = () => [
  {
    id: 'filter_1',
    name: 'Spam Kelime Filtresi',
    type: 'keyword',
    status: 'active',
    keywords: ['bedava para', 'hızlı zengin', 'garanti kazanç', 'risk yok'],
    action: 'flag',
    severity: 'medium',
    createdAt: new Date('2025-09-01').toISOString(),
    triggeredCount: 156,
  },
  {
    id: 'filter_2',
    name: 'Uygunsuz İçerik Filtresi',
    type: 'ai_detection',
    status: 'active',
    action: 'block',
    severity: 'high',
    createdAt: new Date('2025-08-15').toISOString(),
    triggeredCount: 89,
  },
  {
    id: 'filter_3',
    name: 'Sahte Profil Algılayıcı',
    type: 'behavioral',
    status: 'active',
    action: 'flag',
    severity: 'critical',
    createdAt: new Date('2025-08-01').toISOString(),
    triggeredCount: 234,
  },
];

const generateModerationRules = () => [
  {
    id: 'rule_1',
    name: 'Otomatik Spam Engelleme',
    description:
      'Spam skorun %80 üzerinde olan içerikleri otomatik olarak engelle',
    condition: {
      spamScore: { operator: 'gt', value: 0.8 },
    },
    action: {
      type: 'block',
      notify: true,
      escalate: false,
    },
    status: 'active',
    priority: 'high',
    createdAt: new Date('2025-09-01').toISOString(),
    triggeredCount: 45,
  },
  {
    id: 'rule_2',
    name: 'Şüpheli Hesap İncelemesi',
    description: 'Yeni hesaplardan gelen raporu elle incele',
    condition: {
      accountAge: { operator: 'lt', value: 7 },
      reportCount: { operator: 'gt', value: 0 },
    },
    action: {
      type: 'manual_review',
      notify: true,
      escalate: true,
    },
    status: 'active',
    priority: 'medium',
    createdAt: new Date('2025-08-20').toISOString(),
    triggeredCount: 23,
  },
];

// API handlers
export const moderationHandlers = [
  // Get moderation dashboard stats
  http.get('/api/admin/moderation/stats', () => {
    return HttpResponse.json({
      success: true,
      data: generateModerationStats(),
    });
  }),

  // Get moderation items
  http.get('/api/admin/moderation/items', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type');
    const severity = url.searchParams.get('severity');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let items = generateModerationItems();

    // Apply filters
    if (type && type !== 'all') {
      items = items.filter((item) => item.type === type);
    }
    if (severity && severity !== 'all') {
      items = items.filter((item) => item.severity === severity);
    }
    if (status && status !== 'all') {
      items = items.filter((item) => item.status === status);
    }
    if (search) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.reportedUser.name.toLowerCase().includes(search.toLowerCase()) ||
          item.reportReason.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          page,
          limit,
          total: items.length,
          totalPages: Math.ceil(items.length / limit),
        },
      },
    });
  }),

  // Take action on moderation item
  http.post(
    '/api/admin/moderation/items/:id/action',
    async ({ request, params }) => {
      const { id } = params;
      const body = (await request.json()) as {
        action: string;
        reason?: string;
      };

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      return HttpResponse.json({
        success: true,
        data: {
          id,
          action: body.action,
          timestamp: new Date().toISOString(),
        },
      });
    }
  ),

  // Get content filters
  http.get('/api/admin/moderation/filters', () => {
    return HttpResponse.json({
      success: true,
      data: generateContentFilters(),
    });
  }),

  // Create content filter
  http.post('/api/admin/moderation/filters', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    const newFilter = {
      id: `filter_${Date.now()}`,
      ...(body as object),
      createdAt: new Date().toISOString(),
      triggeredCount: 0,
    };

    return HttpResponse.json({
      success: true,
      data: newFilter,
    });
  }),

  // Update content filter
  http.put('/api/admin/moderation/filters/:id', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      data: {
        id,
        ...(body as object),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Delete content filter
  http.delete('/api/admin/moderation/filters/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: { id },
    });
  }),

  // Get moderation rules
  http.get('/api/admin/moderation/rules', () => {
    return HttpResponse.json({
      success: true,
      data: generateModerationRules(),
    });
  }),

  // Create moderation rule
  http.post('/api/admin/moderation/rules', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    const newRule = {
      id: `rule_${Date.now()}`,
      ...(body as object),
      createdAt: new Date().toISOString(),
      triggeredCount: 0,
    };

    return HttpResponse.json({
      success: true,
      data: newRule,
    });
  }),

  // Update moderation rule
  http.put('/api/admin/moderation/rules/:id', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      data: {
        id,
        ...(body as object),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Delete moderation rule
  http.delete('/api/admin/moderation/rules/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: { id },
    });
  }),

  // Bulk actions
  http.post('/api/admin/moderation/bulk-action', async ({ request }) => {
    const body = (await request.json()) as {
      itemIds: string[];
      action: string;
      reason?: string;
    };

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return HttpResponse.json({
      success: true,
      data: {
        processedCount: body.itemIds.length,
        action: body.action,
        timestamp: new Date().toISOString(),
      },
    });
  }),

  // Get moderation history
  http.get('/api/admin/moderation/history/:userId', () => {
    const mockHistory = [
      {
        id: 'hist_1',
        action: 'warning_sent',
        reason: 'Spam içerik paylaşımı',
        moderator: 'admin_1',
        timestamp: new Date('2025-09-10').toISOString(),
      },
      {
        id: 'hist_2',
        action: 'content_removed',
        reason: 'Uygunsuz dil kullanımı',
        moderator: 'admin_2',
        timestamp: new Date('2025-09-08').toISOString(),
      },
    ];

    return HttpResponse.json({
      success: true,
      data: mockHistory,
    });
  }),
];
