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
// Trend direction values
export type TrendDirection = 'up' | 'down' | 'neutral' | 'stable';

// Legacy: Simple trend indicator (backward compatibility)
export type TrendIndicatorSimple = 'up' | 'down' | 'stable';

// Modern: Trend indicator with details
export interface TrendIndicator {
  percentage: number;
  direction: TrendDirection;
  isPositive: boolean;
  value?: number;
  label?: string;
}

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
 * Activity item for timeline/feed
 */
export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  iconColor?: string;
  status?:
    | 'pending'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'in_progress'
    | 'approved'
    | 'rejected';
  link?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  entity?: {
    id: string;
    type: string;
    title: string;
  };
  metadata?: Record<string, unknown>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    icon?: any;
    isLoading?: boolean;
  }>;
}

/**
 * Quick action button
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string | any; // string for serialization, LucideIcon for client-side
  href?: string;
  onClick?: () => void;
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'default'
    | 'success'
    | 'warning'
    | 'danger';
  description?: string;
  disabled?: boolean;
  badge?: number;
  iconColor?: string;
  requiredPermission?: string;
}

/**
 * Chart widget data
 */
export interface ChartWidgetData {
  id: string;
  title: string;
  subtitle?: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
  series?: Array<{
    name: string;
    data: Array<{ label: string; value: number }>;
    color?: string;
  }>;
  config?: {
    type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'area';
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    height?: number;
    responsive?: boolean;
  };
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
  earnings: {
    total: number;
    pending: number;
    available: number;
    currency: string;
    trend?: TrendIndicator;
  };
  orders?: {
    active: number;
    total: number;
    completed?: number;
    cancelled?: number;
    totalSpent?: number;
    views: number;
    orders: number;
  };
  packages?: {
    total: number;
    active: number;
    paused: number;
    views: number;
  };
  ratings?: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
  messages?: {
    unread: number;
    pendingResponses: number;
    averageResponseTime: number;
    responseRate: number;
  };
  pendingActions?: {
    ordersToAccept: number;
    ordersToDeliver: number;
    reviewsToGive: number;
  };
  performance?: {
    conversionRate: number;
    onTimeDeliveryRate: number;
    averageDeliveryTime: number;
    repeatCustomerRate?: number;
  };
  recentActivities?: ActivityItem[];
  quickActions?: QuickAction[];
  charts?: {
    earningsChart?: ChartWidgetData;
    ordersChart?: ChartWidgetData;
    performanceChart?: ChartWidgetData;
  };
  period?: DashboardPeriod;
  cache?: CacheMetadata;
  analytics: FreelancerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  /** Sprint 1 - Story 1.4: Milestone data for dashboard widget */
  milestones?: {
    active: Array<import('@/types/business/features/milestone').OrderMilestone>;
    stats: {
      total: number;
      inProgress: number;
      pending: number;
      delivered: number;
    };
  };
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
  orders?: {
    active: number;
    completed: number;
    pending: number;
    totalRevenue: number;
  };
  packages?: {
    active: number;
    total: number;
    views: number;
    orders: number;
  };
  charts?: {
    earningsChart?: ChartWidgetData;
    ordersChart?: ChartWidgetData;
    performanceChart?: ChartWidgetData;
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
  spending: {
    total: number;
    thisMonth: number;
    currency: string;
    trend?: TrendIndicator;
  };
  orders?: {
    active: number;
    completed: number;
    cancelled: number;
    totalSpent: number;
    total?: number;
    views?: number;
    orders?: number;
  };
  favorites?: {
    packages: number;
    sellers: number;
  };
  recentActivities?: ActivityItem[];
  quickActions?: QuickAction[];
  charts?: {
    spending?: ChartWidgetData;
    orders?: ChartWidgetData;
  };
  period?: DashboardPeriod;
  cache?: CacheMetadata;
  analytics: EmployerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  orders?: {
    active: number;
    completed: number;
    cancelled: number;
    totalSpent: number;
  };
  favorites?: {
    packages: number;
    sellers: number;
  };
  messages?: {
    unread: number;
    activeConversations: number;
  };
  pendingActions?: {
    ordersToApprove: number;
    reviewsToGive: number;
  };
  recentOrder?: {
    id: string;
    title: string;
    packageTitle: string;
    seller: string;
    sellerName: string;
    amount: number;
    status: string;
    orderNumber: string;
    createdAt: string;
    lastUpdate: string;
  };
  /** Sprint 1 - Story 1.4: Milestone data for dashboard widget */
  milestones?: {
    pendingAcceptance: Array<
      import('@/types/business/features/milestone').OrderMilestone
    >;
    stats: {
      total: number;
      pendingAcceptance: number;
      inProgress: number;
      accepted: number;
    };
  };
  chartData?: {
    spending: Array<{ date: string; amount: number; jobCount?: number }>;
    hiring: {
      avgTimeToHire: number;
      freelancerRetention: number;
      satisfaction: number;
    };
  };
  charts?: {
    spendingChart?: ChartWidgetData;
    hiringChart?: ChartWidgetData;
    activityChart?: ChartWidgetData;
    spending?: ChartWidgetData; // Alias for spendingChart
    orders?: ChartWidgetData; // Order trends chart
  };
  recentActivities?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>;
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
