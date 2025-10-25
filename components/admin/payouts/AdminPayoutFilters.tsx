/**
 * ================================================
 * ADMIN PAYOUT FILTERS
 * ================================================
 * Filter controls for payout management page
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 26, 2025
 */

'use client';

import { useState } from 'react';
import { PayoutStatus } from '@/types/business/features/wallet';
import type { PayoutFilters } from '@/lib/api/admin/payout-admin-api';
import { Filter, X, ChevronDown } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface AdminPayoutFiltersProps {
  filters: PayoutFilters;
  onFiltersChange: (filters: PayoutFilters) => void;
  onClear: () => void;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export const AdminPayoutFilters: React.FC<AdminPayoutFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any filters are active
  const hasActiveFilters =
    filters.status ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.userId;

  // ==================== HANDLERS ====================

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status ? (status as PayoutStatus) : undefined,
    });
  };

  const handleStartDateChange = (date: string) => {
    onFiltersChange({
      ...filters,
      startDate: date || undefined,
    });
  };

  const handleEndDateChange = (date: string) => {
    onFiltersChange({
      ...filters,
      endDate: date || undefined,
    });
  };

  const handleMinAmountChange = (amount: string) => {
    onFiltersChange({
      ...filters,
      minAmount: amount ? parseFloat(amount) : undefined,
    });
  };

  const handleMaxAmountChange = (amount: string) => {
    onFiltersChange({
      ...filters,
      maxAmount: amount ? parseFloat(amount) : undefined,
    });
  };

  const handleUserIdChange = (userId: string) => {
    onFiltersChange({
      ...filters,
      userId: userId || undefined,
    });
  };

  // ==================== RENDER ====================

  return (
    <div
      className={cn(
        'mb-6 rounded-lg border border-gray-200 bg-white',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtreler</h3>
          {hasActiveFilters && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Aktif
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="mr-1 h-3 w-3" />
              Temizle
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-md p-1 hover:bg-gray-100 lg:hidden"
            aria-label={isExpanded ? 'Filtreleri gizle' : 'Filtreleri göster'}
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className={cn('p-4', !isExpanded && 'hidden lg:block')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Status Filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Durum
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Tümü</option>
              <option value={PayoutStatus.PENDING}>Beklemede</option>
              <option value={PayoutStatus.PROCESSING}>İşleniyor</option>
              <option value={PayoutStatus.COMPLETED}>Tamamlandı</option>
              <option value={PayoutStatus.FAILED}>Başarısız</option>
              <option value={PayoutStatus.CANCELLED}>İptal Edildi</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="start-date-filter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Başlangıç Tarihi
            </label>
            <input
              id="start-date-filter"
              type="date"
              value={filters.startDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleStartDateChange(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end-date-filter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Bitiş Tarihi
            </label>
            <input
              id="end-date-filter"
              type="date"
              value={filters.endDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleEndDateChange(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Min Amount */}
          <div>
            <label
              htmlFor="min-amount-filter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Min. Tutar (₺)
            </label>
            <input
              id="min-amount-filter"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={filters.minAmount || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleMinAmountChange(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label
              htmlFor="max-amount-filter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Max. Tutar (₺)
            </label>
            <input
              id="max-amount-filter"
              type="number"
              min="0"
              step="0.01"
              placeholder="50000.00"
              value={filters.maxAmount || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleMaxAmountChange(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* User ID / Search */}
          <div>
            <label
              htmlFor="user-id-filter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Kullanıcı ID
            </label>
            <input
              id="user-id-filter"
              type="text"
              placeholder="UUID"
              value={filters.userId || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleUserIdChange(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
            <span className="text-sm font-medium text-gray-700">
              Aktif Filtreler:
            </span>

            {filters.status && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                Durum: {filters.status}
                <button
                  onClick={() => handleStatusChange('')}
                  className="hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.startDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                Başlangıç: {filters.startDate}
                <button
                  onClick={() => handleStartDateChange('')}
                  className="hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.endDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                Bitiş: {filters.endDate}
                <button
                  onClick={() => handleEndDateChange('')}
                  className="hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.minAmount && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                Min: ₺{filters.minAmount}
                <button
                  onClick={() => handleMinAmountChange('')}
                  className="hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.maxAmount && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                Max: ₺{filters.maxAmount}
                <button
                  onClick={() => handleMaxAmountChange('')}
                  className="hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.userId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                Kullanıcı: {filters.userId.substring(0, 8)}...
                <button
                  onClick={() => handleUserIdChange('')}
                  className="hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

AdminPayoutFilters.displayName = 'AdminPayoutFilters';
