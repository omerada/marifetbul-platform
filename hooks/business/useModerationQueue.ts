/**
 * ================================================
 * USE MODERATION QUEUE HOOK
 * ================================================
 * Hook for managing moderation queue items
 *
 * Sprint: Moderator System Completion - Day 2
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { moderationApi } from '@/lib/api/moderation';
import { logger } from '@/lib/shared/utils/logger';
import { toast } from 'sonner';
import type {
  PendingItem,
  PendingItemType,
  Priority,
} from '@/types/business/moderation';

// ============================================================================
// TYPES
// ============================================================================

interface QueueFilters {
  type?: PendingItemType | 'ALL';
  priority?: Priority | 'ALL';
  search?: string;
}

interface UseModerationQueueReturn {
  items: PendingItem[];
  isLoading: boolean;
  error: Error | null;
  selectedItems: string[];
  filters: QueueFilters;
  setFilters: (filters: QueueFilters) => void;
  selectItem: (itemId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  approveItem: (itemId: string) => Promise<void>;
  rejectItem: (itemId: string, reason?: string) => Promise<void>;
  bulkApprove: (itemIds: string[]) => Promise<void>;
  bulkReject: (itemIds: string[], reason?: string) => Promise<void>;
  bulkSpam: (itemIds: string[]) => Promise<void>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing moderation queue
 * Uses SWR for data fetching and caching
 */
export function useModerationQueue(): UseModerationQueueReturn {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState<QueueFilters>({
    type: 'ALL',
    priority: 'ALL',
    search: '',
  });

  // Fetch pending items with SWR
  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR(
    '/moderation/pending-items',
    async () => {
      const result = await moderationApi.getPendingItems(1, 100);
      return result;
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const items = useMemo(() => response?.items || [], [response]);

  // ================================================
  // SELECTION MANAGEMENT
  // ================================================

  const selectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.itemId));
    }
  }, [items, selectedItems.length]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // ================================================
  // SINGLE ITEM ACTIONS
  // ================================================

  const approveItem = useCallback(
    async (itemId: string) => {
      const item = items.find((i) => i.itemId === itemId);
      if (!item) return;

      try {
        // Determine the correct API call based on item type
        switch (item.itemType) {
          case 'COMMENT':
            await moderationApi.approveComment(itemId);
            break;
          case 'REVIEW':
            await moderationApi.approveReview(itemId);
            break;
          default:
            throw new Error(`Unsupported item type: ${item.itemType}`);
        }

        // Remove from selected items
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));

        // Refresh data
        mutate();

        toast.success('İçerik onaylandı');
        logger.info(`Approved ${item.itemType}:`, itemId);
      } catch (error) {
        logger.error('Failed to approve item:', error);
        toast.error('Onaylama başarısız oldu');
        throw error;
      }
    },
    [items, mutate]
  );

  const rejectItem = useCallback(
    async (itemId: string, reason = 'Moderatör tarafından reddedildi') => {
      const item = items.find((i) => i.itemId === itemId);
      if (!item) return;

      try {
        switch (item.itemType) {
          case 'COMMENT':
            await moderationApi.rejectComment(itemId, reason);
            break;
          case 'REVIEW':
            await moderationApi.rejectReview(itemId, reason);
            break;
          default:
            throw new Error(`Unsupported item type: ${item.itemType}`);
        }

        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
        mutate();

        toast.success('İçerik reddedildi');
        logger.info(`Rejected ${item.itemType}:`, itemId, 'Reason:', reason);
      } catch (error) {
        logger.error('Failed to reject item:', error);
        toast.error('Reddetme başarısız oldu');
        throw error;
      }
    },
    [items, mutate]
  );

  // ================================================
  // BULK ACTIONS
  // ================================================

  const bulkApprove = useCallback(
    async (itemIds: string[]) => {
      if (itemIds.length === 0) return;

      try {
        // Group items by type
        const commentIds = items
          .filter(
            (item) =>
              itemIds.includes(item.itemId) && item.itemType === 'COMMENT'
          )
          .map((item) => item.itemId);

        // Note: reviewIds prepared for future bulk approve reviews support
        const _reviewIds = items
          .filter(
            (item) =>
              itemIds.includes(item.itemId) && item.itemType === 'REVIEW'
          )
          .map((item) => item.itemId);

        // Execute bulk operations
        const results = await Promise.allSettled([
          commentIds.length > 0 &&
            moderationApi.bulkApproveComments(commentIds),
          // TODO: Add bulk approve reviews when backend supports it
        ]);

        // Handle results
        const allSuccessful = results.every(
          (result) => result.status === 'fulfilled'
        );

        if (allSuccessful) {
          toast.success(`${itemIds.length} içerik onaylandı`);
        } else {
          toast.warning('Bazı içerikler onaylanamadı');
        }

        clearSelection();
        mutate();

        logger.info('Bulk approved items:', itemIds);
      } catch (error) {
        logger.error('Failed to bulk approve:', error);
        toast.error('Toplu onaylama başarısız oldu');
        throw error;
      }
    },
    [items, clearSelection, mutate]
  );

  const bulkReject = useCallback(
    async (itemIds: string[], reason = 'Toplu reddetme') => {
      if (itemIds.length === 0) return;

      try {
        const commentIds = items
          .filter(
            (item) =>
              itemIds.includes(item.itemId) && item.itemType === 'COMMENT'
          )
          .map((item) => item.itemId);

        const results = await Promise.allSettled([
          commentIds.length > 0 &&
            moderationApi.bulkRejectComments(commentIds, reason),
        ]);

        const allSuccessful = results.every(
          (result) => result.status === 'fulfilled'
        );

        if (allSuccessful) {
          toast.success(`${itemIds.length} içerik reddedildi`);
        } else {
          toast.warning('Bazı içerikler reddedilemedi');
        }

        clearSelection();
        mutate();

        logger.info('Bulk rejected items:', itemIds, 'Reason:', reason);
      } catch (error) {
        logger.error('Failed to bulk reject:', error);
        toast.error('Toplu reddetme başarısız oldu');
        throw error;
      }
    },
    [items, clearSelection, mutate]
  );

  const bulkSpam = useCallback(
    async (itemIds: string[]) => {
      if (itemIds.length === 0) return;

      try {
        const commentIds = items
          .filter(
            (item) =>
              itemIds.includes(item.itemId) && item.itemType === 'COMMENT'
          )
          .map((item) => item.itemId);

        await moderationApi.bulkMarkCommentsAsSpam(commentIds);

        toast.success(`${itemIds.length} içerik spam olarak işaretlendi`);
        clearSelection();
        mutate();

        logger.info('Bulk marked as spam:', itemIds);
      } catch (error) {
        logger.error('Failed to bulk mark as spam:', error);
        toast.error('Toplu spam işaretleme başarısız oldu');
        throw error;
      }
    },
    [items, clearSelection, mutate]
  );

  // ================================================
  // REFRESH
  // ================================================

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    items,
    isLoading,
    error: error || null,
    selectedItems,
    filters,
    setFilters,
    selectItem,
    selectAll,
    clearSelection,
    approveItem,
    rejectItem,
    bulkApprove,
    bulkReject,
    bulkSpam,
    refresh,
  };
}

export default useModerationQueue;
