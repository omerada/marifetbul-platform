/**
 * ================================================
 * LIST VIEW - Compact Transaction Display
 * ================================================
 * List-based transaction view for compact display
 * Optimized with React.memo for performance
 */

'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { Transaction } from '@/types/business/features/wallet';
import {
  getTransactionTypeLabel,
  getTransactionTypeBadgeVariant,
  getTransactionIcon,
} from './utils/transactionHelpers';

export interface ListViewProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

function ListViewComponent({
  transactions,
  onTransactionClick,
}: ListViewProps) {
  return (
    <div className="space-y-2" role="list" aria-label="İşlem listesi">
      {transactions.map((transaction) => {
        const iconConfig = getTransactionIcon(transaction.type);

        return (
          <Card
            key={transaction.id}
            role="listitem"
            tabIndex={onTransactionClick ? 0 : undefined}
            className={`p-4 transition-all ${
              onTransactionClick
                ? 'hover:border-primary/50 cursor-pointer hover:shadow-sm'
                : ''
            }`}
            onClick={() => onTransactionClick?.(transaction)}
            onKeyDown={(e) => {
              if (onTransactionClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onTransactionClick(transaction);
              }
            }}
            aria-label={`${getTransactionTypeLabel(transaction.type)} işlemi: ${transaction.description}, ${formatCurrency(transaction.amount)}, ${formatDate(transaction.createdAt, 'SHORT')}`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left: Icon + Description */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={`shrink-0 rounded-full p-2 ${iconConfig.colorClass}`}
                >
                  {iconConfig.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={getTransactionTypeBadgeVariant(transaction.type)}
                      className="text-xs"
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt, 'RELATIVE')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="shrink-0 text-right">
                <div
                  className={`text-base font-semibold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.amount >= 0 ? '+' : ''}
                  {formatCurrency(
                    transaction.amount,
                    transaction.currency || 'TRY'
                  )}
                </div>
                {transaction.balanceAfter !== undefined && (
                  <div className="mt-1 text-xs text-gray-500">
                    Bakiye:{' '}
                    {formatCurrency(
                      transaction.balanceAfter,
                      transaction.currency || 'TRY'
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Export memoized component for performance
export const ListView = memo(ListViewComponent);
ListView.displayName = 'ListView';
