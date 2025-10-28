/**
 * ================================================
 * TRANSACTION FILTERS - Transaction Filtering Component
 * ================================================
 * Provides filtering options for transaction history
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Filter, X } from 'lucide-react';
import type {
  TransactionFilters as Filters,
  TransactionType,
} from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface TransactionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClear: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.type ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount;

  return (
    <Card>
      <CardContent className="p-4">
        {/* Filter Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            Filtreler
            {hasActiveFilters && (
              <span className="bg-primary rounded-full px-2 py-0.5 text-xs text-white">
                Aktif
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
              Temizle
            </button>
          )}
        </div>

        {/* Filter Form */}
        {isExpanded && (
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Transaction Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                İşlem Tipi
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    type: (e.target.value as TransactionType) || undefined,
                  })
                }
                className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              >
                <option value="">Tümü</option>
                <option value="CREDIT">Ödeme Alındı</option>
                <option value="ESCROW_RELEASE">Ödeme Serbest Bırakıldı</option>
                <option value="ESCROW_HOLD">Ödeme Beklemede</option>
                <option value="PAYOUT">Para Çekme</option>
                <option value="REFUND">İade</option>
                <option value="FEE">Komisyon</option>
                <option value="DEBIT">Ödeme Gönderildi</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, startDate: e.target.value })
                }
                className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, endDate: e.target.value })
                }
                className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </div>

            {/* Amount Range */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tutar Aralığı
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minAmount: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      maxAmount: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

TransactionFilters.displayName = 'TransactionFilters';
