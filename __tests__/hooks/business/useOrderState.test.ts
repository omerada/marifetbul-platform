/**
 * ================================================
 * ORDER STATE HOOK TESTS
 * ================================================
 * Tests for useOrderState custom hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2.4.3: Dashboard Pages Refactor
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrderState } from '../../../hooks/business/useOrderState';
import type {
  OrderSummaryResponse,
  OrderStatistics,
} from '../../../types/backend-aligned';

// ================================================
// MOCKS
// ================================================

const mockOrders: OrderSummaryResponse[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    type: 'PACKAGE_ORDER',
    packageTitle: 'Logo Design',
    totalAmount: 100,
    currency: 'USD',
    status: 'PAID',
    buyerName: 'John Doe',
    sellerName: 'Jane Smith',
    deadline: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    type: 'PACKAGE_ORDER',
    packageTitle: 'Web Development',
    totalAmount: 500,
    currency: 'USD',
    status: 'IN_PROGRESS',
    buyerName: 'John Doe',
    sellerName: 'Jane Smith',
    deadline: '2024-02-15T00:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

const mockStatistics: OrderStatistics = {
  totalOrders: 10,
  activeOrders: 3,
  completedOrders: 6,
  cancelledOrders: 1,
  totalRevenue: 5000,
  averageOrderValue: 500,
  completionRate: 0.75,
  averageDeliveryTime: 5.2,
};

// Mock fetch
global.fetch = jest.fn();

// ================================================
// TESTS
// ================================================

describe('useOrderState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/statistics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockStatistics }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: { content: mockOrders } }),
      });
    });
  });

  // ================================================
  // INITIAL STATE
  // ================================================

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: false })
      );

      expect(result.current.state.orders).toEqual([]);
      expect(result.current.state.stats).toBeUndefined();
      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.selectedStatus).toBe('all');
      expect(result.current.state.searchQuery).toBe('');
      expect(result.current.state.sortBy).toBe('latest');
    });

    it('should auto-load data when autoLoad is true', async () => {
      renderHook(() => useOrderState({ userRole: 'buyer', autoLoad: true }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should not auto-load data when autoLoad is false', () => {
      renderHook(() => useOrderState({ userRole: 'buyer', autoLoad: false }));

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ================================================
  // ACTIONS
  // ================================================

  describe('Actions', () => {
    it('should update selected status', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: false })
      );

      act(() => {
        result.current.actions.setSelectedStatus('IN_PROGRESS');
      });

      expect(result.current.state.selectedStatus).toBe('IN_PROGRESS');
    });

    it('should update search query', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: false })
      );

      act(() => {
        result.current.actions.setSearchQuery('test search');
      });

      expect(result.current.state.searchQuery).toBe('test search');
    });

    it('should update sort by', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: false })
      );

      act(() => {
        result.current.actions.setSortBy('amount_high');
      });

      expect(result.current.state.sortBy).toBe('amount_high');
    });

    it('should clear all filters', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: false })
      );

      // Set some filters
      act(() => {
        result.current.actions.setSelectedStatus('COMPLETED');
        result.current.actions.setSearchQuery('search');
        result.current.actions.setSortBy('oldest');
      });

      // Clear filters
      act(() => {
        result.current.actions.clearFilters();
      });

      expect(result.current.state.selectedStatus).toBe('all');
      expect(result.current.state.searchQuery).toBe('');
      expect(result.current.state.sortBy).toBe('latest');
    });
  });

  // ================================================
  // DATA FETCHING
  // ================================================

  describe('Data Fetching', () => {
    it('should load buyer orders', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: false })
      );

      await act(async () => {
        await result.current.actions.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.state.orders).toEqual(mockOrders);
        expect(result.current.state.isLoading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should load seller orders', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'seller', autoLoad: false })
      );

      await act(async () => {
        await result.current.actions.loadOrders();
      });

      await waitFor(() => {
        expect(result.current.state.orders).toEqual(mockOrders);
        expect(result.current.state.isLoading).toBe(false);
      });
    });

    it('should load order statistics', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: false })
      );

      await act(async () => {
        await result.current.actions.loadStats();
      });

      await waitFor(() => {
        expect(result.current.state.stats).toEqual({
          total: 10,
          active: 3,
          completed: 6,
          cancelled: 1,
        });
      });
    });
  });

  // ================================================
  // INTEGRATION
  // ================================================

  describe('Integration', () => {
    it('should handle complete workflow', async () => {
      const { result } = renderHook(() =>
        useOrderState({ userRole: 'buyer', autoLoad: true })
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.state.orders.length).toBeGreaterThan(0);
      });

      // Apply filters
      act(() => {
        result.current.actions.setSelectedStatus('IN_PROGRESS');
        result.current.actions.setSearchQuery('web');
        result.current.actions.setSortBy('amount_high');
      });

      expect(result.current.state.selectedStatus).toBe('IN_PROGRESS');
      expect(result.current.state.searchQuery).toBe('web');
      expect(result.current.state.sortBy).toBe('amount_high');

      // Clear filters
      act(() => {
        result.current.actions.clearFilters();
      });

      expect(result.current.state.selectedStatus).toBe('all');
      expect(result.current.state.searchQuery).toBe('');
      expect(result.current.state.sortBy).toBe('latest');
    });
  });
});
