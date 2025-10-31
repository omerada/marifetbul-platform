/**
 * ================================================
 * USE ORDERS HOOK
 * ================================================
 * Custom hook for fetching orders list
 *
 * Features:
 * - Pagination
 * - Filtering by status
 * - Sorting
 * - Auto-refresh
 * - Error handling
 * - Loading state
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/types/business/features/orders';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

interface UseOrdersOptions {
  /** Auto-load orders on mount */
  autoLoad?: boolean;
  /** Filter by status */
  status?: string;
  /** Page number (0-indexed) */
  page?: number;
  /** Page size */
  pageSize?: number;
  /** Sort field */
  sortBy?: 'createdAt' | 'amount' | 'deliveryDate';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Show error toast on failure */
  showErrorToast?: boolean;
}

interface UseOrdersReturn {
  /** Orders list */
  orders: Order[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Total pages */
  totalPages: number;
  /** Total elements */
  totalElements: number;
  /** Current page */
  currentPage: number;
  /** Refresh orders */
  refresh: () => Promise<void>;
  /** Load specific page */
  loadPage: (page: number) => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

// ================================================
// HOOK
// ================================================

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    autoLoad = true,
    status,
    page = 0,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    showErrorToast = false,
  } = options;

  // ================================================
  // STATE
  // ================================================

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  // ================================================
  // API FETCH
  // ================================================

  const fetchOrders = useCallback(
    async (pageNumber: number = currentPage) => {
      try {
        setIsLoading(true);
        setError(null);

        // Build URL with query params
        const params = new URLSearchParams({
          page: pageNumber.toString(),
          size: pageSize.toString(),
          sort: `${sortBy},${sortOrder}`,
        });

        if (status && status !== 'all') {
          params.append('status', status);
        }

        const response = await fetch(`/api/v1/orders/me?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Siparişler yüklenemedi');
        }

        const data = await response.json();

        // Handle both paginated and non-paginated responses
        if (data.data?.content) {
          // Paginated response
          setOrders(data.data.content);
          setTotalPages(data.data.totalPages || 0);
          setTotalElements(data.data.totalElements || 0);
          setCurrentPage(data.data.number || 0);
        } else if (Array.isArray(data.data)) {
          // Non-paginated response
          setOrders(data.data);
          setTotalPages(1);
          setTotalElements(data.data.length);
          setCurrentPage(0);
        } else {
          throw new Error('Geçersiz veri formatı');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        setError(errorMessage);

        if (showErrorToast) {
          toast.error('Siparişler yüklenemedi', {
            description: errorMessage,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, sortBy, sortOrder, status, showErrorToast]
  );

  // ================================================
  // EFFECTS
  // ================================================

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      fetchOrders();
    }
  }, [autoLoad, fetchOrders]);

  // ================================================
  // HANDLERS
  // ================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadPage = useCallback(
    async (pageNumber: number) => {
      setCurrentPage(pageNumber);
      await fetchOrders(pageNumber);
    },
    [fetchOrders]
  );

  // ================================================
  // RETURN
  // ================================================

  return {
    orders,
    isLoading,
    error,
    totalPages,
    totalElements,
    currentPage,
    refresh: () => fetchOrders(currentPage),
    loadPage,
    clearError,
  };
}
