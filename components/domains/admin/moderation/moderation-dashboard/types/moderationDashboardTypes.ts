/**
 * ModerationDashboard Types
 *
 * Type definitions for moderation dashboard components
 */

// ============================================================================
// Core Types
// ============================================================================

export interface ModerationItem {
  id: string;
  type: 'user_report' | 'auto_flagged' | 'manual_review';
  contentType: 'job_post' | 'user_profile' | 'message' | 'package' | 'review';
  title: string;
  description: string;
  reportedBy?: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reportReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  content: {
    text?: string;
    images?: string[];
    metadata?: Record<string, string | number | boolean>;
  };
  autoFlags: {
    spam: boolean;
    inappropriate: boolean;
    fake: boolean;
    harassment: boolean;
    score: number;
  };
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  autoFlagged: number;
  averageResponseTime: number;
  moderationAccuracy: number;
  trendsData: {
    date: string;
    reports: number;
    resolved: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

export interface ModerationFilters {
  type: string | string[];
  severity: string | string[];
  status: string | string[];
  priority?: string | string[];
  search: string;
}

export type ModerationAction = 'approve' | 'reject' | 'escalate';

export interface CategoryBreakdownItem {
  category: string;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  color: 'green' | 'red' | 'blue' | 'yellow';
  text: string;
}

// ============================================================================
// Component Props
// ============================================================================

export interface ModerationHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onDownload: () => void;
}

export interface ModerationStatsGridProps {
  stats: ModerationStats | null;
}

export interface ModerationFiltersProps {
  filters: ModerationFilters;
  onFilterChange: (key: keyof ModerationFilters, value: string) => void;
  onSearchChange: (value: string) => void;
}

export interface ModerationItemCardProps {
  item: ModerationItem;
  onAction: (itemId: string, action: ModerationAction) => void;
}

export interface ModerationItemsListProps {
  items: ModerationItem[];
  onItemAction: (itemId: string, action: ModerationAction) => void;
}

export interface CategoryBreakdownProps {
  categories: CategoryBreakdownItem[];
}

export interface QuickActionsProps {
  onAction?: (action: string) => void;
}

export interface RecentActivityProps {
  activities?: ActivityItem[];
}

export interface ModerationSidebarProps {
  stats: ModerationStats | null;
  activities?: ActivityItem[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModerationLoadingStateProps {
  // No props - static skeleton
}
