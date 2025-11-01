/**
 * ================================================
 * TRANSACTION FILTERS
 * ================================================
 * Filter panel for transaction filtering
 */

'use client';

import { X } from 'lucide-react';
import { TransactionType } from '@/types/business/features/wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/UnifiedButton';
import type { TransactionFilters } from '@/types/business/features/wallet';
import { TRANSACTION_TYPE_LABELS } from '../utils/transactionHelpers';

export interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  onClear,
  isOpen,
  onToggle,
}: TransactionFiltersProps) {
  if (!isOpen) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtreler</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              İşlem Tipi
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  type: (e.target.value || undefined) as
                    | TransactionType
                    | undefined,
                })
              }
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="">Tümü</option>
              {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range - Start */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  startDate: e.target.value || undefined,
                })
              }
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Date Range - End */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  endDate: e.target.value || undefined,
                })
              }
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Amount Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Minimum Tutar
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minAmount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minAmount: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClear}>
            Temizle
          </Button>
          <Button onClick={onToggle}>Uygula</Button>
        </div>
      </CardContent>
    </Card>
  );
}
