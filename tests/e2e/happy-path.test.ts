/**
 * E2E Happy Path Scenarios
 *
 * Basic end-to-end tests for critical user flows
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrderStore } from '../../lib/core/store/orders';
import { useProposal } from '../../hooks/business/useProposal';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../lib/core/store/domains/ui/uiStore';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/core/store/domains/ui/uiStore', () => ({
  useUIStore: jest.fn(),
}));

jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

global.fetch = jest.fn();

describe('E2E Happy Path Scenarios', () => {
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

  describe('Scenario 1: Freelancer proposal to order completion', () => {
    it('should complete full flow from proposal acceptance to order creation', async () => {
      /**
       * User Story:
       * As an employer, I want to accept a proposal and have it converted to an order
       * so that I can begin working with the freelancer
       */

      // Step 1: Accept the proposal
      const proposalResponse = {
        success: true,
        data: {
          orderId: 'order-123',
          proposalId: 'proposal-456',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => proposalResponse,
      });

      const { result: proposalHook } = renderHook(() => useProposal());

      let orderId: string | undefined;
      await act(async () => {
        const result =
          await proposalHook.current.acceptProposal('proposal-456');
        orderId = result.orderId;
      });

      // Verify proposal was accepted
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/proposals/proposal-456/accept',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Başarılı',
        })
      );

      expect(orderId).toBe('order-123');

      // Step 2: Redirect happens
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/dashboard/employer/orders');
        },
        { timeout: 2000 }
      );

      // Step 3: Load the created order
      const orderResponse = {
        data: {
          id: 'order-123',
          orderNumber: 'ORD-2024-001',
          title: 'Website Development',
          status: 'active',
          budget: 5000,
          currency: 'TRY',
          buyerId: 'buyer-1',
          freelancerId: 'freelancer-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deliveryDate: '2024-02-01T00:00:00Z',
          milestones: [],
          attachments: [],
        },
        success: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => orderResponse,
      });

      const { result: orderStore } = renderHook(() => useOrderStore());

      await act(async () => {
        await orderStore.current.loadOrder('order-123');
      });

      // Verify order was loaded
      await waitFor(() => {
        expect(orderStore.current.currentOrder).toBeTruthy();
        expect(orderStore.current.currentOrder?.id).toBe('order-123');
        expect(orderStore.current.currentOrder?.status).toBe('active');
      });

      // Step 4: Verify complete flow state
      expect(proposalHook.current.isLoading).toBe(false);
      expect(proposalHook.current.error).toBeNull();
      expect(orderStore.current.isLoadingOrder).toBe(false);
      expect(orderStore.current.error).toBeNull();

      // Verify API calls were made in correct order
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('proposals'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('orders')
      );
    });
  });

  describe('Scenario 2: Order filtering and status management', () => {
    it('should filter orders by status and update order state', async () => {
      /**
       * User Story:
       * As a user, I want to filter my orders by status
       * and see the filtered results immediately
       */

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-2024-001',
          title: 'Active Order 1',
          status: 'active',
          budget: 1000,
          currency: 'TRY',
          buyerId: 'buyer-1',
          freelancerId: 'freelancer-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deliveryDate: '2024-02-01T00:00:00Z',
          milestones: [],
          attachments: [],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-2024-002',
          title: 'Active Order 2',
          status: 'active',
          budget: 2000,
          currency: 'TRY',
          buyerId: 'buyer-1',
          freelancerId: 'freelancer-2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          deliveryDate: '2024-02-02T00:00:00Z',
          milestones: [],
          attachments: [],
        },
      ];

      // Step 1: Load all orders
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockOrders,
          meta: {
            total: 2,
            page: 1,
            pageSize: 10,
            totalPages: 1,
          },
          success: true,
        }),
      });

      const { result } = renderHook(() => useOrderStore());

      await act(async () => {
        await result.current.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(2);
      });

      // Step 2: Apply status filter
      const activeOrders = [mockOrders[0]]; // Only first order
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: activeOrders,
          meta: {
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1,
          },
          success: true,
        }),
      });

      await act(async () => {
        await result.current.loadOrders({ status: 'active' });
      });

      // Verify filter was applied
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('status=active'),
        expect.any(Object)
      );

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(1);
        expect(result.current.filters).toEqual({ status: 'active' });
      });

      // Step 3: Update order status via real-time event
      const updatedOrder = {
        ...mockOrders[0],
        status: 'completed' as const,
      };

      await act(async () => {
        result.current.handleOrderUpdate(updatedOrder);
      });

      // Verify order was updated in the store
      expect(
        result.current.orders.find((o) => o.id === 'order-1')?.status
      ).toBe('completed');

      // Step 4: Clear filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});

      // Step 5: Load completed orders
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [updatedOrder],
          meta: {
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1,
          },
          success: true,
        }),
      });

      await act(async () => {
        await result.current.loadOrders({ status: 'completed' });
      });

      await waitFor(() => {
        expect(result.current.orders[0].status).toBe('completed');
      });

      // Verify complete flow state
      expect(result.current.isLoadingOrders).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toBeTruthy();
    });
  });

  describe('Error recovery scenarios', () => {
    it('should recover gracefully from API errors', async () => {
      const { result } = renderHook(() => useOrderStore());

      // First attempt fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Server error' } }),
      });

      await act(async () => {
        await result.current.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Clear error and retry
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();

      // Second attempt succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
          success: true,
        }),
      });

      await act(async () => {
        await result.current.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.orders).toEqual([]);
      });
    });
  });
});
