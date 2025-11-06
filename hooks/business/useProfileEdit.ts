/**
 * Enhanced profile editing hook with optimized auto-save
 * Handles debouncing, error recovery, and save queue
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import useProfileStore from '@/lib/core/store/profile';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import logger from '@/lib/infrastructure/monitoring/logger';

interface UseProfileEditOptions {
  autoSaveDelay?: number; // milliseconds
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface SaveQueueItem {
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export function useProfileEdit(options: UseProfileEditOptions = {}) {
  const { autoSaveDelay = 3000, onSaveSuccess, onSaveError } = options;

  const { addToast } = useUIStore();
  const { updateProfile, isUpdating } = useProfileStore();

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveQueueRef = useRef<SaveQueueItem[]>([]);
  const isProcessingQueueRef = useRef(false);

  /**
   * Process save queue with retry logic
   */
  const processSaveQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || saveQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    const item = saveQueueRef.current[0];

    try {
      setIsSaving(true);
      setSaveError(null);

      await updateProfile(item.data);

      // Success - remove from queue
      saveQueueRef.current.shift();
      setLastSaved(new Date());
      setHasUnsavedChanges(saveQueueRef.current.length > 0);

      onSaveSuccess?.();

      logger.info('Profile auto-saved successfully', { timestampitemtimestamp, retryCountitemretryCount,  });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Save failed';

      // Retry logic
      if (item.retryCount < 3) {
        item.retryCount++;
        logger.warn('Profile save failed, { retrying, errorerrorMessage, retryCountitemretryCount,  });

        // Move to end of queue for retry
        saveQueueRef.current.shift();
        saveQueueRef.current.push(item);
      } else {
        // Max retries reached - remove from queue and show error
        saveQueueRef.current.shift();
        setSaveError(errorMessage);

        addToast({
          type: 'error',
          title: 'Otomatik kaydetme başarısız',
          description:
            'Değişiklikleriniz kaydedilemedi. Lütfen manuel olarak kaydedin.',
          duration: 5000,
        });

        onSaveError?.(error instanceof Error ? error : new Error(errorMessage));

        logger.error(
          'Profile save failed after max retries',
          error instanceof Error ? error : new Error(errorMessage)
        );
      }
    } finally {
      setIsSaving(false);
      isProcessingQueueRef.current = false;

      // Process next item if queue is not empty
      if (saveQueueRef.current.length > 0) {
        setTimeout(processSaveQueue, 1000); // Wait 1s before next attempt
      }
    }
  }, [updateProfile, addToast, onSaveSuccess, onSaveError]);

  /**
   * Queue a save operation with debouncing
   */
  const queueSave = useCallback(
    (data: Record<string, unknown>) => {
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setHasUnsavedChanges(true);
      setSaveError(null);

      // Add to queue
      const queueItem: SaveQueueItem = {
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };

      // Replace pending save with latest data
      if (saveQueueRef.current.length > 0 && !isProcessingQueueRef.current) {
        saveQueueRef.current[saveQueueRef.current.length - 1] = queueItem;
      } else {
        saveQueueRef.current.push(queueItem);
      }

      // Start debounced save
      saveTimerRef.current = setTimeout(() => {
        processSaveQueue();
      }, autoSaveDelay);

      logger.debug('Profile save queued', { timestamp: queueItem.timestamp });
    },
    [autoSaveDelay, processSaveQueue]
  );

  /**
   * Force immediate save (manual save)
   */
  const forceSave = useCallback(
    async (data: Record<string, unknown>) => {
      // Clear auto-save timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Clear queue and add this as immediate save
      saveQueueRef.current = [
        {
          data,
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      setIsSaving(true);
      setSaveError(null);

      try {
        await updateProfile(data);

        saveQueueRef.current = [];
        setLastSaved(new Date());
        setHasUnsavedChanges(false);

        addToast({
          type: 'success',
          title: 'Profil güncellendi',
          description: 'Değişiklikleriniz başarıyla kaydedildi.',
          duration: 3000,
        });

        onSaveSuccess?.();

        logger.info('Profile saved manually');
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Save failed';
        setSaveError(errorMessage);

        addToast({
          type: 'error',
          title: 'Kaydetme başarısız',
          description: errorMessage,
          duration: 5000,
        });

        onSaveError?.(error instanceof Error ? error : new Error(errorMessage));

        logger.error(
          'Profile manual save failed',
          error instanceof Error ? error : new Error(errorMessage)
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [updateProfile, addToast, onSaveSuccess, onSaveError]
  );

  /**
   * Cancel pending saves
   */
  const cancelPendingSaves = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveQueueRef.current = [];
    setHasUnsavedChanges(false);
    setSaveError(null);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  /**
   * Get formatted last saved time
   */
  const getLastSavedText = useCallback(() => {
    if (!lastSaved) return null;

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 60) {
      return 'Az önce kaydedildi';
    } else if (diffMin < 60) {
      return `${diffMin} dakika önce kaydedildi`;
    } else {
      return lastSaved.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }, [lastSaved]);

  return {
    // State
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    lastSavedText: getLastSavedText(),
    saveError,
    isUpdating: isSaving || isUpdating,

    // Actions
    queueSave,
    forceSave,
    cancelPendingSaves,

    // Queue info (for debugging)
    queueLength: saveQueueRef.current.length,
  };
}
