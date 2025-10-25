/**
 * ================================================
 * RECENT TRANSACTIONS WIDGET - Latest Transactions Display
 * ================================================
 * Shows the most recent wallet transactions with icons and details
 * Provides quick overview of recent account activity
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  RefreshCw,
  CreditCard,
  AlertCircle,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { useTransactions } from '@/hooks/business/wallet';
import {
  TransactionType,
  formatCurrency,
} from '@/types/business/features/wallet';
import Link from 'next/link';

// ================================================
// TYPES
// ================================================

export interface RecentTransactionsWidgetProps {
  /**
   * Number of transactions to display
   * @default 5
   */
  limit?: number;

  /**
   * Custom className for styling
   */
  className?: string;

  /**
   * Show "View All" link
   * @default true
   */
  showViewAll?: boolean;
}

// ================================================
// HELPERS
// ================================================

function getTransactionIcon(type: TransactionType) {
  switch (type) {
    case TransactionType.PAYMENT_RECEIVED:
    case TransactionType.PAYMENT_RELEASED:
    case TransactionType.REFUND_RECEIVED:
      return <ArrowDownCircle className="h-5 w-5 text-green-600" />;

    case TransactionType.PAYOUT_REQUESTED:
    case TransactionType.PAYOUT_COMPLETED:
    case TransactionType.REFUND_ISSUED:
      return <ArrowUpCircle className="h-5 w-5 text-blue-600" />;

    case TransactionType.PAYMENT_HELD:
      return <Clock className="h-5 w-5 text-amber-600" />;

    case TransactionType.PAYOUT_FAILED:
    case TransactionType.PAYOUT_CANCELLED:
      return <AlertCircle className="h-5 w-5 text-red-600" />;

    case TransactionType.FEE:
      return <CreditCard className="h-5 w-5 text-gray-600" />;

    case TransactionType.ADJUSTMENT:
      return <RefreshCw className="h-5 w-5 text-purple-600" />;

    default:
      return <DollarSign className="h-5 w-5 text-gray-600" />;
  }
}

function getTransactionLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    [TransactionType.PAYMENT_RECEIVED]: 'Ödeme Alındı',
    [TransactionType.PAYMENT_RELEASED]: 'Ödeme Serbest Bırakıldı',
    [TransactionType.PAYMENT_HELD]: 'Ödeme Beklemede',
    [TransactionType.PAYOUT_REQUESTED]: 'Para Çekme Talebi',
    [TransactionType.PAYOUT_COMPLETED]: 'Para Çekme Tamamlandı',
    [TransactionType.PAYOUT_FAILED]: 'Para Çekme Başarısız',
    [TransactionType.PAYOUT_CANCELLED]: 'Para Çekme İptal',
    [TransactionType.REFUND_RECEIVED]: 'İade Alındı',
    [TransactionType.REFUND_ISSUED]: 'İade Yapıldı',
    [TransactionType.ADJUSTMENT]: 'Düzeltme',
    [TransactionType.FEE]: 'Komisyon',
  };
  return labels[type] || type;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// ================================================
// COMPONENT
// ================================================

export const RecentTransactionsWidget: React.FC<
  RecentTransactionsWidgetProps
> = ({ limit = 5, className = '', showViewAll = true }) => {
  // ==================== HOOKS ====================

  const { transactions, isLoading, error } = useTransactions(true);

  // ==================== COMPUTED VALUES ====================

  const recentTransactions = useMemo(
    () => transactions.slice(0, limit),
    [transactions, limit]
  );

  // ==================== RENDER ====================

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Clock className="text-primary h-5 w-5" />
          Son İşlemler
        </CardTitle>
        {showViewAll && transactions.length > limit && (
          <Link
            href="/dashboard/freelancer/wallet/transactions"
            className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
          >
            Tümünü Gör
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-lg p-3"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
                <div className="h-6 w-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">
            <AlertCircle className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm font-medium">İşlemler yüklenemedi</p>
            <p className="mt-1 text-xs text-red-500">{error}</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <DollarSign className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm">Henüz işlem bulunmamaktadır</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map((transaction) => {
              const isCredit =
                transaction.type === TransactionType.PAYMENT_RECEIVED ||
                transaction.type === TransactionType.PAYMENT_RELEASED ||
                transaction.type === TransactionType.REFUND_RECEIVED;

              return (
                <div
                  key={transaction.id}
                  className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-white group-hover:shadow-sm">
                    {getTransactionIcon(transaction.type)}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {getTransactionLabel(transaction.type)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="text-muted-foreground text-xs">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.description && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <p className="text-muted-foreground truncate text-xs">
                            {transaction.description}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0 text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isCredit
                          ? 'text-green-600'
                          : transaction.amount < 0
                            ? 'text-red-600'
                            : 'text-gray-900'
                      }`}
                    >
                      {isCredit && '+'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

RecentTransactionsWidget.displayName = 'RecentTransactionsWidget';
