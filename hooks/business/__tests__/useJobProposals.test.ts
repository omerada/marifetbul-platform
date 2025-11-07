/**
 * ================================================
 * USE JOB PROPOSALS HOOK UNIT TESTS
 * ================================================
 * Tests for job proposals summary management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 6: Testing Coverage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobProposals } from '../useJobProposals';

// Mock logger
jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('useJobProposals Hook', () => {
  const mockApiResponse = {
    data: [
      {
        jobId: 'job-1',
        totalCount: 5,
        unreadCount: 2,
        pendingCount: 3,
        acceptedCount: 1,
        rejectedCount: 1,
        lastProposalDate: '2024-01-01T00:00:00Z',
        averageProposedBudget: 5000,
        lowestProposedBudget: 3000,
        highestProposedBudget: 7000,
      },
      {
        jobId: 'job-2',
        totalCount: 3,
        unreadCount: 0,
        pendingCount: 2,
        acceptedCount: 1,
        rejectedCount: 0,
        lastProposalDate: '2024-01-02T00:00:00Z',
        averageProposedBudget: 4000,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Data Fetching', () => {
    it('should fetch proposal data on mount when autoFetch is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalled();
      expect(Object.keys(result.current.proposalsByJob)).toHaveLength(2);
    });

    it('should not fetch on mount when autoFetch is false', async () => {
      const { result } = renderHook(() =>
        useJobProposals({ autoFetch: false })
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(Object.keys(result.current.proposalsByJob)).toHaveLength(0);
    });

    it('should fetch proposal data with specific job IDs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const jobIds = ['job-1', 'job-2'];

      renderHook(() => useJobProposals({ jobIds, autoFetch: true }));

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const url = fetchCall[0];
        // URL encoded comma is %2C
        expect(url).toContain('jobIds=job-1%2Cjob-2');
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.error).toContain('Failed to fetch proposal data');
      });
    });
  });

  describe('Manual Fetching', () => {
    it('should fetch data manually when fetchProposalData is called', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const { result } = renderHook(() =>
        useJobProposals({ autoFetch: false })
      );

      expect(Object.keys(result.current.proposalsByJob)).toHaveLength(0);

      await act(async () => {
        await result.current.fetchProposalData();
      });

      expect(Object.keys(result.current.proposalsByJob)).toHaveLength(2);
    });
  });

  describe('Proposal Summary Access', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });
    });

    it('should check if job has proposals', async () => {
      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasProposals('job-1')).toBe(true);
      expect(result.current.hasProposals('job-2')).toBe(true);
      expect(result.current.hasProposals('job-999')).toBe(false);
    });

    it('should get proposal summary for specific job', async () => {
      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const summary = result.current.getProposalSummary('job-1');

      expect(summary).toBeDefined();
      expect(summary?.totalCount).toBe(5);
      expect(summary?.unreadCount).toBe(2);
      expect(summary?.pendingCount).toBe(3);
      expect(summary?.acceptedCount).toBe(1);
      expect(summary?.rejectedCount).toBe(1);
      expect(summary?.hasNewProposals).toBe(true);
    });

    it('should return undefined for non-existent job', async () => {
      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const summary = result.current.getProposalSummary('non-existent');
      expect(summary).toBeUndefined();
    });

    it('should calculate total unread count across all jobs', async () => {
      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const totalUnread = result.current.getTotalUnreadCount();
      expect(totalUnread).toBe(2); // job-1 has 2 unread, job-2 has 0
    });

    it('should get jobs with new proposals', async () => {
      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const jobsWithNew = result.current.getJobsWithNewProposals();
      expect(jobsWithNew).toEqual(['job-1']); // Only job-1 has unread
    });

    it('should parse budget information correctly', async () => {
      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const summary = result.current.getProposalSummary('job-1');
      expect(summary?.averageProposedBudget).toBe(5000);
      expect(summary?.lowestProposedBudget).toBe(3000);
      expect(summary?.highestProposedBudget).toBe(7000);
    });

    it('should parse date correctly', async () => {
      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const summary = result.current.getProposalSummary('job-1');
      expect(summary?.lastProposalDate).toBeInstanceOf(Date);
      expect(summary?.lastProposalDate?.toISOString()).toBe(
        '2024-01-01T00:00:00.000Z'
      );
    });
  });

  describe('Polling', () => {
    it('should not poll when enablePolling is false', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderHook(() =>
        useJobProposals({ autoFetch: true, enablePolling: false })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(120000); // 2 minutes
      });

      // Should still be only 1 call (initial)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should poll at specified interval when enabled', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderHook(() =>
        useJobProposals({
          autoFetch: true,
          enablePolling: true,
          pollingInterval: 30000, // 30 seconds
        })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 30 seconds
      await act(async () => {
        jest.advanceTimersByTime(30000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // Fast-forward another 30 seconds
      await act(async () => {
        jest.advanceTimersByTime(30000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });
    });

    it('should use default polling interval', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderHook(() =>
        useJobProposals({ autoFetch: true, enablePolling: true })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 60 seconds (default interval)
      await act(async () => {
        jest.advanceTimersByTime(60000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error state', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set loading state correctly during fetch', async () => {
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve fetch
      await act(async () => {
        resolveFetch!({
          ok: true,
          json: async () => mockApiResponse,
        });
        await fetchPromise;
      });

      // Should not be loading anymore
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Object.keys(result.current.proposalsByJob)).toHaveLength(0);
      expect(result.current.getTotalUnreadCount()).toBe(0);
      expect(result.current.getJobsWithNewProposals()).toHaveLength(0);
    });

    it('should handle missing optional fields', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              jobId: 'job-minimal',
              // Only required fields
            },
          ],
        }),
      });

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const summary = result.current.getProposalSummary('job-minimal');
      expect(summary?.totalCount).toBe(0);
      expect(summary?.unreadCount).toBe(0);
      expect(summary?.hasNewProposals).toBe(false);
    });

    it('should handle response without data field', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useJobProposals({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Object.keys(result.current.proposalsByJob)).toHaveLength(0);
    });
  });
});
