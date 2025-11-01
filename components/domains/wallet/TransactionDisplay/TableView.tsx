/**
 * ================================================
 * TABLE VIEW - Desktop Transaction Display
 * ================================================
 * Table-based transaction view for desktop screens
 */

'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { Transaction } from '@/types/business/features/wallet';
import {
  getTransactionTypeLabel,
  getTransactionTypeBadgeVariant,
  getTransactionIcon,
} from '../utils/transactionHelpers';

export interface TableViewProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TableView({
  transactions,
  onTransactionClick,
}: TableViewProps) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left text-sm font-medium text-gray-700">
                Tarih
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">
                Açıklama
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">
                Tip
              </th>
              <th className="p-4 text-right text-sm font-medium text-gray-700">
                Tutar
              </th>
              <th className="p-4 text-right text-sm font-medium text-gray-700">
                Bakiye
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const iconConfig = getTransactionIcon(transaction.type);

              return (
                <tr
                  key={transaction.id}
                  className={`border-b transition-colors ${
                    onTransactionClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onTransactionClick?.(transaction)}
                >
                  <td className="p-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.createdAt, 'SHORT')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt, 'TIME')}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${iconConfig.colorClass}`}
                      >
                        {iconConfig.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <Badge
                      variant={getTransactionTypeBadgeVariant(transaction.type)}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </Badge>
                  </td>

                  <td className="p-4 text-right">
                    <span
                      className={`text-sm font-semibold ${
                        transaction.amount >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.amount >= 0 ? '+' : ''}
                      {formatCurrency(
                        transaction.amount,
                        transaction.currency || 'TRY'
                      )}
                    </span>
                  </td>

                  <td className="p-4 text-right text-sm text-gray-600">
                    {transaction.balanceAfter !== undefined &&
                      formatCurrency(
                        transaction.balanceAfter,
                        transaction.currency || 'TRY'
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
