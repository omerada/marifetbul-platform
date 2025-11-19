/**
 * ================================================
 * USE CATEGORY COMMISSIONS HOOK
 * ================================================
 * Custom hook for managing category-specific commission rates
 *
 * Sprint: Admin Commission Management
 * Story: Category Commission Management (3 SP)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint Day 1
 */

'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import {
  getAllCategoryCommissions,
  updateCategoryCommission,
  resetCategoryCommission,
} from '@/lib/api/admin/commissions';
import type {
  CategoryCommission,
  CategoryCommissionUpdateRequest,
} from '@/lib/api/admin/types';

// ========== SWR Keys ==========

const CATEGORY_COMMISSIONS_KEY = '/api/v1/admin/commissions/categories';

// ========== Hook ==========

export function useCategoryCommissions() {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all category commissions with SWR
  const {
    data: commissions,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<CategoryCommission[]>(
    CATEGORY_COMMISSIONS_KEY,
    getAllCategoryCommissions,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Update category commission
  const updateCommission = useCallback(
    async (
      categoryId: string,
      data: CategoryCommissionUpdateRequest,
      callbacks?: {
        onSuccess?: () => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      setIsUpdating(true);
      try {
        const updated = await updateCategoryCommission(categoryId, data);

        // Optimistically update local cache
        mutate(
          CATEGORY_COMMISSIONS_KEY,
          (current) =>
            current?.map((c: CategoryCommission) =>
              c.categoryId === categoryId ? updated : c
            ),
          false
        );

        toast.success('Kategori komisyonu güncellendi');
        callbacks?.onSuccess?.();
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Komisyon güncellenirken hata oluştu';
        toast.error(errorMessage);
        callbacks?.onError?.(error);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  // Reset category commission to default
  const resetCommission = useCallback(
    async (
      categoryId: string,
      callbacks?: {
        onSuccess?: () => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      setIsUpdating(true);
      try {
        const updated = await resetCategoryCommission(categoryId);

        // Optimistically update local cache
        mutate(
          CATEGORY_COMMISSIONS_KEY,
          (current) =>
            current?.map((c: CategoryCommission) =>
              c.categoryId === categoryId ? updated : c
            ),
          false
        );

        toast.success('Kategori komisyonu varsayılan değere sıfırlandı');
        callbacks?.onSuccess?.();
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Komisyon sıfırlanırken hata oluştu';
        toast.error(errorMessage);
        callbacks?.onError?.(error);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    commissions: commissions || [],
    isLoading,
    error,
    refetch,
    updateCommission,
    resetCommission,
    isUpdating,
  };
}
