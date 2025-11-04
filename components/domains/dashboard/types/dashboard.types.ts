/**
 * @fileoverview Unified Dashboard TypeScript Type Definitions
 * @module components/domains/dashboard/types
 *
 * Central type definitions for the unified dashboard system.
 * Supports all 4 user roles: ADMIN, MODERATOR, FREELANCER, EMPLOYER
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Task 1.3
 */

import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// ============================================================================
// USER ROLES
// ============================================================================

/**
 * User role types supported by the dashboard
 */
export type UserRole = 'ADMIN' | 'MODERATOR' | 'FREELANCER' | 'EMPLOYER';

/**
 * Dashboard view mode based on user role
 */
export type DashboardViewMode =
  | 'admin'
  | 'moderator'
  | 'freelancer'
  | 'employer';

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
 * Time range filter options
 */
export type TimeRange = 7 | 30 | 90 | 365 | 'custom';

/**
 * Dashboard error types
 */
export interface DashboardError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Timestamp when error occurred */
  timestamp: Date;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Original error object */
  originalError?: Error;
}

/**
 * Loading state for different data sections
 */
export interface LoadingState {
  /** Main dashboard data is loading */
  dashboard: boolean;
  /** Stats are loading */
  stats: boolean;
  /** Charts are loading */
  charts: boolean;
  /** Activity/timeline is loading */
  activity: boolean;
  /** Additional content is loading */
  additional: boolean;
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

// ============================================================================
// STATS TYPES
// ============================================================================

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Trend indicator
 */
export interface TrendIndicator {
  /** Percentage change */
  percentage: number;
  /** Trend direction */
  direction: TrendDirection;
  /** Whether the trend is positive (green) or negative (red) */
  isPositive: boolean;
  /** Label for the trend (e.g., "vs last month") */
  label?: string;
}

/**
 * Single stat card data
 */
export interface StatCardData {
  /** Unique identifier */
  id: string;
  /** Stat title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle */
  subtitle?: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Icon color class */
  iconColor?: string;
  /** Trend indicator */
  trend?: TrendIndicator;
  /** Additional metadata */
  metadata?: {
    /** Tooltip text */
    tooltip?: string;
    /** Click action */
    onClick?: () => void;
    /** Badge text */
    badge?: string;
  };
}

/**
 * Stats grid configuration
 */
export interface StatsGridConfig {
  /** Number of columns on different breakpoints */
  columns: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 2 | 3 | 4;
  };
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg';
  /** Whether to animate on load */
  animate?: boolean;
}

// ============================================================================
// CHART TYPES
// ============================================================================

/**
 * Chart type
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut';

/**
 * Chart data point
 */
export interface ChartDataPoint {
  /** Label (e.g., date, category) */
  label: string;
  /** Value */
  value: number;
  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Chart series
 */
export interface ChartSeries {
  /** Series name */
  name: string;
  /** Data points */
  data: ChartDataPoint[];
  /** Series color */
  color?: string;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  /** Chart type */
  type: ChartType;
  /** Chart title */
  title?: string;
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Height in pixels */
  height?: number;
  /** Whether chart is responsive */
  responsive?: boolean;
}

/**
 * Chart widget data
 */
export interface ChartWidgetData {
  /** Unique identifier */
  id: string;
  /** Chart title */
  title: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Chart series */
  series: ChartSeries[];
  /** Chart configuration */
  config: ChartConfig;
}

// ============================================================================
// ACTIVITY / TIMELINE TYPES
// ============================================================================

/**
 * Activity type
 */
export type ActivityType =
  | 'order'
  | 'message'
  | 'review'
  | 'dispute'
  | 'payment'
  | 'package'
  | 'user'
  | 'system'
  | 'moderation';

/**
 * Activity status
 */
export type ActivityStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'in_progress'
  | 'approved'
  | 'rejected';

/**
 * Single activity/event
 */
export interface ActivityItem {
  /** Unique identifier */
  id: string;
  /** Activity type */
  type: ActivityType;
  /** Activity title */
  title: string;
  /** Activity description */
  description?: string;
  /** Activity status */
  status: ActivityStatus;
  /** Icon component name (as string for serialization) */
  icon?: string;
  /** Icon color */
  iconColor?: string;
  /** Navigation link */
  link?: string;
  /** Timestamp (ISO string) */
  timestamp: string;
  /** User who performed the action */
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  /** Related entity */
  entity?: {
    id: string;
    type: string;
    title: string;
  };
  /** Action buttons */
  actions?: ActivityAction[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Activity action button
 */
export interface ActivityAction {
  /** Action label */
  label: string;
  /** Action handler */
  onClick: () => void;
  /** Action variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Action icon */
  icon?: LucideIcon;
  /** Whether action is loading */
  isLoading?: boolean;
}

/**
 * Activity timeline configuration
 */
export interface ActivityTimelineConfig {
  /** Maximum number of items to display */
  maxItems?: number;
  /** Whether to show load more button */
  showLoadMore?: boolean;
  /** Whether to group by date */
  groupByDate?: boolean;
  /** Whether to show empty state */
  showEmptyState?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
}

// ============================================================================
// QUICK ACTIONS TYPES
// ============================================================================

/**
 * Quick action button
 */
export interface QuickAction {
  /** Unique identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action description */
  description?: string;
  /** Icon component (LucideIcon for client-side rendering) */
  icon: LucideIcon;
  /** Icon color */
  iconColor?: string;
  /** Action link (for navigation) */
  href?: string;
  /** Action handler (for buttons) */
  onClick?: () => void;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Badge count */
  badge?: number;
  /** Action variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Whether action requires permission */
  requiredPermission?: string;
}

/**
 * Quick actions grid configuration
 */
export interface QuickActionsConfig {
  /** Grid columns */
  columns: {
    mobile: 2 | 3;
    tablet: 3 | 4;
    desktop: 3 | 4 | 5;
  };
  /** Action button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show descriptions */
  showDescriptions?: boolean;
}

// ============================================================================
// ROLE-SPECIFIC DASHBOARD DATA
// ============================================================================

/**
 * Freelancer dashboard data
 */
export interface FreelancerDashboard {
  /** User's earnings summary */
  earnings: {
    total: number;
    pending: number;
    available: number;
    currency: string;
    trend?: TrendIndicator;
  };
  /** Order statistics */
  orders: {
    active: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  };
  /** Package statistics */
  packages: {
    total: number;
    active: number;
    paused: number;
    views: number;
  };
  /** Rating statistics */
  ratings: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
  /** Recent activities */
  recentActivities: ActivityItem[];
  /** Quick actions */
  quickActions: QuickAction[];
  /** Performance charts */
  charts: {
    earnings: ChartWidgetData;
    orders: ChartWidgetData;
    views: ChartWidgetData;
  };
  /** Period info */
  period: DashboardPeriod;
  /** Cache metadata */
  cache?: CacheMetadata;
}

/**
 * Employer dashboard data
 */
export interface EmployerDashboard {
  /** Spending summary */
  spending: {
    total: number;
    thisMonth: number;
    currency: string;
    trend?: TrendIndicator;
  };
  /** Order statistics */
  orders: {
    active: number;
    completed: number;
    cancelled: number;
    totalSpent: number;
  };
  /** Favorites */
  favorites: {
    packages: number;
    sellers: number;
  };
  /** Recent activities */
  recentActivities: ActivityItem[];
  /** Quick actions */
  quickActions: QuickAction[];
  /** Spending charts */
  charts: {
    spending: ChartWidgetData;
    orders: ChartWidgetData;
  };
  /** Period info */
  period: DashboardPeriod;
  /** Cache metadata */
  cache?: CacheMetadata;
}

/**
 * Admin dashboard data
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
  /** Moderation charts - Sprint 1 Task 1.2: Updated with real chart types */
  charts: {
    actionsToday: ChartWidgetData;
    categoryBreakdown: ChartWidgetData;
    moderationVolume: ChartWidgetData;
    responseTime: ChartWidgetData;
  };
  /** Period info */
  period: DashboardPeriod;
}

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
 * Union type for all dashboard data types
 */
export type UnifiedDashboardData =
  | FreelancerDashboard
  | EmployerDashboard
  | AdminDashboard
  | ModeratorDashboard;

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Main dashboard view props
 */
export interface DashboardViewProps {
  /** User role */
  role: UserRole;
  /** Dashboard data */
  data: UnifiedDashboardData | null;
  /** Loading state */
  isLoading?: boolean;
  /** Refreshing state */
  isRefreshing?: boolean;
  /** Error state */
  error?: DashboardError | null;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Period change handler */
  onPeriodChange?: (days: number) => void;
  /** Custom className */
  className?: string;
}

/**
 * Stats card props
 */
export interface StatsCardProps {
  /** Card data */
  data: StatCardData;
  /** Loading state */
  isLoading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
  /** Card variant */
  variant?: 'default' | 'outline' | 'filled';
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Stats grid props
 */
export interface StatsGridProps {
  /** Stats to display */
  stats: StatCardData[];
  /** Grid configuration */
  config?: StatsGridConfig;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Chart widget props
 */
export interface ChartWidgetProps {
  /** Chart data */
  data: ChartWidgetData;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Custom className */
  className?: string;
  /** Whether to show header */
  showHeader?: boolean;
  /** Custom actions */
  actions?: ReactNode;
}

/**
 * Activity timeline props
 */
export interface ActivityTimelineProps {
  /** Activities to display */
  activities: ActivityItem[];
  /** Timeline configuration */
  config?: ActivityTimelineConfig;
  /** Loading state */
  isLoading?: boolean;
  /** Load more handler */
  onLoadMore?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * Quick actions props
 */
export interface QuickActionsProps {
  /** Actions to display */
  actions: QuickAction[];
  /** Grid configuration */
  config?: QuickActionsConfig;
  /** Custom className */
  className?: string;
  /** Section title */
  title?: string;
}

/**
 * Dashboard header props
 */
export interface DashboardHeaderProps {
  /** User role */
  role: UserRole;
  /** Dashboard title */
  title: string;
  /** Dashboard subtitle */
  subtitle?: string;
  /** Period selector */
  period?: {
    current: number;
    options: number[];
    onChange: (days: number) => void;
  };
  /** Refresh button */
  refresh?: {
    onClick: () => void;
    isLoading: boolean;
  };
  /** Custom actions */
  actions?: ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * Dashboard section props
 */
export interface DashboardSectionProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Section icon */
  icon?: LucideIcon;
  /** Section content */
  children: ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Custom actions */
  actions?: ReactNode;
  /** Custom className */
  className?: string;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Whether section is initially collapsed */
  defaultCollapsed?: boolean;
}

/**
 * Empty state props
 */
export interface EmptyStateProps {
  /** Icon component */
  icon?: LucideIcon;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Custom className */
  className?: string;
}

/**
 * Error state props
 */
export interface ErrorStateProps {
  /** Error */
  error: DashboardError;
  /** Retry handler */
  onRetry?: () => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/**
 * Dashboard permissions
 */
export interface DashboardPermissions {
  /** Can view system health */
  canViewSystemHealth: boolean;
  /** Can view analytics */
  canViewAnalytics: boolean;
  /** Can moderate content */
  canModerateContent: boolean;
  /** Can manage users */
  canManageUsers: boolean;
  /** Can view financials */
  canViewFinancials: boolean;
  /** Can perform bulk actions */
  canBulkAction: boolean;
  /** Can export data */
  canExportData: boolean;
  /** Can configure settings */
  canConfigureSettings: boolean;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * useDashboard hook return type
 */
export interface UseDashboardReturn {
  /** Dashboard data */
  data: UnifiedDashboardData | null;
  /** Loading state */
  isLoading: boolean;
  /** Refreshing state */
  isRefreshing: boolean;
  /** Error state */
  error: DashboardError | null;
  /** Refresh function */
  refresh: () => Promise<void>;
  /** Retry function */
  retry: () => Promise<void>;
  /** Clear error function */
  clearError: () => void;
  /** Last updated timestamp */
  lastUpdated: Date | null;
  /** Whether auto-refresh is enabled */
  autoRefreshEnabled: boolean;
}

/**
 * useDashboardPermissions hook return type
 */
export interface UseDashboardPermissionsReturn extends DashboardPermissions {
  /** User role */
  role: UserRole;
  /** Check if has specific permission */
  hasPermission: (permission: keyof DashboardPermissions) => boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract dashboard type by role
 */
export type DashboardByRole<T extends UserRole> = T extends 'FREELANCER'
  ? FreelancerDashboard
  : T extends 'EMPLOYER'
    ? EmployerDashboard
    : T extends 'ADMIN'
      ? AdminDashboard
      : T extends 'MODERATOR'
        ? ModeratorDashboard
        : never;

/**
 * Partial dashboard data (for optimistic updates)
 */
export type PartialDashboardData<T extends UnifiedDashboardData> = {
  [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K];
};

/**
 * Dashboard widget type
 */
export type DashboardWidget =
  | 'stats'
  | 'chart'
  | 'activity'
  | 'quick-actions'
  | 'system-health'
  | 'moderation-queue'
  | 'top-packages';

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  /** Visible widgets */
  widgets: DashboardWidget[];
  /** Widget order */
  order?: DashboardWidget[];
  /** Custom grid layout */
  gridLayout?: {
    [K in DashboardWidget]?: {
      col: number;
      row: number;
      width: number;
      height: number;
    };
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for FreelancerDashboard
 */
export function isFreelancerDashboard(
  data: UnifiedDashboardData
): data is FreelancerDashboard {
  return 'earnings' in data && 'packages' in data;
}

/**
 * Type guard for EmployerDashboard
 */
export function isEmployerDashboard(
  data: UnifiedDashboardData
): data is EmployerDashboard {
  return 'spending' in data && 'favorites' in data;
}

/**
 * Type guard for AdminDashboard
 */
export function isAdminDashboard(
  data: UnifiedDashboardData
): data is AdminDashboard {
  return 'systemHealth' in data && 'searchMetrics' in data;
}

/**
 * Type guard for ModeratorDashboard
 */
export function isModeratorDashboard(
  data: UnifiedDashboardData
): data is ModeratorDashboard {
  return (
    'queue' in data &&
    'stats' in data &&
    typeof (data as ModeratorDashboard).stats === 'object' &&
    'pendingItems' in (data as ModeratorDashboard).stats
  );
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Re-export all types for convenience
  LucideIcon,
  ReactNode,
};
