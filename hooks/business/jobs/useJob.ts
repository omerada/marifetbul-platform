/**
 * useJob Hook - Stub Implementation
 * TODO: Implement full functionality for single job fetch/management
 * Currently returns minimal data to satisfy build requirements
 */

export function useJob(jobId: string | undefined) {
  return {
    data: undefined,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}
