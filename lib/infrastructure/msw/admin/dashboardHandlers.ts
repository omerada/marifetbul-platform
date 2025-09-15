import { http, HttpResponse } from 'msw';
import type { AdminDashboardData } from '@/types';
import { userHandlers } from './userHandlers';

// Mock dashboard data generator
const generateDashboardData = (): AdminDashboardData => {
  const stats = {
    totalUsers: 15624,
    activeUsers: 8934,
    newUsersToday: 143,
    newUsersThisMonth: 3892,
    totalRevenue: 12450000,
    monthlyRevenue: 2847650,
    revenueGrowth: 18.3,
    totalJobs: 4523,
    activeJobs: 1876,
    jobsToday: 87,
    totalOrders: 12456,
    completedOrders: 1247,
    pendingOrders: 89,
    pendingPayouts: 847250, // Required field
    totalServices: 8743,
    activeServices: 6234,
    averageOrderValue: 485,
    conversionRate: 12.8,
    userRetentionRate: 76.4,
  };

  const systemHealth = {
    status: 'healthy' as const,
    uptime: 2547892, // seconds
    lastChecked: new Date().toISOString(), // Required field
    responseTime: 145, // ms
    apiStatus: 'operational' as const,
    databaseStatus: 'healthy' as const,
    cacheStatus: 'degraded' as const,
    paymentGatewayStatus: 'operational' as const,
    notificationServiceStatus: 'operational' as const,
    lastCheckedAt: new Date().toISOString(),
    issues: [],
  };

  const alerts = [
    {
      id: '1',
      type: 'warning' as const,
      severity: 'high' as const, // Added required field
      title: 'Yüksek API Trafiği',
      description: 'API endpoint trafiği normal seviyenin %150 üzerinde', // Changed message to description
      message: 'API endpoint trafiği normal seviyenin %150 üzerinde',
      category: 'system' as const,
      priority: 'high' as const,
      isRead: false,
      isResolved: false, // Added required field
      actionRequired: true,
      actionUrl: '/admin/system',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: '2',
      type: 'warning' as const, // Changed from info to warning
      severity: 'medium' as const, // Added required field
      title: 'Sistem Güncellemesi',
      description: 'Scheduled maintenance 03:00-05:00 arası planlandı', // Changed message to description
      message: 'Scheduled maintenance 03:00-05:00 arası planlandı',
      category: 'system' as const,
      priority: 'medium' as const,
      isRead: false,
      isResolved: false, // Added required field
      actionRequired: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: '3',
      type: 'error' as const,
      severity: 'critical' as const, // Added required field
      title: 'Ödeme Gateway Hatası',
      description: 'Payment provider ile bağlantı sorunu yaşanıyor', // Changed message to description
      message: 'Payment provider ile bağlantı sorunu yaşanıyor',
      category: 'finance' as const,
      priority: 'critical' as const,
      isRead: true,
      isResolved: false, // Added required field
      actionRequired: true,
      actionUrl: '/admin/finance',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      id: '4',
      type: 'warning' as const,
      severity: 'high' as const, // Added required field
      title: 'Disk Alanı Uyarısı',
      description: 'Sunucu disk kullanımı %85 seviyesinde', // Changed message to description
      message: 'Sunucu disk kullanımı %85 seviyesinde',
      category: 'system' as const,
      priority: 'high' as const,
      isRead: false,
      isResolved: false, // Added required field
      actionRequired: true,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    },
    {
      id: '5',
      type: 'warning' as const, // Changed from success to warning
      severity: 'low' as const, // Added required field
      title: 'Backup Tamamlandı',
      description: 'Günlük sistem backup işlemi başarıyla tamamlandı', // Changed message to description
      message: 'Günlük sistem backup işlemi başarıyla tamamlandı',
      category: 'system' as const,
      priority: 'low' as const,
      isRead: true,
      isResolved: true, // Added required field - backup completed so resolved
      actionRequired: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'account' as const, // Changed from user_action to valid SecurityAlert type
      severity: 'low' as const, // Added required field
      title: 'Yeni Kullanıcı Kaydı', // Added required field
      description: 'Ahmet Yılmaz (Frontend Developer) platformda kayıt oldu',
      isResolved: true, // Added required field
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
      userId: 'user_12345',
      message: 'Ahmet Yılmaz (Frontend Developer) platformda kayıt oldu',
    },
    {
      id: '2',
      type: 'account' as const, // Changed from system_event to valid SecurityAlert type
      severity: 'low' as const, // Added required field
      title: 'Yeni İş İlanı', // Added required field
      description: 'React Developer aranıyor - Startup projesi için',
      isResolved: true, // Added required field
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
      message: 'React Developer aranıyor - Startup projesi için',
    },
    {
      id: '3',
      type: 'payment' as const, // Changed from financial_transaction to valid SecurityAlert type
      severity: 'low' as const, // Added required field
      title: 'Ödeme Tamamlandı', // Added required field
      description: '₺2,450 tutarında ödeme başarıyla işlendi',
      isResolved: true, // Added required field
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
      message: '₺2,450 tutarında ödeme başarıyla işlendi',
    },
    {
      id: '4',
      type: 'security' as const, // Changed from moderation_action to valid SecurityAlert type
      severity: 'medium' as const, // Added required field
      title: 'İçerik Raporlandı', // Added required field
      description: 'Kullanıcı profili uygunsuz içerik nedeniyle raporlandı',
      isResolved: false, // Added required field
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      message: 'Kullanıcı profili uygunsuz içerik nedeniyle raporlandı',
      userId: 'user_98765',
    },
    {
      id: '5',
      type: 'account' as const, // Changed from user_action to valid SecurityAlert type
      severity: 'low' as const, // Added required field
      title: 'Değerlendirme Gönderildi', // Added required field
      description:
        '5 yıldızlı değerlendirme: "Harika çalışma, zamanında teslim"',
      isResolved: true, // Added required field
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      message: '5 yıldızlı değerlendirme: "Harika çalışma, zamanında teslim"',
      userId: 'user_54321',
    },
    {
      id: '6',
      type: 'account' as const, // Changed from system_event to valid SecurityAlert type
      severity: 'low' as const, // Added required field
      title: 'Sistem Yedeklemesi', // Added required field
      description: 'Otomatik backup işlemi başarıyla tamamlandı',
      isResolved: true, // Added required field
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      message: 'Otomatik backup işlemi başarıyla tamamlandı',
    },
  ];

  // Generate chart data
  const chartData = {
    userGrowth: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 200,
        newUsers: Math.floor(Math.random() * 50) + 80,
      };
    }),
    revenue: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 1000000) + 1500000,
        orders: Math.floor(Math.random() * 500) + 300,
      };
    }),
    activity: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        jobs: Math.floor(Math.random() * 50) + 20,
        orders: Math.floor(Math.random() * 30) + 15,
        messages: Math.floor(Math.random() * 200) + 100,
      };
    }),
    userTypes: [
      {
        type: 'freelancer' as const,
        count: 6743,
        percentage: 63.2,
      },
      {
        type: 'employer' as const,
        count: 3892,
        percentage: 36.8,
      },
    ],
    topCategories: [
      {
        category: 'Web Development',
        jobCount: 1523,
        orderCount: 892,
      },
      {
        category: 'Mobile Development',
        jobCount: 983,
        orderCount: 654,
      },
      {
        category: 'Design',
        jobCount: 756,
        orderCount: 432,
      },
      {
        category: 'Content Writing',
        jobCount: 543,
        orderCount: 321,
      },
      {
        category: 'Digital Marketing',
        jobCount: 432,
        orderCount: 287,
      },
    ],
    orderStatus: [
      { status: 'Tamamlandı', count: 1247, percentage: 68.3 },
      { status: 'Devam Eden', count: 89, percentage: 4.9 },
      { status: 'İptal Edildi', count: 23, percentage: 1.3 },
      { status: 'Beklemede', count: 156, percentage: 8.5 },
      { status: 'Onay Bekliyor', count: 310, percentage: 17.0 },
    ],
    geographicDistribution: [
      {
        country: 'Turkey',
        region: 'İstanbul',
        userCount: 4523,
      },
      {
        country: 'Turkey',
        region: 'Ankara',
        userCount: 2134,
      },
      {
        country: 'Turkey',
        region: 'İzmir',
        userCount: 1876,
      },
      {
        country: 'Turkey',
        region: 'Bursa',
        userCount: 987,
      },
      {
        country: 'Turkey',
        region: 'Antalya',
        userCount: 765,
      },
    ],
  };

  return {
    stats,
    systemHealth,
    alerts,
    recentActivity,
    charts: chartData,
  };
};

const adminDashboardHandlers = [
  // Get dashboard data
  http.get('/api/v1/admin/dashboard', async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const data = generateDashboardData();

    return HttpResponse.json({
      success: true,
      data,
      message: 'Dashboard data retrieved successfully',
    });
  }),

  // Mark alert as read
  http.post('/api/v1/admin/alerts/:alertId/read', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({
      success: true,
      message: `Alert ${params.alertId} marked as read`,
    });
  }),

  // Dismiss alert
  http.delete('/api/v1/admin/alerts/:alertId/dismiss', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({
      success: true,
      message: `Alert ${params.alertId} dismissed`,
    });
  }),

  // Get real-time metrics
  http.get('/api/v1/admin/dashboard/realtime', async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const realTimeData = {
      currentUsers: Math.floor(Math.random() * 500) + 1200,
      cpuUsage: Math.floor(Math.random() * 30) + 40,
      memoryUsage: Math.floor(Math.random() * 20) + 60,
      activeTransactions: Math.floor(Math.random() * 10) + 5,
      queueSize: Math.floor(Math.random() * 50) + 10,
      errorCount: Math.floor(Math.random() * 5),
      responseTime: Math.floor(Math.random() * 100) + 120,
      timestamp: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: realTimeData,
    });
  }),

  // Get system health status
  http.get('/api/v1/admin/system/health', async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const healthData = {
      status: 'healthy',
      services: {
        database: { status: 'operational', responseTime: 45 },
        redis: { status: 'operational', responseTime: 12 },
        elasticsearch: { status: 'degraded', responseTime: 234 },
        paymentGateway: { status: 'operational', responseTime: 567 },
        emailService: { status: 'operational', responseTime: 89 },
        fileStorage: { status: 'operational', responseTime: 123 },
      },
      metrics: {
        uptime: 2547892,
        totalRequests: 45678901,
        errorRate: 0.02,
        averageResponseTime: 145,
      },
      lastCheck: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: healthData,
    });
  }),
];

export const dashboardHandlers = [
  // Dashboard handlers
  ...adminDashboardHandlers,

  // User management handlers
  ...userHandlers,
];
