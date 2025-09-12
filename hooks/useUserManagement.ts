import { useCallback, useEffect, useState } from 'react';
import {
  useAdminUserStore,
  useAdminUserSelectors,
} from '@/lib/store/admin-users';
import type {
  UserFilters,
  UserActionRequest,
  BulkUserActionRequest,
} from '@/types';

/**
 * Hook for user management functionality
 */
export function useUserManagement() {
  const {
    fetchUsers,
    fetchUserById,
    performUserAction,
    performBulkAction,
    setFilters,
    selectUser,
    toggleBulkSelection,
    selectAllUsers,
    clearBulkSelection,
    clearError,
  } = useAdminUserStore();

  const selectors = useAdminUserSelectors();
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Auto-fetch users on mount
  useEffect(() => {
    if (!selectors.hasData && !selectors.isLoading) {
      fetchUsers();
    }
  }, [fetchUsers, selectors.hasData, selectors.isLoading]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<UserFilters>) => {
      setFilters(newFilters);
      fetchUsers(newFilters);
    },
    [setFilters, fetchUsers]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const newFilters = { ...selectors.filters, page };
      handleFilterChange(newFilters);
    },
    [selectors.filters, handleFilterChange]
  );

  const handleUserAction = useCallback(
    async (userId: string, action: UserActionRequest) => {
      setIsActionLoading(true);
      try {
        await performUserAction(userId, action);
        // Refresh current page after action
        await fetchUsers(selectors.filters);
      } catch (error) {
        console.error('User action failed:', error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [performUserAction, fetchUsers, selectors.filters]
  );

  const handleBulkAction = useCallback(
    async (action: BulkUserActionRequest) => {
      setIsActionLoading(true);
      try {
        await performBulkAction(action);
        clearBulkSelection();
      } catch (error) {
        console.error('Bulk action failed:', error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [performBulkAction, clearBulkSelection]
  );

  const handleUserSelect = useCallback(
    async (userId: string) => {
      try {
        await fetchUserById(userId);
      } catch (error) {
        console.error('User fetch failed:', error);
      }
    },
    [fetchUserById]
  );

  const handleBulkToggle = useCallback(
    (userId: string) => {
      toggleBulkSelection(userId);
    },
    [toggleBulkSelection]
  );

  const handleSelectAll = useCallback(() => {
    if (selectors.isAllSelected) {
      clearBulkSelection();
    } else {
      selectAllUsers();
    }
  }, [selectors.isAllSelected, clearBulkSelection, selectAllUsers]);

  const handleSearch = useCallback(
    (searchTerm: string) => {
      const newFilters = { ...selectors.filters, search: searchTerm, page: 1 };
      handleFilterChange(newFilters);
    },
    [selectors.filters, handleFilterChange]
  );

  const handleSort = useCallback(
    (sortBy: UserFilters['sort']) => {
      const newFilters = { ...selectors.filters, sort: sortBy, page: 1 };
      handleFilterChange(newFilters);
    },
    [selectors.filters, handleFilterChange]
  );

  return {
    // Data
    ...selectors,

    // Loading states
    isActionLoading,

    // Actions
    onFilterChange: handleFilterChange,
    onPageChange: handlePageChange,
    onUserAction: handleUserAction,
    onBulkAction: handleBulkAction,
    onUserSelect: handleUserSelect,
    onBulkToggle: handleBulkToggle,
    onSelectAll: handleSelectAll,
    onSearch: handleSearch,
    onSort: handleSort,

    // User management utilities
    selectUser,
    clearError,
    clearBulkSelection,

    // Computed values
    pagination: {
      currentPage: selectors.currentPage,
      totalPages: selectors.totalPages,
      hasNext: selectors.hasNextPage,
      hasPrev: selectors.hasPrevPage,
      total: selectors.totalUsers,
    },

    statistics: {
      total: selectors.totalUsers,
      active: selectors.activeUsers,
      suspended: selectors.suspendedUsers,
      banned: selectors.bannedUsers,
      verified: selectors.verifiedUsers,
      freelancers: selectors.freelancers,
      employers: selectors.employers,
    },

    bulkSelection: {
      selectedCount: selectors.selectedCount,
      isAllSelected: selectors.isAllSelected,
      selectedIds: selectors.bulkSelectedIds,
      hasSelection: selectors.selectedCount > 0,
    },
  };
}

export default useUserManagement;
