import { useCallback, useEffect, useState } from 'react';
import {
import { logger } from '@/lib/shared/utils/logger';
  useAdminModerationStore,
  useAdminModerationSelectors,
} from '@/lib/core/store/admin-moderation';
import type { ModerationFilters, ModerationActionRequest } from '@/types';

/**
 * Hook for content moderation functionality
 */
export function useContentModeration() {
  const {
    fetchModerationQueue,
    fetchModerationStats,
    performModerationAction,
    assignModerator,
    escalateItem,
    setFilters,
    selectItem,
    clearError,
  } = useAdminModerationStore();

  const selectors = useAdminModerationSelectors();
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Auto-fetch moderation queue on mount
  useEffect(() => {
    if (!selectors.hasData && !selectors.isLoading) {
      fetchModerationQueue?.();
      fetchModerationStats?.();
    }
  }, [
    fetchModerationQueue,
    fetchModerationStats,
    selectors.hasData,
    selectors.isLoading,
  ]);

  // Auto-refresh stats every 2 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (selectors.hasStats) {
          fetchModerationStats?.();
        }
      },
      2 * 60 * 1000
    ); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchModerationStats, selectors.hasStats]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<ModerationFilters>) => {
      setFilters(newFilters);
      fetchModerationQueue(newFilters);
    },
    [setFilters, fetchModerationQueue]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const newFilters = { ...selectors.filters, page };
      handleFilterChange(newFilters);
    },
    [selectors.filters, handleFilterChange]
  );

  const handleModerationAction = useCallback(
    async (itemId: string, action: ModerationActionRequest) => {
      setIsActionLoading(true);
      try {
        await performModerationAction(itemId, action);
        // Refresh current page after action
        await fetchModerationQueue(selectors.filters);
      } catch (error) {
        logger.error('Moderation action failed:', error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [performModerationAction, fetchModerationQueue, selectors.filters]
  );

  const handleAssignModerator = useCallback(
    async (itemId: string, moderatorId: string) => {
      setIsActionLoading(true);
      try {
        await assignModerator(itemId, moderatorId);
      } catch (error) {
        logger.error('Moderator assignment failed:', error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [assignModerator]
  );

  const handleEscalate = useCallback(
    async (itemId: string, reason: string) => {
      setIsActionLoading(true);
      try {
        await escalateItem(itemId, reason);
      } catch (error) {
        logger.error('Escalation failed:', error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [escalateItem]
  );

  const handleItemSelect = useCallback(
    (itemId: string) => {
      const item = selectors.items.find((item) => item.id === itemId);
      selectItem(item || null);
    },
    [selectItem, selectors.items]
  );

  const handleQuickActions = useCallback(() => {
    return {
      approve: (itemId: string, notes?: string) =>
        handleModerationAction(itemId, {
          itemId,
          action: 'approve',
          notes,
        }),
      reject: (itemId: string, reason: string, notes?: string) =>
        handleModerationAction(itemId, {
          itemId,
          action: 'reject',
          reason,
          notes,
        }),
      escalate: (itemId: string, reason: string) =>
        handleEscalate(itemId, reason),
      dismiss: (itemId: string, notes?: string) =>
        handleModerationAction(itemId, {
          itemId,
          action: 'dismiss',
          notes,
        }),
    };
  }, [handleModerationAction, handleEscalate]);

  const handleBulkActions = useCallback(
    (itemIds: string[]) => {
      return {
        approve: async (notes?: string) => {
          for (const itemId of itemIds) {
            await handleModerationAction(itemId, {
              itemId,
              action: 'approve',
              notes,
            });
          }
        },
        reject: async (reason: string, notes?: string) => {
          for (const itemId of itemIds) {
            await handleModerationAction(itemId, {
              itemId,
              action: 'reject',
              reason,
              notes,
            });
          }
        },
      };
    },
    [handleModerationAction]
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      const newFilters = { ...selectors.filters, search: searchTerm, page: 1 };
      handleFilterChange(newFilters);
    },
    [selectors.filters, handleFilterChange]
  );

  const handleSort = useCallback(
    (sortBy: ModerationFilters['sort']) => {
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
    onModerationAction: handleModerationAction,
    onAssignModerator: handleAssignModerator,
    onEscalate: handleEscalate,
    onItemSelect: handleItemSelect,
    onSearch: handleSearch,
    onSort: handleSort,

    // Quick actions
    quickActions: handleQuickActions(),
    bulkActions: handleBulkActions,

    // Utilities
    selectItem,
    clearError,
    refresh: () => {
      fetchModerationQueue(selectors.filters);
      fetchModerationStats?.();
    },

    // Computed values
    queueSummary: {
      total: selectors.totalItems,
      pending: selectors.pendingItems,
      approved: selectors.approvedItems,
      rejected: selectors.rejectedItems,
      escalated: selectors.escalatedItems,
      highPriority: selectors.highPriorityItems,
      urgent: selectors.urgentItems,
    },

    contentBreakdown: {
      reviews: selectors.reviewItems,
      jobs: selectors.jobItems,
      services: selectors.serviceItems,
      profiles: selectors.profileItems,
    },

    performance: {
      averageReviewTime: selectors.averageReviewTime,
      automatedAccuracy: selectors.automatedFlagAccuracy,
    },
  };
}

export default useContentModeration;
