/**
 * ================================================
 * PAYOUT HOOK
 * ================================================
 * React hook for managing payouts
 *
 * Sprint 14 - Payment & Payout System
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks';
import { payoutApi, type CreatePayoutRequest } from '@/lib/api/payout';
import type { Payout } from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

interface UsePayoutOptions {
  autoLoad?: boolean;
}

export interface UsePayoutReturn {
  // State
  payouts: Payout[];
  pendingPayouts: Payout[];
  isLoading: boolean;
  error: string | null;

  // Actions
  load: () => Promise<void>;
  loadPending: () => Promise<void>;
  request: (data: CreatePayoutRequest) => Promise<Payout>;
  cancel: (payoutId: string, reason?: string) => Promise<void>;
  refresh: () => Promise<void>;

  // Utilities
  canCancel: (payout: Payout) => boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePayout(options: UsePayoutOptions = {}): UsePayoutReturn {
  const { autoLoad = true } = options;
  const { success, error: showError, info } = useToast();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load payout history
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await payoutApi.getPayoutHistory(0, 50);
      setPayouts(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme geçmişi yüklenemedi';
      setError(errorMessage);
      console.error('Load payouts error:', err);
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
      const data = await payoutApi.getPendingPayouts();
      setPendingPayouts(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bekleyen ödemeler yüklenemedi';
      setError(errorMessage);
      console.error('Load pending payouts error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request payout
   */
  const request = useCallback(
    async (data: CreatePayoutRequest): Promise<Payout> => {
      setIsLoading(true);
      setError(null);

      try {
        const payout = await payoutApi.createPayout(data);

        // Add to pending list
        setPendingPayouts((prev) => [payout, ...prev]);

        // Add to all payouts list
        setPayouts((prev) => [payout, ...prev]);

        success('Başarılı', 'Ödeme talebiniz oluşturuldu');

        return payout;
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
   * Cancel payout
   */
  const cancel = useCallback(
    async (payoutId: string, reason?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedPayout = await payoutApi.cancelPayout(payoutId, reason);

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
   * Check if payout can be canceled
   */
  const canCancel = useCallback((payout: Payout) => {
    return payoutApi.canCancelPayout(payout);
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
  pendingPayouts: Payout[];
  isLoading: boolean;
  error: string | null;

  // Actions
  load: () => Promise<void>;
  approve: (payoutId: string, notes?: string) => Promise<void>;
  reject: (payoutId: string, reason: string) => Promise<void>;
  refresh: () => Promise<void>;

  // Utilities
  canApprove: (payout: Payout) => boolean;
}

export function usePayoutAdmin(): UsePayoutAdminReturn {
  const { success, error: showError, warning } = useToast();

  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load pending payouts for admin
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await payoutApi.getPendingPayoutsAdmin(0, 100);
      setPendingPayouts(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bekleyen ödemeler yüklenemedi';
      setError(errorMessage);
      console.error('Load pending payouts error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Approve payout
   */
  const approve = useCallback(
    async (payoutId: string, notes?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await payoutApi.approvePayout(payoutId, notes);

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
   * Reject payout
   */
  const reject = useCallback(
    async (payoutId: string, reason: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await payoutApi.rejectPayout(payoutId, { reason });

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
   * Check if payout can be approved
   */
  const canApprove = useCallback((payout: Payout) => {
    return payoutApi.canApprovePayout(payout);
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
