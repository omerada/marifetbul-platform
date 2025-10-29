/**
 * Portfolio Reorder Hook
 * Sprint 1: Story 2 - Portfolio Reordering with DnD
 *
 * Provides drag-and-drop reordering functionality for portfolio items
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { reorderPortfolio, type PortfolioResponse } from '@/lib/api/portfolio';
import { useAuthState } from '@/hooks/shared/useAuth';
import { logger } from '@/lib/shared/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UsePortfolioReorderReturn {
  // State
  isReordering: boolean;
  isSaving: boolean;
  hasChanges: boolean;

  // Actions
  reorderItems: (items: PortfolioResponse[]) => void;
  saveOrder: () => Promise<boolean>;
  resetOrder: () => void;

  // Current state
  orderedItems: PortfolioResponse[];
}

// ============================================================================
// HOOK
// ============================================================================

export function usePortfolioReorder(
  initialItems: PortfolioResponse[]
): UsePortfolioReorderReturn {
  const { user } = useAuthState();
  const [orderedItems, setOrderedItems] =
    useState<PortfolioResponse[]>(initialItems);
  const [originalItems, setOriginalItems] =
    useState<PortfolioResponse[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Check if order has changed
  const hasChanges = orderedItems.some(
    (item, index) => item.id !== originalItems[index]?.id
  );

  /**
   * Update the order of items (called during drag)
   */
  const reorderItems = useCallback((items: PortfolioResponse[]) => {
    setOrderedItems(items);
    setIsReordering(true);
  }, []);

  /**
   * Save the new order to backend
   */
  const saveOrder = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Lütfen giriş yapınız');
      return false;
    }

    if (!hasChanges) {
      toast.info('Değişiklik yapılmadı');
      return false;
    }

    setIsSaving(true);
    try {
      logger.info('[usePortfolioReorder] Saving new order', {
        itemCount: orderedItems.length,
      });

      // Extract IDs in the new order
      const portfolioIds = orderedItems.map((item) => item.id);

      // Call backend API
      await reorderPortfolio(portfolioIds);

      // Update the original items to reflect saved state
      setOriginalItems(orderedItems);
      setIsReordering(false);

      // Revalidate SWR cache
      await mutate(`/portfolios/user/${user.id}`);

      toast.success('Sıralama başarıyla kaydedildi! ✅');
      logger.info('[usePortfolioReorder] Order saved successfully');

      return true;
    } catch (err) {
      logger.error('[usePortfolioReorder] Save order failed', err);
      toast.error('Sıralama kaydedilemedi. Lütfen tekrar deneyin.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, orderedItems, hasChanges]);

  /**
   * Reset to original order (cancel changes)
   */
  const resetOrder = useCallback(() => {
    setOrderedItems(originalItems);
    setIsReordering(false);
    toast.info('Değişiklikler geri alındı');
    logger.info('[usePortfolioReorder] Order reset to original');
  }, [originalItems]);

  // Update items when initialItems change
  useState(() => {
    setOrderedItems(initialItems);
    setOriginalItems(initialItems);
  });

  return {
    isReordering,
    isSaving,
    hasChanges,
    reorderItems,
    saveOrder,
    resetOrder,
    orderedItems,
  };
}

export default usePortfolioReorder;
