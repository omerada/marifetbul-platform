/**
 * UserTable Type Definitions
 *
 * Centralized types for user table management, filters, actions, and components.
 */

import { ReactNode } from 'react';

// ============================================================================
// Core User Types
// ============================================================================

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'banned'
  | 'pending_verification';

export type UserRole = 'admin' | 'moderator' | 'employer' | 'freelancer';

export type UserActionType =
  | 'activate'
  | 'suspend'
  | 'ban'
  | 'delete'
  | 'verify'
  | 'view'
  | 'email'
  | 'activity';

export interface AdminUserData {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  userType: UserRole;
  accountStatus: UserStatus;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt?: string | Date;
  lastActiveAt?: string | Date;
  avatarUrl?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface UserFilters {
  search?: string;
  status?: UserStatus[];
  userType?: UserRole;
  dateRange?: {
    start: Date;
    end: Date;
  };
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface UserTablePagination {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Bulk Selection Types
// ============================================================================

export interface BulkSelectionState {
  selectedIds: string[];
  selectedCount: number;
  isAllSelected: boolean;
}

export interface BulkActionPayload {
  userIds: string[];
  action: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'verify' | 'unverify';
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface BulkActionsProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

export interface TableHeaderProps {
  title: string;
  description: string;
  userCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'xlsx') => void;
}

export interface TableFiltersProps {
  filters: UserFilters;
  onFilterChange: (filters: Partial<UserFilters>) => void;
  onSearch: (query: string) => void;
}

export interface UserRowProps {
  user: AdminUserData;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: UserActionType) => void;
}

export interface ActionMenuProps {
  user: AdminUserData;
  onAction: (action: UserActionType) => void;
}

export interface TablePaginationProps {
  pagination: UserTablePagination;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export interface EmptyStateProps {
  hasFilters: boolean;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  color: string;
  icon?: ReactNode;
}

export interface ActionMenuItem {
  key: UserActionType;
  label: string;
  icon: ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  condition?: (user: AdminUserData) => boolean;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseUserTableActionsReturn {
  handleActivate: (userId: string) => Promise<void>;
  handleSuspend: (userId: string) => Promise<void>;
  handleBan: (userId: string) => Promise<void>;
  handleVerify: (userId: string) => Promise<void>;
  handleDelete: (userId: string) => Promise<void>;
  handleExport: (format: 'csv' | 'xlsx', filters: UserFilters) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}
