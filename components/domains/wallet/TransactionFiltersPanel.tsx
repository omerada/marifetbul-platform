/**
 * ================================================
 * TRANSACTION FILTERS PANEL
 * ================================================
 * Filtering and search UI for transaction history
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1
 */

'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, DollarSign } from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface TransactionFilters {
  search?: string;
  type?: 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'COMMISSION';
  status?: 'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

interface TransactionFiltersPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onReset: () => void;
  totalTransactions?: number;
  filteredCount?: number;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function TransactionFiltersPanel({
  filters,
  onFiltersChange,
  onReset,
  totalTransactions,
  filteredCount,
}: TransactionFiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'ALL' ? undefined : value,
    });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([_key, value]) => value !== undefined && value !== '' && value !== 'ALL'
  ).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Filtreler</h3>
            <p className="text-sm text-gray-600">
              {totalTransactions !== undefined && filteredCount !== undefined
                ? `${filteredCount} / ${totalTransactions} işlem`
                : 'İşlemleri filtreleyin'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {activeFilterCount} filtre aktif
              </span>
              <button
                onClick={onReset}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
          >
            {isExpanded ? 'Gizle' : 'Göster'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {isExpanded && (
        <div className="space-y-4 p-4">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Ara
              </div>
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="İşlem açıklaması, ID veya referans numarası"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Transaction Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                İşlem Türü
              </label>
              <select
                value={filters.type || 'ALL'}
                onChange={(e) =>
                  handleFilterChange(
                    'type',
                    e.target.value as TransactionFilters['type']
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">Tümü</option>
                <option value="DEPOSIT">Para Yatırma</option>
                <option value="WITHDRAWAL">Para Çekme</option>
                <option value="PAYMENT">Ödeme</option>
                <option value="REFUND">İade</option>
                <option value="COMMISSION">Komisyon</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Durum
              </label>
              <select
                value={filters.status || 'ALL'}
                onChange={(e) =>
                  handleFilterChange(
                    'status',
                    e.target.value as TransactionFilters['status']
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">Tümü</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="PENDING">Beklemede</option>
                <option value="FAILED">Başarısız</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tarih Aralığı
              </div>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Başlangıç
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) =>
                    handleFilterChange('dateFrom', e.target.value)
                  }
                  max={filters.dateTo || undefined}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Bitiş
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  min={filters.dateFrom || undefined}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tutar Aralığı (TL)
              </div>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Minimum
                </label>
                <input
                  type="number"
                  value={filters.amountMin || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'amountMin',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Maksimum
                </label>
                <input
                  type="number"
                  value={filters.amountMax || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'amountMax',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="0.00"
                  min={filters.amountMin || 0}
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Hızlı Filtreler
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  handleFilterChange('dateFrom', today);
                  handleFilterChange('dateTo', today);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Bugün
              </button>
              <button
                onClick={() => {
                  const last7Days = new Date();
                  last7Days.setDate(last7Days.getDate() - 7);
                  handleFilterChange(
                    'dateFrom',
                    last7Days.toISOString().split('T')[0]
                  );
                  handleFilterChange(
                    'dateTo',
                    new Date().toISOString().split('T')[0]
                  );
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Son 7 Gün
              </button>
              <button
                onClick={() => {
                  const last30Days = new Date();
                  last30Days.setDate(last30Days.getDate() - 30);
                  handleFilterChange(
                    'dateFrom',
                    last30Days.toISOString().split('T')[0]
                  );
                  handleFilterChange(
                    'dateTo',
                    new Date().toISOString().split('T')[0]
                  );
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Son 30 Gün
              </button>
              <button
                onClick={() => {
                  handleFilterChange('type', 'DEPOSIT');
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Sadece Gelir
              </button>
              <button
                onClick={() => {
                  handleFilterChange('type', 'WITHDRAWAL');
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Sadece Gider
              </button>
            </div>
          </div>

          {/* Applied Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="mb-2 text-sm font-medium text-blue-900">
                Aktif Filtreler:
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-blue-900">
                    Arama: {filters.search}
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.type && filters.type !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-blue-900">
                    Tür: {filters.type}
                    <button
                      onClick={() => handleFilterChange('type', 'ALL')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.status && filters.status !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-blue-900">
                    Durum: {filters.status}
                    <button
                      onClick={() => handleFilterChange('status', 'ALL')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-blue-900">
                    Tarih: {filters.dateFrom} - {filters.dateTo}
                    <button
                      onClick={() => {
                        handleFilterChange('dateFrom', '');
                        handleFilterChange('dateTo', '');
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.amountMin || filters.amountMax) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-blue-900">
                    Tutar: {filters.amountMin || 0} - {filters.amountMax || '∞'}{' '}
                    TL
                    <button
                      onClick={() => {
                        handleFilterChange('amountMin', undefined);
                        handleFilterChange('amountMax', undefined);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionFiltersPanel;
