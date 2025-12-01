/**
 * @fileoverview Unified Dashboard Component Type Definitions
 * @module components/domains/dashboard/types
 *
 * Component-specific types for the unified dashboard system.
 * Core dashboard data types are now in @/types/core/dashboard
 *
 * @created 2025-11-01
 * @updated 2025-11-13 - Sprint 1: Moved core types to @/types/core/dashboard
 * @sprint Sprint 1 - Dashboard Consolidation
 */

import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Import core dashboard types from canonical location
import type {
  FreelancerDashboard,
  EmployerDashboard,
  AdminDashboard,
  ModeratorDashboard,
  UnifiedDashboardData,
  DashboardPeriod,
  ModerationItem,
  CacheMetadata,
  TrendIndicator,
  ChartWidgetData,
  ActivityItem,
  QuickAction,
} from '@/types/core/dashboard';

// Re-export for convenience
export type {
  FreelancerDashboard,
  EmployerDashboard,
  AdminDashboard,
  ModeratorDashboard,
  UnifiedDashboardData,
  DashboardPeriod,
  ModerationItem,
  CacheMetadata,
  TrendIndicator,
  ChartWidgetData,
  ActivityItem,
  QuickAction,
};

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
// COMPONENT-SPECIFIC TYPES
// ============================================================================

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

// ============================================================================
// STATS TYPES
// ============================================================================

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

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

// ============================================================================
// DASHBOARD DATA TYPES - RE-EXPORTED FROM CORE
// ============================================================================
// NOTE: All dashboard data interfaces (FreelancerDashboard, EmployerDashboard,
// AdminDashboard, ModeratorDashboard) are now defined in types/core/dashboard.ts
// and re-exported at the top of this file for convenience.
// This eliminates duplication and establishes a single source of truth.
// ============================================================================

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
