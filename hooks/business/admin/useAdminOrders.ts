/**
 * useAdminOrders Hook
 * -------------------
 * Fetch and manage orders from admin perspective
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/types/business/features/orders';
import { toast } from 'sonner';

interface UseAdminOrdersOptions {
  autoLoad?: boolean;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface UseAdminOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  refresh: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  forceComplete: (orderId: string, adminNote: string) => Promise<void>;
  forceCancel: (
    orderId: string,
    reason: string,
    adminNote: string
  ) => Promise<void>;
}

export function useAdminOrders(
  options: UseAdminOrdersOptions = {}
): UseAdminOrdersReturn {
  const { autoLoad = true, status, search, page = 0, pageSize = 20 } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchOrders = useCallback(
    async (pageNumber: number = currentPage) => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: pageNumber.toString(),
          size: pageSize.toString(),
          sort: 'createdAt,desc',
        });

        if (status && status !== 'all') params.append('status', status);
        if (search) params.append('search', search);

        const response = await fetch(
          `/api/v1/admin/orders?${params.toString()}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Siparişler yüklenemedi');
        }

        const data = await response.json();

        if (data.data?.content) {
          setOrders(data.data.content);
          setTotalPages(data.data.totalPages || 0);
          setTotalElements(data.data.totalElements || 0);
          setCurrentPage(data.data.number || 0);
        } else if (Array.isArray(data.data)) {
          setOrders(data.data);
          setTotalPages(1);
          setTotalElements(data.data.length);
          setCurrentPage(0);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        setError(errorMessage);
        toast.error('Siparişler yüklenemedi', { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, status, search]
  );

  useEffect(() => {
    if (autoLoad) {
      fetchOrders();
    }
  }, [autoLoad, fetchOrders]);

  const loadPage = useCallback(
    async (pageNumber: number) => {
      setCurrentPage(pageNumber);
      await fetchOrders(pageNumber);
    },
    [fetchOrders]
  );

  const forceComplete = useCallback(
    async (orderId: string, adminNote: string) => {
      try {
        const response = await fetch(
          `/api/v1/admin/orders/${orderId}/force-complete`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ adminNote }),
          }
        );

        if (!response.ok) {
          throw new Error('Sipariş tamamlanamadı');
        }

        toast.success('Sipariş başarıyla tamamlandı');
        await fetchOrders(currentPage);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        toast.error('Sipariş tamamlanamadı', { description: errorMessage });
        throw err;
      }
    },
    [fetchOrders, currentPage]
  );

  const forceCancel = useCallback(
    async (orderId: string, reason: string, adminNote: string) => {
      try {
        const response = await fetch(
          `/api/v1/admin/orders/${orderId}/force-cancel`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ reason, adminNote }),
          }
        );

        if (!response.ok) {
          throw new Error('Sipariş iptal edilemedi');
        }

        toast.success('Sipariş başarıyla iptal edildi');
        await fetchOrders(currentPage);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        toast.error('Sipariş iptal edilemedi', { description: errorMessage });
        throw err;
      }
    },
    [fetchOrders, currentPage]
  );

  return {
    orders,
    isLoading,
    error,
    totalPages,
    totalElements,
    currentPage,
    refresh: () => fetchOrders(currentPage),
    loadPage,
    forceComplete,
    forceCancel,
  };
}
