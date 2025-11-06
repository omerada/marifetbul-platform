/**
 * useUserTableActions Hook
 *
 * Custom hook for handling user management actions (activate, suspend, ban, delete, export)
 */

'use client';

import { useState, useCallback } from 'react';
import { useUserManagement } from '@/hooks';
import { UserFilters } from '../types/userTableTypes';
import logger from '@/lib/infrastructure/monitoring/logger';

export function useUserTableActions() {
  const { onUserAction } = useUserManagement();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = useCallback(
    async (userId: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        await onUserAction(userId, {
          userId,
          action: 'unsuspend',
        });
      } catch (err) {
        const errorMessage = 'Kullanıcı aktifleştirilemedi';
        setError(errorMessage);
        logger.error('Error activating user:', err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [onUserAction]
  );

  const handleSuspend = useCallback(
    async (userId: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        await onUserAction(userId, {
          userId,
          action: 'suspend',
        });
      } catch (err) {
        const errorMessage = 'Kullanıcı askıya alınamadı';
        setError(errorMessage);
        logger.error('Error suspending user:', err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [onUserAction]
  );

  const handleBan = useCallback(
    async (userId: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        await onUserAction(userId, {
          userId,
          action: 'ban',
        });
      } catch (err) {
        const errorMessage = 'Kullanıcı yasaklanamadı';
        setError(errorMessage);
        logger.error('Error banning user:', err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [onUserAction]
  );

  const handleVerify = useCallback(
    async (userId: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        await onUserAction(userId, {
          userId,
          action: 'verify',
        });
      } catch (err) {
        const errorMessage = 'Kullanıcı doğrulanamadı';
        setError(errorMessage);
        logger.error('Error verifying user:', err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [onUserAction]
  );

  const handleDelete = useCallback(async (userId: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Delete operation failed');
      }

      const result = await response.json();

      if (result.success) {
        // Successfully deleted, refresh the page
        window.location.reload();
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err) {
      const errorMessage = 'Kullanıcı silinemedi';
      setError(errorMessage);
      logger.error('Error deleting user:', err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleExport = useCallback(
    async (format: 'csv' | 'xlsx', filters: UserFilters) => {
      setIsProcessing(true);
      setError(null);
      try {
        const response = await fetch('/api/v1/admin/users/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            format,
            filters,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.downloadUrl) {
            window.open(result.data.downloadUrl, '_blank');
          } else {
            throw new Error('Export failed: No download URL');
          }
        } else {
          throw new Error('Export request failed');
        }
      } catch (err) {
        const errorMessage = 'Dışa aktarma başarısız oldu';
        setError(errorMessage);
        logger.error('Error exporting users:', err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    handleActivate,
    handleSuspend,
    handleBan,
    handleVerify,
    handleDelete,
    handleExport,
    isProcessing,
    error,
  };
}
