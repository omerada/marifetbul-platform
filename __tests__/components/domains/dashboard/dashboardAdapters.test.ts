/**
 * ================================================
 * DASHBOARD ADAPTERS UNIT TESTS
 * ================================================
 * Sprint 1 - Task T-103
 *
 * Test Coverage:
 * - adaptAdminDashboard()
 * - Type validation
 * - Edge cases
 * - Error handling
 *
 * @version 1.0.0
 * @created 2025-11-02
 */

import { describe, it, expect } from '@jest/globals';
import {
  adaptAdminDashboard,
  adaptFreelancerDashboard,
  adaptEmployerDashboard,
  adaptModeratorDashboard,
} from '@/components/domains/dashboard/utils/dashboardAdapters';
import type {
  AdminDashboardApiResponse,
  SellerDashboardApiResponse,
  BuyerDashboardApiResponse,
  ModeratorDashboardApiResponse,
} from '@/types/backend/dashboard';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Valid Admin Dashboard API Response (Complete)
 */
const validAdminApiResponse: AdminDashboardApiResponse = {
  periodStart: '2025-10-01T00:00:00Z',
  periodEnd: '2025-10-31T23:59:59Z',
  periodDays: 30,

  userMetrics: {
    totalUsers: 1000,
    activeUsers: 500,
    newUsers: 50,
    dailyActiveUsers: 200,
    monthlyActiveUsers: 500,
    dauMauRatio: 0.4,
    totalSellers: 300,
    activeSellers: 150,
    totalBuyers: 700,
    activeBuyers: 350,
    usersByRole: {
      FREELANCER: 300,
      EMPLOYER: 700,
    },
    userGrowthRate: 15.5,
  },

  revenueMetrics: {
    totalRevenue: 50000,
    platformFee: 10000,
    sellerEarnings: 40000,
    netRevenue: 10000,
    totalOrders: 200,
    averageOrderValue: 250,
    totalRefunds: 5,
    refundAmount: 500,
    refundRate: 2.5,
    revenueGrowth: 5000,
    revenueGrowthRate: 11.11,
    revenueByCategory: {
      'Web Development': 20000,
      'Graphic Design': 15000,
      'Content Writing': 15000,
    },
    revenueByPaymentMethod: {
      'Credit Card': 30000,
      Wallet: 20000,
    },
  },

  packageMetrics: {
    totalPackages: 500,
    activePackages: 400,
    newPackages: 30,
    totalViews: 10000,
    uniqueViewers: 3000,
    totalFavorites: 500,
    totalShares: 200,
    averageConversionRate: 2.5,
    packagesByCategory: {
      'Web Development': 150,
      'Graphic Design': 200,
      'Content Writing': 150,
    },
    packagesByStatus: {
      ACTIVE: 400,
      PAUSED: 80,
      DELETED: 20,
    },
    topPackages: [
      {
        packageId: 'pkg-1',
        title: 'Professional Logo Design',
        sellerName: 'John Doe',
        views: 1000,
        orders: 50,
        revenue: 5000,
      },
      {
        packageId: 'pkg-2',
        title: 'WordPress Website',
        sellerName: 'Jane Smith',
        views: 800,
        orders: 40,
        revenue: 4000,
      },
    ],
  },

  orderMetrics: {
    totalOrders: 200,
    completedOrders: 150,
    pendingOrders: 30,
    cancelledOrders: 15,
    refundedOrders: 5,
    completionRate: 75,
    cancellationRate: 7.5,
    totalOrderValue: 50000,
    averageOrderValue: 250,
    ordersByStatus: {
      COMPLETED: 150,
      PENDING: 30,
      CANCELLED: 15,
      REFUNDED: 5,
    },
    ordersByCategory: {
      'Web Development': 80,
      'Graphic Design': 70,
      'Content Writing': 50,
    },
  },

  searchMetrics: {
    totalSearches: 5000,
    uniqueSearchers: 1500,
    zeroResultSearches: 500,
    zeroResultRate: 10,
    clickThroughRate: 25,
    searchToOrderConversionRate: 4,
    conversionRate: 4,
    averageResultCount: 15.5,
    topKeywords: ['logo', 'website', 'content', 'design', 'seo'],
    zeroResultKeywords: ['blockchain', 'ai'],
    searchesByCategory: {
      'Web Development': 2000,
      'Graphic Design': 1800,
      'Content Writing': 1200,
    },
  },

  activityMetrics: {
    totalActivities: 20000,
    apiCalls: 15000,
    pageViews: 50000,
    averageResponseTime: 150,
    slowRequests: 50,
    errorRequests: 20,
    errorRate: 0.1,
    activitiesByType: {
      SEARCH: 5000,
      VIEW: 10000,
      ORDER: 200,
      MESSAGE: 4800,
    },
    activitiesByCategory: {
      'Web Development': 8000,
      'Graphic Design': 7000,
      'Content Writing': 5000,
    },
    activitiesByHour: {
      0: 500,
      1: 300,
      9: 2000,
      10: 2500,
      14: 2200,
    },
  },

  systemHealth: {
    databaseHealthy: true,
    elasticsearchHealthy: true,
    systemStatus: 'HEALTHY',
    activeConnections: 50,
    idleConnections: 20,
    heapMemoryUsed: 512000000,
    heapMemoryMax: 1024000000,
    heapUsagePercent: 50,
    uptimeSeconds: 86400,
  },

  businessMetrics: {
    conversionRate: 2.5,
    repeatPurchaseRate: 30,
    averageLifetimeValue: 500,
    customerSatisfactionScore: 4.5,
    totalReviews: 300,
    averageRating: 4.5,
    totalMessages: 5000,
    responseRate: 95,
  },

  trends: {
    dailyRevenue: [
      { date: '2025-10-01', value: 1500 },
      { date: '2025-10-02', value: 1600 },
      { date: '2025-10-03', value: 1800 },
    ],
    dailyOrders: [
      { date: '2025-10-01', value: 6 },
      { date: '2025-10-02', value: 7 },
      { date: '2025-10-03', value: 8 },
    ],
    dailyUsers: [
      { date: '2025-10-01', value: 15 },
      { date: '2025-10-02', value: 18 },
      { date: '2025-10-03', value: 20 },
    ],
    dailyPackageViews: [
      { date: '2025-10-01', value: 300 },
      { date: '2025-10-02', value: 320 },
      { date: '2025-10-03', value: 350 },
    ],
  },

  generatedAt: '2025-11-02T10:00:00Z',
  fromCache: false,
  cacheAgeSeconds: 0,
};

/**
 * Invalid API Response (Missing required fields)
 */
const invalidApiResponse = {
  periodDays: 30,
  // Missing required fields: userMetrics, revenueMetrics, etc.
};

/**
 * API Response with Negative Growth
 */
const negativeGrowthResponse: AdminDashboardApiResponse = {
  ...validAdminApiResponse,
  userMetrics: {
    ...validAdminApiResponse.userMetrics,
    userGrowthRate: -5.5,
  },
  revenueMetrics: {
    ...validAdminApiResponse.revenueMetrics,
    revenueGrowthRate: -10.2,
  },
};

/**
 * API Response with System Issues
 */
const degradedSystemResponse: AdminDashboardApiResponse = {
  ...validAdminApiResponse,
  systemHealth: {
    ...validAdminApiResponse.systemHealth,
    systemStatus: 'DEGRADED',
    databaseHealthy: false,
    heapUsagePercent: 85,
  },
};

/**
 * API Response with Empty Arrays
 */
const emptyArraysResponse: AdminDashboardApiResponse = {
  ...validAdminApiResponse,
  packageMetrics: {
    ...validAdminApiResponse.packageMetrics,
    topPackages: [],
  },
  searchMetrics: {
    ...validAdminApiResponse.searchMetrics,
    topKeywords: [],
    zeroResultKeywords: [],
  },
};

// ============================================================================
// TESTS: adaptAdminDashboard()
// ============================================================================

describe('adaptAdminDashboard', () => {
  describe('Valid API Response', () => {
    it('should transform valid API response to AdminDashboard type', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.systemHealth).toBeDefined();
      expect(result.searchMetrics).toBeDefined();
      expect(result.period).toBeDefined();
    });

    it('should map user stats correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.stats.users.total).toBe(1000);
      expect(result.stats.users.active).toBe(500);
      expect(result.stats.users.new).toBe(50);
      expect(result.stats.users.trend).toBeDefined();
    });

    it('should map package stats correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.stats.packages.total).toBe(500);
      expect(result.stats.packages.active).toBe(400);
      expect(result.stats.packages.paused).toBe(100); // total - active
    });

    it('should map order stats correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.stats.orders.total).toBe(200);
      expect(result.stats.orders.completed).toBe(150);
      expect(result.stats.orders.active).toBe(30); // pending mapped to active
      expect(result.stats.orders.revenue).toBe(50000);
    });

    it('should map revenue stats correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.stats.revenue.total).toBe(50000);
      expect(result.stats.revenue.commission).toBe(10000);
      expect(result.stats.revenue.currency).toBe('TRY');
    });

    it('should map search metrics correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.searchMetrics.totalSearches).toBe(5000);
      expect(result.searchMetrics.avgResultsPerSearch).toBe(15.5);
      expect(result.searchMetrics.noResultsCount).toBe(500);
      expect(result.searchMetrics.topSearchTerms).toHaveLength(5);
      expect(result.searchMetrics.topSearchTerms[0]).toEqual({
        term: 'logo',
        count: 100,
      });
    });

    it('should map top packages correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.topPackages).toHaveLength(2);
      expect(result.topPackages[0]).toEqual({
        id: 'pkg-1',
        title: 'Professional Logo Design',
        seller: 'John Doe',
        revenue: 5000,
        orders: 50,
      });
    });

    it('should map period information correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.period.days).toBe(30);
      expect(result.period.startDate).toBe('2025-10-01T00:00:00Z');
      expect(result.period.endDate).toBe('2025-10-31T23:59:59Z');
    });

    it('should map cache metadata correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.cache).toBeDefined();
      expect(result.cache?.fromCache).toBe(false);
      expect(result.cache?.generatedAt).toBe('2025-11-02T10:00:00Z');
      expect(result.cache?.cacheKey).toBe('admin-dashboard-30');
    });
  });

  describe('System Health Status Normalization', () => {
    it('should normalize HEALTHY status to "healthy"', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);
      expect(result.systemHealth.status).toBe('healthy');
    });

    it('should normalize DEGRADED status to "warning"', () => {
      const result = adaptAdminDashboard(degradedSystemResponse);
      expect(result.systemHealth.status).toBe('warning');
    });

    it('should normalize DOWN status to "critical"', () => {
      const downResponse = {
        ...validAdminApiResponse,
        systemHealth: {
          ...validAdminApiResponse.systemHealth,
          systemStatus: 'DOWN' as const,
        },
      };
      const result = adaptAdminDashboard(downResponse);
      expect(result.systemHealth.status).toBe('critical');
    });

    it('should map system health metrics correctly', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.systemHealth.uptime).toBe(86400);
      expect(result.systemHealth.memory).toBe(50);
      expect(result.systemHealth.activeConnections).toBe(50);
      expect(result.systemHealth.lastChecked).toBe('2025-11-02T10:00:00Z');
    });
  });

  describe('Trend Indicators', () => {
    it('should calculate positive user growth trend', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.stats.users.trend?.value).toBe(15.5);
      expect(result.stats.users.trend?.direction).toBe('up');
      expect(result.stats.users.trend?.percentage).toBe(15.5);
      expect(result.stats.users.trend?.isPositive).toBe(true);
    });

    it('should calculate negative user growth trend', () => {
      const result = adaptAdminDashboard(negativeGrowthResponse);

      expect(result.stats.users.trend?.value).toBe(-5.5);
      expect(result.stats.users.trend?.direction).toBe('down');
      expect(result.stats.users.trend?.percentage).toBe(5.5); // Absolute value
      expect(result.stats.users.trend?.isPositive).toBe(false);
    });

    it('should calculate positive revenue growth trend', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.stats.revenue.trend?.value).toBe(11.11);
      expect(result.stats.revenue.trend?.direction).toBe('up');
      expect(result.stats.revenue.trend?.isPositive).toBe(true);
    });

    it('should calculate negative revenue growth trend', () => {
      const result = adaptAdminDashboard(negativeGrowthResponse);

      expect(result.stats.revenue.trend?.value).toBe(-10.2);
      expect(result.stats.revenue.trend?.direction).toBe('down');
      expect(result.stats.revenue.trend?.percentage).toBe(10.2); // Absolute value
      expect(result.stats.revenue.trend?.isPositive).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty top packages array', () => {
      const result = adaptAdminDashboard(emptyArraysResponse);
      expect(result.topPackages).toHaveLength(0);
    });

    it('should handle empty search keywords arrays', () => {
      const result = adaptAdminDashboard(emptyArraysResponse);
      expect(result.searchMetrics.topSearchTerms).toHaveLength(0);
    });

    it('should throw error for invalid API response', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => adaptAdminDashboard(invalidApiResponse as any)).toThrow(
        'Failed to adapt Admin dashboard: Invalid API response structure'
      );
    });

    it('should throw error for null/undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => adaptAdminDashboard(null as any)).toThrow();
    });
  });

  describe('Recent Activities Integration (Sprint 2)', () => {
    it('should populate recentActivities array from metrics', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);
      expect(result.recentActivities).toBeDefined();
      expect(Array.isArray(result.recentActivities)).toBe(true);
      expect(result.recentActivities.length).toBeGreaterThan(0);
    });

    it('should include order activities with correct status mapping', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);
      const orderActivities = result.recentActivities.filter(
        (a) => a.type === 'order'
      );
      expect(orderActivities.length).toBeGreaterThan(0);

      orderActivities.forEach((activity) => {
        expect(activity).toMatchObject({
          id: expect.any(String),
          type: 'order',
          title: expect.any(String),
          description: expect.any(String),
          timestamp: expect.any(String),
          status: expect.stringMatching(
            /^(pending|completed|cancelled|failed|in_progress)$/
          ),
        });
      });
    });

    it('should limit activities to max 10 items', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);
      expect(result.recentActivities.length).toBeLessThanOrEqual(10);
    });

    it('should sort activities by timestamp descending', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);
      for (let i = 1; i < result.recentActivities.length; i++) {
        const prevTimestamp = new Date(
          result.recentActivities[i - 1].timestamp
        ).getTime();
        const currTimestamp = new Date(
          result.recentActivities[i].timestamp
        ).getTime();
        expect(prevTimestamp).toBeGreaterThanOrEqual(currTimestamp);
      }
    });
  });

  describe('Quick Actions Integration (Sprint 2)', () => {
    it('should populate quickActions array for admin', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);
      expect(result.quickActions).toBeDefined();
      expect(Array.isArray(result.quickActions)).toBe(true);
      expect(result.quickActions.length).toBe(5); // 5 admin actions
    });

    it('should have correctly structured quick actions', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      result.quickActions.forEach((action) => {
        expect(action).toMatchObject({
          id: expect.any(String),
          label: expect.any(String),
          description: expect.any(String),
          icon: expect.any(Function), // Lucide icon component
          href: expect.stringMatching(/^\//), // URL starting with /
          variant: expect.stringMatching(/^(primary|default|secondary)$/),
        });
      });
    });

    it('should include user management as first action', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);
      expect(result.quickActions[0].label).toBe('Kullanıcı Yönetimi');
      expect(result.quickActions[0].href).toBe('/admin/users');
      expect(result.quickActions[0].variant).toBe('primary');
    });

    it('should include badge for actions with counts', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      const actionsWithBadges = result.quickActions.filter(
        (action) => action.badge !== undefined
      );
      expect(actionsWithBadges.length).toBeGreaterThan(0);

      actionsWithBadges.forEach((action) => {
        expect(typeof action.badge).toBe('number');
        expect(action.badge).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Chart Data Integration (Sprint 2)', () => {
    it('should populate chart structures from backend data', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(result.charts).toBeDefined();
      expect(result.charts.userGrowth).toBeDefined();
      expect(result.charts.revenue).toBeDefined();
      expect(result.charts.orders).toBeDefined();
      expect(result.charts.searchAnalytics).toBeDefined();
    });

    it('should have chart series with valid data arrays', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      expect(Array.isArray(result.charts.userGrowth.series)).toBe(true);
      expect(Array.isArray(result.charts.revenue.series)).toBe(true);
      expect(Array.isArray(result.charts.orders.series)).toBe(true);

      result.charts.userGrowth.series.forEach((series) => {
        expect(series).toMatchObject({
          name: expect.any(String),
          data: expect.any(Array),
        });
        expect(series.data.length).toBeGreaterThan(0);
      });
    });

    it('should populate chart labels/categories', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      if (result.charts.userGrowth.categories) {
        expect(Array.isArray(result.charts.userGrowth.categories)).toBe(true);
        expect(result.charts.userGrowth.categories.length).toBeGreaterThan(0);
      }
    });

    it('should include chart metadata (type, title, etc)', () => {
      const result = adaptAdminDashboard(validAdminApiResponse);

      const charts = [
        result.charts.userGrowth,
        result.charts.revenue,
        result.charts.orders,
      ];

      charts.forEach((chart) => {
        expect(chart.type).toMatch(/^(line|bar|area|pie|donut)$/);
        if (chart.title) {
          expect(typeof chart.title).toBe('string');
        }
      });
    });
  });
});

// ============================================================================
// TESTS: adaptFreelancerDashboard() (Seller)
// ============================================================================

describe('adaptFreelancerDashboard (Seller)', () => {
  /**
   * Valid Seller Dashboard API Response
   */
  const validSellerApiResponse: SellerDashboardApiResponse = {
    sellerId: 'seller-123',
    sellerName: 'John Doe',
    sellerEmail: 'john@example.com',
    memberSince: '2024-01-01T00:00:00Z',

    periodStart: '2025-10-01T00:00:00Z',
    periodEnd: '2025-10-31T23:59:59Z',
    periodDays: 30,

    revenueMetrics: {
      totalRevenue: 15000,
      platformFee: 3000,
      netEarnings: 12000,
      totalOrders: 50,
      averageOrderValue: 300,
      pendingBalance: 1000,
      availableBalance: 11000,
      lifetimeEarnings: 50000,
      revenueChange: 2000,
      revenueChangePercent: 15.5,
      ordersChange: 5,
      ordersChangePercent: 11.1,
    },

    packagePerformance: {
      totalPackages: 10,
      activePackages: 8,
      inactivePackages: 2,
      totalViews: 5000,
      uniqueViewers: 2000,
      totalOrders: 50,
      conversionRate: 2.5,
      totalFavorites: 150,
      totalShares: 50,
      topPackages: [
        {
          packageId: 'pkg-1',
          title: 'Logo Design',
          categoryName: 'Graphic Design',
          views: 1000,
          orders: 20,
          conversionRate: 2.0,
          revenue: 3000,
          averageRating: 4.8,
        },
      ],
      trendingPackages: [],
      lowPerformingPackages: [],
    },

    orderMetrics: {
      totalOrders: 50,
      completedOrders: 40,
      inProgressOrders: 8,
      cancelledOrders: 2,
      refundedOrders: 0,
      completionRate: 80,
      cancellationRate: 4,
      refundRate: 0,
      ordersByStatus: {
        COMPLETED: 40,
        IN_PROGRESS: 8,
        CANCELLED: 2,
      },
      recentOrders: [],
    },

    customerMetrics: {
      totalCustomers: 35,
      repeatCustomers: 10,
      repeatCustomerRate: 28.5,
      newCustomers: 5,
      averageOrdersPerCustomer: 1.4,
      averageCustomerValue: 428.5,
      topCustomers: [],
    },

    reviewMetrics: {
      totalReviews: 40,
      averageRating: 4.7,
      fiveStarReviews: 30,
      fourStarReviews: 8,
      threeStarReviews: 2,
      twoStarReviews: 0,
      oneStarReviews: 0,
      ratingDistribution: {
        5: 30,
        4: 8,
        3: 2,
        2: 0,
        1: 0,
      },
      recentReviews: [],
    },

    communicationMetrics: {
      totalMessages: 120,
      unreadMessages: 5,
      activeConversations: 10,
      averageResponseTime: 2.5,
      responseRate: 95,
      recentMessagePreviews: [],
    },

    trends: {
      dailyRevenue: [],
      dailyOrders: [],
      dailyViews: [],
      dailyConversionRate: [],
    },

    insights: {
      strengths: ['High rating', 'Fast response'],
      improvements: ['Increase package variety'],
      recommendations: ['Create more packages'],
      alerts: [],
    },

    generatedAt: '2025-11-02T12:00:00Z',
    fromCache: false,
    cacheAgeSeconds: 0,
  };

  const invalidSellerResponse = {
    periodDays: 30,
    // Missing required fields
  };

  describe('Valid API Response', () => {
    it('should transform valid Seller API response to FreelancerDashboard type', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result).toBeDefined();
      expect(result.earnings).toBeDefined();
      expect(result.orders).toBeDefined();
      expect(result.packages).toBeDefined();
      expect(result.ratings).toBeDefined();
    });

    it('should map earnings correctly', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result.earnings.total).toBe(50000); // lifetimeEarnings
      expect(result.earnings.pending).toBe(1000);
      expect(result.earnings.available).toBe(11000);
      expect(result.earnings.currency).toBe('TRY');
      expect(result.earnings.trend).toBeDefined();
    });

    it('should map orders correctly', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result.orders.active).toBe(8); // inProgressOrders
      expect(result.orders.completed).toBe(40);
      expect(result.orders.cancelled).toBe(2);
      expect(result.orders.totalRevenue).toBe(15000);
    });

    it('should map packages correctly', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result.packages.total).toBe(10);
      expect(result.packages.active).toBe(8);
      expect(result.packages.paused).toBe(2); // inactivePackages
      expect(result.packages.views).toBe(5000);
    });

    it('should map ratings correctly', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result.ratings.average).toBe(4.7);
      expect(result.ratings.count).toBe(40);
      expect(result.ratings.distribution).toEqual({
        5: 30,
        4: 8,
        3: 2,
        2: 0,
        1: 0,
      });
    });

    it('should map period information correctly', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result.period.days).toBe(30);
      expect(result.period.startDate).toBe('2025-10-01T00:00:00Z');
      expect(result.period.endDate).toBe('2025-10-31T23:59:59Z');
    });

    it('should map cache metadata correctly', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result.cache).toBeDefined();
      expect(result.cache?.fromCache).toBe(false);
      expect(result.cache?.generatedAt).toBe('2025-11-02T12:00:00Z');
      expect(result.cache?.cacheKey).toBe('seller-dashboard-30');
    });
  });

  describe('Earnings Trend Calculation', () => {
    it('should calculate positive revenue growth trend', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);

      expect(result.earnings.trend?.value).toBe(15.5);
      expect(result.earnings.trend?.direction).toBe('up');
      expect(result.earnings.trend?.percentage).toBe(15.5);
      expect(result.earnings.trend?.isPositive).toBe(true);
    });

    it('should calculate negative revenue growth trend', () => {
      const negativeGrowthResponse = {
        ...validSellerApiResponse,
        revenueMetrics: {
          ...validSellerApiResponse.revenueMetrics,
          revenueChangePercent: -8.5,
        },
      };

      const result = adaptFreelancerDashboard(negativeGrowthResponse);

      expect(result.earnings.trend?.value).toBe(-8.5);
      expect(result.earnings.trend?.direction).toBe('down');
      expect(result.earnings.trend?.percentage).toBe(8.5); // Absolute value
      expect(result.earnings.trend?.isPositive).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for invalid API response', () => {
      expect(() =>
        adaptFreelancerDashboard(invalidSellerResponse as any)
      ).toThrow(
        'Failed to adapt Freelancer dashboard: Invalid API response structure'
      );
    });

    it('should throw error for null/undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => adaptFreelancerDashboard(null as any)).toThrow();
    });
  });

  describe('Recent Activities Integration (Sprint 2)', () => {
    it('should populate recentActivities from order and review metrics', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      expect(result.recentActivities).toBeDefined();
      expect(Array.isArray(result.recentActivities)).toBe(true);
    });

    it('should map recent orders to activity items', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      const orderActivities = result.recentActivities.filter(
        (a) => a.type === 'order'
      );

      orderActivities.forEach((activity) => {
        expect(activity).toMatchObject({
          id: expect.any(String),
          type: 'order',
          title: expect.stringContaining('order'),
          timestamp: expect.any(String),
          status: expect.stringMatching(
            /^(pending|completed|cancelled|failed|in_progress)$/
          ),
        });
      });
    });

    it('should limit activities to 10 most recent', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      expect(result.recentActivities.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Quick Actions Integration (Sprint 2)', () => {
    it('should have 4 freelancer-specific quick actions', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      expect(result.quickActions).toBeDefined();
      expect(Array.isArray(result.quickActions)).toBe(true);
      expect(result.quickActions.length).toBe(4);
    });

    it('should include create package as primary action', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      expect(result.quickActions[0]).toMatchObject({
        id: 'create-package',
        label: 'Create New Package',
        href: '/dashboard/packages/new',
        variant: 'primary',
      });
    });

    it('should show order count badge on view orders action', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      const viewOrdersAction = result.quickActions.find(
        (a) => a.id === 'view-orders'
      );
      expect(viewOrdersAction).toBeDefined();
      expect(viewOrdersAction!.badge).toBe(
        validSellerApiResponse.orderMetrics.inProgressOrders
      );
    });
  });

  describe('Chart Data Integration (Sprint 2)', () => {
    it('should populate earnings chart from revenue trends', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      expect(result.charts.earnings).toBeDefined();
      expect(Array.isArray(result.charts.earnings.series)).toBe(true);
      expect(result.charts.earnings.type).toMatch(/^(line|bar|area)$/);
    });

    it('should populate orders chart from order metrics', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      expect(result.charts.orders).toBeDefined();
      expect(Array.isArray(result.charts.orders.series)).toBe(true);
    });

    it('should populate views chart from package performance', () => {
      const result = adaptFreelancerDashboard(validSellerApiResponse);
      expect(result.charts.views).toBeDefined();
      expect(Array.isArray(result.charts.views.series)).toBe(true);
    });
  });
});

// ============================================================================
// TESTS: adaptEmployerDashboard() (Buyer)
// ============================================================================

describe('adaptEmployerDashboard (Buyer)', () => {
  /**
   * Valid Buyer Dashboard API Response
   */
  const validBuyerApiResponse: BuyerDashboardApiResponse = {
    buyerId: 'buyer-456',
    buyerName: 'Jane Smith',
    buyerEmail: 'jane@example.com',
    memberSince: '2024-03-01T00:00:00Z',

    periodStart: '2025-10-01T00:00:00Z',
    periodEnd: '2025-10-31T23:59:59Z',
    periodDays: 30,

    orderSummary: {
      totalOrders: 25,
      completedOrders: 20,
      inProgressOrders: 4,
      cancelledOrders: 1,
      totalSpent: 7500,
      averageOrderValue: 300,
      totalItems: 25,
      recentOrders: [
        {
          orderId: 'order-1',
          packageTitle: 'Logo Design',
          sellerName: 'John Doe',
          amount: 300,
          status: 'COMPLETED',
          orderDate: '2025-10-25T10:00:00Z',
          deliveryDate: '2025-10-28T15:00:00Z',
          canReview: true,
        },
      ],
      activeOrders: [],
    },

    favorites: {
      totalFavorites: 15,
      newFavorites: 3,
      favoritePackages: [
        {
          packageId: 'pkg-fav-1',
          title: 'Website Development',
          sellerName: 'Tech Expert',
          price: 5000,
          rating: 4.9,
          reviewCount: 50,
          thumbnailUrl: 'https://example.com/thumb.jpg',
          inStock: true,
          addedDate: '2025-10-15T00:00:00Z',
        },
      ],
      recentlyViewed: [],
    },

    purchaseHistory: {
      lifetimeSpent: 25000,
      lifetimeOrders: 80,
      favoriteCategory: 'Web Development',
      favoriteSeller: 'John Doe',
      purchasesByCategory: {
        'Web Development': 30,
        'Graphic Design': 25,
        'Content Writing': 25,
      },
      spendingByCategory: {
        'Web Development': 15000,
        'Graphic Design': 6000,
        'Content Writing': 4000,
      },
      spendingTrend: [
        { date: '2025-10-01', value: 200 },
        { date: '2025-10-02', value: 250 },
      ],
    },

    reviewActivity: {
      totalReviewsGiven: 60,
      pendingReviews: 3,
      averageRatingGiven: 4.5,
      recentReviews: [],
    },

    messages: {
      totalConversations: 20,
      unreadMessages: 2,
      activeConversations: 5,
      recentConversations: [],
    },

    recommendations: {
      forYou: [],
      trending: [],
      similar: [],
      newArrivals: [],
    },

    activitySummary: {
      searchesPerformed: 150,
      packagesViewed: 300,
      sellersFollowed: 8,
      lastLoginDate: '2025-11-02T09:00:00Z',
      daysActive: 25,
      topSearchKeywords: ['website', 'logo', 'content'],
    },

    savings: {
      totalSaved: 500,
      couponsUsed: 5,
      activeCoupons: 2,
      availableCoupons: [
        {
          couponCode: 'WELCOME10',
          description: '10% off',
          discountValue: 10,
          discountType: 'PERCENTAGE',
          expiryDate: '2025-12-31T23:59:59Z',
        },
      ],
    },

    notifications: {
      unreadCount: 5,
      recent: [],
    },

    generatedAt: '2025-11-02T13:00:00Z',
    fromCache: false,
    cacheAgeSeconds: 0,
  };

  const invalidBuyerResponse = {
    periodDays: 30,
    // Missing required fields
  };

  describe('Valid API Response', () => {
    it('should transform valid Buyer API response to EmployerDashboard type', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      expect(result).toBeDefined();
      expect(result.spending).toBeDefined();
      expect(result.orders).toBeDefined();
      expect(result.favorites).toBeDefined();
    });

    it('should map spending correctly', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      expect(result.spending.total).toBe(25000); // lifetimeSpent
      expect(result.spending.thisMonth).toBe(7500); // period totalSpent
      expect(result.spending.currency).toBe('TRY');
      expect(result.spending.trend).toBeDefined();
    });

    it('should map orders correctly', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      expect(result.orders.active).toBe(4); // inProgressOrders
      expect(result.orders.completed).toBe(20);
      expect(result.orders.cancelled).toBe(1);
      expect(result.orders.totalSpent).toBe(7500);
    });

    it('should map favorites correctly', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      expect(result.favorites.packages).toBe(15); // totalFavorites
      expect(result.favorites.sellers).toBe(8); // sellersFollowed
    });

    it('should map period information correctly', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      expect(result.period.days).toBe(30);
      expect(result.period.startDate).toBe('2025-10-01T00:00:00Z');
      expect(result.period.endDate).toBe('2025-10-31T23:59:59Z');
    });

    it('should map cache metadata correctly', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      expect(result.cache).toBeDefined();
      expect(result.cache?.fromCache).toBe(false);
      expect(result.cache?.generatedAt).toBe('2025-11-02T13:00:00Z');
      expect(result.cache?.cacheKey).toBe('buyer-dashboard-30');
    });
  });

  describe('Spending Trend Calculation', () => {
    it('should calculate spending trend', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      expect(result.spending.trend).toBeDefined();
      expect(result.spending.trend?.direction).toMatch(/up|down/);
      expect(typeof result.spending.trend?.percentage).toBe('number');
      // For buyers, spending increase is not necessarily positive
      expect(result.spending.trend?.isPositive).toBe(false);
    });

    it('should handle zero lifetime spending', () => {
      const zeroSpendingResponse = {
        ...validBuyerApiResponse,
        purchaseHistory: {
          ...validBuyerApiResponse.purchaseHistory,
          lifetimeSpent: 0,
        },
        orderSummary: {
          ...validBuyerApiResponse.orderSummary,
          totalSpent: 0,
        },
      };

      const result = adaptEmployerDashboard(zeroSpendingResponse);

      expect(result.spending.trend?.value).toBe(0);
      expect(result.spending.trend?.percentage).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for invalid API response', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => adaptEmployerDashboard(invalidBuyerResponse as any)).toThrow(
        'Failed to adapt Employer dashboard: Invalid API response structure'
      );
    });

    it('should throw error for null/undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => adaptEmployerDashboard(null as any)).toThrow();
    });
  });

  describe('Recent Activities Integration (Sprint 2)', () => {
    it('should populate recentActivities from order history', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      expect(result.recentActivities).toBeDefined();
      expect(Array.isArray(result.recentActivities)).toBe(true);
    });

    it('should map recent orders to activity items for employer', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);

      result.recentActivities.forEach((activity) => {
        expect(activity).toMatchObject({
          id: expect.any(String),
          type: expect.stringMatching(/^(order|message|notification)$/),
          title: expect.any(String),
          timestamp: expect.any(String),
          status: expect.stringMatching(
            /^(pending|completed|cancelled|failed|in_progress)$/
          ),
        });
      });
    });

    it('should sort activities chronologically', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      for (let i = 1; i < result.recentActivities.length; i++) {
        const prevTime = new Date(result.recentActivities[i - 1].timestamp);
        const currTime = new Date(result.recentActivities[i].timestamp);
        expect(prevTime.getTime()).toBeGreaterThanOrEqual(currTime.getTime());
      }
    });
  });

  describe('Quick Actions Integration (Sprint 2)', () => {
    it('should have 5 employer-specific quick actions', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      expect(result.quickActions.length).toBe(5);
    });

    it('should include browse packages as primary action', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      expect(result.quickActions[0]).toMatchObject({
        label: 'Paketlere Göz At',
        variant: 'primary',
      });
    });

    it('should show active orders count badge', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      const ordersAction = result.quickActions.find((a) =>
        a.label.includes('Sipariş')
      );
      expect(ordersAction?.badge).toBeDefined();
      expect(ordersAction!.badge).toBe(
        validBuyerApiResponse.orderMetrics.inProgressOrders
      );
    });
  });

  describe('Chart Data Integration (Sprint 2)', () => {
    it('should populate spending chart from spending trends', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      expect(result.charts.spending).toBeDefined();
      expect(Array.isArray(result.charts.spending.series)).toBe(true);
      expect(result.charts.spending.type).toMatch(/^(line|bar|area)$/);
    });

    it('should populate orders chart from order metrics', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      expect(result.charts.orders).toBeDefined();
      expect(Array.isArray(result.charts.orders.series)).toBe(true);
    });

    it('should include chart categories for time series', () => {
      const result = adaptEmployerDashboard(validBuyerApiResponse);
      if (result.charts.spending.categories) {
        expect(Array.isArray(result.charts.spending.categories)).toBe(true);
      }
    });
  });
});

// ============================================================================
// TESTS: adaptModeratorDashboard() (Moderator)
// ============================================================================

describe('adaptModeratorDashboard (Moderator)', () => {
  /**
   * Valid Moderator Dashboard API Response
   */
  const validModeratorApiResponse: ModeratorDashboardApiResponse = {
    moderatorId: 'mod-789',
    moderatorName: 'Alex Moderator',

    stats: {
      pendingComments: 15,
      flaggedComments: 5,
      commentsApprovedToday: 20,
      commentsRejectedToday: 3,

      pendingReviews: 10,
      flaggedReviews: 2,
      reviewsApprovedToday: 15,
      reviewsRejectedToday: 1,

      pendingReports: 8,
      reportsResolvedToday: 5,

      pendingSupportTickets: 12,
      ticketsClosedToday: 4,

      totalPendingItems: 45, // 15+5+10+2+8+12
      totalActionsToday: 48, // 20+3+15+1+5+4
      averageResponseTimeMinutes: 15.5,
      accuracyRate: 0.95,
    },

    pendingItems: {
      items: [
        {
          itemId: 'item-1',
          itemType: 'COMMENT',
          content: 'This is a test comment',
          authorId: 'user-1',
          authorName: 'John Doe',
          submittedAt: '2025-11-02T10:00:00Z',
          priority: 'HIGH',
          status: 'PENDING',
          waitingTimeMinutes: 30,
          flagCount: 2,
          relatedEntityId: 'blog-post-1',
          relatedEntityTitle: 'Blog Post Title',
        },
        {
          itemId: 'item-2',
          itemType: 'REVIEW',
          content: 'Great service!',
          authorId: 'user-2',
          authorName: 'Jane Smith',
          submittedAt: '2025-11-02T11:00:00Z',
          priority: 'MEDIUM',
          status: 'FLAGGED',
          waitingTimeMinutes: 60,
          flagCount: 1,
          relatedEntityId: 'package-1',
          relatedEntityTitle: 'Package Title',
        },
      ],
      totalCount: 45,
      currentPage: 0,
      pageSize: 10,
      totalPages: 5,
      hasNext: true,
      hasPrevious: false,
    },

    recentActivities: {
      activities: [
        {
          activityId: 'activity-1',
          moderatorId: 'mod-789',
          moderatorName: 'Alex Moderator',
          actionType: 'APPROVE',
          targetType: 'COMMENT',
          targetId: 'comment-123',
          description: 'Approved comment',
          reason: 'Content meets guidelines',
          timestamp: '2025-11-02T12:00:00Z',
          affectedUserId: 'user-3',
          affectedUserName: 'Bob Wilson',
        },
        {
          activityId: 'activity-2',
          moderatorId: 'mod-789',
          moderatorName: 'Alex Moderator',
          actionType: 'REJECT',
          targetType: 'REVIEW',
          targetId: 'review-456',
          description: 'Rejected review',
          reason: 'Spam content',
          timestamp: '2025-11-02T12:30:00Z',
          affectedUserId: 'user-4',
          affectedUserName: 'Alice Brown',
        },
      ],
      totalCount: 48,
    },

    generatedAt: '2025-11-02T13:00:00Z',
    fromCache: false,
    cacheAgeSeconds: 0,
  };

  const invalidModeratorResponse = {
    moderatorId: 'mod-123',
    // Missing required fields
  };

  describe('Valid API Response', () => {
    it('should transform valid Moderator API response to ModeratorDashboard type', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.queue).toBeDefined();
      expect(result.recentActivities).toBeDefined();
    });

    it('should map stats correctly', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);

      expect(result.stats.pendingItems).toBe(45);
      expect(result.stats.approvedToday).toBe(35); // 20 + 15
      expect(result.stats.rejectedToday).toBe(4); // 3 + 1
      expect(result.stats.spamDetected).toBe(7); // 5 + 2
      expect(result.stats.avgResponseTime).toBe(16); // Math.round(15.5)
    });

    it('should map pending items queue correctly', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);

      expect(result.queue.items).toHaveLength(2);
      expect(result.queue.total).toBe(45);
      expect(result.queue.page).toBe(0);
      expect(result.queue.pageSize).toBe(10);
    });

    it('should map individual pending items correctly', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);
      const firstItem = result.queue.items[0];

      expect(firstItem).toBeDefined();
      expect(firstItem.id).toBe('item-1');
      expect(firstItem.type).toBe('comment');
      expect(firstItem.title).toBe('Blog Post Title');
      expect(firstItem.content).toBe('This is a test comment');
      expect(firstItem.submittedBy.id).toBe('user-1');
      expect(firstItem.submittedBy.name).toBe('John Doe');
      expect(firstItem.priority).toBe('high');
      expect(firstItem.status).toBe('pending');
      expect(firstItem.flagsCount).toBe(2);
    });

    it('should map recent activities correctly', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);

      expect(result.recentActivities).toHaveLength(2);

      const firstActivity = result.recentActivities[0];
      expect(firstActivity).toBeDefined();
      expect(firstActivity.id).toBe('activity-1');
      expect(firstActivity.type).toBe('moderation');
      expect(firstActivity.title).toBe('Approved comment');
      expect(firstActivity.description).toBe('Content meets guidelines');
      expect(firstActivity.status).toBe('completed');
      expect(firstActivity.user.id).toBe('mod-789');
      expect(firstActivity.user.name).toBe('Alex Moderator');
      expect(firstActivity.metadata?.action).toBe('approve');
    });

    it('should map period information correctly', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);

      expect(result.period.type).toBe('day');
      expect(result.period.label).toBe('Today');
      expect(result.period.days).toBe(1);
      expect(result.period.startDate).toBeDefined();
      expect(result.period.endDate).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for invalid API response', () => {
      expect(() =>
        adaptModeratorDashboard(invalidModeratorResponse as any)
      ).toThrow(
        'Failed to adapt Moderator dashboard: Invalid API response structure'
      );
    });

    it('should throw error for null/undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => adaptModeratorDashboard(null as any)).toThrow();
    });

    it('should handle pending items with missing relatedEntityTitle', () => {
      const responseWithoutTitle = {
        ...validModeratorApiResponse,
        pendingItems: {
          ...validModeratorApiResponse.pendingItems,
          items: [
            {
              ...validModeratorApiResponse.pendingItems.items[0],
              relatedEntityTitle: undefined,
            },
          ],
        },
      };

      const result = adaptModeratorDashboard(responseWithoutTitle);
      const firstItem = result.queue.items[0];

      // Should fallback to itemType
      expect(firstItem.title).toBe('COMMENT');
    });

    it('should handle activities with null reason', () => {
      const responseWithNullReason = {
        ...validModeratorApiResponse,
        recentActivities: {
          ...validModeratorApiResponse.recentActivities,
          activities: [
            {
              ...validModeratorApiResponse.recentActivities.activities[0],
              reason: null,
            },
          ],
        },
      };

      const result = adaptModeratorDashboard(responseWithNullReason);
      const firstActivity = result.recentActivities[0];

      // Should use empty string
      expect(firstActivity.description).toBe('');
    });
  });

  describe('Quick Actions Integration (Sprint 2)', () => {
    it('should have 5 moderator-specific quick actions', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);
      expect(result.quickActions).toBeDefined();
      expect(Array.isArray(result.quickActions)).toBe(true);
      expect(result.quickActions.length).toBe(5);
    });

    it('should include pending reviews as primary action', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);
      expect(result.quickActions[0]).toMatchObject({
        label: 'Bekleyen İncelemeler',
        variant: 'primary',
      });
    });

    it('should show pending items count on relevant actions', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);
      const pendingAction = result.quickActions[0];
      expect(pendingAction.badge).toBeDefined();
      expect(typeof pendingAction.badge).toBe('number');
    });

    it('should include all moderator action types', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);
      const actionLabels = result.quickActions.map((a) => a.label);

      expect(actionLabels).toContain('Bekleyen İncelemeler');
      expect(result.quickActions.every((a) => a.href)).toBe(true);
      expect(result.quickActions.every((a) => a.icon)).toBe(true);
    });
  });

  describe('Chart Data Integration (Sprint 2)', () => {
    it('should populate moderation volume chart', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);
      expect(result.charts.moderationVolume).toBeDefined();
      expect(Array.isArray(result.charts.moderationVolume.series)).toBe(true);
      expect(result.charts.moderationVolume.type).toMatch(/^(line|bar|area)$/);
    });

    it('should populate response time chart', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);
      expect(result.charts.responseTime).toBeDefined();
      expect(Array.isArray(result.charts.responseTime.series)).toBe(true);
    });

    it('should validate chart data structure for moderator metrics', () => {
      const result = adaptModeratorDashboard(validModeratorApiResponse);

      [result.charts.moderationVolume, result.charts.responseTime].forEach(
        (chart) => {
          expect(chart.type).toBeDefined();
          chart.series.forEach((series) => {
            expect(series.name).toBeDefined();
            expect(Array.isArray(series.data)).toBe(true);
          });
        }
      );
    });
  });
});

// ============================================================================
// TESTS: Legacy Adapters (Mock Data)
// ============================================================================

describe('Legacy Adapters (Mock Data)', () => {
  // Note: adaptModeratorDashboard now uses real API, no legacy mock test needed
  it('no legacy mock adapters remaining', () => {
    expect(true).toBe(true);
  });
});
