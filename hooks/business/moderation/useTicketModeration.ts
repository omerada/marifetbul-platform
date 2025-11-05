/**
 * ==================================================
 * USE TICKET MODERATION HOOK
 * ================================================
 * Dedicated hook for moderator ticket/support management
 *
 * Sprint 1 - Story 1.2: Ticket Management System
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { logger } from '@/lib/shared/utils/logger';
import type {
  SupportTicket,
  TicketStatus as TypesTicketStatus,
  TicketPriority as TypesTicketPriority,
} from '@/types/business/features/support';

// Re-export types
export type TicketStatus = TypesTicketStatus;
export type TicketPriority = TypesTicketPriority;

// ============================================================================
// TYPES
// ============================================================================

export interface TicketModerationFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assignedToMe?: boolean;
  unassigned?: boolean;
  needsResponse?: boolean;
}

export interface TicketModerationStats {
  total: number;
  open: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  avgResponseTime: number;
  needingResponse: number;
}

export interface TicketModerationResponse {
  tickets: SupportTicket[];
  stats: TicketModerationStats;
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface UseTicketModerationOptions {
  autoFetch?: boolean;
  filters?: TicketModerationFilters;
  pageSize?: number;
}

export interface UseTicketModerationReturn {
  tickets: SupportTicket[];
  stats: TicketModerationStats | null;
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  isProcessing: boolean;
  selectedTickets: string[];
  assignTicket: (ticketId: string, moderatorId?: string) => Promise<boolean>;
  resolveTicket: (ticketId: string, resolution: string) => Promise<boolean>;
  closeTicket: (ticketId: string, notes?: string) => Promise<boolean>;
  addResponse: (
    ticketId: string,
    message: string,
    isInternal?: boolean
  ) => Promise<boolean>;
  updatePriority: (
    ticketId: string,
    priority: TicketPriority
  ) => Promise<boolean>;
  escalateTicket: (ticketId: string) => Promise<boolean>;
  bulkAssign: (ticketIds: string[], moderatorId: string) => Promise<boolean>;
  bulkEscalate: (ticketIds: string[]) => Promise<boolean>;
  refresh: () => void;
  toggleSelection: (ticketId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (ticketId: string) => boolean;
  currentPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useTicketModeration(
  options: UseTicketModerationOptions = {}
): UseTicketModerationReturn {
  const { autoFetch = true, filters = {}, pageSize = 20 } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Build cache key
  const cacheKey = autoFetch
    ? [
        '/api/v1/support/tickets/admin/all',
        currentPage,
        pageSize,
        JSON.stringify(filters),
      ]
    : null;

  // Fetch tickets with SWR
  const { data, error, isLoading, mutate } = useSWR<TicketModerationResponse>(
    cacheKey,
    async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.unassigned) params.append('unassigned', 'true');
      if (filters.assignedToMe) params.append('assignedToMe', 'true');
      if (filters.needsResponse) params.append('needsResponse', 'true');

      const response = await fetch(
        `/api/v1/support/tickets/admin/all?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch tickets');

      const result = await response.json();

      return {
        tickets: result.data.content || [],
        stats: await fetchStats(),
        pagination: {
          page: result.data.number || 0,
          pageSize: result.data.size || pageSize,
          totalElements: result.data.totalElements || 0,
          totalPages: result.data.totalPages || 0,
        },
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Fetch stats separately
  const fetchStats = async (): Promise<TicketModerationStats> => {
    try {
      const response = await fetch('/api/v1/support/tickets/admin/statistics');
      const result = await response.json();

      if (result.success && result.data) {
        const s = result.data;
        return {
          total: s.totalTickets || 0,
          open: s.byStatus?.OPEN || 0,
          pending: s.byStatus?.PENDING || 0,
          inProgress: s.byStatus?.IN_PROGRESS || 0,
          resolved: s.byStatus?.RESOLVED || 0,
          closed: s.byStatus?.CLOSED || 0,
          byPriority: {
            urgent: s.byPriority?.URGENT || 0,
            high: s.byPriority?.HIGH || 0,
            normal: s.byPriority?.NORMAL || 0,
            low: s.byPriority?.LOW || 0,
          },
          avgResponseTime: s.avgResponseTimeHours || 0,
          needingResponse: s.ticketsNeedingResponse || 0,
        };
      }

      throw new Error('Invalid stats');
    } catch (error) {
      logger.error('Failed to fetch ticket stats:', error);
      return {
        total: 0,
        open: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        byPriority: { urgent: 0, high: 0, normal: 0, low: 0 },
        avgResponseTime: 0,
        needingResponse: 0,
      };
    }
  };

  // ============================================================================
  // SELECTION (Define first to avoid hoisting issues)
  // ============================================================================

  const toggleSelection = useCallback((ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (data?.tickets) setSelectedTickets(data.tickets.map((t) => t.id));
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedTickets([]);
  }, []);

  const isSelected = useCallback(
    (ticketId: string) => selectedTickets.includes(ticketId),
    [selectedTickets]
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const assignTicket = useCallback(
    async (ticketId: string, moderatorId?: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/support/tickets/${ticketId}/assign`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moderatorId }),
          }
        );

        if (!response.ok) throw new Error('Failed to assign');
        await mutate();
        toast.success(moderatorId ? 'Ticket atandı' : 'Ticket size atandı');
        logger.info('Ticket assigned', { ticketId, moderatorId });
        return true;
      } catch (error) {
        logger.error('Assign failed:', error);
        toast.error('Atama başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const resolveTicket = useCallback(
    async (ticketId: string, resolution: string): Promise<boolean> => {
      if (!resolution || resolution.length < 10) {
        toast.error('Çözüm açıklaması en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/support/tickets/${ticketId}/resolve`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolutionNotes: resolution }),
          }
        );

        if (!response.ok) throw new Error('Failed to resolve');
        await mutate();
        toast.success('Ticket çözüldü');
        logger.info('Ticket resolved', { ticketId });
        return true;
      } catch (error) {
        logger.error('Resolve failed:', error);
        toast.error('Çözme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const closeTicket = useCallback(
    async (ticketId: string, notes?: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/support/tickets/${ticketId}/close`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolutionNotes: notes }),
          }
        );

        if (!response.ok) throw new Error('Failed to close');
        await mutate();
        toast.success('Ticket kapatıldı');
        logger.info('Ticket closed', { ticketId });
        return true;
      } catch (error) {
        logger.error('Close failed:', error);
        toast.error('Kapatma başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const addResponse = useCallback(
    async (
      ticketId: string,
      message: string,
      isInternal = false
    ): Promise<boolean> => {
      if (!message || message.length < 5) {
        toast.error('Mesaj en az 5 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/support/tickets/${ticketId}/responses`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message, isInternal }),
          }
        );

        if (!response.ok) throw new Error('Failed to add response');
        await mutate();
        toast.success('Yanıt eklendi');
        logger.info('Response added', { ticketId, isInternal });
        return true;
      } catch (error) {
        logger.error('Add response failed:', error);
        toast.error('Yanıt ekleme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const updatePriority = useCallback(
    async (ticketId: string, priority: TicketPriority): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(`/api/v1/support/tickets/${ticketId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority }),
        });

        if (!response.ok) throw new Error('Failed to update priority');
        await mutate();
        toast.success('Öncelik güncellendi');
        logger.info('Priority updated', { ticketId, priority });
        return true;
      } catch (error) {
        logger.error('Update priority failed:', error);
        toast.error('Güncelleme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const bulkAssign = useCallback(
    async (ticketIds: string[], moderatorId: string): Promise<boolean> => {
      if (ticketIds.length === 0) {
        toast.error('Lütfen en az bir ticket seçin');
        return false;
      }

      setIsProcessing(true);
      try {
        const results = await Promise.allSettled(
          ticketIds.map((id) =>
            fetch(`/api/v1/support/tickets/${id}/assign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ moderatorId }),
            })
          )
        );

        const successful = results.filter(
          (r) => r.status === 'fulfilled'
        ).length;
        const failed = ticketIds.length - successful;

        await mutate();
        clearSelection();

        if (failed === 0) {
          toast.success(`${successful} ticket atandı`);
          logger.info('Bulk assign success', { count: successful });
          return true;
        } else {
          toast.warning(`${successful} başarılı, ${failed} başarısız`);
          logger.warn('Bulk assign partial', { successful, failed });
          return false;
        }
      } catch (error) {
        logger.error('Bulk assign failed:', error);
        toast.error('Toplu atama başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate, clearSelection]
  );

  const escalateTicket = useCallback(
    async (ticketId: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/support/tickets/${ticketId}/escalate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) throw new Error('Failed to escalate ticket');
        await mutate();
        toast.success('Ticket yükseltildi');
        logger.info('Ticket escalated', { ticketId });
        return true;
      } catch (error) {
        logger.error('Escalate failed:', error);
        toast.error('Yükseltme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const bulkEscalate = useCallback(
    async (ticketIds: string[]): Promise<boolean> => {
      if (ticketIds.length === 0) {
        toast.error('Lütfen en az bir ticket seçin');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch('/api/v1/support/tickets/bulk/escalate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketIds: ticketIds.map(Number) }),
        });

        if (!response.ok) throw new Error('Failed to bulk escalate');

        await mutate();
        clearSelection();
        toast.success(`${ticketIds.length} ticket yükseltildi`);
        logger.info('Bulk escalate success', { count: ticketIds.length });
        return true;
      } catch (error) {
        logger.error('Bulk escalate failed:', error);
        toast.error('Toplu yükseltme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate, clearSelection]
  );

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      clearSelection();
    },
    [clearSelection]
  );

  const nextPage = useCallback(() => {
    if (data?.pagination && currentPage < data.pagination.totalPages - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, data, goToPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    tickets: data?.tickets ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? null,
    isLoading,
    error: error ?? null,
    isProcessing,
    selectedTickets,
    assignTicket,
    resolveTicket,
    closeTicket,
    addResponse,
    updatePriority,
    escalateTicket,
    bulkAssign,
    bulkEscalate,
    refresh: mutate,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    currentPage,
    goToPage,
    nextPage,
    previousPage,
  };
}
