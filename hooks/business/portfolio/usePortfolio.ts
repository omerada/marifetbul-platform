/**
 * Portfolio CRUD Hook
 * Sprint 1: Portfolio & Analytics System
 *
 * Provides comprehensive portfolio management functionality
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import {
  createPortfolio,
  updatePortfolio as updatePortfolioApi,
  deletePortfolio as deletePortfolioApi,
  getUserPortfolio,
  type PortfolioResponse,
  type CreatePortfolioRequest,
  type UpdatePortfolioRequest,
} from '@/lib/api/portfolio';
import { useAuthState } from '@/hooks/shared/useAuth';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UsePortfolioReturn {
  // State
  portfolios: PortfolioResponse[];
  isLoading: boolean;
  error: Error | null;

  // CRUD Operations
  createNewPortfolio: (
    data: CreatePortfolioRequest
  ) => Promise<PortfolioResponse | null>;
  updateExistingPortfolio: (
    portfolioId: string,
    data: UpdatePortfolioRequest
  ) => Promise<PortfolioResponse | null>;
  deleteExistingPortfolio: (portfolioId: string) => Promise<boolean>;
  refreshPortfolios: () => Promise<void>;

  // State
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuthState();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user's portfolios
  const {
    data: portfoliosData,
    error,
    isLoading,
  } = useSWR(
    user?.id ? `/portfolios/user/${user.id}` : null,
    () => (user?.id ? getUserPortfolio(user.id, 0, 100) : null),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const portfolios = portfoliosData?.content || [];

  /**
   * Create new portfolio
   */
  const createNewPortfolio = useCallback(
    async (data: CreatePortfolioRequest): Promise<PortfolioResponse | null> => {
      if (!user?.id) {
        toast.error('Lütfen giriş yapınız');
        return null;
      }

      setIsCreating(true);
      try {
        logger.info('[usePortfolio] Creating portfolio', { data });

        const newPortfolio = await createPortfolio(data);

        // Optimistic update
        await mutate(`/portfolios/user/${user.id}`);

        toast.success('Portfolio başarıyla oluşturuldu! 🎉');
        logger.info('[usePortfolio] Portfolio created', { portfolioIdnewPortfolioid,  });

        return newPortfolio;
      } catch (err) {
        logger.error('[usePortfolio] Create portfolio failed', err instanceof Error ? err : new Error(String(err)));
        toast.error('Portfolio oluşturulamadı. Lütfen tekrar deneyin.');
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [user?.id]
  );

  /**
   * Update existing portfolio
   */
  const updateExistingPortfolio = useCallback(
    async (
      portfolioId: string,
      data: UpdatePortfolioRequest
    ): Promise<PortfolioResponse | null> => {
      if (!user?.id) {
        toast.error('Lütfen giriş yapınız');
        return null;
      }

      setIsUpdating(true);
      try {
        logger.info('[usePortfolio] Updating portfolio', { portfolioId, data,  });

        const updatedPortfolio = await updatePortfolioApi(portfolioId, data);

        // Optimistic update
        await mutate(`/portfolios/user/${user.id}`);

        toast.success('Portfolio başarıyla güncellendi! ✅');
        logger.info('[usePortfolio] Portfolio updated', { portfolioId });

        return updatedPortfolio;
      } catch (err) {
        logger.error('[usePortfolio] Update portfolio failed', err instanceof Error ? err : new Error(String(err)));
        toast.error('Portfolio güncellenemedi. Lütfen tekrar deneyin.');
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [user?.id]
  );

  /**
   * Delete portfolio
   */
  const deleteExistingPortfolio = useCallback(
    async (portfolioId: string): Promise<boolean> => {
      if (!user?.id) {
        toast.error('Lütfen giriş yapınız');
        return false;
      }

      setIsDeleting(true);
      try {
        logger.info('[usePortfolio] Deleting portfolio', { portfolioId });

        await deletePortfolioApi(portfolioId);

        // Optimistic update
        await mutate(`/portfolios/user/${user.id}`);

        toast.success('Portfolio başarıyla silindi! 🗑️');
        logger.info('[usePortfolio] Portfolio deleted', { portfolioId });

        return true;
      } catch (err) {
        logger.error('[usePortfolio] Delete portfolio failed', err instanceof Error ? err : new Error(String(err)));
        toast.error('Portfolio silinemedi. Lütfen tekrar deneyin.');
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [user?.id]
  );

  /**
   * Refresh portfolios
   */
  const refreshPortfolios = useCallback(async () => {
    if (user?.id) {
      await mutate(`/portfolios/user/${user.id}`);
    }
  }, [user?.id]);

  return {
    portfolios,
    isLoading,
    error: error || null,
    createNewPortfolio,
    updateExistingPortfolio,
    deleteExistingPortfolio,
    refreshPortfolios,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

export default usePortfolio;
