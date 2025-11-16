'use client';

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
  CreditCard,
  AlertCircle,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { useTransactions } from '@/hooks/business/wallet';
import { TransactionType } from '@/types/business/features/wallet';
import { formatCurrency, formatRelativeTime } from '@/lib/shared/formatters';
import { MilestoneTransactionBadge } from './MilestoneTransactionBadge';
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
    case TransactionType.CREDIT:
    case TransactionType.ESCROW_RELEASE:
    case TransactionType.REFUND:
      return <ArrowDownCircle className="h-5 w-5 text-green-600" />;

    case TransactionType.DEBIT:
    case TransactionType.PAYOUT:
      return <ArrowUpCircle className="h-5 w-5 text-blue-600" />;

    case TransactionType.ESCROW_HOLD:
      return <Clock className="h-5 w-5 text-amber-600" />;

    case TransactionType.MILESTONE_PAYMENT:
      // Sprint 1 - Story 2.3: Milestone payment icon
      return <ArrowDownCircle className="h-5 w-5 text-purple-600" />;

    case TransactionType.FEE:
      return <CreditCard className="h-5 w-5 text-gray-600" />;

    default:
      return <DollarSign className="h-5 w-5 text-gray-600" />;
  }
}

function getTransactionLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    [TransactionType.CREDIT]: 'Gelen Ödeme',
    [TransactionType.DEBIT]: 'Giden Ödeme',
    [TransactionType.ESCROW_HOLD]: 'Ödeme Tutuldu',
    [TransactionType.ESCROW_RELEASE]: 'Ödeme Serbest',
    [TransactionType.MILESTONE_PAYMENT]: 'Milestone Ödemesi', // Sprint 1 - Story 2.3
    [TransactionType.PAYOUT]: 'Para Çekme',
    [TransactionType.REFUND]: 'İade',
    [TransactionType.FEE]: 'Komisyon',
  };
  return labels[type] || type;
}

// Sprint 1 Cleanup: Local formatDate removed - using formatRelativeTime from canonical formatters

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
            href="/dashboard/wallet/transactions"
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
                transaction.type === TransactionType.CREDIT ||
                transaction.type === TransactionType.ESCROW_RELEASE ||
                transaction.type === TransactionType.REFUND;

              // Sprint 1 Story 1.6: Extract milestone info from metadata
              const isMilestonePayment =
                transaction.type === TransactionType.MILESTONE_PAYMENT;
              const milestoneData = isMilestonePayment
                ? (transaction.metadata as {
                    milestoneSequence?: number;
                    milestoneTotalCount?: number;
                    milestoneTitle?: string;
                    orderId?: string;
                  })
                : undefined;

              return (
                <div
                  key={transaction.id}
                  className="group flex flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-white group-hover:shadow-sm">
                      {getTransactionIcon(transaction.type as TransactionType)}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {getTransactionLabel(
                          transaction.type as TransactionType
                        )}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="text-muted-foreground text-xs">
                          {formatRelativeTime(transaction.createdAt)}
                        </p>
                        {transaction.description && !isMilestonePayment && (
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

                  {/* Sprint 1 Story 1.6: Milestone badge for milestone payments */}
                  {isMilestonePayment &&
                    milestoneData?.milestoneSequence &&
                    milestoneData?.milestoneTotalCount &&
                    milestoneData?.milestoneTitle && (
                      <div className="ml-13">
                        <MilestoneTransactionBadge
                          sequence={milestoneData.milestoneSequence}
                          totalCount={milestoneData.milestoneTotalCount}
                          title={milestoneData.milestoneTitle}
                          orderId={milestoneData.orderId}
                          compact
                          showLink
                        />
                      </div>
                    )}
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
