'use client';

/**
 * ================================================
 * BALANCE HOOK - Wallet Balance Management
 * ================================================
 * Specialized hook for balance display and monitoring
 * Provides formatted balance data and refresh capabilities
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useWalletStore } from '@/stores/walletStore';
import { useEffect, useMemo } from 'react';
import { formatCurrency } from '@/lib/shared/formatters';
import type { BalanceResponse } from '@/lib/api/validators';

// ================================================
// HOOK INTERFACE
// ================================================

export interface UseBalanceReturn {
  // Raw balance data
  balance: BalanceResponse | null;

  // Formatted balance strings (with TL symbol)
  formattedAvailableBalance: string;
  formattedPendingBalance: string;
  formattedTotalBalance: string;
  formattedTotalEarnings: string;
  formattedPendingPayouts: string;

  // Loading & error states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ================================================
// MAIN HOOK
// ================================================

/**
 * Hook for managing and displaying wallet balance
 * Provides both raw and formatted balance values
 *
 * @param autoFetch - Whether to automatically fetch balance on mount (default: true)
 * @param refreshInterval - Optional auto-refresh interval in milliseconds
 * @returns Balance state, formatted values, and actions
 *
 * @example
 * ```tsx
 * const { formattedAvailableBalance, formattedPendingBalance, isLoading, refresh } = useBalance();
 *
 * return (
 *   <Card>
 *     <h3>Kullanılabilir Bakiye</h3>
 *     <p className="text-3xl font-bold">{formattedAvailableBalance}</p>
 *     <p className="text-sm text-gray-500">
 *       Bekleyen: {formattedPendingBalance}
 *     </p>
 *     <button onClick={refresh}>Yenile</button>
 *   </Card>
 * );
 * ```
 */
export const useBalance = (
  autoFetch = true,
  refreshInterval?: number
): UseBalanceReturn => {
  // ==================== SELECTORS ====================

  const balance = useWalletStore((state) => state.balance);
  const isLoading = useWalletStore((state) => state.ui.isLoadingWallet);
  const error = useWalletStore((state) => state.ui.error);

  // ==================== ACTIONS ====================

  const fetchBalance = useWalletStore((state) => state.fetchBalance);

  // ==================== EFFECTS ====================

  // Auto-fetch balance on mount
  useEffect(() => {
    if (autoFetch && !balance) {
      fetchBalance();
    }
  }, [autoFetch, balance, fetchBalance]);

  // Optional auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      fetchBalance();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchBalance]);

  // ==================== COMPUTED VALUES ====================

  const formattedValues = useMemo(() => {
    if (!balance) {
      return {
        formattedAvailableBalance: '0,00 TL',
        formattedPendingBalance: '0,00 TL',
        formattedTotalBalance: '0,00 TL',
        formattedTotalEarnings: '0,00 TL',
        formattedPendingPayouts: '0,00 TL',
      };
    }

    return {
      formattedAvailableBalance: formatCurrency(balance.availableBalance),
      formattedPendingBalance: formatCurrency(balance.pendingBalance),
      formattedTotalBalance: formatCurrency(balance.totalBalance),
      formattedTotalEarnings: formatCurrency(balance.totalEarnings),
      formattedPendingPayouts: formatCurrency(balance.pendingPayouts),
    };
  }, [balance]);

  const refresh = async () => {
    await fetchBalance();
  };

  // ==================== RETURN ====================

  return {
    // Raw data
    balance,

    // Formatted values
    ...formattedValues,

    // State
    isLoading,
    error,

    // Actions
    fetchBalance,
    refresh,
  };
};
