import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import logger from '@/lib/infrastructure/monitoring/logger';

export type ProposalStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | null;

export interface Proposal {
  id: string;
  job: {
    id: string;
    title: string;
    budget?: {
      min: number;
      max: number;
      type: string;
    };
    employer: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  coverLetter: string;
  bidAmount: number;
  deliveryTime: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  isViewed: boolean;
  submittedAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  acceptanceRate: number;
}

interface UseFreelancerProposalsOptions {
  status?: ProposalStatus;
  page?: number;
  size?: number;
}

interface UseFreelancerProposalsResult {
  proposals: Proposal[];
  stats: ProposalStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
  setStatus: (status: ProposalStatus) => void;
  withdrawProposal: (proposalId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage freelancer proposals
 *
 * Features:
 * - Fetch proposals with pagination
 * - Filter by status
 * - Calculate statistics
 * - Withdraw proposals
 * - Optimistic updates
 *
 * @param options - Filter and pagination options
 * @returns Proposals data and actions
 */
export function useFreelancerProposals(
  options: UseFreelancerProposalsOptions = {}
): UseFreelancerProposalsResult {
  const { addToast } = useUIStore();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<ProposalStatus>(
    options.status || null
  );
  const [page, setPage] = useState(options.page || 0);
  const [size] = useState(options.size || 20);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Calculate stats from proposals
  const calculateStats = useCallback(
    (allProposals: Proposal[]): ProposalStats => {
      const total = allProposals.length;
      const pending = allProposals.filter((p) => p.status === 'PENDING').length;
      const accepted = allProposals.filter(
        (p) => p.status === 'ACCEPTED'
      ).length;
      const rejected = allProposals.filter(
        (p) => p.status === 'REJECTED'
      ).length;
      const withdrawn = allProposals.filter(
        (p) => p.status === 'WITHDRAWN'
      ).length;
      const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

      return {
        total,
        pending,
        accepted,
        rejected,
        withdrawn,
        acceptanceRate: Math.round(acceptanceRate),
      };
    },
    []
  );

  // Fetch proposals
  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(
        `/api/v1/proposals/me?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Teklifler yüklenemedi');
      }

      // Handle both paginated and non-paginated responses
      const proposalsData = data.data?.content || data.data || [];
      setProposals(proposalsData);

      // Update pagination
      if (data.data?.page !== undefined) {
        setPagination({
          page: data.data.page,
          size: data.data.size,
          totalElements: data.data.totalElements,
          totalPages: data.data.totalPages,
        });
      }

      // Fetch all proposals for stats (without status filter)
      if (statusFilter) {
        // If filtered, fetch all for accurate stats
        const statsResponse = await fetch('/api/v1/proposals/me', {
          credentials: 'include',
        });
        const statsData = await statsResponse.json();
        const allProposals = statsData.data?.content || statsData.data || [];
        setStats(calculateStats(allProposals));
      } else {
        // Use current proposals for stats
        setStats(calculateStats(proposalsData));
      }

      logger.debug('[useFreelancerProposals] Proposals fetched:', { countproposalsDatalength, statusstatusFilter, page,  });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      logger.error('[useFreelancerProposals] Error:', err instanceof Error ? err : new Error(String(err)));

      addToast({
        title: 'Hata',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, size, statusFilter, addToast, calculateStats]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Withdraw proposal
  const withdrawProposal = useCallback(
    async (proposalId: string) => {
      try {
        const response = await fetch(
          `/api/v1/proposals/${proposalId}/withdraw`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Teklif geri çekilemedi');
        }

        // Optimistic update
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposalId ? { ...p, status: 'WITHDRAWN' as const } : p
          )
        );

        // Recalculate stats
        const updatedProposals = proposals.map((p) =>
          p.id === proposalId ? { ...p, status: 'WITHDRAWN' as const } : p
        );
        setStats(calculateStats(updatedProposals));

        addToast({
          title: 'Başarılı',
          description: 'Teklif geri çekildi',
          type: 'success',
          duration: 3000,
        });

        logger.info('[useFreelancerProposals] Proposal withdrawn:', proposalId);

        // Refetch to get updated data
        await fetchProposals();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';

        addToast({
          title: 'Hata',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });

        logger.error('[useFreelancerProposals] Withdraw error:', err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [proposals, addToast, calculateStats, fetchProposals]
  );

  // Update status filter
  const handleSetStatus = useCallback((newStatus: ProposalStatus) => {
    setStatusFilter(newStatus);
    setPage(0); // Reset to first page when filtering
  }, []);

  // Update page
  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    proposals,
    stats,
    isLoading,
    error,
    pagination,
    setPage: handleSetPage,
    setStatus: handleSetStatus,
    withdrawProposal,
    refetch: fetchProposals,
  };
}
