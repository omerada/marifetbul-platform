import { http, HttpResponse } from 'msw';
import type {
  AdminDashboardData,
  AdminUserData,
  ModerationItem,
  PlatformSettings,
  UserActionRequest,
  ModerationActionRequest,
} from '@/types';

// Mock Data
const mockAdminDashboard: AdminDashboardData = {
  stats: {
    totalUsers: 15234,
    activeUsers: 8764,
    totalJobs: 3421,
    activeJobs: 892,
    totalRevenue: 2456789,
    pendingPayouts: 123456,
    newUsersToday: 45,
    monthlyRevenue: 234567,
    revenueGrowth: 12.5,
    pendingOrders: 67,
    completedOrders: 1234,
    conversionRate: 8.7,
    userRetentionRate: 85.2,
  },
  alerts: [
    {
      id: 'alert-1',
      type: 'security',
      severity: 'medium',
      title: 'Yüksek spam raporları',
      description: 'Son 24 saatte normalden 3x fazla spam raporu alındı',
      message: 'Son 24 saatte normalden 3x fazla spam raporu alındı',
      category: 'moderation',
      priority: 'high',
      isRead: false,
      isResolved: false,
      createdAt: '2025-09-11T10:00:00Z',
    },
  ],
  recentActivity: [
    {
      id: 'activity-1',
      type: 'security',
      severity: 'medium',
      title: 'Kullanıcı askıya alındı',
      description: 'Kullanıcı spam nedeniyle askıya alındı',
      isResolved: true,
      createdAt: '2025-09-11T11:30:00Z',
    },
  ],
  systemHealth: {
    status: 'healthy',
    uptime: 2634000,
    lastChecked: '2025-09-11T12:00:00Z',
    issues: ['Payment Gateway response time artışı'],
  },
};

const mockAdminUsers: AdminUserData[] = [
  {
    id: 'user-1',
    email: 'ali.veli@example.com',
    name: 'Ali Veli',
    firstName: 'Ali',
    lastName: 'Veli',
    userType: 'freelancer',
    accountStatus: 'active',
    verificationStatus: 'verified',
    verificationBadges: ['email', 'identity'],
    createdAt: '2025-01-15T10:00:00Z',
    lastLoginAt: '2025-09-11T08:00:00Z',
    profileCompletion: 95,
    totalJobs: 45,
    totalEarnings: 125000,
    rating: 4.8,
    reviewCount: 43,
    updatedAt: '2025-09-11T09:30:00Z',
  },
  {
    id: 'user-2',
    email: 'ayse.yilmaz@example.com',
    name: 'Ayşe Yılmaz',
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    userType: 'employer',
    accountStatus: 'suspended',
    verificationStatus: 'pending',
    verificationBadges: ['email'],
    createdAt: '2025-02-10T12:00:00Z',
    lastLoginAt: '2025-09-10T15:00:00Z',
    profileCompletion: 78,
    totalJobs: 23,
    totalEarnings: 0,
    totalSpent: 45000,
    rating: 4.2,
    reviewCount: 18,
    suspensionHistory: [
      {
        id: 'suspension-1',
        moderatorId: 'admin-1',
        reason: 'Spam içerik paylaşımı',
        startDate: '2025-09-10T16:00:00Z',
        endDate: '2025-09-17T16:00:00Z',
        isActive: true,
      },
    ],
    updatedAt: '2025-09-10T16:00:00Z',
  },
];

const mockModerationQueue: ModerationItem[] = [
  {
    id: 'mod-1',
    type: 'review',
    content: {
      id: 'review-123',
      title: 'Kötü hizmet',
      description: 'Çok kötü hizmet, para iadesi istiyorum!',
    },
    reportReason: 'inappropriate_content',
    reportedBy: 'user-1',
    reportedAt: '2025-09-11T08:00:00Z',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'mod-2',
    type: 'job',
    content: {
      id: 'job-456',
      title: 'Ucuz web sitesi yapımı',
      description: 'Çok ucuza website yaparım',
    },
    reportReason: 'spam',
    reportedBy: 'user-2',
    reportedAt: '2025-09-11T09:00:00Z',
    priority: 'medium',
    status: 'pending',
  },
];

const mockPlatformSettings: PlatformSettings = {
  general: {
    siteName: 'Marifet Platform',
    siteDescription: "Türkiye'nin en büyük freelancer platformu",
    contactEmail: 'contact@marifet.com',
    supportEmail: 'support@marifet.com',
    maintenanceMode: false,
    maintenanceMessage: 'Platform bakımda, lütfen daha sonra tekrar deneyin.',
    maxFileUploadSize: 10,
  },
  features: {
    enableJobPosting: true,
    enableServicePackages: true,
    enableEscrow: true,
    enableDirectPayments: true,
    enableReviews: true,
    enableMessaging: true,
    emailVerificationRequired: true,
    userRegistration: true,
    profileVerification: true,
  },
  payments: {
    commissionRate: 5,
    minimumPayout: 100,
    paymentMethods: ['credit_card', 'bank_transfer'],
    currencies: ['TRY', 'USD', 'EUR'],
    defaultCurrency: 'TRY',
  },
  payment: {
    platformFee: 5,
    minimumWithdrawal: 100,
  },
  security: {
    twoFactorAuth: true,
    passwordRequirements: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
    },
  },
  maintenance: {
    isMaintenanceMode: false,
    maintenanceMessage: 'Platform bakımda',
    scheduledMaintenance: [],
  },
  moderation: {
    autoModeration: true,
    moderationQueue: true,
    requireApproval: false,
    contentFilters: ['spam', 'inappropriate', 'hate_speech'],
  },
};

// Handlers
export const adminHandlers = [
  // Get admin dashboard
  http.get('/api/admin/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: mockAdminDashboard,
    });
  }),

  // Get admin users
  http.get('/api/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredUsers = mockAdminUsers;
    if (search) {
      filteredUsers = mockAdminUsers.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          '' ||
          user.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          '' ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    });
  }),

  // User actions
  http.post('/api/admin/users/:userId/action', async ({ params, request }) => {
    const { userId } = params;
    const action = (await request.json()) as UserActionRequest;

    const userIndex = mockAdminUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = mockAdminUsers[userIndex];

    switch (action.action) {
      case 'suspend':
        user.accountStatus = 'suspended';
        if (!user.suspensionHistory) {
          user.suspensionHistory = [];
        }
        user.suspensionHistory.push({
          id: `suspension-${Date.now()}`,
          moderatorId: 'admin-1',
          reason: action.reason || 'Admin action',
          startDate: new Date().toISOString(),
          endDate: action.endDate,
          isActive: true,
        });
        break;
      case 'unsuspend':
        user.accountStatus = 'active';
        user.suspensionHistory?.forEach((s) => (s.isActive = false));
        break;
      case 'ban':
        user.accountStatus = 'banned';
        break;
      case 'unban':
        user.accountStatus = 'active';
        break;
      case 'verify':
        user.verificationStatus = 'verified';
        break;
      case 'unverify':
        user.verificationStatus = 'unverified';
        break;
    }

    user.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      data: user,
    });
  }),

  // Get moderation queue
  http.get('/api/admin/moderation', () => {
    return HttpResponse.json({
      success: true,
      data: mockModerationQueue,
    });
  }),

  // Moderation actions
  http.post(
    '/api/admin/moderation/:itemId/action',
    async ({ params, request }) => {
      const { itemId } = params;
      const action = (await request.json()) as ModerationActionRequest;

      const itemIndex = mockModerationQueue.findIndex(
        (item) => item.id === itemId
      );
      if (itemIndex === -1) {
        return HttpResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        );
      }

      const item = mockModerationQueue[itemIndex];

      switch (action.action) {
        case 'approve':
          item.status = 'approved';
          break;
        case 'reject':
          item.status = 'rejected';
          break;
        case 'escalate':
          item.status = 'escalated';
          break;
        case 'dismiss':
          item.status = 'dismissed';
          break;
      }

      item.moderatorNotes = action.notes;
      item.moderatedBy = 'admin-1';
      item.moderatedAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      item.resolvedAt = new Date().toISOString();

      return HttpResponse.json({
        success: true,
        data: item,
      });
    }
  ),

  // Get platform settings
  http.get('/api/admin/settings', () => {
    return HttpResponse.json({
      success: true,
      data: mockPlatformSettings,
    });
  }),

  // Update platform settings
  http.put('/api/admin/settings', async ({ request }) => {
    const updates = await request.json();
    Object.assign(mockPlatformSettings, updates);

    return HttpResponse.json({
      success: true,
      data: mockPlatformSettings,
    });
  }),

  // Alert actions
  http.post('/api/admin/alerts/:alertId/read', ({ params }) => {
    const { alertId } = params;
    const alert = mockAdminDashboard.alerts?.find((a) => a.id === alertId);

    if (!alert) {
      return HttpResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    alert.isRead = true;

    return HttpResponse.json({
      success: true,
      data: alert,
    });
  }),

  http.delete('/api/admin/alerts/:alertId', ({ params }) => {
    const { alertId } = params;
    if (!mockAdminDashboard.alerts) {
      return HttpResponse.json(
        { success: false, error: 'No alerts found' },
        { status: 404 }
      );
    }

    const alertIndex = mockAdminDashboard.alerts.findIndex(
      (a) => a.id === alertId
    );

    if (alertIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    mockAdminDashboard.alerts.splice(alertIndex, 1);

    return HttpResponse.json({
      success: true,
    });
  }),
];
