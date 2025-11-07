/**
 * ================================================
 * USE PROFILE EDIT HOOK UNIT TESTS
 * ================================================
 * Tests for enhanced profile editing with auto-save
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 6: Testing Coverage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfileEdit } from '../useProfileEdit';

// Mock logger
jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock UI store
const mockAddToast = jest.fn();

jest.mock('@/lib/core/store/domains/ui/uiStore', () => ({
  useUIStore: jest.fn(() => ({
    addToast: mockAddToast,
  })),
}));

// Mock profile store
const mockUpdateProfile = jest.fn();

jest.mock('@/lib/core/store/profile', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    updateProfile: mockUpdateProfile,
    isUpdating: false,
  })),
}));

describe('useProfileEdit Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Auto-save with Debouncing', () => {
    it('should queue save and execute after delay', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProfileEdit());

      // Queue a save
      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      // Should mark as having unsaved changes
      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(mockUpdateProfile).not.toHaveBeenCalled();

      // Fast-forward time by 3 seconds (default delay)
      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
      });

      // Should have called update
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ firstName: 'John' });
      });
    });

    it('should debounce multiple rapid saves', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() =>
        useProfileEdit({ autoSaveDelay: 2000 })
      );

      // Queue multiple saves rapidly
      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.queueSave({ firstName: 'Jane' });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.queueSave({ firstName: 'Jake' });
      });

      // Fast-forward remaining time
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      // Should only have called update once with the latest data
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
        expect(mockUpdateProfile).toHaveBeenCalledWith({ firstName: 'Jake' });
      });
    });

    it('should update lastSaved timestamp on successful save', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProfileEdit());

      expect(result.current.lastSaved).toBeNull();

      act(() => {
        result.current.queueSave({ bio: 'New bio' });
      });

      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current.lastSaved).toBeInstanceOf(Date);
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });
  });

  describe('Manual Save', () => {
    it('should force immediate save bypassing queue', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProfileEdit());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.forceSave({
          firstName: 'John',
          lastName: 'Doe',
        });
      });

      expect(success).toBe(true);
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Profil güncellendi',
        })
      );
    });

    it('should handle manual save failure', async () => {
      const error = new Error('Update failed');
      mockUpdateProfile.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useProfileEdit());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.forceSave({ firstName: 'John' });
      });

      expect(success).toBe(false);
      expect(result.current.saveError).toBe('Update failed');
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Kaydetme başarısız',
        })
      );
    });

    it('should clear pending auto-saves when forcing manual save', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProfileEdit());

      // Queue auto-save
      act(() => {
        result.current.queueSave({ bio: 'Auto save' });
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      // Force manual save
      await act(async () => {
        await result.current.forceSave({ firstName: 'Manual save' });
      });

      // Should have called update only once with manual save data
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        firstName: 'Manual save',
      });
    });
  });

  describe('Error Handling and Retry', () => {
    it('should retry failed saves up to 3 times', async () => {
      // Fail first 2 attempts, succeed on 3rd
      mockUpdateProfile
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProfileEdit());

      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      // First attempt
      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
      });

      // Wait for retry delay
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      // Second attempt
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledTimes(2);
      });

      // Wait for retry delay
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      // Third attempt should succeed
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledTimes(3);
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });

    it('should show error after max retries', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Persistent error'));

      const { result } = renderHook(() => useProfileEdit());

      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      // Process through all retry attempts
      for (let i = 0; i < 4; i++) {
        await act(async () => {
          jest.advanceTimersByTime(3000);
          await Promise.resolve();
        });

        if (i < 3) {
          await act(async () => {
            jest.advanceTimersByTime(1000);
            await Promise.resolve();
          });
        }
      }

      await waitFor(() => {
        expect(result.current.saveError).toBe('Persistent error');
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            title: 'Otomatik kaydetme başarısız',
          })
        );
      });
    });
  });

  describe('Save Cancellation', () => {
    it('should cancel pending saves', () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProfileEdit());

      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.cancelPendingSaves();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.saveError).toBeNull();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not have called update
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });
  });

  describe('Save State Tracking', () => {
    it('should track isSaving state during save', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProfileEdit());

      expect(result.current.isSaving).toBe(false);

      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
      });

      // After save completes, should not be saving
      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
        expect(result.current.lastSaved).toBeInstanceOf(Date);
      });
    });

    it('should provide last saved text when available', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProfileEdit());

      // Initially no last saved text
      expect(result.current.lastSavedText).toBeNull();

      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
      });

      // After save, should have last saved text
      await waitFor(() => {
        expect(result.current.lastSavedText).toBeTruthy();
        expect(result.current.lastSavedText).toContain('kaydedildi');
      });
    });
  });

  describe('Callback Hooks', () => {
    it('should call onSaveSuccess callback', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const onSaveSuccess = jest.fn();
      const { result } = renderHook(() => useProfileEdit({ onSaveSuccess }));

      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(onSaveSuccess).toHaveBeenCalled();
      });
    });

    it('should call onSaveError callback on manual save failure', async () => {
      const error = new Error('Save failed');
      const onSaveError = jest.fn();

      // Clear any previous mock setup and set new rejection
      mockUpdateProfile.mockReset();
      mockUpdateProfile.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useProfileEdit({ onSaveError }));

      await act(async () => {
        const success = await result.current.forceSave({ firstName: 'John' });
        expect(success).toBe(false);
      });

      expect(onSaveError).toHaveBeenCalledWith(error);
    });
  });

  describe('Custom Auto-save Delay', () => {
    it('should respect custom auto-save delay', async () => {
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() =>
        useProfileEdit({ autoSaveDelay: 5000 })
      );

      act(() => {
        result.current.queueSave({ firstName: 'John' });
      });

      // Should not save after 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockUpdateProfile).not.toHaveBeenCalled();

      // Should save after 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });
    });
  });
});
