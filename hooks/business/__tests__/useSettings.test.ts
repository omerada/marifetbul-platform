/**
 * ================================================
 * USE SETTINGS HOOK UNIT TESTS
 * ================================================
 * Comprehensive tests for settings management hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 6: Testing Coverage
 */

import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../useSettings';

// Mock logger first
jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock dependencies
jest.mock('@/lib/core/auth/unifiedAuthService', () => ({
  unifiedAuthService: {
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
}));

jest.mock('@/lib/core/store/domains/auth/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Import mocked modules
import { unifiedAuthService } from '@/lib/core/auth/unifiedAuthService';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

const mockUpdateProfile = unifiedAuthService.updateProfile as jest.Mock;
const mockChangePassword = unifiedAuthService.changePassword as jest.Mock;

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  roles: ['USER'],
};

describe('useSettings Hook', () => {
  const mockUpdateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup auth store mock
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updatedData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      // Mock successful API response
      mockUpdateProfile.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockUser,
          ...updatedData,
        },
      });

      const { result } = renderHook(() => useSettings());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.updateProfile(updatedData);
      });

      // Should return true
      expect(success).toBe(true);

      // Should call API
      expect(mockUpdateProfile).toHaveBeenCalledWith(updatedData);

      // Should update user
      expect(mockUpdateUser).toHaveBeenCalled();

      // Should not have error
      expect(result.current.profileError).toBeNull();
      expect(result.current.isUpdatingProfile).toBe(false);
    });

    it('should handle profile update error', async () => {
      const updatedData = {
        firstName: 'Invalid',
        lastName: 'Name',
      };

      const errorMessage = 'Profil güncellenemedi';

      // Mock API error
      mockUpdateProfile.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useSettings());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.updateProfile(updatedData);
      });

      // Should return false
      expect(success).toBe(false);

      // Should set error
      expect(result.current.profileError).toBe(errorMessage);
      expect(result.current.isUpdatingProfile).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      };

      // Mock successful API call
      mockChangePassword.mockResolvedValueOnce({
        success: true,
      });

      const { result } = renderHook(() => useSettings());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.changePassword(passwordData);
      });

      // Should return true
      expect(success).toBe(true);

      // Should call API with correct data
      expect(mockChangePassword).toHaveBeenCalledWith(passwordData);

      // Should not have error
      expect(result.current.passwordError).toBeNull();
      expect(result.current.isChangingPassword).toBe(false);
    });

    it('should handle password change error', async () => {
      const passwordData = {
        currentPassword: 'wrong',
        newPassword: 'newPassword456',
      };

      const errorMessage = 'Mevcut şifre yanlış';

      // Mock API error
      mockChangePassword.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useSettings());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.changePassword(passwordData);
      });

      // Should return false
      expect(success).toBe(false);

      // Should set error
      expect(result.current.passwordError).toBe(errorMessage);
      expect(result.current.isChangingPassword).toBe(false);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', async () => {
      // Set profile error
      mockUpdateProfile.mockRejectedValueOnce(new Error('Profile error'));

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await result.current.updateProfile({
          firstName: 'Test',
          lastName: 'User',
        });
      });

      expect(result.current.profileError).toBeTruthy();

      // Clear errors
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.profileError).toBeNull();
      expect(result.current.passwordError).toBeNull();
    });
  });
});
