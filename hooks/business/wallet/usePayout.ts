/**
 * ================================================
 * PayoutResponse HOOK
 * ================================================
 * React hook for managing payouts
 *
 * Sprint 14 - Payment & PayoutResponse System
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  requestPayout,
  getPayoutHistory,
  getPendingPayouts,
  getAllPendingPayouts,
  cancelPayout,
  approvePayout,
  rejectPayout,
  canCancelPayout,
  canProcessPayout,
  type RequestPayoutRequest,
  type PayoutResponse,
} from '@/lib/api/payouts';

// ============================================================================
// TYPES
// ============================================================================

interface UsePayoutOptions {
  autoLoad?: boolean;
}

export interface UsePayoutReturn {
  // State
  payouts: PayoutResponse[];
  pendingPayouts: PayoutResponse[];
  isLoading: boolean;
  error: string | null;

  // Actions
  load: () => Promise<void>;
  loadPending: () => Promise<void>;
  request: (data: RequestPayoutRequest) => Promise<PayoutResponse>;
  cancel: (payoutId: string, reason?: string) => Promise<void>;
  refresh: () => Promise<void>;

  // Utilities
  canCancel: (PayoutResponse: PayoutResponse) => boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePayout(options: UsePayoutOptions = {}): UsePayoutReturn {
  const { autoLoad = true } = options;
  const { success, error: showError, info } = useToast();

  const [payouts, setPayouts] = useState<PayoutResponse[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PayoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load PayoutResponse history
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPayoutHistory(0, 50);
      setPayouts(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme geçmişi yüklenemedi';
      setError(errorMessage);
      if (err instanceof Error) {
        logger.error(
          'Load payouts error:',
          err instanceof Error ? err : new Error(String(err))
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load pending payouts
   */
  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPendingPayouts();
      setPendingPayouts(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bekleyen ödemeler yüklenemedi';
      setError(errorMessage);
      if (err instanceof Error) {
        logger.error(
          'Load pending payouts error:',
          err instanceof Error ? err : new Error(String(err))
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request PayoutResponse
   */
  const request = useCallback(
    async (data: RequestPayoutRequest): Promise<PayoutResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const PayoutResponse = await requestPayout(data);

        // Add to pending list
        setPendingPayouts((prev) => [PayoutResponse, ...prev]);

        // Add to all payouts list
        setPayouts((prev) => [PayoutResponse, ...prev]);

        success('Başarılı', 'Ödeme talebiniz oluşturuldu');

        return PayoutResponse;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ödeme talebi oluşturulamadı';
        setError(errorMessage);

        showError('Hata', errorMessage);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  /**
   * Cancel PayoutResponse
   */
  const cancel = useCallback(
    async (payoutId: string, reason?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedPayout = await cancelPayout(
          payoutId,
          reason || 'Kullanıcı tarafından iptal edildi'
        );

        // Update in both lists
        setPayouts((prev) =>
          prev.map((p) => (p.id === payoutId ? updatedPayout : p))
        );
        setPendingPayouts((prev) => prev.filter((p) => p.id !== payoutId));

        info('İptal Edildi', 'Ödeme talebiniz iptal edildi');
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ödeme iptal edilemedi';
        setError(errorMessage);

        showError('Hata', errorMessage);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [info, showError]
  );

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await Promise.all([load(), loadPending()]);
  }, [load, loadPending]);

  /**
   * Check if PayoutResponse can be canceled
   */
  const canCancel = useCallback((PayoutResponse: PayoutResponse) => {
    return canCancelPayout(PayoutResponse);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      load();
      loadPending();
    }
  }, [autoLoad, load, loadPending]);

  return {
    // State
    payouts,
    pendingPayouts,
    isLoading,
    error,

    // Actions
    load,
    loadPending,
    request,
    cancel,
    refresh,

    // Utilities
    canCancel,
  };
}

// ============================================================================
// ADMIN HOOK
// ============================================================================

export interface UsePayoutAdminReturn {
  // State
  pendingPayouts: PayoutResponse[];
  isLoading: boolean;
  error: string | null;

  // Actions
  load: () => Promise<void>;
  approve: (payoutId: string, notes?: string) => Promise<void>;
  reject: (payoutId: string, reason: string) => Promise<void>;
  refresh: () => Promise<void>;

  // Utilities
  canApprove: (PayoutResponse: PayoutResponse) => boolean;
}

export function usePayoutAdmin(): UsePayoutAdminReturn {
  const { success, error: showError, warning } = useToast();

  const [pendingPayouts, setPendingPayouts] = useState<PayoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load pending payouts for admin
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllPendingPayouts(0, 100);
      setPendingPayouts(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bekleyen ödemeler yüklenemedi';
      setError(errorMessage);
      if (err instanceof Error) {
        logger.error(
          'Load pending payouts error:',
          err instanceof Error ? err : new Error(String(err))
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Approve PayoutResponse
   */
  const approve = useCallback(
    async (payoutId: string, notes?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await approvePayout(payoutId, notes);

        // Remove from pending list
        setPendingPayouts((prev) => prev.filter((p) => p.id !== payoutId));

        success('Onaylandı', 'Ödeme talebi onaylandı ve işleme alındı');
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ödeme onaylanamadı';
        setError(errorMessage);

        showError('Hata', errorMessage);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  /**
   * Reject PayoutResponse
   */
  const reject = useCallback(
    async (payoutId: string, reason: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await rejectPayout(payoutId, reason);

        // Remove from pending list
        setPendingPayouts((prev) => prev.filter((p) => p.id !== payoutId));

        warning('Reddedildi', 'Ödeme talebi reddedildi');
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ödeme reddedilemedi';
        setError(errorMessage);

        showError('Hata', errorMessage);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [warning, showError]
  );

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  /**
   * Check if PayoutResponse can be approved/rejected
   */
  const canApprove = useCallback((PayoutResponse: PayoutResponse) => {
    return canProcessPayout(PayoutResponse);
  }, []);

  return {
    // State
    pendingPayouts,
    isLoading,
    error,

    // Actions
    load,
    approve,
    reject,
    refresh,

    // Utilities
    canApprove,
  };
}
