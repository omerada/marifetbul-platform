/**
 * ================================================
 * USE PROPOSALS HOOK
 * ================================================
 * Custom hook for managing proposals (freelancer dashboard)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 * Sprint: Job Posting & Proposal System - Story 2
 */

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import type { PageResponse, ProposalResponse } from '@/types/backend-aligned';
import * as proposalsAPI from '@/lib/api/proposals';
import { logger } from '@/lib/shared/utils/logger';
import { toast } from 'sonner';
import type { ProposalStatus } from '@/lib/core/validations/proposals';

// ================================================
// TYPES
// ================================================

export interface ProposalFilters {
  status?: ProposalStatus;
  jobId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'newest' | 'amount_low' | 'amount_high' | 'delivery';
  page?: number;
  limit?: number;
}

export interface UseProposalsReturn {
  // Data
  proposals: ProposalResponse[];
  pagination: {
    page: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
  stats: {
    totalProposals: number;
    pendingProposals: number;
    acceptedProposals: number;
    rejectedProposals: number;
    withdrawnProposals: number;
  };

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isWithdrawing: boolean;
  isDeleting: boolean;

  // Error
  error: Error | null;

  // Actions
  createProposal: (
    data: proposalsAPI.CreateProposalRequest
  ) => Promise<ProposalResponse | null>;
  updateProposal: (
    id: string,
    data: proposalsAPI.UpdateProposalRequest
  ) => Promise<ProposalResponse | null>;
  withdrawProposal: (id: string) => Promise<boolean>;
  deleteProposal: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  setFilters: (filters: ProposalFilters) => void;
}

// ================================================
// HOOK
// ================================================

export function useProposals(
  initialFilters: ProposalFilters = {}
): UseProposalsReturn {
  const [filters, setFilters] = useState<ProposalFilters>({
    page: 1,
    limit: 10,
    sortBy: 'newest',
    ...initialFilters,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==================== DATA FETCHING ====================

  // Fetch user's proposals
  const {
    data: proposalsData,
    error,
    isLoading,
    mutate,
  } = useSWR<PageResponse<ProposalResponse>>(
    ['my-proposals', filters],
    async () => {
      const response = await proposalsAPI.getMyProposals(filters);
      return response;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Calculate stats from proposals
  const stats = {
    totalProposals: proposalsData?.totalElements || 0,
    pendingProposals:
      proposalsData?.content.filter((p) => p.status === 'PENDING').length || 0,
    acceptedProposals:
      proposalsData?.content.filter((p) => p.status === 'ACCEPTED').length || 0,
    rejectedProposals:
      proposalsData?.content.filter((p) => p.status === 'REJECTED').length || 0,
    withdrawnProposals:
      proposalsData?.content.filter((p) => p.status === 'WITHDRAWN').length ||
      0,
  };

  // ==================== ACTIONS ====================

  /**
   * Create new proposal
   */
  const createProposal = useCallback(
    async (
      data: proposalsAPI.CreateProposalRequest
    ): Promise<ProposalResponse | null> => {
      try {
        setIsCreating(true);
        logger.info('Creating proposal', { jobId: data.jobId });

        const newProposal = await proposalsAPI.createProposal(data);

        // Optimistic update
        await mutate();

        toast.success('Teklif gönderildi', {
          description: 'İşveren teklifinizi inceleyecektir',
        });

        logger.info('Proposal created successfully', {
          proposalId: newProposal.id,
        });
        return newProposal as unknown as ProposalResponse;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to create proposal', err);
        toast.error('Teklif gönderilemedi', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [mutate]
  );

  /**
   * Update existing proposal
   */
  const updateProposal = useCallback(
    async (
      id: string,
      data: proposalsAPI.UpdateProposalRequest
    ): Promise<ProposalResponse | null> => {
      try {
        setIsUpdating(true);
        logger.info('Updating proposal', { proposalId: id });

        const updatedProposal = await proposalsAPI.updateProposal(id, data);

        // Optimistic update
        await mutate();

        toast.success('Teklif güncellendi');

        logger.info('Proposal updated successfully', { proposalId: id });
        return updatedProposal as unknown as ProposalResponse;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to update proposal', err);
        toast.error('Teklif güncellenemedi', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [mutate]
  );

  /**
   * Withdraw proposal
   */
  const withdrawProposal = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsWithdrawing(true);
        logger.info('Withdrawing proposal', { proposalId: id });

        await proposalsAPI.withdrawProposal(id);

        // Optimistic update
        await mutate();

        toast.success('Teklif geri çekildi');

        logger.info('Proposal withdrawn successfully', { proposalId: id });
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to withdraw proposal', err);
        toast.error('Teklif geri çekilemedi', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return false;
      } finally {
        setIsWithdrawing(false);
      }
    },
    [mutate]
  );

  /**
   * Delete proposal
   */
  const deleteProposal = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        logger.info('Deleting proposal', { proposalId: id });

        await proposalsAPI.deleteProposal(id);

        // Optimistic update
        await mutate();

        toast.success('Teklif silindi');

        logger.info('Proposal deleted successfully', { proposalId: id });
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to delete proposal', err);
        toast.error('Teklif silinemedi', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [mutate]
  );

  /**
   * Refresh proposals list
   */
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  // ==================== LOG ERRORS ====================

  useEffect(() => {
    if (error) {
      logger.error('Proposals fetch error', error);
    }
  }, [error]);

  // ==================== RETURN ====================

  return {
    // Data
    proposals: proposalsData?.content || [],
    pagination: proposalsData
      ? {
          page: proposalsData.page || 0,
          totalPages: proposalsData.totalPages,
          totalElements: proposalsData.totalElements,
          hasNext: (proposalsData.page || 0) < proposalsData.totalPages - 1,
          hasPrevious: (proposalsData.page || 0) > 0,
        }
      : null,
    stats,

    // Loading States
    isLoading,
    isCreating,
    isUpdating,
    isWithdrawing,
    isDeleting,

    // Error
    error: error || null,

    // Actions
    createProposal,
    updateProposal,
    withdrawProposal,
    deleteProposal,
    refresh,
    setFilters,
  };
}
