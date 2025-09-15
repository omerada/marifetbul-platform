import { http, HttpResponse } from 'msw';

interface UserReport {
  id: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    userType: 'freelancer' | 'employer';
  };
  reportedContent?: {
    id: string;
    type: 'job' | 'package' | 'message' | 'profile' | 'review';
    title: string;
    excerpt: string;
  };
  category:
    | 'spam'
    | 'inappropriate'
    | 'harassment'
    | 'fraud'
    | 'fake_profile'
    | 'other';
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: {
    id: string;
    name: string;
  };
  resolution?: {
    action:
      | 'no_action'
      | 'warning'
      | 'content_removal'
      | 'account_restriction'
      | 'account_suspension'
      | 'account_ban';
    reason: string;
    notes: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  evidence: {
    screenshots?: string[];
    messages?: string[];
    other?: string[];
  };
}

interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  averageResolutionTime: number;
  categoryBreakdown: Record<string, number>;
  severityBreakdown: Record<string, number>;
}

// Mock data generators
const generateUserReports = (): UserReport[] => {
  const categories: UserReport['category'][] = [
    'spam',
    'inappropriate',
    'harassment',
    'fraud',
    'fake_profile',
    'other',
  ];
  const statuses: UserReport['status'][] = [
    'pending',
    'investigating',
    'resolved',
    'dismissed',
    'escalated',
  ];
  const priorities: UserReport['priority'][] = [
    'low',
    'medium',
    'high',
    'critical',
  ];

  const reports: UserReport[] = [];

  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const createdAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    reports.push({
      id: `report-${i.toString().padStart(3, '0')}`,
      reportedBy: {
        id: `user-reporter-${i}`,
        name: `Rapor Eden ${i}`,
        email: `reporter${i}@example.com`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=50&h=50&fit=crop&crop=face`,
      },
      reportedUser: {
        id: `user-reported-${i}`,
        name: `Şikayet Edilen ${i}`,
        email: `reported${i}@example.com`,
        avatar: `https://images.unsplash.com/photo-${1600000000000 + i}?w=50&h=50&fit=crop&crop=face`,
        userType: Math.random() > 0.5 ? 'freelancer' : 'employer',
      },
      reportedContent:
        Math.random() > 0.3
          ? {
              id: `content-${i}`,
              type: (
                ['job', 'package', 'message', 'profile', 'review'] as const
              )[Math.floor(Math.random() * 5)],
              title: `İçerik Başlığı ${i}`,
              excerpt: `Bu içerik hakkında şikayet var. İçerik numarası: ${i}`,
            }
          : undefined,
      category,
      reason: getReasonByCategory(category),
      description: `Detaylı açıklama: ${category} kategorisinde rapor edilmiş içerik. Rapor numarası: ${i}`,
      status,
      priority,
      assignedTo:
        status === 'investigating' || status === 'resolved'
          ? {
              id: `moderator-${Math.floor(Math.random() * 3) + 1}`,
              name: `Moderatör ${Math.floor(Math.random() * 3) + 1}`,
            }
          : undefined,
      resolution:
        status === 'resolved'
          ? {
              action: (
                [
                  'no_action',
                  'warning',
                  'content_removal',
                  'account_restriction',
                ] as const
              )[Math.floor(Math.random() * 4)],
              reason: 'Kuralları ihlal ettiği tespit edildi',
              notes: 'Moderatör notları burada yer alır',
              resolvedBy: 'moderator-1',
              resolvedAt: new Date(
                Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
            }
          : undefined,
      createdAt,
      updatedAt:
        status === 'pending'
          ? createdAt
          : new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
      evidence: {
        screenshots:
          Math.random() > 0.7
            ? [`screenshot-${i}-1.png`, `screenshot-${i}-2.png`]
            : undefined,
        messages: Math.random() > 0.8 ? [`Problematik mesaj ${i}`] : undefined,
        other: Math.random() > 0.9 ? [`Ek kanıt ${i}`] : undefined,
      },
    });
  }

  return reports.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const getReasonByCategory = (category: UserReport['category']): string => {
  const reasons = {
    spam: 'Spam mesaj gönderme',
    inappropriate: 'Uygunsuz içerik paylaşma',
    harassment: 'Taciz ve rahatsız etme',
    fraud: 'Dolandırıcılık girişimi',
    fake_profile: 'Sahte profil kullanma',
    other: 'Diğer kural ihlali',
  };
  return reasons[category];
};

const generateReportStats = (): ReportStats => {
  const mockReports = generateUserReports();

  return {
    totalReports: mockReports.length,
    pendingReports: mockReports.filter((r) => r.status === 'pending').length,
    resolvedToday: Math.floor(Math.random() * 15) + 5,
    averageResolutionTime: Math.floor(Math.random() * 20) + 12, // 12-32 hours
    categoryBreakdown: {
      spam: mockReports.filter((r) => r.category === 'spam').length,
      inappropriate: mockReports.filter((r) => r.category === 'inappropriate')
        .length,
      harassment: mockReports.filter((r) => r.category === 'harassment').length,
      fraud: mockReports.filter((r) => r.category === 'fraud').length,
      fake_profile: mockReports.filter((r) => r.category === 'fake_profile')
        .length,
      other: mockReports.filter((r) => r.category === 'other').length,
    },
    severityBreakdown: {
      low: mockReports.filter((r) => r.priority === 'low').length,
      medium: mockReports.filter((r) => r.priority === 'medium').length,
      high: mockReports.filter((r) => r.priority === 'high').length,
      critical: mockReports.filter((r) => r.priority === 'critical').length,
    },
  };
};

// Mock data storage
const mockReports = generateUserReports();
let mockStats = generateReportStats();

export const reportHandlers = [
  // Get all reports
  http.get('/api/admin/reports', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const priority = url.searchParams.get('priority');
    const search = url.searchParams.get('search');

    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredReports = [...mockReports];

    // Apply filters
    if (status && status !== 'all') {
      filteredReports = filteredReports.filter(
        (report) => report.status === status
      );
    }

    if (category && category !== 'all') {
      filteredReports = filteredReports.filter(
        (report) => report.category === category
      );
    }

    if (priority && priority !== 'all') {
      filteredReports = filteredReports.filter(
        (report) => report.priority === priority
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredReports = filteredReports.filter(
        (report) =>
          report.reportedUser.name.toLowerCase().includes(searchLower) ||
          report.reportedBy.name.toLowerCase().includes(searchLower) ||
          report.reason.toLowerCase().includes(searchLower) ||
          report.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedReports,
      pagination: {
        page,
        limit,
        total: filteredReports.length,
        totalPages: Math.ceil(filteredReports.length / limit),
      },
    });
  }),

  // Get single report
  http.get('/api/admin/reports/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 300));

    const report = mockReports.find((r) => r.id === id);

    if (!report) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Rapor bulunamadı',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: report,
    });
  }),

  // Update report status
  http.patch('/api/admin/reports/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = (await request.json()) as {
      status: UserReport['status'];
    };

    await new Promise((resolve) => setTimeout(resolve, 400));

    const reportIndex = mockReports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Rapor bulunamadı',
        },
        { status: 404 }
      );
    }

    // Update report
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'investigating' &&
        !mockReports[reportIndex].assignedTo && {
          assignedTo: {
            id: 'moderator-1',
            name: 'Sistem Moderatörü',
          },
        }),
    };

    // Update stats
    mockStats = generateReportStats();

    return HttpResponse.json({
      success: true,
      data: mockReports[reportIndex],
      message: 'Rapor durumu güncellendi',
    });
  }),

  // Assign report to moderator
  http.patch('/api/admin/reports/:id/assign', async ({ params, request }) => {
    const { id } = params;
    const { assignedTo } = (await request.json()) as { assignedTo: string };

    await new Promise((resolve) => setTimeout(resolve, 300));

    const reportIndex = mockReports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Rapor bulunamadı',
        },
        { status: 404 }
      );
    }

    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      assignedTo: {
        id: assignedTo,
        name: `Moderatör ${assignedTo.slice(-1)}`,
      },
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockReports[reportIndex],
      message: 'Rapor atandı',
    });
  }),

  // Resolve report
  http.patch('/api/admin/reports/:id/resolve', async ({ params, request }) => {
    const { id } = params;
    const resolutionData = (await request.json()) as {
      action:
        | 'no_action'
        | 'warning'
        | 'content_removal'
        | 'account_restriction'
        | 'account_suspension'
        | 'account_ban';
      reason: string;
      notes: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 600));

    const reportIndex = mockReports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Rapor bulunamadı',
        },
        { status: 404 }
      );
    }

    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status: 'resolved',
      resolution: {
        action: resolutionData.action,
        reason: resolutionData.reason,
        notes: resolutionData.notes,
        resolvedBy: 'moderator-1',
        resolvedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    // Update stats
    mockStats = generateReportStats();

    return HttpResponse.json({
      success: true,
      data: mockReports[reportIndex],
      message: 'Rapor çözüldü',
    });
  }),

  // Get report statistics
  http.get('/api/admin/reports/stats', async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Refresh stats with current data
    mockStats = generateReportStats();

    return HttpResponse.json({
      success: true,
      data: mockStats,
    });
  }),

  // Block/unblock user
  http.post('/api/admin/users/:userId/block', async ({ params }) => {
    const { userId } = params;

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate user blocking
    console.log(`Blocking user: ${userId}`);

    return HttpResponse.json({
      success: true,
      message: 'Kullanıcı engellendi',
      data: {
        userId,
        blockedAt: new Date().toISOString(),
        reason: 'Admin tarafından engellendi',
      },
    });
  }),

  http.post('/api/admin/users/:userId/unblock', async ({ params }) => {
    const { userId } = params;

    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simulate user unblocking
    console.log(`Unblocking user: ${userId}`);

    return HttpResponse.json({
      success: true,
      message: 'Kullanıcı engeli kaldırıldı',
      data: {
        userId,
        unblockedAt: new Date().toISOString(),
      },
    });
  }),

  // Create new report (for testing)
  http.post('/api/admin/reports', async ({ request }) => {
    const reportData = (await request.json()) as Partial<UserReport>;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const newReport: UserReport = {
      id: `report-${Date.now()}`,
      reportedBy: reportData.reportedBy!,
      reportedUser: reportData.reportedUser!,
      reportedContent: reportData.reportedContent,
      category: reportData.category || 'other',
      reason: reportData.reason || 'Test raporu',
      description: reportData.description || 'Test açıklaması',
      status: 'pending',
      priority: reportData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: reportData.evidence || {},
    };

    mockReports.unshift(newReport);
    mockStats = generateReportStats();

    return HttpResponse.json({
      success: true,
      data: newReport,
      message: 'Rapor oluşturuldu',
    });
  }),

  // Delete report
  http.delete('/api/admin/reports/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 400));

    const reportIndex = mockReports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Rapor bulunamadı',
        },
        { status: 404 }
      );
    }

    const deletedReport = mockReports.splice(reportIndex, 1)[0];
    mockStats = generateReportStats();

    return HttpResponse.json({
      success: true,
      data: deletedReport,
      message: 'Rapor silindi',
    });
  }),
];
