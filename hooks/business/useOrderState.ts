/**
 * ================================================
 * ORDER STATE HOOK
 * ================================================
 * Custom hook for managing order list state
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2.4.3: Dashboard Pages Refactor
 */

import { useReducer, useEffect, useCallback } from 'react';
import type {
  OrderSummaryResponse,
  OrderStatus,
  OrderStatistics,
  PageResponse,
} from '@/types/backend-aligned';
import { orderApi, unwrapOrderResponse } from '@/lib/api/orders';
import { logError } from '@/lib/shared/errors';
import type { OrderStats } from '@/components/dashboard/orders';

// ================================================
// TYPES
// ================================================

export interface OrderStateData {
  orders: OrderSummaryResponse[];
  stats: OrderStats | undefined;
  isLoading: boolean;
  error: string | null;
  selectedStatus: OrderStatus | 'all';
  searchQuery: string;
  sortBy: string;
}

export type OrderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ORDERS'; payload: OrderSummaryResponse[] }
  | { type: 'SET_STATS'; payload: OrderStats | undefined }
  | { type: 'SET_SELECTED_STATUS'; payload: OrderStatus | 'all' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'CLEAR_FILTERS' };

export interface OrderStateActions {
  setSelectedStatus: (status: OrderStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  clearFilters: () => void;
  loadOrders: () => Promise<void>;
  loadStats: () => Promise<void>;
}

// ================================================
// REDUCER
// ================================================

const initialState: OrderStateData = {
  orders: [],
  stats: undefined,
  isLoading: true,
  error: null,
  selectedStatus: 'all',
  searchQuery: '',
  sortBy: 'latest',
};

function orderReducer(
  state: OrderStateData,
  action: OrderAction
): OrderStateData {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_ORDERS':
      return { ...state, orders: action.payload, error: null };

    case 'SET_STATS':
      return { ...state, stats: action.payload };

    case 'SET_SELECTED_STATUS':
      return { ...state, selectedStatus: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        selectedStatus: 'all',
        searchQuery: '',
        sortBy: 'latest',
      };

    default:
      return state;
  }
}

// ================================================
// HOOK
// ================================================

export interface UseOrderStateOptions {
  /** User role for fetching appropriate orders */
  userRole: 'buyer' | 'seller';
  /** Auto-load orders on mount */
  autoLoad?: boolean;
}

export function useOrderState(options: UseOrderStateOptions): {
  state: OrderStateData;
  actions: OrderStateActions;
} {
  const { userRole, autoLoad = true } = options;
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // ================================================
  // DATA FETCHING
  // ================================================

  const loadOrders = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Fetch orders based on role
      const response =
        userRole === 'buyer'
          ? await orderApi.getBuyerOrders()
          : await orderApi.getSellerOrders();

      // Unwrap and extract orders from paged response
      const unwrapped = unwrapOrderResponse(
        response
      ) as PageResponse<OrderSummaryResponse>;
      const fetchedOrders = unwrapped.content || [];

      dispatch({ type: 'SET_ORDERS', payload: fetchedOrders });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Siparişler yüklenemedi';

      logError(err instanceof Error ? err : new Error(errorMessage), {
        action: 'loadOrders',
        userRole,
      });

      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [userRole]);

  const loadStats = useCallback(async () => {
    try {
      const response = await orderApi.getOrderStatistics();
      const statistics = unwrapOrderResponse(response) as OrderStatistics;

      // Calculate counts from statistics
      const statsData: OrderStats = {
        total: statistics.totalOrders || 0,
        active: statistics.activeOrders || 0,
        completed: statistics.completedOrders || 0,
        cancelled: statistics.cancelledOrders || 0,
      };

      dispatch({ type: 'SET_STATS', payload: statsData });
    } catch (err) {
      // Stats are optional, just log the error
      logError(err instanceof Error ? err : new Error('Failed to load stats'), {
        action: 'loadStats',
        userRole,
      });
    }
  }, [userRole]);

  // ================================================
  // ACTIONS
  // ================================================

  const actions: OrderStateActions = {
    setSelectedStatus: (status: OrderStatus | 'all') => {
      dispatch({ type: 'SET_SELECTED_STATUS', payload: status });
    },

    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },

    setSortBy: (sort: string) => {
      dispatch({ type: 'SET_SORT_BY', payload: sort });
    },

    clearFilters: () => {
      dispatch({ type: 'CLEAR_FILTERS' });
    },

    loadOrders,
    loadStats,
  };

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    if (autoLoad) {
      loadOrders();
      loadStats();
    }
  }, [autoLoad, loadOrders, loadStats]);

  return { state, actions };
}
