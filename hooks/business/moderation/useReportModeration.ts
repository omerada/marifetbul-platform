/**
 * ================================================
 * USE REPORT MODERATION HOOK
 * ================================================
 * Dedicated hook for moderator report management
 *
 * Features:
 * - Fetch pending/flagged reports
 * - Investigate and take action
 * - Dismiss reports
 * - Escalate to admin
 * - Priority and type filtering
 * - Real-time stats updates
 *
 * Sprint 1 - Story 1.3: Reports Dashboard
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { logger } from '@/lib/shared/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ReportStatus =
  | 'PENDING'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'ESCALATED';
export type ReportType =
  | 'USER'
  | 'CONTENT'
  | 'REVIEW'
  | 'COMMENT'
  | 'PACKAGE'
  | 'OTHER';
export type ReportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type ReportAction =
  | 'WARN'
  | 'SUSPEND'
  | 'BAN'
  | 'REMOVE_CONTENT'
  | 'EDIT_CONTENT'
  | 'NO_ACTION';

export interface Report {
  id: string;
  reportType: ReportType;
  status: ReportStatus;
  priority: ReportPriority;
  reason: string;
  description: string;
  reporterId: string;
  reporterUsername?: string;
  reporterEmail?: string;
  entityType: string;
  entityId: string;
  entityDescription?: string;
  assignedModeratorId?: string;
  assignedModeratorUsername?: string;
  moderatorNotes?: string;
  actionTaken?: ReportAction;
  reporterNotified: boolean;
  entityOwnerNotified: boolean;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface ReportModerationFilters {
  status?: ReportStatus;
  type?: ReportType;
  priority?: ReportPriority;
  assignedToMe?: boolean;
  unassigned?: boolean;
}

export interface ReportModerationStats {
  total: number;
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
  escalated: number;
  byPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  byType: {
    user: number;
    content: number;
    review: number;
    comment: number;
    other: number;
  };
  avgResolutionTime: number; // in hours
}

export interface ReportModerationResponse {
  reports: Report[];
  stats: ReportModerationStats;
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseReportModerationOptions {
  autoFetch?: boolean;
  filters?: ReportModerationFilters;
  pageSize?: number;
}

export interface UseReportModerationReturn {
  reports: Report[];
  stats: ReportModerationStats | null;
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  isProcessing: boolean;
  selectedReports: string[];
  assignToMe: (reportId: string) => Promise<boolean>;
  investigate: (reportId: string) => Promise<boolean>;
  resolve: (
    reportId: string,
    action: ReportAction,
    notes: string
  ) => Promise<boolean>;
  dismiss: (reportId: string, reason: string) => Promise<boolean>;
  escalate: (reportId: string, notes: string) => Promise<boolean>;
  bulkDismiss: (reportIds: string[], reason: string) => Promise<boolean>;
  bulkEscalate: (reportIds: string[]) => Promise<boolean>;
  refresh: () => void;
  toggleSelection: (reportId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (reportId: string) => boolean;
  currentPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export function useReportModeration(
  options: UseReportModerationOptions = {}
): UseReportModerationReturn {
  const { autoFetch = true, filters = {}, pageSize = 20 } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Build cache key
  const cacheKey = autoFetch
    ? [
        '/api/v1/moderator/reports',
        currentPage,
        pageSize,
        JSON.stringify(filters),
      ]
    : null;

  // Fetch reports with SWR
  const { data, error, isLoading, mutate } = useSWR<ReportModerationResponse>(
    cacheKey,
    async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.unassigned) params.append('unassigned', 'true');
      if (filters.assignedToMe) params.append('assignedToMe', 'true');

      const response = await fetch(`/api/v1/moderator/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reports');

      const result = await response.json();

      return {
        reports: result.data.content || [],
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
  const fetchStats = async (): Promise<ReportModerationStats> => {
    try {
      const response = await fetch('/api/v1/moderator/reports/statistics');
      const result = await response.json();

      if (result.success && result.data) {
        const s = result.data;
        return {
          total: s.totalReports || 0,
          pending: s.byStatus?.PENDING || 0,
          investigating: s.byStatus?.INVESTIGATING || 0,
          resolved: s.byStatus?.RESOLVED || 0,
          dismissed: s.byStatus?.DISMISSED || 0,
          escalated: s.byStatus?.ESCALATED || 0,
          byPriority: {
            urgent: s.byPriority?.URGENT || 0,
            high: s.byPriority?.HIGH || 0,
            normal: s.byPriority?.NORMAL || 0,
            low: s.byPriority?.LOW || 0,
          },
          byType: {
            user: s.byType?.USER || 0,
            content: s.byType?.CONTENT || 0,
            review: s.byType?.REVIEW || 0,
            comment: s.byType?.COMMENT || 0,
            other: s.byType?.OTHER || 0,
          },
          avgResolutionTime: s.avgResolutionTimeHours || 0,
        };
      }

      throw new Error('Invalid stats');
    } catch (error) {
      logger.error('Failed to fetch report stats:', error);
      return {
        total: 0,
        pending: 0,
        investigating: 0,
        resolved: 0,
        dismissed: 0,
        escalated: 0,
        byPriority: { urgent: 0, high: 0, normal: 0, low: 0 },
        byType: { user: 0, content: 0, review: 0, comment: 0, other: 0 },
        avgResolutionTime: 0,
      };
    }
  };

  // ============================================================================
  // SELECTION (Define first to avoid hoisting issues)
  // ============================================================================

  const toggleSelection = useCallback((reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (data?.reports) setSelectedReports(data.reports.map((r) => r.id));
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedReports([]);
  }, []);

  const isSelected = useCallback(
    (reportId: string) => selectedReports.includes(reportId),
    [selectedReports]
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const assignToMe = useCallback(
    async (reportId: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/moderator/reports/${reportId}/assign`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) throw new Error('Failed to assign');
        await mutate();
        toast.success('Rapor size atandı');
        logger.info('Report assigned', { reportId });
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

  const investigate = useCallback(
    async (reportId: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/moderator/reports/${reportId}/investigate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) throw new Error('Failed to start investigation');
        await mutate();
        toast.success('İnceleme başlatıldı');
        logger.info('Investigation started', { reportId });
        return true;
      } catch (error) {
        logger.error('Investigation failed:', error);
        toast.error('İnceleme başlatma başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const resolve = useCallback(
    async (
      reportId: string,
      action: ReportAction,
      notes: string
    ): Promise<boolean> => {
      if (!notes || notes.length < 10) {
        toast.error('Notlar en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/moderator/reports/${reportId}/resolve`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actionTaken: action,
              moderatorNotes: notes,
              notifyReporter: true,
              notifyEntityOwner: action !== 'NO_ACTION',
            }),
          }
        );

        if (!response.ok) throw new Error('Failed to resolve');
        await mutate();
        toast.success('Rapor çözüldü');
        logger.info('Report resolved', { reportId, action });
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

  const dismiss = useCallback(
    async (reportId: string, reason: string): Promise<boolean> => {
      if (!reason || reason.length < 10) {
        toast.error('Red nedeni en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/moderator/reports/${reportId}/dismiss`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          }
        );

        if (!response.ok) throw new Error('Failed to dismiss');
        await mutate();
        toast.success('Rapor reddedildi');
        logger.info('Report dismissed', { reportId });
        return true;
      } catch (error) {
        logger.error('Dismiss failed:', error);
        toast.error('Reddetme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const escalate = useCallback(
    async (reportId: string, notes: string): Promise<boolean> => {
      if (!notes || notes.length < 10) {
        toast.error('Yükseltme notları en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `/api/v1/moderator/reports/${reportId}/escalate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
          }
        );

        if (!response.ok) throw new Error('Failed to escalate');
        await mutate();
        toast.success('Rapor yöneticiye yükseltildi');
        logger.info('Report escalated', { reportId });
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

  const bulkDismiss = useCallback(
    async (reportIds: string[], reason: string): Promise<boolean> => {
      if (reportIds.length === 0) {
        toast.error('Lütfen en az bir rapor seçin');
        return false;
      }

      if (!reason || reason.length < 10) {
        toast.error('Red nedeni en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);
      try {
        const results = await Promise.allSettled(
          reportIds.map((id) =>
            fetch(`/api/v1/moderator/reports/${id}/dismiss`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason }),
            })
          )
        );

        const successful = results.filter(
          (r) => r.status === 'fulfilled'
        ).length;
        const failed = reportIds.length - successful;

        await mutate();
        clearSelection();

        if (failed === 0) {
          toast.success(`${successful} rapor reddedildi`);
          logger.info('Bulk dismiss success', { count: successful });
          return true;
        } else {
          toast.warning(`${successful} başarılı, ${failed} başarısız`);
          logger.warn('Bulk dismiss partial', { successful, failed });
          return false;
        }
      } catch (error) {
        logger.error('Bulk dismiss failed:', error);
        toast.error('Toplu reddetme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate, clearSelection]
  );

  const bulkEscalate = useCallback(
    async (reportIds: string[]): Promise<boolean> => {
      if (reportIds.length === 0) {
        toast.error('Lütfen en az bir rapor seçin');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          '/api/v1/moderator/reports/bulk/escalate',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportIds }),
          }
        );

        if (!response.ok) throw new Error('Failed to bulk escalate');

        await mutate();
        clearSelection();
        toast.success(`${reportIds.length} rapor yükseltildi`);
        logger.info('Bulk escalate success', { count: reportIds.length });
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
    reports: data?.reports ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? null,
    isLoading,
    error: error ?? null,
    isProcessing,
    selectedReports,
    assignToMe,
    investigate,
    resolve,
    dismiss,
    escalate,
    bulkDismiss,
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
