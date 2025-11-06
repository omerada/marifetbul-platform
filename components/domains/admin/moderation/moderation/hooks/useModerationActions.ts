/**
 * useModerationActions Hook
 *
 * Custom hook for managing moderation actions (approve, reject, escalate).
 */

'use client';

import { useState, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  ModerationItem,
  ModerationAction,
  UseModerationActionsReturn,
} from '../types/moderationTypes';

export function useModerationActions(
  onActionComplete?: () => void
): UseModerationActionsReturn {
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [actionType, setActionType] = useState<ModerationAction | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);

  const handleAction = useCallback(async () => {
    if (!selectedItem || !actionType) {
      logger.warn('handleAction called without selectedItem or actionType');
      return;
    }

    try {
      // Production note: Auth token retrieved from cookie (auth_token).
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(
        `/api/v1/admin/moderation/${selectedItem.id}/action`,
        {
          method: 'POST',
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            action: actionType,
            notes: actionNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('İşlem gerçekleştirilemedi');
      }

      // Notify parent to refetch data
      if (onActionComplete) {
        onActionComplete();
      }

      // Reset state
      setShowActionDialog(false);
      setSelectedItem(null);
      setActionType(null);
      setActionNotes('');

      logger.info(
        `Moderation action ${actionType} completed for item ${selectedItem.id}`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bilinmeyen hata';
      logger.error('Moderation action failed:', err instanceof Error ? err : new Error(String(err)));
      throw new Error(errorMessage);
    }
  }, [selectedItem, actionType, actionNotes, onActionComplete]);

  return {
    selectedItem,
    actionType,
    actionNotes,
    showActionDialog,
    setSelectedItem,
    setActionType,
    setActionNotes,
    setShowActionDialog,
    handleAction,
  };
}
