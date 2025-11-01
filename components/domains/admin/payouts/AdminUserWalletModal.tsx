/**
 * ================================================
 * ADMIN USER WALLET MODAL
 * ================================================
 * Modal for viewing user wallet details and transaction history
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 26, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import type {
  WalletResponse,
  Transaction,
  Payout,
} from '@/types/business/features/wallet';
import { payoutAdminApi } from '@/lib/api/admin/payout-admin-api';
import {
  X,
  Wallet,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/api/admin/payout-admin-api';
import { AdminPayoutStatusBadge } from './AdminPayoutStatusBadge';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

export interface AdminUserWalletModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const AdminUserWalletModal: React.FC<AdminUserWalletModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'payouts'
  >('overview');

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (isOpen && userId) {
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  // ==================== API CALLS ====================

  const fetchWalletData = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const [walletData, transactionsData, payoutsData] = await Promise.all([
        payoutAdminApi.getUserWallet(userId),
        payoutAdminApi.getUserTransactions(userId, 0, 10),
        payoutAdminApi.getUserPayouts(userId),
      ]);

      setWallet(walletData);
      setTransactions(transactionsData.content);
      setPayouts(payoutsData);
    } catch (error) {
      logger.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================

  if (!isOpen || !userId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="bg-opacity-50 fixed inset-0 bg-black transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Kullanıcı Cüzdanı
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                ID: {userId.substring(0, 20)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                İşlemler ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'payouts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Para Çekme ({payouts.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && wallet && (
                  <div className="space-y-4">
                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Kullanılabilir Bakiye
                            </p>
                            <p className="mt-1 text-2xl font-bold text-green-900">
                              {formatCurrency(
                                wallet.balance?.availableBalance || 0
                              )}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </div>

                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Bekleyen Bakiye
                            </p>
                            <p className="mt-1 text-2xl font-bold text-yellow-900">
                              {formatCurrency(
                                wallet.balance?.pendingBalance || 0
                              )}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Toplam Kazanç
                            </p>
                            <p className="mt-1 text-2xl font-bold text-blue-900">
                              {formatCurrency(
                                wallet.balance?.totalEarnings || 0
                              )}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Özet Bilgiler
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Cüzdan Durumu</p>
                          <p className="mt-1 font-medium text-gray-900">
                            {wallet.status === 'ACTIVE'
                              ? '✅ Aktif'
                              : '❌ Pasif'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Para Birimi</p>
                          <p className="mt-1 font-medium text-gray-900">
                            {wallet.balance?.currency || 'TRY'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Oluşturulma Tarihi</p>
                          <p className="mt-1 font-medium text-gray-900">
                            {formatDate(wallet.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Son Güncelleme</p>
                          <p className="mt-1 font-medium text-gray-900">
                            {formatDate(wallet.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                  <div className="space-y-2">
                    {transactions.length === 0 ? (
                      <div className="py-12 text-center">
                        <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Henüz işlem yok
                        </p>
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                transaction.amount > 0
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {transaction.amount > 0 ? (
                                <ArrowDownRight className="h-5 w-5" />
                              ) : (
                                <ArrowUpRight className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-semibold ${
                                transaction.amount > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.amount > 0 ? '+' : ''}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Bakiye: {formatCurrency(transaction.balanceAfter)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Payouts Tab */}
                {activeTab === 'payouts' && (
                  <div className="space-y-2">
                    {payouts.length === 0 ? (
                      <div className="py-12 text-center">
                        <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Henüz para çekme işlemi yok
                        </p>
                      </div>
                    ) : (
                      payouts.map((payout) => (
                        <div
                          key={payout.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {formatCurrency(payout.amount)}
                              </p>
                              <AdminPayoutStatusBadge
                                status={payout.status}
                                size="sm"
                              />
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {formatDate(payout.requestedAt)}
                            </p>
                            {payout.failureReason && (
                              <p className="mt-1 text-sm text-red-600">
                                {payout.failureReason}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {payout.method === 'BANK_TRANSFER'
                                ? 'Banka'
                                : payout.method === 'IYZICO_PAYOUT'
                                  ? 'Iyzico'
                                  : 'Cüzdan'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <UnifiedButton variant="outline" onClick={onClose}>
              Kapat
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================
// LOADING SKELETON
// ================================================

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    <Skeleton className="h-32 w-full" />
  </div>
);

AdminUserWalletModal.displayName = 'AdminUserWalletModal';
