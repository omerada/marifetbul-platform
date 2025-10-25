/**
 * ================================================
 * TRANSACTION LIST - Transaction History Display
 * ================================================
 * Displays list of wallet transactions with details
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { Card, CardContent } from '@/components/ui/Card';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  AlertCircle,
  CreditCard,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import {
  TransactionType,
  formatCurrency,
} from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
  referenceId?: string;
}

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
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

// ================================================
// COMPONENT
// ================================================

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-4 rounded-lg p-4"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="ml-auto h-5 w-20 rounded bg-gray-200" />
                  <div className="ml-auto h-3 w-16 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <DollarSign className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            İşlem Bulunamadı
          </h3>
          <p className="text-muted-foreground text-sm">
            Seçilen filtrelere uygun işlem bulunmamaktadır
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {transactions.map((transaction) => {
            const isCredit =
              transaction.type === TransactionType.PAYMENT_RECEIVED ||
              transaction.type === TransactionType.PAYMENT_RELEASED ||
              transaction.type === TransactionType.REFUND_RECEIVED;

            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                  {getTransactionIcon(transaction.type)}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {getTransactionLabel(transaction.type)}
                    </p>
                    {transaction.referenceId && (
                      <span className="text-xs text-gray-400">
                        #{transaction.referenceId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {transaction.description}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(transaction.createdAt).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Amount & Balance */}
                <div className="flex-shrink-0 text-right">
                  <p
                    className={`mb-1 text-base font-semibold ${
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
                  <p className="text-muted-foreground text-xs">
                    Bakiye: {formatCurrency(transaction.balanceAfter)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

TransactionList.displayName = 'TransactionList';
