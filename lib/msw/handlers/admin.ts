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
    totalUsers: 15420,
    activeUsers: 2341,
    newUsersToday: 67,
    newUsersThisMonth: 1230,
    totalRevenue: 1250000,
    monthlyRevenue: 185000,
    revenueGrowth: 12.5,
    totalJobs: 3254,
    activeJobs: 567,
    jobsToday: 23,
    totalOrders: 8901,
    completedOrders: 7823,
    pendingOrders: 234,
    totalServices: 2156,
    activeServices: 1987,
    averageOrderValue: 450,
    conversionRate: 3.2,
    userRetentionRate: 78.5,
  },
  charts: {
    userGrowth: [
      { date: '2025-01', users: 12000, newUsers: 1200 },
      { date: '2025-02', users: 13450, newUsers: 1450 },
      { date: '2025-03', users: 14200, newUsers: 750 },
      { date: '2025-04', users: 15420, newUsers: 1220 },
    ],
    revenue: [
      { date: '2025-01', amount: 120000, orders: 267 },
      { date: '2025-02', amount: 145000, orders: 322 },
      { date: '2025-03', amount: 167000, orders: 371 },
      { date: '2025-04', amount: 185000, orders: 411 },
    ],
    activity: [
      { date: '2025-09-08', jobs: 45, orders: 123, messages: 567 },
      { date: '2025-09-09', jobs: 52, orders: 134, messages: 623 },
      { date: '2025-09-10', jobs: 38, orders: 98, messages: 445 },
      { date: '2025-09-11', jobs: 41, orders: 156, messages: 678 },
    ],
    userTypes: [
      { type: 'freelancer', count: 9252, percentage: 60 },
      { type: 'employer', count: 6168, percentage: 40 },
    ],
    topCategories: [
      { category: 'Web Development', jobCount: 456, orderCount: 1234 },
      { category: 'Graphic Design', jobCount: 378, orderCount: 987 },
      { category: 'Content Writing', jobCount: 321, orderCount: 765 },
      { category: 'Digital Marketing', jobCount: 298, orderCount: 654 },
    ],
    orderStatus: [
      { status: 'completed', count: 7823, percentage: 87.9 },
      { status: 'in_progress', count: 543, percentage: 6.1 },
      { status: 'pending', count: 234, percentage: 2.6 },
      { status: 'cancelled', count: 301, percentage: 3.4 },
    ],
    geographicDistribution: [
      { country: 'Turkey', region: 'Istanbul', userCount: 4625 },
      { country: 'Turkey', region: 'Ankara', userCount: 2134 },
      { country: 'Turkey', region: 'Izmir', userCount: 1876 },
      { country: 'Turkey', region: 'Other', userCount: 6785 },
    ],
  },
  alerts: [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'Yüksek spam raporları',
      message: 'Son 24 saatte normalden 3x fazla spam raporu alındı',
      category: 'moderation',
      priority: 'high',
      isRead: false,
      actionRequired: true,
      actionUrl: '/admin/moderation',
      createdAt: '2025-09-11T10:00:00Z',
    },
    {
      id: 'alert-2',
      type: 'error',
      title: 'Ödeme işlemcisi sorunu',
      message: 'Payment gateway response time artışı gözlemleniyor',
      category: 'system',
      priority: 'critical',
      isRead: false,
      actionRequired: true,
      createdAt: '2025-09-11T09:30:00Z',
    },
    {
      id: 'alert-3',
      type: 'info',
      title: 'Yeni özellik güncellemesi',
      message: 'v2.1.0 güncellemesi başarıyla yayınlandı',
      category: 'system',
      priority: 'low',
      isRead: true,
      actionRequired: false,
      createdAt: '2025-09-11T08:00:00Z',
    },
  ],
  recentActivity: [
    {
      id: 'activity-1',
      type: 'user_action',
      userId: 'user-123',
      action: 'user_suspended',
      description: 'Kullanıcı spam nedeniyle askıya alındı',
      timestamp: '2025-09-11T11:30:00Z',
    },
    {
      id: 'activity-2',
      type: 'moderation_action',
      adminId: 'admin-456',
      action: 'content_approved',
      description: 'İçerik moderasyon sürecinden geçirildi',
      timestamp: '2025-09-11T11:15:00Z',
    },
    {
      id: 'activity-3',
      type: 'financial_transaction',
      action: 'payment_processed',
      description: '₺1,250 ödeme başarıyla işlendi',
      timestamp: '2025-09-11T11:00:00Z',
    },
  ],
  systemHealth: {
    status: 'healthy',
    uptime: 2634000, // seconds
    responseTime: 145, // milliseconds
    apiStatus: 'operational',
    databaseStatus: 'healthy',
    cacheStatus: 'healthy',
    paymentGatewayStatus: 'degraded',
    notificationServiceStatus: 'operational',
    lastCheckedAt: '2025-09-11T12:00:00Z',
    issues: [
      {
        id: 'issue-1',
        component: 'Payment Gateway',
        description: 'Response time artışı',
        severity: 'medium',
        startedAt: '2025-09-11T09:30:00Z',
        status: 'investigating',
      },
    ],
  },
};

const mockAdminUsers: AdminUserData[] = [
  {
    id: 'user-1',
    email: 'ali.veli@example.com',
    firstName: 'Ali',
    lastName: 'Veli',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    userType: 'freelancer',
    accountStatus: 'active',
    verificationStatus: 'verified',
    verificationBadges: [
      {
        id: 'badge-1',
        type: 'email',
        status: 'verified',
        verifiedAt: '2025-01-15T10:00:00Z',
      },
      {
        id: 'badge-2',
        type: 'identity',
        status: 'verified',
        verifiedAt: '2025-01-16T14:30:00Z',
      },
    ],
    joinDate: '2025-01-15T10:00:00Z',
    lastActiveAt: '2025-09-11T09:30:00Z',
    lastLoginAt: '2025-09-11T08:00:00Z',
    loginCount: 156,
    totalOrders: 45,
    totalEarnings: 125000,
    totalSpent: 0,
    successRate: 98.5,
    disputeCount: 1,
    warningCount: 0,
    reputationScore: 4.8,
    riskScore: 0.2,
    notes: [
      {
        id: 'note-1',
        adminId: 'admin-1',
        adminName: 'Moderator Admin',
        note: 'Güvenilir freelancer, kaliteli hizmet veriyor',
        category: 'positive',
        isPublic: false,
        createdAt: '2025-08-15T10:00:00Z',
      },
    ],
    suspensionHistory: [],
    phone: '+90 555 123 4567',
    location: 'Istanbul, Turkey',
    bio: 'Experienced web developer specializing in React and Node.js',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-09-11T09:30:00Z',
  },
  {
    id: 'user-2',
    email: 'ayse.yılmaz@example.com',
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    userType: 'employer',
    accountStatus: 'suspended',
    verificationStatus: 'pending',
    verificationBadges: [
      {
        id: 'badge-3',
        type: 'email',
        status: 'verified',
        verifiedAt: '2025-02-10T12:00:00Z',
      },
    ],
    joinDate: '2025-02-10T12:00:00Z',
    lastActiveAt: '2025-09-10T15:45:00Z',
    lastLoginAt: '2025-09-10T15:00:00Z',
    loginCount: 89,
    totalOrders: 23,
    totalEarnings: 0,
    totalSpent: 45000,
    successRate: 87.2,
    disputeCount: 3,
    warningCount: 2,
    reputationScore: 3.4,
    riskScore: 0.7,
    notes: [
      {
        id: 'note-2',
        adminId: 'admin-1',
        adminName: 'Moderator Admin',
        note: 'Birden fazla spam raporu alındı, izleniyor',
        category: 'warning',
        isPublic: false,
        createdAt: '2025-09-01T10:00:00Z',
      },
    ],
    suspensionHistory: [
      {
        id: 'suspension-1',
        adminId: 'admin-1',
        adminName: 'Moderator Admin',
        reason: 'Spam içerik paylaşımı',
        startDate: '2025-09-10T16:00:00Z',
        endDate: '2025-09-17T16:00:00Z',
        isActive: true,
        type: 'temporary_suspension',
      },
    ],
    phone: '+90 555 987 6543',
    location: 'Ankara, Turkey',
    bio: 'Marketing manager looking for creative services',
    createdAt: '2025-02-10T12:00:00Z',
    updatedAt: '2025-09-10T16:00:00Z',
  },
];

const mockModerationQueue: ModerationItem[] = [
  {
    id: 'mod-1',
    type: 'review',
    contentId: 'review-123',
    content: {
      title: 'Kötü hizmet',
      description:
        'Çok kötü hizmet, para iadesi istiyorum! Kesinlikle tavsiye etmiyorum.',
      rating: 1,
      userContent: {
        userId: 'user-789',
        userName: 'Mehmet Kaya',
        userType: 'employer',
        submittedAt: '2025-09-11T08:00:00Z',
      },
    },
    reportedBy: 'user-2',
    reporterInfo: {
      id: 'user-2',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      userType: 'freelancer',
    },
    reason: 'inappropriate_content',
    category: 'community_standards',
    priority: 'high',
    status: 'pending',
    automatedFlags: [
      {
        id: 'flag-1',
        type: 'sentiment_analysis',
        severity: 'high',
        confidence: 0.89,
        details: 'Negative sentiment detected with high confidence',
        flaggedAt: '2025-09-11T08:05:00Z',
      },
      {
        id: 'flag-2',
        type: 'keyword_detection',
        severity: 'medium',
        confidence: 0.75,
        details: 'Potential spam keywords detected',
        flaggedAt: '2025-09-11T08:05:00Z',
      },
    ],
    reviewHistory: [],
    createdAt: '2025-09-11T08:00:00Z',
    updatedAt: '2025-09-11T08:05:00Z',
  },
  {
    id: 'mod-2',
    type: 'job',
    contentId: 'job-456',
    content: {
      title: 'Ucuz web sitesi yapımı',
      description: 'Çok ucuza website yaparım, WhatsApp: +90 123 456 7890',
      userContent: {
        userId: 'user-456',
        userName: 'Fake User',
        userType: 'employer',
        submittedAt: '2025-09-11T09:00:00Z',
      },
    },
    reportedBy: 'user-1',
    reporterInfo: {
      id: 'user-1',
      firstName: 'Ali',
      lastName: 'Veli',
      userType: 'freelancer',
    },
    reason: 'spam',
    category: 'platform_integrity',
    priority: 'medium',
    status: 'pending',
    automatedFlags: [
      {
        id: 'flag-3',
        type: 'pattern_matching',
        severity: 'high',
        confidence: 0.92,
        details: 'Phone number pattern detected in job description',
        flaggedAt: '2025-09-11T09:05:00Z',
      },
    ],
    reviewHistory: [],
    createdAt: '2025-09-11T09:00:00Z',
    updatedAt: '2025-09-11T09:05:00Z',
  },
];

const mockPlatformSettings: PlatformSettings = {
  general: {
    siteName: 'Marifet',
    siteDescription: "Türkiye'nin en büyük freelance platformu",
    supportEmail: 'support@marifet.com',
    maxFileUploadSize: 10485760, // 10MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    defaultLanguage: 'tr',
    supportedLanguages: ['tr', 'en'],
    timezone: 'Europe/Istanbul',
    currency: 'TRY',
    supportedCurrencies: ['TRY', 'USD', 'EUR'],
    termsOfServiceUrl: '/terms',
    privacyPolicyUrl: '/privacy',
    cookiePolicyUrl: '/cookies',
  },
  payment: {
    platformFee: 0.05, // 5%
    minimumWithdrawal: 100,
    withdrawalFee: 5,
    escrowPeriod: 14,
    automaticRelease: true,
    supportedPaymentMethods: ['credit_card', 'bank_transfer', 'wallet'],
    taxCalculation: true,
    invoiceGeneration: true,
    refundPolicy: {
      allowRefunds: true,
      refundPeriod: 30,
      partialRefunds: true,
      automaticRefunds: false,
      refundFee: 0.03,
    },
  },
  security: {
    twoFactorAuth: true,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
    },
    sessionTimeout: 120,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    ipWhitelist: [],
    ipBlacklist: [],
    enableCaptcha: true,
    dataRetentionPeriod: 2555, // 7 years
  },
  email: {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'noreply@marifet.com',
    smtpPassword: '********',
    fromEmail: 'noreply@marifet.com',
    fromName: 'Marifet',
    enableEmailVerification: true,
    emailTemplates: [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: "Marifet'e Hoş Geldiniz!",
        template: 'Merhaba {{userName}}, hesabınız başarıyla oluşturuldu.',
        variables: ['userName'],
        isActive: true,
      },
    ],
  },
  features: {
    userRegistration: true,
    emailVerificationRequired: true,
    profileVerification: true,
    servicePackages: true,
    jobPosting: true,
    directMessaging: true,
    videoChat: false,
    mobileApp: true,
    apiAccess: true,
    affiliateProgram: false,
    loyaltyProgram: true,
    multiLanguage: true,
    darkMode: true,
    notificationSystem: true,
    searchEngine: true,
    analyticsTracking: true,
  },
  content: {
    moderationEnabled: true,
    autoModeration: true,
    userGeneratedContent: true,
    allowUserProfiles: true,
    allowPortfolio: true,
    allowCustomCategories: false,
    contentFiltering: true,
    spamDetection: true,
    duplicateDetection: true,
    imageModeration: true,
    textAnalysis: true,
  },
  api: {
    enablePublicApi: true,
    enableWebhooks: true,
    rateLimiting: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burst: 20,
    },
    apiVersioning: true,
    apiDocumentation: true,
    apiKeys: [],
  },
  integrations: {
    paymentGateways: [
      {
        id: 'iyzico',
        name: 'Iyzico',
        isActive: true,
        configuration: { apiKey: '****', secretKey: '****' },
        supportedCurrencies: ['TRY'],
        fees: { percentage: 0.029, fixed: 0.25 },
      },
    ],
    emailProviders: [
      {
        id: 'sendgrid',
        name: 'SendGrid',
        isActive: true,
        configuration: { apiKey: '****' },
        isDefault: true,
      },
    ],
    smsProviders: [
      {
        id: 'twilio',
        name: 'Twilio',
        isActive: true,
        configuration: { accountSid: '****', authToken: '****' },
        isDefault: true,
        supportedCountries: ['TR', 'US'],
      },
    ],
    analyticsProviders: [
      {
        id: 'ga4',
        name: 'Google Analytics 4',
        isActive: true,
        configuration: { measurementId: 'G-XXXXXXX' },
        trackingId: 'G-XXXXXXX',
      },
    ],
    socialLogins: [
      {
        provider: 'google',
        isActive: true,
        clientId: '****',
        clientSecret: '****',
        scopes: ['email', 'profile'],
      },
    ],
  },
  maintenance: {
    isMaintenanceMode: false,
    maintenanceMessage: 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
    scheduledMaintenance: [],
    allowedIps: [],
    allowedRoles: ['admin', 'super_admin'],
  },
};

// Admin Handlers
export const adminHandlers = [
  // Dashboard
  http.get('/api/v1/admin/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: mockAdminDashboard,
    });
  }),

  // Users
  http.get('/api/v1/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 50;
    const search = url.searchParams.get('search');
    const userType = url.searchParams.get('userType') as
      | 'freelancer'
      | 'employer';
    const status = url.searchParams.getAll('status[]');

    let filteredUsers = [...mockAdminUsers];

    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (userType) {
      filteredUsers = filteredUsers.filter(
        (user) => user.userType === userType
      );
    }

    if (status.length > 0) {
      filteredUsers = filteredUsers.filter((user) =>
        status.includes(user.accountStatus)
      );
    }

    const total = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1,
        },
      },
    });
  }),

  http.get('/api/v1/admin/users/:id', ({ params }) => {
    const userId = params.id as string;
    const user = mockAdminUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Kullanıcı bulunamadı',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: user,
    });
  }),

  http.post('/api/v1/admin/users/:id/action', async ({ params, request }) => {
    const userId = params.id as string;
    const action = (await request.json()) as UserActionRequest;

    const userIndex = mockAdminUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Kullanıcı bulunamadı',
        },
        { status: 404 }
      );
    }

    const user = mockAdminUsers[userIndex];

    // Apply action
    switch (action.action) {
      case 'suspend':
        user.accountStatus = 'suspended';
        if (action.reason) {
          user.suspensionHistory.push({
            id: `suspension-${Date.now()}`,
            adminId: 'admin-1',
            adminName: 'Current Admin',
            reason: action.reason,
            startDate: new Date().toISOString(),
            endDate: action.endDate,
            isActive: true,
            type: 'temporary_suspension',
          });
        }
        break;
      case 'unsuspend':
        user.accountStatus = 'active';
        user.suspensionHistory.forEach((s) => (s.isActive = false));
        break;
      case 'ban':
        user.accountStatus = 'banned';
        break;
      case 'verify':
        user.verificationStatus = 'verified';
        break;
      case 'unverify':
        user.verificationStatus = 'unverified';
        break;
    }

    user.updatedAt = new Date().toISOString();
    mockAdminUsers[userIndex] = user;

    return HttpResponse.json({
      success: true,
      data: { user },
      message: 'Kullanıcı işlemi başarıyla gerçekleştirildi',
    });
  }),

  // Moderation
  http.get('/api/v1/admin/moderation/queue', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 50;
    const status = url.searchParams.getAll('status[]');
    const priority = url.searchParams.getAll('priority[]');
    const type = url.searchParams.getAll('type[]');

    let filteredItems = [...mockModerationQueue];

    if (status.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        status.includes(item.status)
      );
    }

    if (priority.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        priority.includes(item.priority)
      );
    }

    if (type.length > 0) {
      filteredItems = filteredItems.filter((item) => type.includes(item.type));
    }

    const total = filteredItems.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredItems.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1,
        },
      },
    });
  }),

  http.get('/api/v1/admin/moderation/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalItems: mockModerationQueue.length,
        pendingItems: mockModerationQueue.filter(
          (item) => item.status === 'pending'
        ).length,
        approvedItems: mockModerationQueue.filter(
          (item) => item.status === 'approved'
        ).length,
        rejectedItems: mockModerationQueue.filter(
          (item) => item.status === 'rejected'
        ).length,
        averageReviewTime: 125, // seconds
        automatedFlagAccuracy: 0.87,
        topModerationReasons: [
          { reason: 'spam', count: 45 },
          { reason: 'inappropriate_content', count: 32 },
          { reason: 'fake_reviews', count: 28 },
        ],
        moderatorPerformance: [
          {
            moderatorId: 'mod-1',
            moderatorName: 'Moderator 1',
            reviewedItems: 156,
            averageTime: 98,
            accuracy: 0.94,
          },
        ],
      },
    });
  }),

  http.post(
    '/api/v1/admin/moderation/:id/action',
    async ({ params, request }) => {
      const itemId = params.id as string;
      const action = (await request.json()) as ModerationActionRequest;

      const itemIndex = mockModerationQueue.findIndex(
        (item) => item.id === itemId
      );
      if (itemIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Moderasyon öğesi bulunamadı',
          },
          { status: 404 }
        );
      }

      const item = mockModerationQueue[itemIndex];

      // Apply action
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

      if (action.notes) {
        item.moderatorNotes = action.notes;
      }

      item.updatedAt = new Date().toISOString();
      item.resolvedAt = new Date().toISOString();
      mockModerationQueue[itemIndex] = item;

      return HttpResponse.json({
        success: true,
        data: { item },
        message: 'Moderasyon işlemi başarıyla gerçekleştirildi',
      });
    }
  ),

  // Settings
  http.get('/api/v1/admin/settings', () => {
    return HttpResponse.json({
      success: true,
      data: mockPlatformSettings,
    });
  }),

  http.put('/api/v1/admin/settings', async ({ request }) => {
    const settings = (await request.json()) as Partial<PlatformSettings>;

    // Update mock settings (in real app, this would update database)
    Object.assign(mockPlatformSettings, settings);

    return HttpResponse.json({
      success: true,
      data: mockPlatformSettings,
      message: 'Platform ayarları başarıyla güncellendi',
    });
  }),

  // Alerts
  http.post('/api/v1/admin/alerts/:id/read', ({ params }) => {
    const alertId = params.id as string;
    const alert = mockAdminDashboard.alerts.find((a) => a.id === alertId);

    if (!alert) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Alert bulunamadı',
        },
        { status: 404 }
      );
    }

    alert.isRead = true;

    return HttpResponse.json({
      success: true,
      message: 'Alert okundu olarak işaretlendi',
    });
  }),

  http.delete('/api/v1/admin/alerts/:id/dismiss', ({ params }) => {
    const alertId = params.id as string;
    const alertIndex = mockAdminDashboard.alerts.findIndex(
      (a) => a.id === alertId
    );

    if (alertIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Alert bulunamadı',
        },
        { status: 404 }
      );
    }

    mockAdminDashboard.alerts.splice(alertIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Alert başarıyla kapatıldı',
    });
  }),
];

export default adminHandlers;
