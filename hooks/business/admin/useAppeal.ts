/**
 * @fileoverview Appeal Management Hooks
 * @description Production-ready hooks for appeal system
 * @module hooks/business/admin/useAppeal
 */

'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  appealApi,
  type Appeal,
  type CreateAppealRequest,
  type ResolveAppealRequest,
  type AppealFilters,
  type AppealStatistics,
} from '@/lib/api/appeal';
import type { PageResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const appealKeys = {
  all: ['appeals'] as const,
  lists: () => [...appealKeys.all, 'list'] as const,
  list: (filters: AppealFilters) => [...appealKeys.lists(), filters] as const,
  my: (page: number, size: number) => [...appealKeys.all, 'my', page, size] as const,
  assigned: (page: number, size: number) => [...appealKeys.all, 'assigned', page, size] as const,
  detail: (id: string) => [...appealKeys.all, 'detail', id] as const,
  stats: () => [...appealKeys.all, 'stats'] as const,
};

// ============================================================================
// LIST HOOKS
// ============================================================================

/**
 * Hook for fetching appeals with filters
 * Admin/Moderator only
 */
export function useAppeals(filters: AppealFilters = {}) {
  return useQuery({
    queryKey: appealKeys.list(filters),
    queryFn: () => appealApi.getAppeals(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching current user's appeals
 */
export function useMyAppeals(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: appealKeys.my(page, size),
    queryFn: () => appealApi.getMyAppeals(page, size),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching appeals assigned to current moderator
 * Moderator only
 */
export function useAssignedAppeals(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: appealKeys.assigned(page, size),
    queryFn: () => appealApi.getAssignedAppeals(page, size),
    staleTime: 1000 * 60, // 1 minute - more fresh for moderators
  });
}

/**
 * Hook for fetching appeal by ID
 */
export function useAppeal(appealId: string | null) {
  return useQuery({
    queryKey: appealKeys.detail(appealId || ''),
    queryFn: () => appealApi.getAppealById(appealId!),
    enabled: !!appealId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching appeal statistics
 * Admin only
 */
export function useAppealStatistics() {
  return useQuery({
    queryKey: appealKeys.stats(),
    queryFn: () => appealApi.getAppealStatistics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook for creating appeal
 */
export function useCreateAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAppealRequest) => appealApi.createAppeal(request),
    onSuccess: (data: Appeal) => {
      // Invalidate my appeals list
      queryClient.invalidateQueries({ queryKey: appealKeys.my(0, 20) });
      logger.info('Appeal created successfully', { appealId: data.id });
    },
    onError: (error: Error) => {
      logger.error('Failed to create appeal', error instanceof Error ? error : new Error(String(error)));
    },
  });
}

/**
 * Hook for resolving appeal
 * Moderator/Admin only
 */
export function useResolveAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appealId, request }: { appealId: string; request: ResolveAppealRequest }) =>
      appealApi.resolveAppeal(appealId, request),
    onSuccess: (data: Appeal) => {
      // Invalidate all appeal lists
      queryClient.invalidateQueries({ queryKey: appealKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appealKeys.assigned(0, 20) });
      queryClient.invalidateQueries({ queryKey: appealKeys.stats() });
      // Update detail cache
      queryClient.setQueryData(appealKeys.detail(data.id), data);
      logger.info('Appeal resolved successfully', { appealId: data.id, decision: data.decision });
    },
    onError: (error: Error) => {
      logger.error('Failed to resolve appeal', error instanceof Error ? error : new Error(String(error)));
    },
  });
}

/**
 * Hook for escalating appeal
 * Moderator only
 */
export function useEscalateAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appealId, reason }: { appealId: string; reason: string }) =>
      appealApi.escalateAppeal(appealId, reason),
    onSuccess: (data: Appeal) => {
      // Invalidate all appeal lists
      queryClient.invalidateQueries({ queryKey: appealKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appealKeys.assigned(0, 20) });
      queryClient.invalidateQueries({ queryKey: appealKeys.stats() });
      // Update detail cache
      queryClient.setQueryData(appealKeys.detail(data.id), data);
      logger.info('Appeal escalated successfully', { appealId: data.id, escalated: data.escalated });
    },
    onError: (error: Error) => {
      logger.error('Failed to escalate appeal', error instanceof Error ? error : new Error(String(error)));
    },
  });
}

// ============================================================================
// COMPOSITE HOOKS
// ============================================================================

export interface UseAppealManagementOptions {
  filters?: AppealFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseAppealManagementReturn {
  // Data
  appeals: PageResponse<Appeal> | undefined;
  statistics: AppealStatistics | undefined;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Mutations
  createAppeal: ReturnType<typeof useCreateAppeal>['mutate'];
  resolveAppeal: ReturnType<typeof useResolveAppeal>['mutate'];
  escalateAppeal: ReturnType<typeof useEscalateAppeal>['mutate'];
  
  // Mutation states
  isCreating: boolean;
  isResolving: boolean;
  isEscalating: boolean;
  
  // Actions
  refetch: () => void;
  updateFilters: (newFilters: AppealFilters) => void;
}

/**
 * Composite hook for appeal management
 * Provides complete appeal management functionality
 * 
 * @example
 * ```tsx
 * const {
 *   appeals,
 *   statistics,
 *   createAppeal,
 *   resolveAppeal,
 *   escalateAppeal,
 *   isLoading,
 *   refetch,
 * } = useAppealManagement({
 *   filters: { status: 'PENDING' },
 *   autoRefresh: true,
 * });
 * ```
 */
export function useAppealManagement(
  options: UseAppealManagementOptions = {}
): UseAppealManagementReturn {
  const { filters: initialFilters = {}, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [filters, setFilters] = useState<AppealFilters>(initialFilters);
  
  // Queries
  const appealsQuery = useQuery({
    queryKey: appealKeys.list(filters),
    queryFn: () => appealApi.getAppeals(filters),
    staleTime: 1000 * 60 * 2,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });
  
  const statsQuery = useQuery({
    queryKey: appealKeys.stats(),
    queryFn: () => appealApi.getAppealStatistics(),
    staleTime: 1000 * 60 * 5,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });
  
  // Mutations
  const createMutation = useCreateAppeal();
  const resolveMutation = useResolveAppeal();
  const escalateMutation = useEscalateAppeal();
  
  // Actions
  const refetch = useCallback(() => {
    appealsQuery.refetch();
    statsQuery.refetch();
  }, [appealsQuery, statsQuery]);
  
  const updateFilters = useCallback((newFilters: AppealFilters) => {
    setFilters(newFilters);
  }, []);
  
  return {
    // Data
    appeals: appealsQuery.data,
    statistics: statsQuery.data,
    
    // Loading states
    isLoading: appealsQuery.isLoading || statsQuery.isLoading,
    isRefreshing: appealsQuery.isRefetching || statsQuery.isRefetching,
    
    // Mutations
    createAppeal: createMutation.mutate,
    resolveAppeal: resolveMutation.mutate,
    escalateAppeal: escalateMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isResolving: resolveMutation.isPending,
    isEscalating: escalateMutation.isPending,
    
    // Actions
    refetch,
    updateFilters,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for appeal creation with validation
 */
export function useAppealCreation() {
  const createMutation = useCreateAppeal();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateAppeal = useCallback((request: CreateAppealRequest): boolean => {
    const errors: Record<string, string> = {};
    
    if (!request.contentId?.trim()) {
      errors.contentId = 'Content ID is required';
    }
    
    if (!request.appealType) {
      errors.appealType = 'Appeal type is required';
    }
    
    if (!request.reason?.trim()) {
      errors.reason = 'Reason is required';
    } else if (request.reason.length < 20) {
      errors.reason = 'Reason must be at least 20 characters';
    } else if (request.reason.length > 2000) {
      errors.reason = 'Reason must not exceed 2000 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);
  
  const createAppeal = useCallback(
    (request: CreateAppealRequest) => {
      if (!validateAppeal(request)) {
        return;
      }
      
      createMutation.mutate(request);
    },
    [createMutation, validateAppeal]
  );
  
  return {
    createAppeal,
    validationErrors,
    isCreating: createMutation.isPending,
    error: createMutation.error,
    reset: () => {
      setValidationErrors({});
      createMutation.reset();
    },
  };
}

/**
 * Hook for appeal resolution with validation
 */
export function useAppealResolution() {
  const resolveMutation = useResolveAppeal();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateResolution = useCallback((request: ResolveAppealRequest): boolean => {
    const errors: Record<string, string> = {};
    
    if (!request.decision) {
      errors.decision = 'Decision is required';
    }
    
    if (!request.decisionReason?.trim()) {
      errors.decisionReason = 'Decision reason is required';
    } else if (request.decisionReason.length < 20) {
      errors.decisionReason = 'Decision reason must be at least 20 characters';
    } else if (request.decisionReason.length > 2000) {
      errors.decisionReason = 'Decision reason must not exceed 2000 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);
  
  const resolveAppeal = useCallback(
    (appealId: string, request: ResolveAppealRequest) => {
      if (!validateResolution(request)) {
        return;
      }
      
      resolveMutation.mutate({ appealId, request });
    },
    [resolveMutation, validateResolution]
  );
  
  return {
    resolveAppeal,
    validationErrors,
    isResolving: resolveMutation.isPending,
    error: resolveMutation.error,
    reset: () => {
      setValidationErrors({});
      resolveMutation.reset();
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  Appeal,
  CreateAppealRequest,
  ResolveAppealRequest,
  AppealFilters,
  AppealStatistics,
};
