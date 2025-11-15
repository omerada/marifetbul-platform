/**
 * ================================================
 * USE REFUNDS HOOK - UNIT TESTS
 * ================================================
 * Test suite for refund management hooks
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - User Refund Flow (Story 2.6)
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import {
  useMyRefunds,
  useRefund,
  useOrderRefund,
  useRefundActions,
} from '@/hooks/business/useRefunds';
import { refundApi } from '@/lib/api/refunds';
import { toast } from 'sonner';
import {
  RefundDto,
  RefundStatus,
  RefundReasonCategory,
} from '@/types/business/features/refund';

// ================================================
// MOCKS
// ================================================

jest.mock('@/lib/api/refunds');
jest.mock('sonner');
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key, fetcher) => {
    if (!fetcher)
      return { data: undefined, error: undefined, isLoading: false };

    // Simulate successful data fetch
    return {
      data: mockRefunds,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    };
  }),
}));

const mockRefundApi = refundApi as jest.Mocked<typeof refundApi>;
const mockToast = toast as jest.Mocked<typeof toast>;

// ================================================
// MOCK DATA
// ================================================

const mockRefund: RefundDto = {
  id: 'refund-123',
  orderId: 'order-456',
  paymentId: 'payment-789',
  amount: 500.0,
  currency: 'TRY',
  reason: 'Hizmet verilmedi',
  reasonCategory: RefundReasonCategory.ORDER_NOT_DELIVERED,
  description: 'Sipariş teslim edilmedi ve satıcıyla iletişim kurulamadı.',
  status: RefundStatus.PENDING,
  requestedBy: 'user-123',
  requestedAt: '2025-01-15T10:00:00Z',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
};

const mockRefunds: RefundDto[] = [
  mockRefund,
  {
    ...mockRefund,
    id: 'refund-124',
    status: RefundStatus.APPROVED,
    approvedBy: 'admin-1',
    approvedAt: '2025-01-16T10:00:00Z',
  },
  {
    ...mockRefund,
    id: 'refund-125',
    status: RefundStatus.COMPLETED,
    completedAt: '2025-01-17T10:00:00Z',
  },
];

// ================================================
// TESTS
// ================================================

describe('useRefunds Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== useMyRefunds ====================

  describe('useMyRefunds', () => {
    it('should fetch user refunds successfully', async () => {
      const { result } = renderHook(() => useMyRefunds());

      await waitFor(() => {
        expect(result.current.refunds).toEqual(mockRefunds);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeUndefined();
      });
    });

    it('should return correct refund count', async () => {
      const { result } = renderHook(() => useMyRefunds());

      await waitFor(() => {
        expect(result.current.count).toBe(3);
      });
    });

    it('should calculate pending refunds correctly', async () => {
      const { result } = renderHook(() => useMyRefunds());

      await waitFor(() => {
        expect(result.current.pendingRefunds).toHaveLength(1);
        expect(result.current.pendingRefunds[0].id).toBe('refund-123');
      });
    });

    it('should calculate approved refunds correctly', async () => {
      const { result } = renderHook(() => useMyRefunds());

      await waitFor(() => {
        expect(result.current.approvedRefunds).toHaveLength(1);
        expect(result.current.approvedRefunds[0].id).toBe('refund-124');
      });
    });

    it('should calculate total refund amount', async () => {
      const { result } = renderHook(() => useMyRefunds());

      await waitFor(() => {
        expect(result.current.totalAmount).toBe(1500.0); // 500 * 3
      });
    });
  });

  // ==================== useRefund ====================

  describe('useRefund', () => {
    it('should fetch single refund by ID', async () => {
      mockRefundApi.getRefundById.mockResolvedValue(mockRefund);

      const { result } = renderHook(() => useRefund('refund-123'));

      await waitFor(() => {
        expect(result.current.refund).toEqual(mockRefund);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeUndefined();
      });
    });

    it('should handle refund not found', async () => {
      const error = new Error('Refund not found');
      mockRefundApi.getRefundById.mockRejectedValue(error);

      const { result } = renderHook(() => useRefund('invalid-id'));

      await waitFor(() => {
        expect(result.current.refund).toBeUndefined();
        expect(result.current.error).toBeDefined();
      });
    });

    it('should check if refund is cancellable', async () => {
      mockRefundApi.getRefundById.mockResolvedValue(mockRefund);

      const { result } = renderHook(() => useRefund('refund-123'));

      await waitFor(() => {
        expect(result.current.isCancellable).toBe(true);
      });
    });

    it('should return false for non-cancellable refund', async () => {
      const completedRefund = {
        ...mockRefund,
        status: RefundStatus.COMPLETED,
      };
      mockRefundApi.getRefundById.mockResolvedValue(completedRefund);

      const { result } = renderHook(() => useRefund('refund-125'));

      await waitFor(() => {
        expect(result.current.isCancellable).toBe(false);
      });
    });
  });

  // ==================== useOrderRefund ====================

  describe('useOrderRefund', () => {
    it('should fetch refund by order ID', async () => {
      mockRefundApi.getRefundByOrderId.mockResolvedValue(mockRefund);

      const { result } = renderHook(() => useOrderRefund('order-456'));

      await waitFor(() => {
        expect(result.current.refund).toEqual(mockRefund);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle order with no refund', async () => {
      const error = new Error('No refund found for order');
      mockRefundApi.getRefundByOrderId.mockRejectedValue(error);

      const { result } = renderHook(() => useOrderRefund('order-no-refund'));

      await waitFor(() => {
        expect(result.current.refund).toBeUndefined();
        expect(result.current.error).toBeDefined();
      });
    });

    it('should check if order has refund', async () => {
      mockRefundApi.getRefundByOrderId.mockResolvedValue(mockRefund);

      const { result } = renderHook(() => useOrderRefund('order-456'));

      await waitFor(() => {
        expect(result.current.hasRefund).toBe(true);
      });
    });
  });

  // ==================== useRefundActions ====================

  describe('useRefundActions', () => {
    describe('createRefund', () => {
      it('should create refund successfully', async () => {
        mockRefundApi.createRefund.mockResolvedValue(mockRefund);
        mockToast.success = jest.fn();

        const { result } = renderHook(() => useRefundActions());

        await act(async () => {
          const refund = await result.current.createRefund({
            orderId: 'order-456',
            amount: 500.0,
            reasonCategory: RefundReasonCategory.ORDER_NOT_DELIVERED,
            description: 'Test refund request',
          });

          expect(refund).toEqual(mockRefund);
        });

        expect(mockRefundApi.createRefund).toHaveBeenCalledWith({
          orderId: 'order-456',
          amount: 500.0,
          reasonCategory: RefundReasonCategory.ORDER_NOT_DELIVERED,
          description: 'Test refund request',
        });
        expect(mockToast.success).toHaveBeenCalledWith(
          'İade talebi oluşturuldu'
        );
      });

      it('should handle create refund error', async () => {
        const error = new Error('Failed to create refund');
        mockRefundApi.createRefund.mockRejectedValue(error);
        mockToast.error = jest.fn();

        const { result } = renderHook(() => useRefundActions());

        await act(async () => {
          try {
            await result.current.createRefund({
              orderId: 'order-456',
              amount: 500.0,
              reasonCategory: RefundReasonCategory.ORDER_NOT_DELIVERED,
              description: 'Test',
            });
          } catch (err) {
            expect(err).toBe(error);
          }
        });

        expect(mockToast.error).toHaveBeenCalledWith('Failed to create refund');
      });

      it('should set loading state during creation', async () => {
        mockRefundApi.createRefund.mockResolvedValue(mockRefund);

        const { result } = renderHook(() => useRefundActions());

        const createPromise = act(async () => {
          await result.current.createRefund({
            orderId: 'order-456',
            amount: 500.0,
            reasonCategory: RefundReasonCategory.ORDER_NOT_DELIVERED,
            description: 'Test',
          });
        });

        // Check loading state
        expect(result.current.isCreating).toBe(true);

        await createPromise;

        // Check loading state after completion
        await waitFor(() => {
          expect(result.current.isCreating).toBe(false);
        });
      });
    });

    describe('cancelRefund', () => {
      it('should cancel refund successfully', async () => {
        mockRefundApi.cancelRefund.mockResolvedValue(undefined);
        mockToast.success = jest.fn();

        const { result } = renderHook(() => useRefundActions());

        await act(async () => {
          await result.current.cancelRefund('refund-123', 'order-456');
        });

        expect(mockRefundApi.cancelRefund).toHaveBeenCalledWith('refund-123');
        expect(mockToast.success).toHaveBeenCalledWith(
          'İade talebi iptal edildi'
        );
      });

      it('should handle cancel refund error', async () => {
        const error = new Error('Failed to cancel refund');
        mockRefundApi.cancelRefund.mockRejectedValue(error);
        mockToast.error = jest.fn();

        const { result } = renderHook(() => useRefundActions());

        await act(async () => {
          try {
            await result.current.cancelRefund('refund-123', 'order-456');
          } catch (err) {
            expect(err).toBe(error);
          }
        });

        expect(mockToast.error).toHaveBeenCalledWith('Failed to cancel refund');
      });

      it('should set loading state during cancellation', async () => {
        mockRefundApi.cancelRefund.mockResolvedValue(undefined);

        const { result } = renderHook(() => useRefundActions());

        const cancelPromise = act(async () => {
          await result.current.cancelRefund('refund-123', 'order-456');
        });

        // Check loading state
        expect(result.current.isCanceling).toBe(true);

        await cancelPromise;

        // Check loading state after completion
        await waitFor(() => {
          expect(result.current.isCanceling).toBe(false);
        });
      });
    });

    describe('isLoading', () => {
      it('should be true when creating', async () => {
        mockRefundApi.createRefund.mockImplementation(
          () =>
            new Promise((resolve) => setTimeout(() => resolve(mockRefund), 100))
        );

        const { result } = renderHook(() => useRefundActions());

        act(() => {
          result.current.createRefund({
            orderId: 'order-456',
            amount: 500.0,
            reasonCategory: RefundReasonCategory.ORDER_NOT_DELIVERED,
            description: 'Test',
          });
        });

        expect(result.current.isLoading).toBe(true);
      });

      it('should be true when canceling', async () => {
        mockRefundApi.cancelRefund.mockImplementation(
          () =>
            new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
        );

        const { result } = renderHook(() => useRefundActions());

        act(() => {
          result.current.cancelRefund('refund-123', 'order-456');
        });

        expect(result.current.isLoading).toBe(true);
      });

      it('should be false when idle', () => {
        const { result } = renderHook(() => useRefundActions());

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isCreating).toBe(false);
        expect(result.current.isCanceling).toBe(false);
      });
    });
  });
});
