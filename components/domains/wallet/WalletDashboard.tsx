/**
 * ================================================
 * WALLET DASHBOARD COMPONENT (UNIFIED)
 * ================================================
 * Consolidated wallet management dashboard
 *
 * Features:
 * - Balance overview with real-time updates
 * - Recent transactions with rich UI
 * - Quick action buttons
 * - Stats summary cards
 * - Escrow tracking
 * - Payout requests
 * - Analytics integration
 * - WebSocket support
 * - Export functionality
 *
 * Sprint 1 - Epic 1.1 - Component Consolidation
 * @author MarifetBul Development Team
 * @version 3.0.0 - Unified from 2 versions
 * @since 2025-11-04
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Clock,
  AlertCircle,
  Download,
  FileText,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { BalanceCard } from './BalanceCard';
import { WalletAnalytics } from './WalletAnalytics';
import { PayoutRequestFlow } from './PayoutRequestFlow';
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { useWebSocketWallet } from '@/hooks/business/wallet/useWebSocketWallet';
import { useWalletConfig } from '@/hooks/business/wallet/useWalletConfig';
import { useBankAccounts } from '@/hooks/business/wallet/useBankAccounts';
import { usePayout } from '@/hooks/business/wallet/usePayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/shared/formatters';
import { toast } from 'sonner';
import { exportTransactions } from '@/lib/api/wallet';

// Helper function for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
import type { Transaction } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface WalletDashboardProps {
  /** Initial view mode */
  defaultView?: 'overview' | 'transactions' | 'escrow' | 'payouts';

  /** Show analytics section */
  showAnalytics?: boolean;

  /** Enable WebSocket real-time updates */
  enableWebSocket?: boolean;

  /** User ID for WebSocket connection */
  userId?: string;

  /** Additional CSS classes */
  className?: string;

  /** Custom balance data (for controlled mode) */
  balance?: {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    pendingPayouts?: number;
  };

  /** Custom transactions data (for controlled mode) */
  transactions?: Transaction[];

  /** Loading state (for controlled mode) */
  isLoading?: boolean;

  /** Error state (for controlled mode) */
  error?: Error | string | null;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Request payout callback */
  onRequestPayout?: () => void;

  /** View transactions callback */
  onViewTransactions?: () => void;

  /** View payouts callback */
  onViewPayouts?: () => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Recent transactions list (simplified for Day 1)
 */
function RecentTransactions({
  transactions,
  onViewAll,
}: {
  transactions: Transaction[];
  onViewAll?: () => void;
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Henüz işlem bulunmuyor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Son İşlemler</span>
        </CardTitle>

        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Tümünü Gör
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {transaction.description || 'İşlem'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`font-bold ${
                    transaction.type === 'CREDIT' ||
                    transaction.type === 'ESCROW_RELEASE'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'CREDIT' ||
                  transaction.type === 'ESCROW_RELEASE'
                    ? '+'
                    : '-'}
                  {formatCurrency(transaction.amount, 'TRY')}
                </p>
                <p className="text-xs text-gray-500">{transaction.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick stats cards
 */
function QuickStats({
  stats,
}: {
  stats: {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Quick Actions - Fast access to common wallet operations
 */
interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Hızlı İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              className="h-auto flex-col gap-2 py-4"
              onClick={action.onClick}
              disabled={action.disabled}
              size="sm"
            >
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * WalletDashboard Component
 *
 * Complete wallet management dashboard
 *
 * @example
 * ```tsx
 * <WalletDashboard
 *   defaultView="overview"
 *   showAnalytics={true}
 * />
 * ```
 */
export function WalletDashboard({
  defaultView: _defaultView = 'overview',
  showAnalytics = true,
  enableWebSocket = true,
  userId,
  className = '',
  balance: externalBalance,
  transactions: externalTransactions,
  isLoading: externalIsLoading,
  error: externalError,
  onRefresh: externalOnRefresh,
  onRequestPayout: externalOnRequestPayout,
  onViewTransactions: externalOnViewTransactions,
  onViewPayouts: externalOnViewPayouts,
}: WalletDashboardProps) {
  // ========================================================================
  // STATE
  // ========================================================================

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // ========================================================================
  // HOOKS - Wallet Configuration & Bank Accounts (Sprint 1 - Story 2.2)
  // ========================================================================

  const { config: walletConfig } = useWalletConfig();
  const { verifiedAccounts, refresh: refreshBankAccounts } = useBankAccounts();
  const { request: requestPayout } = usePayout({
    autoLoad: false,
  });

  // ========================================================================
  // HOOKS - Internal data fetching (only if external data not provided)
  // ========================================================================

  const useInternalData = !externalBalance && !externalTransactions;

  const {
    wallet,
    transactions: internalTransactions,
    isLoading: internalIsLoading,
    isRefreshing,
    error: internalError,
    refresh: internalRefresh,
    availableBalance: internalAvailableBalance,
    pendingBalance: internalPendingBalance,
    totalEarnings: internalTotalEarnings,
    totalPayouts: internalTotalPayouts,
  } = useWalletData(useInternalData, 30000);

  // Determine which data source to use (external props or internal hooks)
  const isLoading = externalIsLoading ?? internalIsLoading;
  const error = externalError ?? internalError;
  const transactions = externalTransactions ?? internalTransactions ?? [];
  const availableBalance =
    externalBalance?.availableBalance ?? internalAvailableBalance;
  const pendingBalance =
    externalBalance?.pendingBalance ?? internalPendingBalance;
  const totalEarnings = externalBalance?.totalEarnings ?? internalTotalEarnings;
  const totalPayouts = externalBalance?.pendingPayouts ?? internalTotalPayouts;

  const refresh = externalOnRefresh ?? internalRefresh;

  // WebSocket for real-time updates
  const {
    isConnected: wsConnected,
    balanceData: wsBalance,
    latestTransaction: _wsLatestTransaction,
  } = useWebSocketWallet({
    userId,
    enableNotifications: enableWebSocket,
    autoConnect: enableWebSocket,
    onBalanceUpdate: (_balance) => {
      // Refresh wallet data when balance updates via WebSocket
      refresh();
    },
    onNewTransaction: () => {
      // Refresh transactions when new transaction arrives
      refresh();
    },
  });

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleWithdraw = () => {
    if (externalOnRequestPayout) {
      externalOnRequestPayout();
    } else {
      setIsWithdrawModalOpen(true);
    }
  };

  const handleWithdrawSuccess = () => {
    toast.success('Para çekme talebi oluşturuldu', {
      description:
        'Talebiniz işleme alındı. 1-3 iş günü içinde hesabınıza ulaşacaktır.',
    });
    refresh(); // Refresh wallet data
  };

  const handleViewTransactions = () => {
    if (externalOnViewTransactions) {
      externalOnViewTransactions();
    } else {
      // Navigate to wallet transactions page
      // Note: Create /dashboard/wallet/transactions page for full transaction history
      // For now, transactions are visible in the dashboard below
      toast.info('İşlem geçmişi', {
        description: 'Tüm işlemlerinizi aşağıda görüntüleyebilirsiniz',
      });
    }
  };

  const handleViewPayouts = () => {
    if (externalOnViewPayouts) {
      externalOnViewPayouts();
    } else {
      // Navigate to existing payouts page
      window.location.href = '/dashboard/wallet/payouts';
    }
  };

  const handleExportTransactions = async () => {
    try {
      toast.info('İşlem geçmişi indiriliyor...');

      const blob = await exportTransactions('csv');

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marifetbul_islemler_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('İşlem geçmişi indirildi');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('İndirme başarısız', {
        description: 'İşlem geçmişi indirilirken bir hata oluştu',
      });
    }
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const quickStats = [
    {
      label: 'Aktif Siparişler',
      value: wallet?.activeOrdersCount?.toString() || '0',
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-100',
    },
    {
      label: 'Bekleyen Escrow',
      value: formatCurrency(pendingBalance, 'TRY'),
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      color: 'bg-yellow-100',
    },
    {
      label: 'Toplam Kazanç',
      value: formatCurrency(totalEarnings, 'TRY'),
      icon: <Wallet className="h-6 w-6 text-green-600" />,
      color: 'bg-green-100',
    },
  ];

  // Quick actions for wallet operations
  const quickActions: QuickAction[] = [
    {
      label: 'Para Çek',
      icon: <Download className="h-5 w-5" />,
      onClick: handleWithdraw,
      variant: 'primary',
      disabled: availableBalance <= 0,
    },
    {
      label: 'İşlem Geçmişi',
      icon: <FileText className="h-5 w-5" />,
      onClick: handleViewTransactions,
      variant: 'outline',
    },
    {
      label: 'Çekim Geçmişi',
      icon: <TrendingUp className="h-5 w-5" />,
      onClick: handleViewPayouts,
      variant: 'outline',
    },
    {
      label: 'Dışa Aktar',
      icon: <Download className="h-5 w-5" />,
      onClick: handleExportTransactions,
      variant: 'outline',
      disabled: transactions.length === 0,
    },
  ];

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-64 rounded-lg bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-32 rounded-lg bg-gray-200" />
            <div className="h-32 rounded-lg bg-gray-200" />
            <div className="h-32 rounded-lg bg-gray-200" />
          </div>
          <div className="h-96 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  // ========================================================================
  // ERROR STATE
  // ========================================================================

  if (error) {
    const errorMessage =
      typeof error === 'string' ? error : error?.message || 'Bilinmeyen hata';

    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-medium">
              Cüzdan bilgileri yüklenirken hata oluştu
            </p>
            <p className="mt-1 text-sm">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="mt-3"
            >
              Tekrar Dene
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex-1">
          <h1 className="flex items-center space-x-3 text-3xl font-bold text-gray-900">
            <Wallet className="h-8 w-8 text-blue-600" />
            <span>Cüzdanım</span>
          </h1>
          <p className="mt-1 flex items-center space-x-2 text-gray-600">
            <span>Bakiyenizi yönetin ve işlemlerinizi takip edin</span>
            {enableWebSocket && (
              <span className="flex items-center space-x-1 text-xs">
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Canlı</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-400">Bağlantı Yok</span>
                  </>
                )}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExportTransactions}
            disabled={transactions.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>

          <Button variant="ghost" onClick={refresh} disabled={isRefreshing}>
            {isRefreshing ? '🔄' : '🔄'} Yenile
          </Button>
        </div>
      </motion.div>

      {/* Balance Card */}
      <BalanceCard
        availableBalance={wsBalance?.availableBalance ?? availableBalance}
        pendingBalance={wsBalance?.pendingBalance ?? pendingBalance}
        totalEarnings={wsBalance?.totalEarnings ?? totalEarnings}
        totalPayouts={wsBalance?.pendingPayouts ?? totalPayouts}
        currency="TRY"
        isLoading={false}
        onRefresh={refresh}
        onWithdraw={handleWithdraw}
        onViewTransactions={handleViewTransactions}
      />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Quick Stats */}
      <QuickStats stats={quickStats} />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions as unknown as Transaction[]}
        onViewAll={handleViewTransactions}
      />

      {/* Analytics Section */}
      {showAnalytics && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <WalletAnalytics
            transactions={transactions as unknown as Transaction[]}
            isLoading={isLoading}
            defaultPeriod="30d"
            currency="TRY"
          />
        </motion.div>
      )}

      {/* Withdraw Modal - Using PayoutRequestFlow */}
      <PayoutRequestFlow
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          refreshBankAccounts(); // Refresh bank accounts when modal closes
        }}
        availableBalance={availableBalance}
        limits={{
          minimum: walletConfig?.payout.minAmount ?? 50,
          maximum: walletConfig?.payout.maxAmount ?? 10000,
        }}
        bankAccounts={verifiedAccounts.map((account) => ({
          id: account.id,
          bankName: account.bankName,
          iban: account.iban,
          accountHolder: account.accountHolder,
          isDefault: account.isDefault,
        }))}
        onSubmit={async (data) => {
          try {
            // Validate bank account ID
            if (!data.bankAccountId) {
              throw new Error('Lütfen bir banka hesabı seçiniz');
            }

            // Request payout with validated data
            await requestPayout({
              amount: data.amount,
              bankAccountId: data.bankAccountId,
              description: data.description || 'Para çekme talebi',
            });

            // Success handling
            handleWithdrawSuccess();
            setIsWithdrawModalOpen(false);

            // Refresh wallet data and bank accounts
            refresh();
            refreshBankAccounts();

            toast.success('Başarılı', {
              description: 'Para çekme talebiniz oluşturuldu',
            });
          } catch (error) {
            console.error('Payout failed:', error);
            toast.error('Hata', {
              description:
                error instanceof Error
                  ? error.message
                  : 'Para çekme talebi oluşturulamadı',
            });
          }
        }}
      />
    </div>
  );
}

export default WalletDashboard;
