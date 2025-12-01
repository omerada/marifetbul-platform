'use client';

/**
 * ================================================
 * WALLET BALANCE WIDGET - Enhanced Dashboard Widget
 * ================================================
 * Displays wallet balance with prominent UI for dashboard
 * Integrated with backend DashboardSnapshotService
 *
 * Features:
 * - Real wallet data from backend (no mocks)
 * - Available and pending balance display
 * - Quick actions (Withdraw, View Transactions)
 * - Growth indicators
 * - Responsive design
 * - Loading and error states
 *
 * Sprint 1 Day 3 - Dashboard Wallet Integration
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-07
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Eye,
  Download,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSellerSnapshot, useBuyerSnapshot } from '@/hooks/business';
import { useAuth } from '@/hooks/core/useAuth';
import { useWebSocketWallet } from '@/hooks/business/wallet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { Alert, AlertDescription } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/shared/formatters';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface WalletBalanceWidgetProps {
  /** Show compact version */
  compact?: boolean;

  /** Custom className */
  className?: string;

  /** Hide quick actions */
  hideActions?: boolean;

  /** Show earnings trend */
  showTrend?: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Loading skeleton for wallet widget
 */
function WalletBalanceWidgetSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state for wallet widget
 */
function WalletBalanceWidgetError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <Wallet className="mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-sm text-gray-600">
          C�zdan verileri y�klenemedi
        </p>
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Tekrar Dene
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Balance card component
 */
function BalanceCard({
  label,
  amount,
  icon: Icon,
  iconColor,
  trend,
}: {
  label: string;
  amount: number;
  icon: React.ElementType;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}) {
  return (
    <div className="rounded-lg border bg-gradient-to-br from-white to-gray-50 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`rounded-lg p-2 ${iconColor}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(amount, 'TRY')}
            </p>
          </div>
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT - SELLER (FREELANCER) VERSION
// ============================================================================

function SellerWalletBalance({
  compact = false,
  hideActions = false,
  showTrend = true,
  className = '',
}: WalletBalanceWidgetProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, error, refresh } = useSellerSnapshot();

  // ========================================================================
  // WEBSOCKET REAL-TIME UPDATES (Sprint 1 Day 4)
  // ========================================================================
  const [isUpdating, setIsUpdating] = useState(false);

  const { isConnected, isConnecting, disconnect } = useWebSocketWallet({
    userId: user?.id,
    enableNotifications: true,
    autoConnect: true,

    // Real-time balance update callback
    onBalanceUpdate: useCallback(
      (balance: {
        availableBalance: number;
        pendingBalance: number;
        totalEarnings: number;
      }) => {
        logger.info('Balance updated via WebSocket');

        // Show brief animation
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 1000);

        // Refresh snapshot data from backend
        refresh();

        // Optional: Show toast notification
        toast.success('Bakiye g�ncellendi', {
          description: `Yeni bakiye: ${formatCurrency(balance.availableBalance, 'TRY')}`,
          duration: 3000,
        });
      },
      [refresh]
    ),

    // New transaction notification
    onNewTransaction: useCallback(
      (transaction: { type: string; amount: number; description: string }) => {
        logger.info('New transaction received');

        // Refresh to get updated balance
        refresh();

        // Show notification based on transaction type
        const isIncoming = transaction.type === 'CREDIT';
        toast.info(isIncoming ? 'Yeni Para Giri�i' : 'Para ��k���', {
          description: `${formatCurrency(transaction.amount, 'TRY')} - ${transaction.description}`,
          duration: 5000,
        });
      },
      [refresh]
    ),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  if (isLoading) {
    return <WalletBalanceWidgetSkeleton />;
  }

  if (error || !data) {
    return <WalletBalanceWidgetError onRetry={refresh} />;
  }

  const handleWithdraw = () => {
    router.push('/wallet?action=withdraw');
  };

  const handleViewTransactions = () => {
    router.push('/wallet?tab=transactions');
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kullan�labilir Bakiye</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data.availableBalance, 'TRY')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWithdraw}
              className="ml-4"
            >
              <Download className="mr-2 h-4 w-4" />
              �ek
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card
        className={`overflow-hidden ${isUpdating ? 'ring-opacity-50 ring-2 ring-green-400' : ''}`}
      >
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-green-600" />
              <span className="text-gray-900">C�zdan Bakiyesi</span>
            </div>

            {/* WebSocket Connection Status */}
            <Badge
              variant={
                isConnected ? 'success' : isConnecting ? 'warning' : 'secondary'
              }
              className="flex items-center gap-1 text-xs"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Canl�</span>
                </>
              ) : isConnecting ? (
                <>
                  <Wifi className="h-3 w-3 animate-pulse" />
                  <span>Ba�lan�yor</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>�evrimd���</span>
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Balance Cards */}
            {/* Main Balance Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <BalanceCard
                label="Kullan�labilir Bakiye"
                amount={data.availableBalance}
                icon={DollarSign}
                iconColor="bg-green-600"
                trend={
                  showTrend
                    ? {
                        value: data.earningsGrowthRate,
                        isPositive: data.earningsGrowthRate >= 0,
                      }
                    : undefined
                }
              />

              <BalanceCard
                label="Bekleyen Bakiye"
                amount={data.pendingBalance}
                icon={Clock}
                iconColor="bg-yellow-600"
              />
            </div>

            {/* Total Earnings Summary */}
            <div className="rounded-lg border-l-4 border-blue-600 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Toplam Kazan�
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(data.totalEarnings, 'TRY')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Bu Ay</p>
                  <p className="font-semibold text-blue-900">
                    {formatCurrency(data.earningsThisMonth, 'TRY')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {!hideActions && (
              <div className="flex gap-3">
                <Button
                  onClick={handleWithdraw}
                  className="flex-1"
                  variant="primary"
                  disabled={data.availableBalance <= 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Para �ek
                </Button>
                <Button
                  onClick={handleViewTransactions}
                  className="flex-1"
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  ��lem Ge�mi�i
                </Button>
              </div>
            )}

            {/* Info Alert */}
            {data.availableBalance <= 0 && data.pendingBalance > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {formatCurrency(data.pendingBalance, 'TRY')} tutar�nda
                  bekleyen bakiyeniz var. Sipari�leriniz tamamland�k�a
                  kullan�labilir hale gelecek.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT - BUYER (EMPLOYER) VERSION
// ============================================================================

function BuyerWalletBalance({
  compact = false,
  hideActions = false,
  className = '',
}: WalletBalanceWidgetProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, error, refresh } = useBuyerSnapshot();

  // ========================================================================
  // WEBSOCKET REAL-TIME UPDATES (Sprint 1 Day 4)
  // ========================================================================
  const [isUpdating, setIsUpdating] = useState(false);

  const { isConnected, isConnecting, disconnect } = useWebSocketWallet({
    userId: user?.id,
    enableNotifications: true,
    autoConnect: true,

    // Real-time balance update callback
    onBalanceUpdate: useCallback(
      (balance: {
        availableBalance: number;
        pendingBalance: number;
        totalEarnings: number;
      }) => {
        logger.info('Balance updated via WebSocket (Buyer)');

        // Show brief animation
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 1000);

        // Refresh snapshot data from backend
        refresh();

        // Show toast notification
        toast.success('Bakiye g�ncellendi', {
          description: `Yeni bakiye: ${formatCurrency(balance.availableBalance, 'TRY')}`,
          duration: 3000,
        });
      },
      [refresh]
    ),

    // New transaction notification
    onNewTransaction: useCallback(
      (transaction: { type: string; amount: number; description: string }) => {
        logger.info('New transaction received (Buyer)');

        // Refresh to get updated balance
        refresh();

        // Show notification
        const isIncoming = transaction.type === 'CREDIT';
        toast.info(isIncoming ? 'Yeni Para Giri�i' : 'Para ��k���', {
          description: `${formatCurrency(transaction.amount, 'TRY')} - ${transaction.description}`,
          duration: 5000,
        });
      },
      [refresh]
    ),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  if (isLoading) {
    return <WalletBalanceWidgetSkeleton />;
  }

  if (error || !data) {
    return <WalletBalanceWidgetError onRetry={refresh} />;
  }

  const handleAddFunds = () => {
    router.push('/wallet?action=add-funds');
  };

  const handleViewTransactions = () => {
    router.push('/wallet?tab=transactions');
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">C�zdan Bakiyesi</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.walletBalance || 0, 'TRY')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddFunds}
              className="ml-4"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Y�kle
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card
        className={`overflow-hidden ${isUpdating ? 'ring-opacity-50 ring-2 ring-blue-400' : ''}`}
      >
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <span className="text-gray-900">C�zdan & Harcamalar</span>
            </div>

            {/* WebSocket Connection Status */}
            <Badge
              variant={
                isConnected ? 'success' : isConnecting ? 'warning' : 'secondary'
              }
              className="flex items-center gap-1 text-xs"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Canl�</span>
                </>
              ) : isConnecting ? (
                <>
                  <Wifi className="h-3 w-3 animate-pulse" />
                  <span>Ba�lan�yor</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>�evrimd���</span>
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Wallet Balance */}
            {/* Wallet Balance */}
            <BalanceCard
              label="C�zdan Bakiyesi"
              amount={data.walletBalance || 0}
              icon={Wallet}
              iconColor="bg-blue-600"
            />

            {/* Spending Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-gradient-to-br from-white to-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Harcama
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(data.totalSpent, 'TRY')}
                </p>
              </div>

              <div className="rounded-lg border bg-gradient-to-br from-white to-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600">Bu Ay</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(data.spentThisMonth, 'TRY')}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {!hideActions && (
              <div className="flex gap-3">
                <Button
                  onClick={handleAddFunds}
                  className="flex-1"
                  variant="primary"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Bakiye Y�kle
                </Button>
                <Button
                  onClick={handleViewTransactions}
                  className="flex-1"
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  ��lem Ge�mi�i
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// UNIFIED COMPONENT (AUTO-DETECTS USER ROLE)
// ============================================================================

/**
 * Unified Wallet Balance Widget
 * Automatically shows the right version based on user role
 *
 * @example
 * ```tsx
 * // In dashboard page
 * <WalletBalanceWidget showTrend />
 *
 * // Compact version in header
 * <WalletBalanceWidget compact />
 *
 * // Without actions
 * <WalletBalanceWidget hideActions />
 * ```
 */
export function WalletBalanceWidget(props: WalletBalanceWidgetProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Render based on user type
  if (user && 'userType' in user && user.userType === 'freelancer') {
    return <SellerWalletBalance {...props} />;
  }

  if (user && 'userType' in user && user.userType === 'employer') {
    return <BuyerWalletBalance {...props} />;
  }

  // Admin/moderator users don't have wallet widget
  return null;
}

// Export individual components for testing
export { SellerWalletBalance, BuyerWalletBalance };
