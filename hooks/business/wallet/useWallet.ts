/**
 * ================================================
 * WALLET HOOK - Main Wallet Management Hook
 * ================================================
 * Primary hook for wallet operations
 * Provides access to wallet state, balance, and actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useWalletStore } from '@/stores/walletStore';
import { useEffect } from 'react';
import type { Wallet, BalanceResponse } from '@/lib/api/validators';

// ================================================
// HOOK INTERFACE
// ================================================

export interface UseWalletReturn {
  // State
  wallet: Wallet | null;
  balance: BalanceResponse | null;
  isLoadingWallet: boolean;
  isLoadingBalance: boolean;
  error: string | null;

  // Actions
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// ================================================
// MAIN HOOK
// ================================================

/**
 * Main hook for wallet management
 * Automatically fetches wallet data on mount
 *
 * @param autoFetch - Whether to automatically fetch data on mount (default: true)
 * @returns Wallet state and actions
 *
 * @example
 * ```tsx
 * const { wallet, balance, isLoadingWallet, fetchWallet } = useWallet();
 *
 * if (isLoadingWallet) return <Spinner />;
 * if (!wallet) return <EmptyState />;
 *
 * return (
 *   <div>
 *     <h2>Balance: {balance?.balance} TL</h2>
 *     <button onClick={fetchWallet}>Refresh</button>
 *   </div>
 * );
 * ```
 */
export const useWallet = (autoFetch = true): UseWalletReturn => {
  // ==================== SELECTORS ====================

  const wallet = useWalletStore((state) => state.wallet);
  const balance = useWalletStore((state) => state.balance);
  const isLoadingWallet = useWalletStore((state) => state.ui.isLoadingWallet);
  const error = useWalletStore((state) => state.ui.error);

  // ==================== ACTIONS ====================

  const fetchWallet = useWalletStore((state) => state.fetchWallet);
  const fetchBalance = useWalletStore((state) => state.fetchBalance);

  // ==================== EFFECTS ====================

  // Auto-fetch wallet data on mount
  useEffect(() => {
    if (autoFetch && !wallet) {
      fetchWallet();
    }
  }, [autoFetch, wallet, fetchWallet]);

  // ==================== COMPUTED VALUES ====================

  const refreshAll = async () => {
    await Promise.all([fetchWallet(), fetchBalance()]);
  };

  // ==================== RETURN ====================

  return {
    // State
    wallet,
    balance,
    isLoadingWallet,
    isLoadingBalance: isLoadingWallet, // Using same loading state for now
    error,

    // Actions
    fetchWallet,
    fetchBalance,
    refreshAll,
  };
};
