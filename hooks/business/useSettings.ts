'use client';

/**
 * ================================================
 * USE SETTINGS HOOK
 * ================================================
 * Custom hook for user settings management
 *
 * Features:
 * - Profile updates
 * - Password changes
 * - Loading and error states
 * - Optimistic updates
 * - Success notifications
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 4: Settings System Refactor
 */

'use client';

import { useState, useCallback } from 'react';
import { unifiedAuthService } from '@/lib/core/auth/unifiedAuthService';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/lib/core/auth/unifiedAuthService';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface UseSettingsReturn {
  // Profile Management
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  isUpdatingProfile: boolean;
  profileError: string | null;

  // Password Management
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  isChangingPassword: boolean;
  passwordError: string | null;

  // Utility
  clearErrors: () => void;
}

// ================================================
// HOOK
// ================================================

export function useSettings(): UseSettingsReturn {
  // Auth store for current user
  const { user, updateUser } = useAuthStore();

  // Profile state
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ================================================
  // PROFILE MANAGEMENT
  // ================================================

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<boolean> => {
      try {
        setIsUpdatingProfile(true);
        setProfileError(null);

        logger.info('[useSettings] Updating profile');

        // Optimistic update
        if (user) {
          updateUser(data);
        }

        // Call API
        const response = await unifiedAuthService.updateProfile(data);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Profil güncellenemedi');
        }

        // Update auth store with server response
        updateUser({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });

        logger.info('[useSettings] Profile updated successfully');
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Profil güncellenirken hata oluştu';

        setProfileError(errorMessage);
        logger.error('[useSettings] Profile update failed', error as Error);

        // Revert optimistic update on error
        // The auth store will handle this automatically on next refresh

        return false;
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [user, updateUser]
  );

  // ================================================
  // PASSWORD MANAGEMENT
  // ================================================

  const changePassword = useCallback(
    async (data: ChangePasswordRequest): Promise<boolean> => {
      try {
        setIsChangingPassword(true);
        setPasswordError(null);

        logger.info('[useSettings] Changing password');

        const response = await unifiedAuthService.changePassword(data);

        if (!response.success) {
          throw new Error(response.message || 'Şifre değiştirilemedi');
        }

        logger.info('[useSettings] Password changed successfully');
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Şifre değiştirilirken hata oluştu';

        setPasswordError(errorMessage);
        logger.error('[useSettings] Password change failed', error as Error);

        return false;
      } finally {
        setIsChangingPassword(false);
      }
    },
    []
  );

  // ================================================
  // UTILITY
  // ================================================

  const clearErrors = useCallback(() => {
    setProfileError(null);
    setPasswordError(null);
  }, []);

  // ================================================
  // RETURN
  // ================================================

  return {
    // Profile
    updateProfile,
    isUpdatingProfile,
    profileError,

    // Password
    changePassword,
    isChangingPassword,
    passwordError,

    // Utility
    clearErrors,
  };
}
