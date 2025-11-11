/**
 * @fileoverview Moderation History Hooks
 * @description Production-ready hooks for moderation audit trail
 * @module hooks/business/admin/useModerationHistory
 */

'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  moderationHistoryApi,
  type ModerationHistory,
  type RecordModerationRequest,
  type ReverseActionRequest,
  type HistoryFilters,
  type ModerationStats,
  type ContentType,
} from '@/lib/api/moderation-history';
import type { PageResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useAuth } from '@/hooks/shared/useAuth';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const moderationHistoryKeys = {
  all: ['moderation-history'] as const,
  lists: () => [...moderationHistoryKeys.all, 'list'] as const,
  list: (filters: HistoryFilters) =>
    [...moderationHistoryKeys.lists(), filters] as const,
  detail: (id: string) => [...moderationHistoryKeys.all, 'detail', id] as const,
  moderator: (moderatorId: string, page: number, size: number) =>
    [
      ...moderationHistoryKeys.all,
      'moderator',
      moderatorId,
      page,
      size,
    ] as const,
  content: (
    contentType: ContentType,
    contentId: string,
    page: number,
    size: number
  ) =>
    [
      ...moderationHistoryKeys.all,
      'content',
      contentType,
      contentId,
      page,
      size,
    ] as const,
  targetUser: (userId: string, page: number, size: number) =>
    [...moderationHistoryKeys.all, 'target-user', userId, page, size] as const,
  appeal: (appealId: string) =>
    [...moderationHistoryKeys.all, 'appeal', appealId] as const,
  stats: (moderatorId: string, days: number) =>
    [...moderationHistoryKeys.all, 'stats', moderatorId, days] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook for searching moderation history
 * Admin/Moderator only
 */
export function useModerationHistory(filters: HistoryFilters = {}) {
  return useQuery({
    queryKey: moderationHistoryKeys.list(filters),
    queryFn: () => moderationHistoryApi.searchHistory(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching history by ID
 */
export function useHistoryById(historyId: string | null) {
  return useQuery({
    queryKey: moderationHistoryKeys.detail(historyId || ''),
    queryFn: () => moderationHistoryApi.getHistoryById(historyId!),
    enabled: !!historyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for moderator's action history
 */
export function useModeratorHistory(
  moderatorId: string | null,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: moderationHistoryKeys.moderator(moderatorId || '', page, size),
    queryFn: () =>
      moderationHistoryApi.getModeratorHistory(moderatorId!, page, size),
    enabled: !!moderatorId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for content moderation history
 */
export function useContentHistory(
  contentType: ContentType | null,
  contentId: string | null,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: moderationHistoryKeys.content(
      contentType || 'REVIEW',
      contentId || '',
      page,
      size
    ),
    queryFn: () =>
      moderationHistoryApi.getContentHistory(
        contentType!,
        contentId!,
        page,
        size
      ),
    enabled: !!contentType && !!contentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for user's moderation history (as target)
 */
export function useTargetUserHistory(
  userId: string | null,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: moderationHistoryKeys.targetUser(userId || '', page, size),
    queryFn: () =>
      moderationHistoryApi.getTargetUserHistory(userId!, page, size),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for appeal-related history
 */
export function useAppealHistory(appealId: string | null) {
  return useQuery({
    queryKey: moderationHistoryKeys.appeal(appealId || ''),
    queryFn: () => moderationHistoryApi.getAppealHistory(appealId!),
    enabled: !!appealId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for moderator statistics
 * Admin only
 */
export function useModeratorStats(
  moderatorId: string | null,
  days: number = 30
) {
  return useQuery({
    queryKey: moderationHistoryKeys.stats(moderatorId || '', days),
    queryFn: () => moderationHistoryApi.getModeratorStats(moderatorId!, days),
    enabled: !!moderatorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook for recording moderation action
 */
export function useRecordModerationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordModerationRequest) =>
      moderationHistoryApi.recordModerationAction(request),
    onSuccess: (data: ModerationHistory) => {
      // Invalidate all history lists
      queryClient.invalidateQueries({
        queryKey: moderationHistoryKeys.lists(),
      });
      // Invalidate moderator-specific queries
      queryClient.invalidateQueries({
        queryKey: moderationHistoryKeys.moderator(data.moderatorId, 0, 20),
      });
      // Invalidate content-specific queries
      queryClient.invalidateQueries({
        queryKey: moderationHistoryKeys.content(
          data.contentType,
          data.contentId,
          0,
          20
        ),
      });
      // Invalidate target user queries if applicable
      if (data.targetUserId) {
        queryClient.invalidateQueries({
          queryKey: moderationHistoryKeys.targetUser(data.targetUserId, 0, 20),
        });
      }
      logger.info('Moderation action recorded', {
        historyId: data.id,
        actionType: data.actionType,
      });
    },
    onError: (error: Error) => {
      logger.error('Failed to record moderation action', error);
    },
  });
}

/**
 * Hook for reversing moderation action
 * Admin only
 */
export function useReverseAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      historyId,
      request,
    }: {
      historyId: string;
      request: ReverseActionRequest;
    }) => moderationHistoryApi.reverseAction(historyId, request),
    onSuccess: (data: ModerationHistory) => {
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: moderationHistoryKeys.lists(),
      });
      // Update detail cache
      queryClient.setQueryData(moderationHistoryKeys.detail(data.id), data);
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: moderationHistoryKeys.stats(data.moderatorId, 30),
      });
      logger.info('Moderation action reversed', {
        historyId: data.id,
        reversedBy: data.reversedBy,
      });
    },
    onError: (error: Error) => {
      logger.error('Failed to reverse moderation action', error);
    },
  });
}

/**
 * Hook for linking history to appeal
 */
export function useLinkToAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      historyId,
      appealId,
    }: {
      historyId: string;
      appealId: string;
    }) => moderationHistoryApi.linkToAppeal(historyId, appealId),
    onSuccess: (data: ModerationHistory) => {
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: moderationHistoryKeys.lists(),
      });
      // Update detail cache
      queryClient.setQueryData(moderationHistoryKeys.detail(data.id), data);
      // Invalidate appeal history
      if (data.appealId) {
        queryClient.invalidateQueries({
          queryKey: moderationHistoryKeys.appeal(data.appealId),
        });
      }
      logger.info('History linked to appeal', {
        historyId: data.id,
        appealId: data.appealId,
      });
    },
    onError: (error: Error) => {
      logger.error('Failed to link history to appeal', error);
    },
  });
}

// ============================================================================
// COMPOSITE HOOKS
// ============================================================================

export interface UseModerationAuditOptions {
  filters?: HistoryFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseModerationAuditReturn {
  // Data
  history: PageResponse<ModerationHistory> | undefined;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Mutations
  recordAction: ReturnType<typeof useRecordModerationAction>['mutate'];
  reverseAction: ReturnType<typeof useReverseAction>['mutate'];
  linkToAppeal: ReturnType<typeof useLinkToAppeal>['mutate'];

  // Mutation states
  isRecording: boolean;
  isReversing: boolean;
  isLinking: boolean;

  // Actions
  refetch: () => void;
  updateFilters: (newFilters: HistoryFilters) => void;
}

/**
 * Composite hook for moderation audit trail
 * Provides complete audit functionality
 *
 * @example
 * ```tsx
 * const {
 *   history,
 *   recordAction,
 *   reverseAction,
 *   isLoading,
 *   refetch,
 * } = useModerationAudit({
 *   filters: { moderatorId: 'mod-123' },
 *   autoRefresh: true,
 * });
 * ```
 */
export function useModerationAudit(
  options: UseModerationAuditOptions = {}
): UseModerationAuditReturn {
  const {
    filters: initialFilters = {},
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [filters, setFilters] = useState<HistoryFilters>(initialFilters);

  // Query
  const historyQuery = useQuery({
    queryKey: moderationHistoryKeys.list(filters),
    queryFn: () => moderationHistoryApi.searchHistory(filters),
    staleTime: 1000 * 60 * 2,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Mutations
  const recordMutation = useRecordModerationAction();
  const reverseMutation = useReverseAction();
  const linkMutation = useLinkToAppeal();

  // Actions
  const refetch = useCallback(() => {
    historyQuery.refetch();
  }, [historyQuery]);

  const updateFilters = useCallback((newFilters: HistoryFilters) => {
    setFilters(newFilters);
  }, []);

  return {
    // Data
    history: historyQuery.data,

    // Loading states
    isLoading: historyQuery.isLoading,
    isRefreshing: historyQuery.isRefetching,

    // Mutations
    recordAction: recordMutation.mutate,
    reverseAction: reverseMutation.mutate,
    linkToAppeal: linkMutation.mutate,

    // Mutation states
    isRecording: recordMutation.isPending,
    isReversing: reverseMutation.isPending,
    isLinking: linkMutation.isPending,

    // Actions
    refetch,
    updateFilters,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for recording moderation action with automatic tracking
 * Automatically retrieves moderator info from auth context
 */
export function useTrackModerationAction() {
  const recordMutation = useRecordModerationAction();
  const { user } = useAuth();

  const trackAction = useCallback(
    async (
      actionType: ModerationHistory['actionType'],
      contentType: ContentType,
      contentId: string,
      reason: string,
      options?: {
        targetUserId?: string;
        targetUserName?: string;
        severity?: ModerationHistory['severity'];
        internalNotes?: string;
        publicMessage?: string;
        beforeState?: Record<string, any>;
        afterState?: Record<string, any>;
        metadata?: Record<string, any>;
      }
    ) => {
      // Get current moderator info from auth context
      if (!user) {
        throw new Error(
          'User must be authenticated to perform moderation actions'
        );
      }

      const moderatorId = user.id;
      const moderatorName = user.name || `${user.email}`;
      const moderatorRole = user.role?.toUpperCase() || 'MODERATOR';

      const request: RecordModerationRequest = {
        moderatorId,
        moderatorName,
        moderatorRole,
        contentType,
        contentId,
        actionType,
        reason,
        ...options,
      };

      return recordMutation.mutateAsync(request);
    },
    [recordMutation, user]
  );

  return {
    trackAction,
    isTracking: recordMutation.isPending,
    error: recordMutation.error,
  };
}

/**
 * Hook for content moderation workflow
 */
export function useContentModeration(
  contentType: ContentType,
  contentId: string
) {
  const historyQuery = useContentHistory(contentType, contentId, 0, 10);
  const { trackAction, isTracking } = useTrackModerationAction();

  const approve = useCallback(
    (reason: string, publicMessage?: string) => {
      return trackAction('CONTENT_APPROVED', contentType, contentId, reason, {
        severity: 'INFO',
        publicMessage,
      });
    },
    [trackAction, contentType, contentId]
  );

  const reject = useCallback(
    (reason: string, publicMessage?: string) => {
      return trackAction('CONTENT_REJECTED', contentType, contentId, reason, {
        severity: 'MEDIUM',
        publicMessage,
      });
    },
    [trackAction, contentType, contentId]
  );

  const hide = useCallback(
    (reason: string, publicMessage?: string) => {
      return trackAction('CONTENT_HIDDEN', contentType, contentId, reason, {
        severity: 'MEDIUM',
        publicMessage,
      });
    },
    [trackAction, contentType, contentId]
  );

  const deleteContent = useCallback(
    (reason: string, publicMessage?: string) => {
      return trackAction('CONTENT_DELETED', contentType, contentId, reason, {
        severity: 'HIGH',
        publicMessage,
      });
    },
    [trackAction, contentType, contentId]
  );

  return {
    history: historyQuery.data,
    isLoading: historyQuery.isLoading || isTracking,
    approve,
    reject,
    hide,
    delete: deleteContent,
    refetch: historyQuery.refetch,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  ModerationHistory,
  RecordModerationRequest,
  ReverseActionRequest,
  HistoryFilters,
  ModerationStats,
  ContentType,
};
