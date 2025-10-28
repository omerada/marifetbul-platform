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

  return {
    overview: {
      totalEarnings: metrics.totalEarnings || 0,
      completedJobs: metrics.completedOrderCount || 0,
      activeJobs: metrics.activeOrderCount || 0,
      profileViews: metrics.profileViewCount || 0,
      successRate: 85, // TODO: Calculate from backend data
      responseTime: 2.5, // TODO: Get from backend
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
        lastMonth: 0, // TODO: Need comparison data from backend
        trend: 'stable' as const,
      },
      jobs: {
        completed: metrics.completedOrderCount || 0,
        active: metrics.activeOrderCount || 0,
        successRate: 85, // TODO: Calculate from backend
      },
      profile: {
        views: metrics.profileViewCount || 0,
        rating: metrics.averageRating || 0,
        responseTime: 2.5, // TODO: Get from backend
      },
    },
    recommendations: [], // TODO: Add when backend provides recommendations
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

  return {
    overview: {
      totalSpent: metrics.totalSpent || 0,
      jobsPosted:
        (metrics.activeJobCount || 0) + (metrics.completedJobCount || 0),
      activeJobs: metrics.activeJobCount || 0,
      completedJobs: metrics.completedJobCount || 0,
      avgTimeToHire: 5, // TODO: Get from backend
      freelancerRetention: 75, // TODO: Calculate from backend
    },
    stats: {
      activeJobs: metrics.activeJobCount || 0,
      totalSpent: metrics.totalSpent || 0,
      savedFreelancers: metrics.savedFreelancerCount || 0,
      completedJobs: metrics.completedJobCount || 0,
    },
    activeJobs: (dto.activeJobs || []).map(transformJob),
    recentJobs: (dto.recentJobs || []).map(transformJob),
    spending: {}, // TODO: Transform spendingChart
    analytics: {
      spending: {
        total: metrics.totalSpent || 0,
        thisMonth: metrics.currentMonthEarnings || 0, // TODO: Fix this mapping
        lastMonth: 0, // TODO: Need comparison data
        trend: 'stable' as const,
      },
      jobs: {
        posted:
          (metrics.activeJobCount || 0) + (metrics.completedJobCount || 0),
        completed: metrics.completedJobCount || 0,
        activeHires: metrics.activeJobCount || 0,
      },
      hiring: {
        avgTimeToHire: 5, // TODO: Calculate from backend
        freelancerRetention: 75, // TODO: Calculate
        satisfaction: metrics.averageRating || 0,
      },
    },
    recommendations: [], // TODO: Add when backend provides
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
