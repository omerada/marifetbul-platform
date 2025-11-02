/**
 * ================================================
 * WALLET DASHBOARD COMPONENT
 * ================================================
 * Main wallet dashboard with balance, transactions, and quick actions
 *
 * Features:
 * - Balance overview
 * - Recent transactions
 * - Escrow tracking
 * - Payout requests
 * - Analytics
 *
 * Sprint 1 - Epic 1.1 - Day 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
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
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { useWebSocketWallet } from '@/hooks/business/wallet/useWebSocketWallet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/shared/utils/format';

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
}: WalletDashboardProps) {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const {
    transactions,
    isLoading,
    isRefreshing,
    error,
    refresh,
    availableBalance,
    pendingBalance,
    totalEarnings,
    totalPayouts,
  } = useWalletData(true, 30000);

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
    // TODO: Open withdraw modal (Epic 1.3)
    // Will be implemented in Epic 1.3
  };

  const handleViewTransactions = () => {
    // TODO: Navigate to transactions page (Epic 1.1 - Day 2)
    // Will be implemented tomorrow
  };

  const handleExportTransactions = () => {
    // TODO: Export transactions (Epic 1.1 - Day 2)
    // Will be implemented tomorrow
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const quickStats = [
    {
      label: 'Aktif Siparişler',
      value: '0', // TODO: Add activeOrdersCount to Wallet schema
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
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-medium">
              Cüzdan bilgileri yüklenirken hata oluştu
            </p>
            <p className="mt-1 text-sm">{error.message}</p>
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
        <div>
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
    </div>
  );
}

export default WalletDashboard;
