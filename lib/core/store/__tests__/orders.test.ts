/**
 * Orders Store Unit Tests
 *
 * Tests for Zustand orders store state management
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrderStore } from '../orders';
import type { Order, OrdersResponse } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock logger
jest.mock('@/lib/shared/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockOrder: Order = {
  id: 'order-1',
  orderNumber: 'ORD-2024-001',
  title: 'Test Order',
  description: 'Test order description',
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
};

const mockOrdersResponse: OrdersResponse = {
  data: [mockOrder],
  meta: {
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
  success: true,
};

describe('Orders Store', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();

    // Reset store state
    const { result } = renderHook(() => useOrderStore());
    act(() => {
      result.current.resetState();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useOrderStore());

      expect(result.current.orders).toEqual([]);
      expect(result.current.currentOrder).toBeNull();
      expect(result.current.isLoadingOrders).toBe(false);
      expect(result.current.isLoadingOrder).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toBeNull();
      expect(result.current.statistics).toBeNull();
    });
  });

  describe('loadOrders', () => {
    it('should load orders successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      });

      const { result } = renderHook(() => useOrderStore());

      await act(async () => {
        await result.current.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(1);
        expect(result.current.orders[0]).toEqual(mockOrder);
        expect(result.current.isLoadingOrders).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/orders',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should handle filters correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      });

      const { result } = renderHook(() => useOrderStore());
      const filters = { status: 'active', buyerId: 'buyer-1' };

      await act(async () => {
        await result.current.loadOrders(filters);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=active'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('buyerId=buyer-1'),
        expect.any(Object)
      );
    });

    it('should handle load orders error', async () => {
      const errorMessage = 'Failed to load orders';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: errorMessage } }),
      });

      const { result } = renderHook(() => useOrderStore());

      await act(async () => {
        await result.current.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Failed to load orders');
        expect(result.current.isLoadingOrders).toBe(false);
        expect(result.current.orders).toEqual([]);
      });
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useOrderStore());

      act(() => {
        result.current.loadOrders();
      });

      // Should be loading
      expect(result.current.isLoadingOrders).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => mockOrdersResponse,
        });
        await fetchPromise;
      });

      // Should not be loading anymore
      expect(result.current.isLoadingOrders).toBe(false);
    });
  });

  describe('loadOrder', () => {
    it('should load a single order successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOrder, success: true }),
      });

      const { result } = renderHook(() => useOrderStore());

      await act(async () => {
        await result.current.loadOrder('order-1');
      });

      await waitFor(() => {
        expect(result.current.currentOrder).toEqual(mockOrder);
        expect(result.current.isLoadingOrder).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/orders/order-1',
        expect.any(Object)
      );
    });

    it('should handle load order error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Order not found' } }),
      });

      const { result } = renderHook(() => useOrderStore());

      await act(async () => {
        await result.current.loadOrder('invalid-id');
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.currentOrder).toBeNull();
      });
    });
  });

  describe('setCurrentOrder', () => {
    it('should set current order', () => {
      const { result } = renderHook(() => useOrderStore());

      act(() => {
        result.current.setCurrentOrder(mockOrder);
      });

      expect(result.current.currentOrder).toEqual(mockOrder);
    });

    it('should clear current order when set to null', () => {
      const { result } = renderHook(() => useOrderStore());

      act(() => {
        result.current.setCurrentOrder(mockOrder);
      });

      expect(result.current.currentOrder).toEqual(mockOrder);

      act(() => {
        result.current.setCurrentOrder(null);
      });

      expect(result.current.currentOrder).toBeNull();
    });
  });

  describe('handleOrderUpdate', () => {
    it('should update existing order in orders list', () => {
      const { result } = renderHook(() => useOrderStore());

      // Set initial orders
      act(() => {
        result.current.loadOrders();
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      });

      // Wait for orders to load
      act(() => {
        result.current.handleOrderUpdate({
          ...mockOrder,
          status: 'completed',
        });
      });

      // The order should be updated in the store
      // Note: This tests the real-time update functionality
    });

    it('should update current order if it matches', () => {
      const { result } = renderHook(() => useOrderStore());

      act(() => {
        result.current.setCurrentOrder(mockOrder);
      });

      const updatedOrder = { ...mockOrder, status: 'completed' as const };

      act(() => {
        result.current.handleOrderUpdate(updatedOrder);
      });

      expect(result.current.currentOrder?.status).toBe('completed');
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useOrderStore());
      const filters = { status: 'active', buyerId: 'buyer-1' };

      act(() => {
        result.current.setFilters(filters);
      });

      expect(result.current.filters).toEqual(filters);
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      const { result } = renderHook(() => useOrderStore());

      act(() => {
        result.current.setFilters({ status: 'active' });
      });

      expect(result.current.filters).toEqual({ status: 'active' });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Server error' } }),
      });

      const { result } = renderHook(() => useOrderStore());

      await act(async () => {
        await result.current.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('resetState', () => {
    it('should reset to initial state', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      });

      const { result } = renderHook(() => useOrderStore());

      await act(async () => {
        await result.current.loadOrders({ status: 'active' });
      });

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(1);
        expect(result.current.filters).toEqual({ status: 'active' });
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.orders).toEqual([]);
      expect(result.current.currentOrder).toBeNull();
      expect(result.current.filters).toEqual({});
      expect(result.current.error).toBeNull();
    });
  });
});
