/**
 * ================================================
 * CARD VIEW - Mobile Transaction Display
 * ================================================
 * Card-based transaction view optimized for mobile
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
} from '../utils/transactionHelpers';

export interface CardViewProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

function CardViewComponent({
  transactions,
  onTransactionClick,
}: CardViewProps) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
      role="list"
      aria-label="İşlem kartları"
    >
      {transactions.map((transaction) => {
        const iconConfig = getTransactionIcon(transaction.type);

        return (
          <Card
            key={transaction.id}
            role="listitem"
            tabIndex={onTransactionClick ? 0 : undefined}
            className={`p-4 transition-all ${
              onTransactionClick
                ? 'hover:border-primary/50 cursor-pointer hover:shadow-md'
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
            {/* Header: Icon + Amount */}
            <div className="mb-3 flex items-start justify-between">
              <div className={`rounded-full p-3 ${iconConfig.colorClass}`}>
                {iconConfig.icon}
              </div>

              <div className="text-right">
                <div
                  className={`text-lg font-bold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.amount >= 0 ? '+' : ''}
                  {formatCurrency(
                    transaction.amount,
                    transaction.currency || 'TRY'
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatDate(transaction.createdAt, 'SHORT')}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">
                {transaction.description}
              </p>
            </div>

            {/* Footer: Badge + Balance */}
            <div className="flex items-center justify-between border-t pt-3">
              <Badge variant={getTransactionTypeBadgeVariant(transaction.type)}>
                {getTransactionTypeLabel(transaction.type)}
              </Badge>

              {transaction.balanceAfter !== undefined && (
                <div className="text-xs text-gray-600">
                  <span className="text-gray-500">Bakiye:</span>{' '}
                  <span className="font-medium">
                    {formatCurrency(
                      transaction.balanceAfter,
                      transaction.currency || 'TRY'
                    )}
                  </span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Export memoized component for performance
export const CardView = memo(CardViewComponent);
CardView.displayName = 'CardView';
