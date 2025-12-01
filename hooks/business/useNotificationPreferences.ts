'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  enableAllEmails,
  disableAllEmails,
  enableAllPush,
  disableAllPush,
  type NotificationPreferences,
  type NotificationPreferencesUpdate,
} from '@/lib/api/notification-preferences';

export function useNotificationPreferences() {
  const [isUpdating, setIsUpdating] = useState(false);

  // Only fetch if user is authenticated
  const { user } = useAuthStore();

  // Fetch preferences with SWR - only if authenticated
  const { data, error, isLoading, mutate } = useSWR<NotificationPreferences>(
    user ? '/notifications/preferences' : null,
    getNotificationPreferences,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Update preferences (optimistic)
  const updatePreferences = async (updates: NotificationPreferencesUpdate) => {
    setIsUpdating(true);

    try {
      // Optimistic update
      mutate(
        (current) => (current ? { ...current, ...updates } : undefined),
        false
      );

      // API call
      const response = await updateNotificationPreferences(updates);

      // Revalidate with server data
      mutate(response, false);

      toast.success('Bildirim ayarları güncellendi');
      return response;
    } catch (error) {
      // Revert on error
      mutate();
      toast.error('Ayarlar güncellenirken bir hata oluştu');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update single preference
  const updateSinglePreference = async (
    key: keyof NotificationPreferences,
    value: boolean | string
  ) => {
    return updatePreferences({ [key]: value });
  };

  // Toggle a boolean preference
  const togglePreference = async (key: keyof NotificationPreferences) => {
    if (data && typeof data[key] === 'boolean') {
      return updatePreferences({ [key]: !data[key] });
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    setIsUpdating(true);

    try {
      const response = await resetNotificationPreferences();
      mutate(response, false);
      toast.success('Ayarlar varsayılana sıfırlandı');
      return response;
    } catch (error) {
      toast.error('Sıfırlama işlemi başarısız');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Enable all emails
  const enableAllEmailNotifications = async () => {
    setIsUpdating(true);

    try {
      const response = await enableAllEmails();
      mutate(response, false);
      toast.success('Tüm email bildirimleri aktif edildi');
      return response;
    } catch (error) {
      toast.error('İşlem başarısız');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Disable all emails
  const disableAllEmailNotifications = async () => {
    setIsUpdating(true);

    try {
      const response = await disableAllEmails();
      mutate(response, false);
      toast.success('Tüm email bildirimleri kapatıldı');
      return response;
    } catch (error) {
      toast.error('İşlem başarısız');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Enable all push
  const enableAllPushNotifications = async () => {
    setIsUpdating(true);

    try {
      const response = await enableAllPush();
      mutate(response, false);
      toast.success('Tüm push bildirimleri aktif edildi');
      return response;
    } catch (error) {
      toast.error('İşlem başarısız');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Disable all push
  const disableAllPushNotifications = async () => {
    setIsUpdating(true);

    try {
      const response = await disableAllPush();
      mutate(response, false);
      toast.success('Tüm push bildirimleri kapatıldı');
      return response;
    } catch (error) {
      toast.error('İşlem başarısız');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    preferences: data,
    isLoading,
    error,
    isUpdating,
    updatePreferences,
    updateSinglePreference,
    togglePreference,
    resetToDefaults,
    enableAllEmailNotifications,
    disableAllEmailNotifications,
    enableAllPushNotifications,
    disableAllPushNotifications,
    refetch: mutate,
  };
}
