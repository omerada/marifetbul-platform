/**
 * useProposal Hook Integration Tests
 *
 * Tests for proposal acceptance/rejection flow
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProposal } from '../useProposal';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/core/store/domains/ui/uiStore', () => ({
  useUIStore: jest.fn(),
}));

jest.mock('@/lib/shared/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

global.fetch = jest.fn();

describe('useProposal Hook', () => {
  const mockPush = jest.fn();
  const mockAddToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  describe('acceptProposal', () => {
    it('should accept proposal successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          orderId: 'order-123',
          proposalId: 'proposal-456',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const onSuccess = jest.fn();
      const { result } = renderHook(() => useProposal({ onSuccess }));

      let returnValue;
      await act(async () => {
        returnValue = await result.current.acceptProposal('proposal-456');
      });

      // Should return the order data
      expect(returnValue).toEqual(mockResponse.data);

      // Should call API with correct params
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/proposals/proposal-456/accept',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );

      // Should show success toast
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Başarılı',
        })
      );

      // Should call success callback
      expect(onSuccess).toHaveBeenCalled();

      // Should redirect after delay
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/dashboard/employer/orders');
        },
        { timeout: 2000 }
      );
    });

    it('should handle accept proposal error', async () => {
      const errorMessage = 'Proposal not found';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      const onError = jest.fn();
      const { result } = renderHook(() => useProposal({ onError }));

      await act(async () => {
        try {
          await result.current.acceptProposal('invalid-proposal');
        } catch {
          // Expected to throw
        }
      });

      // Should show error toast
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Hata',
          description: errorMessage,
        })
      );

      // Should call error callback
      expect(onError).toHaveBeenCalledWith(errorMessage);

      // Should NOT redirect
      expect(mockPush).not.toHaveBeenCalled();

      // Should set error state
      expect(result.current.error).toBe(errorMessage);
    });

    it('should set loading state during acceptance', async () => {
      let resolvePromise: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useProposal());

      // Start accepting
      act(() => {
        result.current.acceptProposal('proposal-123');
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
        await fetchPromise;
      });

      // Should not be loading anymore
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('rejectProposal', () => {
    it('should reject proposal successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Proposal rejected',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const onSuccess = jest.fn();
      const { result } = renderHook(() => useProposal({ onSuccess }));

      await act(async () => {
        await result.current.rejectProposal('proposal-456');
      });

      // Should call API with correct params
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/proposals/proposal-456/reject',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );

      // Should show success toast
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Başarılı',
        })
      );

      // Should call success callback
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle reject proposal error', async () => {
      const errorMessage = 'Failed to reject proposal';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      const onError = jest.fn();
      const { result } = renderHook(() => useProposal({ onError }));

      await act(async () => {
        try {
          await result.current.rejectProposal('proposal-456');
        } catch {
          // Expected to throw
        }
      });

      // Should show error toast
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Hata',
        })
      );

      // Should call error callback
      expect(onError).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useProposal());

      await act(async () => {
        try {
          await result.current.acceptProposal('proposal-123');
        } catch (error) {
          expect(error).toBe(networkError);
        }
      });

      expect(result.current.error).toBe('Network error');
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        })
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete proposal acceptance flow', async () => {
      // Mock successful API calls
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { orderId: 'order-123' },
        }),
      });

      const { result } = renderHook(() => useProposal());

      // Accept proposal
      await act(async () => {
        await result.current.acceptProposal('proposal-456');
      });

      // Verify entire flow
      expect(global.fetch).toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      );

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/dashboard/employer/orders');
        },
        { timeout: 2000 }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle proposal rejection successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useProposal());

      await act(async () => {
        await result.current.rejectProposal('proposal-789');
      });

      // Verify API call
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/proposals/proposal-789/reject',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      );
    });

    it('should recover from error and accept another proposal', async () => {
      const { result } = renderHook(() => useProposal());

      // First attempt fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      });

      await act(async () => {
        try {
          await result.current.acceptProposal('proposal-1');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBeTruthy();

      // Second attempt succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await act(async () => {
        await result.current.acceptProposal('proposal-2');
      });

      expect(result.current.error).toBeNull();
      expect(mockAddToast).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'success' })
      );
    });
  });
});
