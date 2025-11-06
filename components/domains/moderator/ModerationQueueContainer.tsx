/**
 * ================================================
 * MODERATION QUEUE CONTAINER
 * ================================================
 * Smart container component that integrates ModerationQueue with hooks
 *
 * Sprint: Moderator Dashboard Implementation - Sprint 2, Task 2.2
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 4, 2025
 *
 * Features:
 * - Integrated usePendingItems hook
 * - Real-time data fetching with auto-refresh
 * - Built-in action handlers
 * - Bulk selection support
 * - Type filtering
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ModerationQueue } from './ModerationQueue';
import {
  usePendingItems,
  useCommentActions,
  useReviewActions,
} from '@/hooks/business/useModeration';
import { useToast } from '@/hooks/core/useToast';
import type { PendingItemType } from '@/types/business/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ModerationQueueContainerProps {
  /**
   * Page number (1-indexed)
   */
  page?: number;
  /**
   * Items per page
   */
  pageSize?: number;
  /**
   * Optional item type filter
   */
  itemType?: PendingItemType;
  /**
   * Auto-refresh interval in milliseconds (default: 60000 = 60s)
   */
  refreshInterval?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ModerationQueueContainer({
  page = 1,
  pageSize = 20,
  itemType,
  refreshInterval = 60000,
  className,
}: ModerationQueueContainerProps) {
  // Hooks
  const { success, error: showError } = useToast();
  const { items, isLoading, refresh } = usePendingItems(
    page,
    pageSize,
    refreshInterval
  );
  const {
    approve: approveComment,
    reject: rejectComment,
    spam: markAsSpam,
  } = useCommentActions();
  const { approve: approveReview, reject: rejectReview } = useReviewActions();

  // State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Filter items by type if specified
  const filteredItems = React.useMemo(() => {
    if (!itemType) return items;
    return items.filter((item) => item.itemType === itemType);
  }, [items, itemType]);

  // Handle item selection
  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.itemId));
    }
  }, [selectedItems.length, filteredItems]);

  // Handle single item approval
  const handleApprove = useCallback(
    async (itemId: string) => {
      if (actionInProgress) return;

      const item = items.find((i) => i.itemId === itemId);
      if (!item) return;

      try {
        setActionInProgress(true);

        switch (item.itemType) {
          case 'COMMENT':
            await approveComment(itemId);
            success('Yorum onaylandı');
            break;
          case 'REVIEW':
            await approveReview(itemId);
            success('Değerlendirme onaylandı');
            break;
          default:
            showError('Bu içerik türü için onaylama desteklenmiyor');
            return;
        }

        // Refresh data
        await refresh();

        // Remove from selection if selected
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      } catch (err) {
        logger.error('Approve failed', err instanceof Error ? err : new Error(String(err)));
        showError('Onaylama sırasında bir hata oluştu');
      } finally {
        setActionInProgress(false);
      }
    },
    [
      actionInProgress,
      items,
      approveComment,
      approveReview,
      success,
      showError,
      refresh,
    ]
  );

  // Handle single item rejection
  const handleReject = useCallback(
    async (itemId: string) => {
      if (actionInProgress) return;

      const item = items.find((i) => i.itemId === itemId);
      if (!item) return;

      try {
        setActionInProgress(true);

        switch (item.itemType) {
          case 'COMMENT':
            await rejectComment(itemId, 'İçerik politikalarına uygun değil');
            success('Yorum reddedildi');
            break;
          case 'REVIEW':
            await rejectReview(itemId, 'İçerik politikalarına uygun değil');
            success('Değerlendirme reddedildi');
            break;
          default:
            showError('Bu içerik türü için reddetme desteklenmiyor');
            return;
        }

        // Refresh data
        await refresh();

        // Remove from selection if selected
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      } catch (err) {
        logger.error('Reject failed', err instanceof Error ? err : new Error(String(err)));
        showError('Reddetme sırasında bir hata oluştu');
      } finally {
        setActionInProgress(false);
      }
    },
    [
      actionInProgress,
      items,
      rejectComment,
      rejectReview,
      success,
      showError,
      refresh,
    ]
  );

  // Handle bulk actions
  const handleBulkAction = useCallback(
    async (action: 'approve' | 'reject' | 'spam', itemIds: string[]) => {
      if (actionInProgress || itemIds.length === 0) return;

      try {
        setActionInProgress(true);

        const itemsToProcess = items.filter((item) =>
          itemIds.includes(item.itemId)
        );

        // Group by type
        const commentIds = itemsToProcess
          .filter((item) => item.itemType === 'COMMENT')
          .map((item) => item.itemId);
        const reviewIds = itemsToProcess
          .filter((item) => item.itemType === 'REVIEW')
          .map((item) => item.itemId);

        let successCount = 0;
        let failCount = 0;

        // Process comments
        if (commentIds.length > 0) {
          try {
            switch (action) {
              case 'approve':
                for (const id of commentIds) {
                  try {
                    await approveComment(id);
                    successCount++;
                  } catch {
                    failCount++;
                  }
                }
                break;
              case 'reject':
                for (const id of commentIds) {
                  try {
                    await rejectComment(id, 'Toplu moderasyon');
                    successCount++;
                  } catch {
                    failCount++;
                  }
                }
                break;
              case 'spam':
                for (const id of commentIds) {
                  try {
                    await markAsSpam(id);
                    successCount++;
                  } catch {
                    failCount++;
                  }
                }
                break;
            }
          } catch (err) {
            logger.error('Bulk comment action failed', err instanceof Error ? err : new Error(String(err)));
            failCount += commentIds.length;
          }
        }

        // Process reviews
        if (reviewIds.length > 0) {
          try {
            switch (action) {
              case 'approve':
                for (const id of reviewIds) {
                  try {
                    await approveReview(id);
                    successCount++;
                  } catch {
                    failCount++;
                  }
                }
                break;
              case 'reject':
                for (const id of reviewIds) {
                  try {
                    await rejectReview(id, 'Toplu moderasyon');
                    successCount++;
                  } catch {
                    failCount++;
                  }
                }
                break;
              case 'spam':
                // Reviews don't support spam action
                showError('Değerlendirmeler için spam işlemi desteklenmiyor');
                break;
            }
          } catch (err) {
            logger.error('Bulk review action failed', err instanceof Error ? err : new Error(String(err)));
            failCount += reviewIds.length;
          }
        }

        // Show results
        if (successCount > 0) {
          const actionLabel =
            action === 'approve'
              ? 'onaylandı'
              : action === 'reject'
                ? 'reddedildi'
                : 'spam olarak işaretlendi';
          success(`${successCount} içerik ${actionLabel}`);
        }

        if (failCount > 0) {
          showError(`${failCount} içerik işlenemedi`);
        }

        // Refresh data
        await refresh();

        // Clear selection
        setSelectedItems([]);
      } catch (err) {
        logger.error('Bulk action failed', err instanceof Error ? err : new Error(String(err)));
        showError('Toplu işlem sırasında bir hata oluştu');
      } finally {
        setActionInProgress(false);
      }
    },
    [
      actionInProgress,
      items,
      approveComment,
      rejectComment,
      markAsSpam,
      approveReview,
      rejectReview,
      success,
      showError,
      refresh,
    ]
  );

  return (
    <ModerationQueue
      items={filteredItems}
      isLoading={isLoading}
      selectedItems={selectedItems}
      onItemSelect={handleItemSelect}
      onSelectAll={handleSelectAll}
      onApprove={handleApprove}
      onReject={handleReject}
      onBulkAction={handleBulkAction}
      className={className}
    />
  );
}

export default ModerationQueueContainer;
