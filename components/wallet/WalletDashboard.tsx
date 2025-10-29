/**
 * ================================================
 * WALLET DASHBOARD COMPONENT
 * ================================================
 * Comprehensive wallet overview with balance, stats, and actions
 *
 * Features:
 * - Balance cards (available, pending, total earned)
 * - Quick action buttons
 * - Recent transactions widget
 * - Performance metrics
 * - Payout history summary
 * - Responsive design
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/loading';
import { formatCurrency, formatRelativeTime } from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';
import type {
  WalletBalance,
  Transaction,
  TransactionType,
} from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface WalletDashboardProps {
  balance?: WalletBalance;
  transactions?: Transaction[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onRequestPayout?: () => void;
  onViewTransactions?: () => void;
  onViewPayouts?: () => void;
  className?: string;
}

// ============================================================================
// BALANCE CARDS
// ============================================================================

interface BalanceCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'warning' | 'success' | 'default';
  onClick?: () => void;
}

function BalanceCard({
  title,
  amount,
  subtitle,
  icon,
  trend,
  variant = 'default',
  onClick,
}: BalanceCardProps) {
  const variantStyles = {
    primary: 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100',
    warning: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100',
    success: 'border-green-200 bg-gradient-to-br from-green-50 to-green-100',
    default: 'border-gray-200 bg-white',
  };

  const iconStyles = {
    primary: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white',
    success: 'bg-green-500 text-white',
    default: 'bg-gray-500 text-white',
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium text-gray-600">{title}</p>
            <h3 className="mb-1 text-3xl font-bold tracking-tight">
              {formatCurrency(amount, 'TRY')}
            </h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-semibold',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-xs text-gray-500">bu ay</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-full p-3', iconStyles[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
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
// TRANSACTION ITEM
// ============================================================================

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isCredit = transaction.type === 'CREDIT' || transaction.amount > 0;

  const typeLabels: Record<TransactionType, string> = {
    CREDIT: 'Gelir',
    DEBIT: 'Gider',
    ESCROW_HOLD: 'Emanet Tutma',
    ESCROW_RELEASE: 'Emanet Serbest Bırakma',
    PAYOUT: 'Para Çekme',
    REFUND: 'İade',
    FEE: 'Komisyon',
  };

  const typeIcons: Record<TransactionType, React.ReactNode> = {
    CREDIT: <ArrowUpRight className="h-4 w-4" />,
    DEBIT: <ArrowDownRight className="h-4 w-4" />,
    ESCROW_HOLD: <Clock className="h-4 w-4" />,
    ESCROW_RELEASE: <CheckCircle2 className="h-4 w-4" />,
    PAYOUT: <Send className="h-4 w-4" />,
    REFUND: <RefreshCw className="h-4 w-4" />,
    FEE: <DollarSign className="h-4 w-4" />,
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          )}
        >
          {typeIcons[transaction.type as TransactionType]}
        </div>
        <div>
          <p className="font-medium">{transaction.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {typeLabels[transaction.type as TransactionType]}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(transaction.createdAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'text-lg font-semibold',
            isCredit ? 'text-green-600' : 'text-red-600'
          )}
        >
          {isCredit ? '+' : '-'}
          {formatCurrency(Math.abs(transaction.amount), 'TRY')}
        </p>
        <p className="text-xs text-gray-500">
          Bakiye: {formatCurrency(transaction.balanceAfter, 'TRY')}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// RECENT TRANSACTIONS
// ============================================================================

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll?: () => void;
  isLoading?: boolean;
}

function RecentTransactions({
  transactions,
  onViewAll,
  isLoading,
}: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} variant="compact" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Son İşlemler
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Tümünü Gör
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <AlertCircle className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="text-sm">Henüz işlem bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STATS SUMMARY
// ============================================================================

interface StatsSummaryProps {
  stats: {
    totalTransactions: number;
    pendingPayouts: number;
    completedPayouts: number;
    averageTransaction: number;
  };
}

function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam İşlem</p>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen Çekim</p>
              <p className="text-2xl font-bold">{stats.pendingPayouts}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold">{stats.completedPayouts}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ort. İşlem</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.averageTransaction, 'TRY', {
                  useSymbol: false,
                })}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export function WalletDashboard({
  balance,
  transactions = [],
  isLoading = false,
  error,
  onRefresh,
  onRequestPayout,
  onViewTransactions,
  onViewPayouts,
  className,
}: WalletDashboardProps) {
  const router = useRouter();

  // Calculate stats
  const stats = {
    totalTransactions: transactions.length,
    pendingPayouts: balance?.pendingPayouts || 0,
    completedPayouts: Math.floor((balance?.totalEarnings || 0) / 1000), // Mock data
    averageTransaction:
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
          transactions.length
        : 0,
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      label: 'Para Çek',
      icon: <Send className="h-5 w-5" />,
      onClick: () =>
        onRequestPayout?.() ||
        router.push('/dashboard/freelancer/wallet/payouts'),
      variant: 'primary',
      disabled: !balance || balance.availableBalance <= 0,
    },
    {
      label: 'İşlem Geçmişi',
      icon: <TrendingUp className="h-5 w-5" />,
      onClick: () =>
        onViewTransactions?.() ||
        router.push('/dashboard/freelancer/wallet/transactions'),
      variant: 'outline',
    },
    {
      label: 'Çekim Geçmişi',
      icon: <Download className="h-5 w-5" />,
      onClick: () =>
        onViewPayouts?.() ||
        router.push('/dashboard/freelancer/wallet/payouts'),
      variant: 'outline',
    },
    {
      label: 'Yenile',
      icon: <RefreshCw className="h-5 w-5" />,
      onClick: () => onRefresh?.(),
      variant: 'outline',
    },
  ];

  // Error state
  if (error) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">
                  Cüzdan Yüklenemedi
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button onClick={onRefresh} className="mt-4" variant="outline">
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading && !balance) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} variant="default" />
          ))}
        </div>
        <SkeletonCard variant="detailed" />
        <SkeletonCard variant="detailed" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <BalanceCard
          title="Kullanılabilir Bakiye"
          amount={balance?.availableBalance || 0}
          subtitle="Çekebileceğiniz tutar"
          icon={<WalletIcon className="h-6 w-6" />}
          variant="primary"
          trend={{ value: 12.5, isPositive: true }}
        />
        <BalanceCard
          title="Bekleyen Bakiye"
          amount={balance?.pendingBalance || 0}
          subtitle="Emanette tutulan tutar"
          icon={<Clock className="h-6 w-6" />}
          variant="warning"
        />
        <BalanceCard
          title="Toplam Kazanç"
          amount={balance?.totalEarnings || 0}
          subtitle="Tüm zamanlar toplamı"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="success"
          trend={{ value: 8.3, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Stats Summary */}
      <StatsSummary stats={stats} />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        onViewAll={onViewTransactions}
        isLoading={isLoading}
      />
    </div>
  );
}

export default WalletDashboard;
