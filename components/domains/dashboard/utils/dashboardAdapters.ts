/**
 * ================================================
 * DASHBOARD DATA ADAPTERS
 * ================================================
 * Transform API responses to unified dashboard types
 * Sprint Day 9 - Data Transformation Layer
 *
 * NOTE: These adapters are placeholders for future API integration.
 * Currently returning mock data since API schemas are not finalized.
 *
 * @version 1.0.0
 */

import type {
  FreelancerDashboard,
  EmployerDashboard,
  AdminDashboard,
  ModeratorDashboard,
  DashboardPeriod,
} from '../types/dashboard.types';

// ============================================================================
// API RESPONSE TYPES (Legacy - Will be defined when backend is ready)
// ============================================================================

/**
 * Generic API response wrapper
 * @todo Define actual API response structure when backend is ready
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = any;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate default dashboard period
 */
function getDefaultPeriod(): DashboardPeriod {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  return {
    days: 7,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

// ============================================================================
// FREELANCER ADAPTER
// ============================================================================

/**
 * Transform legacy freelancer API response to FreelancerDashboard
 * @todo Implement actual transformation when API is ready
 */
export function adaptFreelancerDashboard(
  _apiResponse: ApiResponse
): FreelancerDashboard {
  // TODO: Implement actual transformation
  return generateMockFreelancerDashboard();
}

// ============================================================================
// EMPLOYER ADAPTER
// ============================================================================

/**
 * Transform legacy employer API response to EmployerDashboard
 * @todo Implement actual transformation when API is ready
 */
export function adaptEmployerDashboard(
  _apiResponse: ApiResponse
): EmployerDashboard {
  // TODO: Implement actual transformation
  return generateMockEmployerDashboard();
}

// ============================================================================
// ADMIN ADAPTER
// ============================================================================

/**
 * Transform legacy admin API response to AdminDashboard
 * @todo Implement actual transformation when API is ready
 */
export function adaptAdminDashboard(_apiResponse: ApiResponse): AdminDashboard {
  // TODO: Implement actual transformation
  return generateMockAdminDashboard();
}

// ============================================================================
// MODERATOR ADAPTER
// ============================================================================

/**
 * Transform legacy moderator API response to ModeratorDashboard
 * @todo Implement actual transformation when API is ready
 */
export function adaptModeratorDashboard(
  _apiResponse: ApiResponse
): ModeratorDashboard {
  // TODO: Implement actual transformation
  return generateMockModeratorDashboard();
}

// ============================================================================
// UNIFIED ADAPTER
// ============================================================================

/**
 * Unified adapter that routes to appropriate role-specific adapter
 */
export function adaptDashboardData(
  role: 'FREELANCER' | 'EMPLOYER' | 'ADMIN' | 'MODERATOR',
  apiResponse: ApiResponse
):
  | FreelancerDashboard
  | EmployerDashboard
  | AdminDashboard
  | ModeratorDashboard {
  switch (role) {
    case 'FREELANCER':
      return adaptFreelancerDashboard(apiResponse);
    case 'EMPLOYER':
      return adaptEmployerDashboard(apiResponse);
    case 'ADMIN':
      return adaptAdminDashboard(apiResponse);
    case 'MODERATOR':
      return adaptModeratorDashboard(apiResponse);
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

// ============================================================================
// MOCK DATA GENERATORS (for development/testing)
// ============================================================================

/**
 * Generate mock freelancer dashboard data
 */
export function generateMockFreelancerDashboard(): FreelancerDashboard {
  return {
    earnings: {
      total: 12500,
      pending: 500,
      available: 12000,
      currency: 'TRY',
      trend: {
        direction: 'up',
        percentage: 15,
        isPositive: true,
      },
    },
    orders: {
      active: 3,
      completed: 21,
      cancelled: 2,
      totalRevenue: 12500,
    },
    packages: {
      total: 8,
      active: 6,
      paused: 2,
      views: 1234,
    },
    ratings: {
      average: 4.8,
      count: 15,
      distribution: { 5: 12, 4: 2, 3: 1, 2: 0, 1: 0 },
    },
    recentActivities: [],
    quickActions: [],
    charts: {
      earnings: {
        title: 'Kazançlar',
        total: 12500,
        change: 15,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      orders: {
        title: 'Siparişler',
        total: 21,
        change: 10,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      views: {
        title: 'Görüntülenmeler',
        total: 1234,
        change: 8,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    period: getDefaultPeriod(),
  };
}

/**
 * Generate mock employer dashboard data
 */
export function generateMockEmployerDashboard(): EmployerDashboard {
  return {
    spending: {
      total: 45000,
      thisMonth: 8500,
      currency: 'TRY',
      trend: {
        direction: 'up',
        percentage: 12,
        isPositive: true,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    orders: {
      active: 5,
      completed: 28,
      cancelled: 3,
      totalSpent: 45000,
    },
    favorites: {
      packages: 12,
      sellers: 8,
    },
    recentActivities: [],
    quickActions: [],
    charts: {
      spending: {
        title: 'Harcamalar',
        total: 45000,
        change: 12,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      orders: {
        title: 'Siparişler',
        total: 28,
        change: 8,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    period: getDefaultPeriod(),
  };
}

/**
 * Generate mock admin dashboard data
 */
export function generateMockAdminDashboard(): AdminDashboard {
  return {
    stats: {
      users: {
        total: 1542,
        active: 892,
        new: 45,
        trend: {
          direction: 'up',
          percentage: 8,
          isPositive: true,
        },
      },
      packages: {
        total: 324,
        active: 287,
        paused: 37,
        trend: {
          direction: 'up',
          percentage: 5,
          isPositive: true,
        },
      },
      orders: {
        total: 2156,
        completed: 1890,
        active: 266,
        revenue: 125000,
        trend: {
          direction: 'up',
          percentage: 12,
          isPositive: true,
        },
      },
      revenue: {
        total: 125000,
        commission: 18750,
        currency: 'TRY',
        trend: {
          direction: 'up',
          percentage: 15,
          isPositive: true,
        },
      },
    },
    systemHealth: {
      status: 'healthy',
      uptime: 99.8,
      cpu: 45,
      memory: 62,
      storage: 38,
      activeConnections: 234,
      cacheHitRate: 87,
      lastChecked: new Date().toISOString(),
    },
    searchMetrics: {
      totalSearches: 5432,
      avgResultsPerSearch: 12,
      topSearchTerms: [
        { term: 'web tasarım', count: 234 },
        { term: 'logo', count: 189 },
        { term: 'mobil uygulama', count: 167 },
        { term: 'seo', count: 145 },
        { term: 'içerik yazarlığı', count: 123 },
      ],
      noResultsCount: 89,
    },
    topPackages: [
      {
        id: '1',
        title: 'Profesyonel Logo Tasarımı',
        seller: 'Ahmet Yılmaz',
        revenue: 12500,
        orders: 25,
      },
      {
        id: '2',
        title: 'Kurumsal Web Sitesi',
        seller: 'Mehmet Kaya',
        revenue: 11200,
        orders: 18,
      },
      {
        id: '3',
        title: 'SEO Optimizasyonu',
        seller: 'Ayşe Demir',
        revenue: 9800,
        orders: 32,
      },
      {
        id: '4',
        title: 'Mobil Uygulama Geliştirme',
        seller: 'Fatma Şahin',
        revenue: 8900,
        orders: 12,
      },
      {
        id: '5',
        title: 'İçerik Yazarlığı',
        seller: 'Ali Çelik',
        revenue: 7600,
        orders: 45,
      },
    ],
    recentActivities: [],
    quickActions: [],
    charts: {
      userGrowth: {
        title: 'Kullanıcı Artışı',
        total: 1542,
        change: 8,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      revenue: {
        title: 'Gelir',
        total: 125000,
        change: 15,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      orders: {
        title: 'Siparişler',
        total: 2156,
        change: 12,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      searchAnalytics: {
        title: 'Arama Analizi',
        total: 5432,
        change: 5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    period: getDefaultPeriod(),
  };
}

/**
 * Generate mock moderator dashboard data
 */
export function generateMockModeratorDashboard(): ModeratorDashboard {
  return {
    stats: {
      pendingItems: 23,
      approvedToday: 45,
      rejectedToday: 12,
      spamDetected: 8,
      avgResponseTime: 15,
    },
    queue: {
      items: [
        {
          id: '1',
          type: 'package',
          title: 'Yeni Paket Onayı',
          content: 'Logo tasarım paketi inceleme bekliyor',
          submittedBy: {
            id: '1',
            name: 'Ahmet Yılmaz',
            avatar: '/avatars/user1.jpg',
          },
          submittedAt: new Date().toISOString(),
          priority: 'high',
          status: 'pending',
          category: 'Grafik Tasarım',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        {
          id: '2',
          type: 'comment',
          title: 'Yorum Şikayeti',
          content: 'Kullanıcı yorumu rahatsız edici içerik barındırıyor',
          submittedBy: {
            id: '2',
            name: 'Mehmet Kaya',
            avatar: '/avatars/user2.jpg',
          },
          submittedAt: new Date().toISOString(),
          priority: 'urgent',
          status: 'pending',
          category: 'Yorumlar',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
      total: 23,
      page: 1,
      pageSize: 10,
    },
    recentActivities: [],
    quickActions: [],
    charts: {
      moderationVolume: {
        title: 'Moderasyon Hacmi',
        total: 156,
        change: 5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      responseTime: {
        title: 'Yanıt Süresi',
        total: 15,
        change: -10,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    period: getDefaultPeriod(),
  };
}
