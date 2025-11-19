/**
 * ================================================
 * USE COMMISSION SETTINGS HOOK
 * ================================================
 * Custom hook for managing commission settings
 *
 * Sprint: Admin Commission Management
 * Story: Commission Settings Management (5 SP)
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
  getCommissionSettings,
  updateCommissionSettings,
} from '@/lib/api/admin/commissions';
import type {
  CommissionSettings,
  CommissionSettingsUpdateRequest,
} from '@/lib/api/admin/types';

// ========== SWR Keys ==========

const COMMISSION_SETTINGS_KEY = '/api/v1/admin/commissions/settings';

// ========== Hook ==========

export function useCommissionSettings() {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch active settings with SWR
  const {
    data: settings,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<CommissionSettings>(
    COMMISSION_SETTINGS_KEY,
    getCommissionSettings,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Update settings
  const updateSettings = useCallback(
    async (
      data: CommissionSettingsUpdateRequest,
      callbacks?: {
        onSuccess?: () => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      setIsUpdating(true);
      try {
        const updatedSettings = await updateCommissionSettings(data);

        // Update local cache
        mutate(COMMISSION_SETTINGS_KEY, updatedSettings, false);

        // Invalidate category commissions (they might depend on settings)
        mutate('/api/v1/admin/commissions/categories');

        toast.success('Komisyon ayarları güncellendi');
        callbacks?.onSuccess?.();
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Komisyon ayarları güncellenirken hata oluştu';
        toast.error(errorMessage);
        callbacks?.onError?.(error);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings,
    isUpdating,
  };
}
