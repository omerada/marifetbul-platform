/**
 * ================================================
 * WALLET OVERVIEW PAGE
 * ================================================
 * Main wallet page using new WalletDashboard component
 *
 * Features:
 * - Modern WalletDashboard with balance cards
 * - Quick action buttons
 * - Recent transactions widget
 * - Performance metrics
 * - Uses centralized formatters and error handling
 *
 * Route: /wallet
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1 (Refactored)
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet as WalletIcon } from 'lucide-react';
import {
  useBalance,
  useTransactions,
  useWalletActions,
  useWalletUI,
} from '@/stores/walletStore';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import type {
  WalletBalance,
  Transaction,
} from '@/types/business/features/wallet';

/**
 * Wallet Overview Page Component
 *
 * Displays comprehensive wallet dashboard with:
 * - Balance information (available, pending, total earnings)
 * - Quick action buttons (withdraw, view history)
 * - Recent transactions
 * - Performance statistics
 */
export default function WalletPage() {
  const router = useRouter();
  const balance = useBalance();
  const storeTransactions = useTransactions();
  const { fetchWallet } = useWalletActions();
  const { isLoadingWallet, error } = useWalletUI();

  // Fetch wallet data on mount
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Adapt balance to expected type
  const adaptedBalance = useMemo((): WalletBalance | undefined => {
    if (!balance) return undefined;
    return {
      availableBalance: balance.availableBalance,
      pendingBalance: balance.pendingBalance,
      totalBalance: balance.totalBalance,
      totalEarnings: balance.totalEarnings,
      currency: 'TRY',
      pendingPayouts: balance.pendingPayouts,
    };
  }, [balance]);

  // Adapt transactions to expected type
  const adaptedTransactions = useMemo((): Transaction[] => {
    return storeTransactions.map((t) => ({
      id: t.id,
      walletId: t.walletId,
      type: t.type as unknown as import('@/types/business/features/wallet').TransactionType,
      amount: t.amount,
      currency: 'TRY',
      description: t.description,
      relatedEntityType: t.referenceId ? ('ORDER' as const) : undefined,
      relatedEntityId: t.referenceId,
      balanceAfter: t.balanceAfter,
      createdAt: t.createdAt,
      metadata: {},
    }));
  }, [storeTransactions]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <WalletIcon className="text-primary h-8 w-8" />
            Cüzdanım
          </h1>
          <p className="text-muted-foreground mt-1">
            Bakiyenizi ve işlemlerinizi yönetin
          </p>
        </div>
      </div>

      {/* Wallet Dashboard */}
      <WalletDashboard
        balance={adaptedBalance}
        transactions={adaptedTransactions}
        isLoading={isLoadingWallet}
        error={error}
        onRefresh={() => fetchWallet()}
        onRequestPayout={() => router.push('/wallet/payout-request')}
        onViewTransactions={() => router.push('/wallet/transactions')}
        onViewPayouts={() => router.push('/wallet/payouts')}
      />
    </div>
  );
}
