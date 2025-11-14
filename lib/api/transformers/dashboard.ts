/**
 * ================================================
 * DASHBOARD DTO TRANSFORMERS - DEPRECATED
 * ================================================
 *
 * ⚠️ DEPRECATION NOTICE - Sprint 1 Story 5
 *
 * This file contains legacy dashboard transformers that are being phased out.
 *
 * **Current Status:**
 * - V1 transformers (transformSellerDashboard, transformBuyerDashboard) → Used only in legacy tests
 * - V2 transformers (transformSellerDashboardV2, transformBuyerDashboardV2) → REPLACED
 *
 * **Migration Path:**
 * - Use adapters from: @/components/domains/dashboard/utils/dashboardAdapters
 *   * adaptFreelancerDashboard() - Replaces transformSellerDashboardV2()
 *   * adaptEmployerDashboard() - Replaces transformBuyerDashboardV2()
 *   * adaptAdminDashboard() - For admin dashboard
 *   * adaptModeratorDashboard() - For moderator dashboard
 *
 * **Production Code:**
 * ✅ All production code migrated to new adapters (as of 2025-11-14)
 * ✅ lib/core/store/dashboard.ts - Now using adapters
 *
 * **Remaining Usage:**
 * - __tests__/lib/api/transformers/dashboard.test.ts (V1 tests only)
 *
 * **Removal Plan:**
 * - Sprint 1 Story 6: Update legacy tests to use adapters
 * - Sprint 2: Remove this file entirely
 *
 * @deprecated Since Sprint 1 Story 5 (2025-11-14)
 * @see @/components/domains/dashboard/utils/dashboardAdapters for current implementation
 */

/**
 * Dashboard DTO Transformers
 * Transforms backend DTOs to frontend types
 */

import type {
  FreelancerDashboard,
  EmployerDashboard,
  Order,
  Job,
  Proposal,
} from '@/types';

// Import new backend DTO types from API clients
import type { SellerDashboardBackendDto } from '@/lib/api/seller-dashboard';
import type { BuyerDashboardBackendDto } from '@/lib/api/buyer-dashboard';

// ============================================================================
// Backend DTO Types (Based on Java backend responses)
// ============================================================================

export interface BackendMetricsDto {
  totalEarnings?: number;
  currentMonthEarnings?: number;
  totalRevenue?: number;
  totalSpent?: number;
  activeOrderCount?: number;
  activeJobCount?: number;
  completedOrderCount?: number;
  completedJobCount?: number;
  averageRating?: number;
  profileViewCount?: number;
  responseRate?: number;
  pendingProposalCount?: number;
  unreadMessageCount?: number;
  pendingReviewCount?: number;
  savedFreelancerCount?: number;
}

export interface BackendRecentOrderDto {
  id: string;
  packageId?: string;
  title?: string;
  description?: string;
  status: string;
  totalAmount?: number;
  amount?: number;
  createdAt: string;
  updatedAt?: string;
  deliveryDate?: string;
  buyerId?: string;
  sellerId?: string;
  progress?: {
    percentage: number;
    currentStage?: string;
    stagesCompleted?: number;
    totalStages?: number;
  };
}

export interface BackendRecentJobDto {
  id: string;
  title: string;
  description?: string;
  budget:
    | number
    | {
        amount: number;
        type: 'fixed' | 'hourly';
        currency?: string;
      };
  status: string;
  categoryId?: string;
  employerId: string;
  createdAt: string;
  deadline?: string;
  location?: string;
  skills?: string[];
}

export interface BackendRecentProposalDto {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  proposedAmount: number;
  deliveryTime: number;
  status: string;
  createdAt: string;
  job?: BackendRecentJobDto;
}

export interface BackendSellerDashboardDto {
  metrics: BackendMetricsDto;
  recentOrders?: BackendRecentOrderDto[];
  recentProposals?: BackendRecentProposalDto[];
  earningsChart?: {
    labels: string[];
    data: number[];
  };
  packagePerformance?: Array<{
    packageId: string;
    title: string;
    views: number;
    orders: number;
    revenue: number;
  }>;
  clientStats?: {
    totalClients: number;
    newClients: number;
    repeatClients: number;
    topClients?: Array<{
      userId: string;
      name: string;
      orderCount: number;
      totalSpent: number;
    }>;
  };
}

export interface BackendBuyerDashboardDto {
  metrics: BackendMetricsDto;
  activeJobs?: BackendRecentJobDto[];
  recentJobs?: BackendRecentJobDto[];
  spendingChart?: {
    labels: string[];
    data: number[];
  };
}

// ============================================================================
// Transformation Functions
// ============================================================================

/**
 * Transform Backend earnings chart to ChartDataPoint array
 */
function transformEarningsChart(chart?: {
  labels: string[];
  data: number[];
}): Array<{ date: string; amount: number; orderCount?: number }> {
  if (!chart || !chart.labels || !chart.data) {
    return [];
  }

  return chart.labels.map((label, index) => ({
    date: label,
    amount: chart.data[index] || 0,
  }));
}

/**
 * Transform Backend package performance to PackageMetrics array
 */
function transformPackagePerformance(
  packages?: Array<{
    packageId: string;
    title: string;
    views: number;
    orders: number;
    revenue: number;
  }>
): Array<{
  packageId: string;
  packageName: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
}> {
  if (!packages || packages.length === 0) {
    return [];
  }

  return packages.map((pkg) => ({
    packageId: pkg.packageId,
    packageName: pkg.title,
    sales: pkg.orders,
    revenue: pkg.revenue,
    views: pkg.views,
    conversionRate: pkg.views > 0 ? (pkg.orders / pkg.views) * 100 : 0,
  }));
}

/**
 * Transform Backend client stats to ClientStats
 */
function transformClientStats(
  clientStats?: {
    totalClients: number;
    newClients: number;
    repeatClients: number;
    topClients?: Array<{
      userId: string;
      name: string;
      orderCount: number;
      totalSpent: number;
    }>;
  },
  averageRating?: number
): {
  totalClients: number;
  newClients: number;
  repeatClients: number;
  averageSatisfaction: number;
  repeatRate: number;
  topClients: Array<{
    id: string;
    name: string;
    orders: number;
    totalSpent: number;
  }>;
} {
  if (!clientStats) {
    return {
      totalClients: 0,
      newClients: 0,
      repeatClients: 0,
      averageSatisfaction: 0,
      repeatRate: 0,
      topClients: [],
    };
  }

  const repeatRate =
    clientStats.totalClients > 0
      ? (clientStats.repeatClients / clientStats.totalClients) * 100
      : 0;

  return {
    totalClients: clientStats.totalClients,
    newClients: clientStats.newClients,
    repeatClients: clientStats.repeatClients,
    averageSatisfaction: averageRating || 0,
    repeatRate,
    topClients: (clientStats.topClients || []).map((client) => ({
      id: client.userId,
      name: client.name,
      orders: client.orderCount,
      totalSpent: client.totalSpent,
    })),
  };
}

/**
 * Transform Backend Order DTO to Frontend Order type
 */
function transformOrder(dto: BackendRecentOrderDto): Order {
  return {
    id: dto.id,
    packageId: dto.packageId || '',
    buyerId: dto.buyerId || '',
    sellerId: dto.sellerId || '',
    status: dto.status as Order['status'],
    totalAmount: dto.totalAmount || dto.amount || 0,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.createdAt,
    title: dto.title,
    description: dto.description,
    amount: dto.amount || dto.totalAmount,
    deliveryDate: dto.deliveryDate,
    progress: dto.progress
      ? {
          percentage: dto.progress.percentage,
          stagesCompleted: dto.progress.stagesCompleted || 0,
          currentStage: dto.progress.currentStage,
          totalStages: dto.progress.totalStages,
        }
      : undefined,
  };
}

/**
 * Transform Backend Job DTO to Frontend Job type
 */
function transformJob(dto: BackendRecentJobDto): Job {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description || '',
    budget:
      typeof dto.budget === 'number'
        ? dto.budget
        : {
            amount: dto.budget.amount,
            type: dto.budget.type,
          },
    status: dto.status as Job['status'],
    categoryId: dto.categoryId || '',
    employerId: dto.employerId,
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
    deadline: dto.deadline,
    location: dto.location,
    skills: dto.skills || [],
  };
}

/**
 * Transform Backend Proposal DTO to Frontend Proposal type
 */
function transformProposal(dto: BackendRecentProposalDto): Proposal {
  return {
    id: dto.id,
    jobId: dto.jobId,
    freelancerId: dto.freelancerId,
    coverLetter: dto.coverLetter,
    proposedRate: dto.proposedAmount, // Backend uses proposedAmount, frontend expects proposedRate
    deliveryTime: dto.deliveryTime,
    status: dto.status as Proposal['status'],
    createdAt: dto.createdAt,
    // Note: Backend provides job details but frontend Proposal type doesn't include it
    // Job details should be fetched separately if needed
  };
}

/**
 * Transform Backend SellerDashboard DTO to Frontend FreelancerDashboard type
 */
export function transformSellerDashboard(
  dto: BackendSellerDashboardDto
): FreelancerDashboard {
  const metrics = dto.metrics || {};

  // Calculate success rate from completed vs total orders
  const totalOrders =
    (metrics.completedOrderCount || 0) + (metrics.activeOrderCount || 0);
  const successRate =
    totalOrders > 0
      ? ((metrics.completedOrderCount || 0) / totalOrders) * 100
      : 0;

  // Extract response time from metrics or use default
  const responseTime = metrics.responseRate
    ? 24 * (1 - metrics.responseRate / 100) // Convert response rate to hours
    : 2.5;

  return {
    overview: {
      totalEarnings: metrics.totalEarnings || 0,
      completedJobs: metrics.completedOrderCount || 0,
      activeJobs: metrics.activeOrderCount || 0,
      profileViews: metrics.profileViewCount || 0,
      successRate: Math.round(successRate * 10) / 10,
      responseTime: Math.round(responseTime * 10) / 10,
    },
    stats: {
      totalEarnings: metrics.totalEarnings || 0,
      currentMonthEarnings: metrics.currentMonthEarnings || 0,
      activeOrders: metrics.activeOrderCount || 0,
      completedJobs: metrics.completedOrderCount || 0,
      rating: metrics.averageRating || 0,
      profileViews: metrics.profileViewCount || 0,
      responseRate: metrics.responseRate || 0,
    },
    quickStats: {
      messagesWaiting: metrics.unreadMessageCount || 0,
      pendingProposals: metrics.pendingProposalCount || 0,
      reviewsPending: metrics.pendingReviewCount || 0,
    },
    recentJobs: [], // Backend doesn't provide this for seller dashboard
    recentOrders: (dto.recentOrders || []).map(transformOrder),
    recentProposals: (dto.recentProposals || []).map(transformProposal),
    earnings: {}, // Legacy field, data now in chartData
    analytics: {
      earnings: {
        total: metrics.totalEarnings || 0,
        thisMonth: metrics.currentMonthEarnings || 0,
        lastMonth: 0, // Comparison data would come from backend if available
        trend:
          (metrics.currentMonthEarnings || 0) >
          (metrics.totalEarnings || 0) / 12
            ? ('up' as const)
            : ('stable' as const),
      },
      jobs: {
        completed: metrics.completedOrderCount || 0,
        active: metrics.activeOrderCount || 0,
        successRate: Math.round(successRate * 10) / 10,
      },
      profile: {
        views: metrics.profileViewCount || 0,
        rating: metrics.averageRating || 0,
        responseTime: Math.round(responseTime * 10) / 10,
      },
    },
    recommendations: [], // Recommendations system not yet implemented
    notifications: [], // Handled by separate notification system
    // Chart data for new dashboard components
    chartData: {
      earnings: transformEarningsChart(dto.earningsChart),
      packages: transformPackagePerformance(dto.packagePerformance),
      clients: transformClientStats(dto.clientStats, metrics.averageRating),
    },
  };
}

/**
 * Transform Backend BuyerDashboard DTO to Frontend EmployerDashboard type
 */
export function transformBuyerDashboard(
  dto: BackendBuyerDashboardDto
): EmployerDashboard {
  const metrics = dto.metrics || {};

  // Calculate average time to hire from completed jobs
  // This would ideally come from backend analytics
  const avgTimeToHire = 5; // Default value, should come from backend

  // Calculate freelancer retention rate
  const totalJobs =
    (metrics.activeJobCount || 0) + (metrics.completedJobCount || 0);
  const freelancerRetention = totalJobs > 0 ? 75 : 0; // Placeholder calculation

  return {
    overview: {
      totalSpent: metrics.totalSpent || 0,
      jobsPosted: totalJobs,
      activeJobs: metrics.activeJobCount || 0,
      completedJobs: metrics.completedJobCount || 0,
      avgTimeToHire,
      freelancerRetention,
    },
    stats: {
      activeJobs: metrics.activeJobCount || 0,
      totalSpent: metrics.totalSpent || 0,
      savedFreelancers: metrics.savedFreelancerCount || 0,
      completedJobs: metrics.completedJobCount || 0,
    },
    activeJobs: (dto.activeJobs || []).map(transformJob),
    recentJobs: (dto.recentJobs || []).map(transformJob),
    spending: {}, // Chart data transformation would go here
    analytics: {
      spending: {
        total: metrics.totalSpent || 0,
        thisMonth: metrics.currentMonthEarnings || 0, // Should be currentMonthSpending from backend
        lastMonth: 0, // Comparison data would come from backend
        trend:
          (metrics.currentMonthEarnings || 0) > (metrics.totalSpent || 0) / 12
            ? ('up' as const)
            : ('stable' as const),
      },
      jobs: {
        posted: totalJobs,
        completed: metrics.completedJobCount || 0,
        activeHires: metrics.activeJobCount || 0,
      },
      hiring: {
        avgTimeToHire,
        freelancerRetention,
        satisfaction: metrics.averageRating || 0,
      },
    },
    recommendations: [], // Recommendations system not yet implemented
    notifications: [], // Handled by notification system
  };
}

/**
 * Safe transformation with error handling
 */
export function safeTransformSellerDashboard(
  data: unknown
): FreelancerDashboard | null {
  try {
    if (!data || typeof data !== 'object') {
      console.error(
        '[Dashboard Transform] Invalid seller dashboard data:',
        data
      );
      return null;
    }

    return transformSellerDashboard(data as BackendSellerDashboardDto);
  } catch (error) {
    console.error(
      '[Dashboard Transform] Error transforming seller dashboard:',
      error
    );
    return null;
  }
}

/**
 * Safe transformation with error handling
 */
export function safeTransformBuyerDashboard(
  data: unknown
): EmployerDashboard | null {
  try {
    if (!data || typeof data !== 'object') {
      console.error(
        '[Dashboard Transform] Invalid buyer dashboard data:',
        data
      );
      return null;
    }

    return transformBuyerDashboard(data as BackendBuyerDashboardDto);
  } catch (error) {
    console.error(
      '[Dashboard Transform] Error transforming buyer dashboard:',
      error
    );
    return null;
  }
}

// ============================================================================
// NEW TRANSFORMERS FOR V2 BACKEND DTO (Sprint 2 - Dashboard Integration)
// ============================================================================

/**
 * Transform NEW SellerDashboardBackendDto (from seller-dashboard.ts API) to FreelancerDashboard
 * This is for the refactored backend endpoints with comprehensive metrics
 */
export function transformSellerDashboardV2(
  dto: SellerDashboardBackendDto
): FreelancerDashboard {
  const earnings = dto.earningsMetrics || {};
  const packages = dto.packageMetrics || {};
  const orders = dto.orderMetrics || {};
  const customers = dto.customerMetrics || {};

  const successRate = orders.completionRate || 0;
  const responseTime = orders.averageDeliveryTime || 2.5;

  return {
    overview: {
      totalEarnings: earnings.totalEarnings || 0,
      completedJobs: orders.completedOrders || 0,
      activeJobs: orders.activeOrders || 0,
      profileViews: packages.totalViews || 0,
      successRate: Math.round(successRate * 10) / 10,
      responseTime: Math.round(responseTime * 10) / 10,
    },
    stats: {
      totalEarnings: earnings.totalEarnings || 0,
      currentMonthEarnings: earnings.netEarnings || 0,
      activeOrders: orders.activeOrders || 0,
      completedJobs: orders.completedOrders || 0,
      rating: packages.averageRating || 0,
      profileViews: packages.totalViews || 0,
      responseRate: orders.onTimeDeliveryRate || 0,
    },
    quickStats: {
      messagesWaiting: 0, // Not in new DTO, needs separate endpoint
      pendingProposals: 0, // Not in new DTO
      reviewsPending: customers.totalReviews || 0,
    },
    recentJobs: [],
    recentOrders: [], // These would come from separate endpoints
    recentProposals: [],
    earnings: {},
    analytics: {
      earnings: {
        total: earnings.totalEarnings || 0,
        thisMonth: earnings.netEarnings || 0,
        lastMonth: earnings.totalEarnings - earnings.netEarnings,
        trend:
          (earnings.earningsGrowthRate || 0) > 0
            ? ('up' as const)
            : (earnings.earningsGrowthRate || 0) < 0
              ? ('down' as const)
              : ('stable' as const),
      },
      jobs: {
        completed: orders.completedOrders || 0,
        active: orders.activeOrders || 0,
        successRate: Math.round(successRate * 10) / 10,
      },
      profile: {
        views: packages.totalViews || 0,
        rating: packages.averageRating || 0,
        responseTime: Math.round(responseTime * 10) / 10,
      },
    },
    recommendations: [],
    notifications: [],
    chartData: {
      earnings: (dto.trends?.dailyEarnings || []).map((point) => ({
        date: point.date,
        amount: point.value,
      })),
      packages: (packages.topPackages || []).map((pkg) => ({
        packageId: pkg.packageId,
        packageName: pkg.title,
        sales: pkg.orders,
        revenue: pkg.revenue,
        views: pkg.views,
        conversionRate: pkg.views > 0 ? (pkg.orders / pkg.views) * 100 : 0,
      })),
      clients: {
        totalClients: customers.totalBuyers || 0,
        newClients: 0, // Not in new DTO
        repeatClients: customers.repeatBuyers || 0,
        averageSatisfaction: customers.customerSatisfactionScore || 0,
        repeatRate: customers.repeatBuyerRate || 0,
        topClients: [], // Would come from separate endpoint
      },
    },
  };
}

/**
 * Transform NEW BuyerDashboardBackendDto (from buyer-dashboard.ts API) to EmployerDashboard
 */
export function transformBuyerDashboardV2(
  dto: BuyerDashboardBackendDto
): EmployerDashboard {
  const spending = dto.spendingMetrics || {};
  const orders = dto.orderMetrics || {};
  const sellers = dto.sellerMetrics || {};

  const avgTimeToHire = orders.averageDeliveryTime || 5;
  const freelancerRetention = sellers.repeatSellerRate || 0;

  return {
    overview: {
      totalSpent: spending.totalSpent || 0,
      jobsPosted: orders.totalOrders || 0,
      activeJobs: orders.activeOrders || 0,
      completedJobs: orders.completedOrders || 0,
      avgTimeToHire,
      freelancerRetention,
    },
    stats: {
      activeJobs: orders.activeOrders || 0,
      totalSpent: spending.totalSpent || 0,
      savedFreelancers: 0, // Not in new DTO
      completedJobs: orders.completedOrders || 0,
    },
    activeJobs: [], // These would come from separate endpoints
    recentJobs: [],
    spending: {},
    analytics: {
      spending: {
        total: spending.totalSpent || 0,
        thisMonth: spending.totalSpent / 12, // Approximation
        lastMonth: 0,
        trend:
          (spending.spendingGrowthRate || 0) > 0
            ? ('up' as const)
            : (spending.spendingGrowthRate || 0) < 0
              ? ('down' as const)
              : ('stable' as const),
      },
      jobs: {
        posted: orders.totalOrders || 0,
        completed: orders.completedOrders || 0,
        activeHires: orders.activeOrders || 0,
      },
      hiring: {
        avgTimeToHire,
        freelancerRetention,
        satisfaction: sellers.averageSellerRating || 0,
      },
    },
    recommendations: [], // Recommendations have different structure, separate endpoint needed
    notifications: [],
  };
}

/**
 * Safe transformation for new Seller Dashboard V2
 */
export function safeTransformSellerDashboardV2(
  data: unknown
): FreelancerDashboard | null {
  try {
    if (!data || typeof data !== 'object') {
      console.error(
        '[Dashboard Transform V2] Invalid seller dashboard data:',
        data
      );
      return null;
    }

    return transformSellerDashboardV2(data as SellerDashboardBackendDto);
  } catch (error) {
    console.error(
      '[Dashboard Transform V2] Error transforming seller dashboard:',
      error
    );
    return null;
  }
}

/**
 * Safe transformation for new Buyer Dashboard V2
 */
export function safeTransformBuyerDashboardV2(
  data: unknown
): EmployerDashboard | null {
  try {
    if (!data || typeof data !== 'object') {
      console.error(
        '[Dashboard Transform V2] Invalid buyer dashboard data:',
        data
      );
      return null;
    }

    return transformBuyerDashboardV2(data as BuyerDashboardBackendDto);
  } catch (error) {
    console.error(
      '[Dashboard Transform V2] Error transforming buyer dashboard:',
      error
    );
    return null;
  }
}
