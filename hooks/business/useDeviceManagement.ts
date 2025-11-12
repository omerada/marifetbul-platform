/**
 * ================================================
 * DEVICE MANAGEMENT HOOK
 * ================================================
 * Hook for managing push notification devices
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Push Notification Sprint
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getUserDevices,
  unregisterDevice,
  unregisterAllDevices,
  getActiveDeviceCount,
  type DeviceTokenResponse,
} from '@/lib/api/device-tokens';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

export interface UseDeviceManagementReturn {
  // State
  devices: DeviceTokenResponse[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  deviceCount: number;

  // Actions
  refreshDevices: () => Promise<void>;
  removeDevice: (token: string) => Promise<boolean>;
  removeAllDevices: () => Promise<boolean>;

  // Helpers
  getCurrentDeviceToken: () => string | null;
  isCurrentDevice: (token: string) => boolean;
}

/**
 * Hook for managing push notification devices
 *
 * @example
 * ```tsx
 * const {
 *   devices,
 *   isLoading,
 *   removeDevice,
 *   refreshDevices,
 * } = useDeviceManagement();
 * ```
 */
export function useDeviceManagement(): UseDeviceManagementReturn {
  const [devices, setDevices] = useState<DeviceTokenResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deviceCount, setDeviceCount] = useState(0);

  /**
   * Get current device's FCM token from localStorage
   */
  const getCurrentDeviceToken = useCallback((): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('fcm_token');
  }, []);

  /**
   * Check if a token belongs to current device
   */
  const isCurrentDevice = useCallback(
    (token: string): boolean => {
      const currentToken = getCurrentDeviceToken();
      return currentToken === token;
    },
    [getCurrentDeviceToken]
  );

  /**
   * Fetch devices from backend
   */
  const fetchDevices = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      logger.info('Fetching registered devices');

      const [devicesData, count] = await Promise.all([
        getUserDevices(),
        getActiveDeviceCount(),
      ]);

      setDevices(devicesData);
      setDeviceCount(count);

      logger.info('Devices fetched successfully', {
        count: devicesData.length,
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch devices');
      setError(error);
      logger.error('Failed to fetch devices', error);
      toast.error('Cihazlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Refresh devices list
   */
  const refreshDevices = useCallback(async () => {
    await fetchDevices(true);
  }, [fetchDevices]);

  /**
   * Remove a specific device
   */
  const removeDevice = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        logger.info('Removing device', { tokenPrefix: token.substring(0, 20) });

        await unregisterDevice(token);

        // Update local state
        setDevices((prev) => prev.filter((d) => d.token !== token));
        setDeviceCount((prev) => prev - 1);

        // Clear localStorage if it's the current device
        if (isCurrentDevice(token)) {
          localStorage.removeItem('fcm_token');
          localStorage.removeItem('fcm_token_timestamp');
        }

        toast.success('Cihaz başarıyla kaldırıldı');
        logger.info('Device removed successfully');

        return true;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to remove device');
        logger.error('Failed to remove device', error);
        toast.error('Cihaz kaldırılırken hata oluştu');
        return false;
      }
    },
    [isCurrentDevice]
  );

  /**
   * Remove all devices
   */
  const removeAllDevices = useCallback(async (): Promise<boolean> => {
    try {
      logger.info('Removing all devices');

      await unregisterAllDevices();

      // Update local state
      setDevices([]);
      setDeviceCount(0);

      // Clear localStorage
      localStorage.removeItem('fcm_token');
      localStorage.removeItem('fcm_token_timestamp');

      toast.success('Tüm cihazlar başarıyla kaldırıldı');
      logger.info('All devices removed successfully');

      return true;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to remove all devices');
      logger.error('Failed to remove all devices', error);
      toast.error('Cihazlar kaldırılırken hata oluştu');
      return false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    // State
    devices,
    isLoading,
    isRefreshing,
    error,
    deviceCount,

    // Actions
    refreshDevices,
    removeDevice,
    removeAllDevices,

    // Helpers
    getCurrentDeviceToken,
    isCurrentDevice,
  };
}
