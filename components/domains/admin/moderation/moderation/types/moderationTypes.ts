/**
 * AdminModeration Type Definitions
 *
 * Centralized types for moderation system, items, stats, filters, and components.
 */

// ============================================================================
// Core Data Types
// ============================================================================

export type ModerationContentType =
  | 'review'
  | 'job'
  | 'package'
  | 'message'
  | 'profile';
export type ModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated';
export type ModerationPriority = 'low' | 'medium' | 'high' | 'critical';
export type ModerationAction = 'approve' | 'reject' | 'escalate';
export type UserType = 'freelancer' | 'employer';
export type FlagSeverity = 'low' | 'medium' | 'high';

// ============================================================================
// Filter Types
// ============================================================================

export interface ModerationFilters {
  status: string[];
  priority: string[];
  type: string[];
  search: string;
}

// ============================================================================
// Item Types
// ============================================================================

export interface AutomatedFlag {
  id: string;
  type: string;
  severity: FlagSeverity;
  confidence: number;
  details: string;
  flaggedAt: string;
}

export interface ReviewHistoryItem {
  id: string;
  moderatorId: string;
  moderatorName: string;
  action: string;
  notes?: string;
  timestamp: string;
}

export interface ReporterInfo {
  id: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

export interface UserContent {
  userId: string;
  userName: string;
  userType: UserType;
  submittedAt: string;
}

export interface ModerationContent {
  title: string;
  description: string;
  rating?: number;
  userContent: UserContent;
}

export interface ModerationItem {
  id: string;
  type: ModerationContentType;
  contentId: string;
  content: ModerationContent;
  reportedBy: string;
  reporterInfo: ReporterInfo;
  reason: string;
  category: string;
  priority: ModerationPriority;
  status: ModerationStatus;
  automatedFlags: AutomatedFlag[];
  reviewHistory: ReviewHistoryItem[];
  moderatorNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface TopModerationReason {
  reason: string;
  count: number;
}

export interface ModerationStats {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  averageReviewTime: number;
  automatedFlagAccuracy: number;
  topModerationReasons: TopModerationReason[];
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface AdminModerationProps {
  // Optional props for customization
  defaultFilters?: Partial<ModerationFilters>;
  onItemSelect?: (item: ModerationItem) => void;
}

export interface ModerationHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export interface ModerationStatsProps {
  stats: ModerationStats | null;
  isLoading?: boolean;
}

export interface ModerationFiltersProps {
  filters: ModerationFilters;
  onFilterChange: (
    key: keyof ModerationFilters,
    value: string | string[]
  ) => void;
}

export interface ModerationTableProps {
  items: ModerationItem[];
  isLoading: boolean;
  onActionClick: (item: ModerationItem, action: ModerationAction) => void;
  onViewDetails: (item: ModerationItem) => void;
}

export interface ModerationRowProps {
  item: ModerationItem;
  onActionClick: (action: ModerationAction) => void;
  onViewDetails: () => void;
}

export interface ModerationPaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export interface ModerationActionDialogProps {
  open: boolean;
  actionType: ModerationAction | null;
  selectedItem: ModerationItem | null;
  actionNotes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseModerationDataReturn {
  items: ModerationItem[];
  stats: ModerationStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseModerationFiltersReturn {
  filters: ModerationFilters;
  handleFilterChange: (
    key: keyof ModerationFilters,
    value: string | string[]
  ) => void;
  clearFilters: () => void;
}

export interface UseModerationActionsReturn {
  selectedItem: ModerationItem | null;
  actionType: ModerationAction | null;
  actionNotes: string;
  showActionDialog: boolean;
  setSelectedItem: (item: ModerationItem | null) => void;
  setActionType: (action: ModerationAction | null) => void;
  setActionNotes: (notes: string) => void;
  setShowActionDialog: (show: boolean) => void;
  handleAction: () => Promise<void>;
}
