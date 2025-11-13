/**
 * Dashboard Core Types
 * Role-specific dashboard structures
 *
 * Sprint 1 - Dashboard Consolidation:
 * - Added AdminDashboard and ModeratorDashboard
 * - Single source of truth for all dashboard types
 *
 * @updated November 13, 2025
 */

import type { Order } from '../business/features/order';
import type { Job } from '../business/features/marketplace';
import type { ProposalResponse } from '../backend-aligned';
import type { EnhancedNotification } from '../domains/notification/notification.types';
import type {
  FreelancerAnalytics,
  EmployerAnalytics,
} from '../business/features/analytics';
import type { Recommendation } from '../business/features/recommendations';

// ============================================================================
// COMMON DASHBOARD TYPES
// ============================================================================

/**
 * Period configuration for dashboard data
 */
export interface DashboardPeriod {
  /** Number of days to include in the period */
  days: number;
  /** Start date (ISO string) */
  startDate: string;
  /** End date (ISO string) */
  endDate: string;
}

/**
 * Trend indicator for metrics
 */
export type TrendIndicator = 'up' | 'down' | 'stable';

/**
 * Cache metadata
 */
export interface CacheMetadata {
  /** Whether data is from cache */
  fromCache: boolean;
  /** When the cache was generated */
  generatedAt: string;
  /** Cache expiry time */
  expiresAt?: string;
  /** Cache key */
  cacheKey?: string;
}

/**
 * Activity item
 */
export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  iconColor?: string;
}

/**
 * Quick action button
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Chart widget data
 */
export interface ChartWidgetData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

// ============================================================================
// ROLE-SPECIFIC DASHBOARD TYPES
// ============================================================================

// ==================== Freelancer Dashboard ====================

export interface FreelancerDashboard {
  overview: {
    totalEarnings: number;
    completedJobs: number;
    activeJobs: number;
    profileViews: number;
    successRate: number;
    responseTime: number;
  };
  stats: {
    totalEarnings: number;
    currentMonthEarnings: number;
    activeOrders: number;
    completedJobs: number;
    rating: number;
    profileViews: number;
    responseRate: number;
  };
  quickStats: {
    messagesWaiting: number;
    pendingProposals: number;
    reviewsPending: number;
  };
  recentJobs: Job[];
  recentOrders: Order[];
  recentProposals: ProposalResponse[];
  earnings: Record<string, number>;
  analytics: FreelancerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  chartData?: {
    earnings: Array<{ date: string; amount: number; orderCount?: number }>;
    packages: Array<{
      packageId: string;
      packageName: string;
      sales: number;
      revenue: number;
      views: number;
      conversionRate: number;
    }>;
    clients: {
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
    };
  };
}

// ==================== Employer Dashboard ====================

export interface EmployerDashboard {
  overview: {
    totalSpent: number;
    jobsPosted: number;
    activeJobs: number;
    completedJobs: number;
    avgTimeToHire: number;
    freelancerRetention: number;
  };
  stats: {
    activeJobs: number;
    totalSpent: number;
    savedFreelancers: number;
    completedJobs: number;
  };
  activeJobs: Job[];
  recentJobs: Job[];
  spending: Record<string, number>;
  analytics: EmployerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  chartData?: {
    spending: Array<{ date: string; amount: number; jobCount?: number }>;
    hiring: {
      avgTimeToHire: number;
      freelancerRetention: number;
      satisfaction: number;
    };
  };
}

// ==================== Admin Dashboard ====================

/**
 * Admin dashboard data
 * Platform-wide administrative view
 */
export interface AdminDashboard {
  /** Platform-wide statistics */
  stats: {
    users: {
      total: number;
      active: number;
      new: number;
      trend?: TrendIndicator;
    };
    packages: {
      total: number;
      active: number;
      paused: number;
      trend?: TrendIndicator;
    };
    orders: {
      total: number;
      completed: number;
      active: number;
      revenue: number;
      trend?: TrendIndicator;
    };
    revenue: {
      total: number;
      commission: number;
      currency: string;
      trend?: TrendIndicator;
    };
  };
  /** System health */
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    cpu: number;
    memory: number;
    storage: number;
    activeConnections: number;
    cacheHitRate: number;
    lastChecked: string;
  };
  /** Search metrics */
  searchMetrics: {
    totalSearches: number;
    avgResultsPerSearch: number;
    topSearchTerms: Array<{ term: string; count: number }>;
    noResultsCount: number;
  };
  /** Top packages */
  topPackages: Array<{
    id: string;
    title: string;
    seller: string;
    revenue: number;
    orders: number;
  }>;
  /** Recent activities */
  recentActivities: ActivityItem[];
  /** Quick actions */
  quickActions: QuickAction[];
  /** Analytics charts */
  charts: {
    userGrowth: ChartWidgetData;
    revenue: ChartWidgetData;
    orders: ChartWidgetData;
    searchAnalytics: ChartWidgetData;
  };
  /** Period info */
  period: DashboardPeriod;
  /** Cache metadata */
  cache?: CacheMetadata;
}

// ==================== Moderator Dashboard ====================

/**
 * Moderation item
 */
export interface ModerationItem {
  /** Unique identifier */
  id: string;
  /** Item type (package, comment, dispute, etc.) */
  type: 'package' | 'comment' | 'dispute' | 'report' | 'user';
  /** Item title */
  title: string;
  /** Item description/content */
  content: string;
  /** Submitted by */
  submittedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  /** Submission timestamp */
  submittedAt: string;
  /** Current status */
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  /** Priority */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** Flags/reports count */
  flagsCount?: number;
  /** Moderation history */
  history?: Array<{
    action: string;
    moderator: string;
    timestamp: string;
    reason?: string;
  }>;
  /** Related entity */
  entity?: {
    id: string;
    type: string;
    url?: string;
  };
}

/**
 * Moderator dashboard data
 */
export interface ModeratorDashboard {
  /** Moderation statistics */
  stats: {
    pendingItems: number;
    approvedToday: number;
    rejectedToday: number;
    spamDetected: number;
    avgResponseTime: number;
  };
  /** Moderation queue */
  queue: {
    items: ModerationItem[];
    total: number;
    page: number;
    pageSize: number;
  };
  /** Moderator activities */
  recentActivities: ActivityItem[];
  /** Quick actions */
  quickActions: QuickAction[];
  /** Moderation charts */
  charts: {
    actionsToday: ChartWidgetData;
    categoryBreakdown: ChartWidgetData;
    moderationVolume: ChartWidgetData;
    responseTime: ChartWidgetData;
  };
  /** Period info */
  period: DashboardPeriod;
}

// ============================================================================
// UNION TYPES
// ============================================================================

/**
 * Union type for all dashboard data types
 */
export type UnifiedDashboardData =
  | FreelancerDashboard
  | EmployerDashboard
  | AdminDashboard
  | ModeratorDashboard;
