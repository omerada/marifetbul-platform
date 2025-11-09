'use client';

/**
 * ================================================
 * ADVANCED ORDER FILTERS
 * ================================================
 * Advanced filtering UI for order lists
 *
 * Features:
 * - Status multi-select
 * - Date range picker
 * - Amount range filter
 * - Search by order number/title
 * - Sort options
 * - Filter presets
 * - Clear all filters
 * - Active filter count badge
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  ArrowUpDown,
  ChevronDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface OrderFilterValues {
  search?: string;
  statuses?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedOrderFiltersProps {
  /** Current filter values */
  filters: OrderFilterValues;
  /** Filter change handler */
  onFiltersChange: (filters: OrderFilterValues) => void;
  /** Available status options */
  statusOptions?: Array<{ value: string; label: string }>;
  /** Show amount filter */
  showAmountFilter?: boolean;
  /** Show sort options */
  showSortOptions?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// ================================================
// DEFAULT OPTIONS
// ================================================

const DEFAULT_STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Ödeme Bekliyor' },
  { value: 'PAID', label: 'Ödendi' },
  { value: 'IN_PROGRESS', label: 'Devam Ediyor' },
  { value: 'IN_REVIEW', label: 'İncelemede' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
  { value: 'CANCELLED', label: 'İptal Edildi' },
  { value: 'DISPUTED', label: 'İtiraz Var' },
  { value: 'REFUNDED', label: 'İade Edildi' },
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'En Yeni' },
  { value: 'createdAt_asc', label: 'En Eski' },
  { value: 'amount_desc', label: 'Tutar: Yüksek-Düşük' },
  { value: 'amount_asc', label: 'Tutar: Düşük-Yüksek' },
  { value: 'deadline_asc', label: 'Teslimat Tarihi' },
];

// ================================================
// HELPER COMPONENTS
// ================================================

function StatusDropdown({
  selectedStatuses,
  onChange,
  options,
}: {
  selectedStatuses: string[];
  onChange: (statuses: string[]) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Durum
          {selectedStatuses.length > 0 && (
            <Badge variant="default" size="sm">
              {selectedStatuses.length}
            </Badge>
          )}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="max-h-64 overflow-y-auto p-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors',
                    selectedStatuses.includes(option.value)
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <span>{option.label}</span>
                  {selectedStatuses.includes(option.value) && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange([]);
                  setIsOpen(false);
                }}
                className="w-full"
              >
                Temizle
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function AdvancedOrderFilters({
  filters,
  onFiltersChange,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  showAmountFilter = true,
  showSortOptions = true,
  compact = false,
}: AdvancedOrderFiltersProps) {
  // ================================================
  // STATE
  // ================================================

  const [showAdvanced, setShowAdvanced] = useState(false);

  // ================================================
  // COMPUTED VALUES
  // ================================================

  const activeFilterCount = [
    filters.search && filters.search.length > 0,
    filters.statuses && filters.statuses.length > 0,
    filters.dateFrom || filters.dateTo,
    filters.amountMin !== undefined || filters.amountMax !== undefined,
  ].filter(Boolean).length;

  // ================================================
  // HANDLERS
  // ================================================

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (statuses: string[]) => {
    onFiltersChange({ ...filters, statuses });
  };

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ ...filters, dateFrom: value });
  };

  const handleDateToChange = (value: string) => {
    onFiltersChange({ ...filters, dateTo: value });
  };

  const handleAmountMinChange = (value: string) => {
    onFiltersChange({
      ...filters,
      amountMin: value ? parseFloat(value) : undefined,
    });
  };

  const handleAmountMaxChange = (value: string) => {
    onFiltersChange({
      ...filters,
      amountMax: value ? parseFloat(value) : undefined,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('_');
    onFiltersChange({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Card className="overflow-hidden">
      {/* Basic Filters */}
      <div className={cn('p-4', compact ? 'space-y-2' : 'space-y-4')}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Sipariş numarası veya başlık ara..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <StatusDropdown
            selectedStatuses={filters.statuses || []}
            onChange={handleStatusChange}
            options={statusOptions}
          />
        </div>

        {/* Advanced Toggle & Clear */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm"
          >
            {showAdvanced ? 'Gelişmiş Filtreleri Gizle' : 'Gelişmiş Filtreler'}
            <ChevronDown
              className={cn(
                'ml-1 h-4 w-4 transition-transform',
                showAdvanced && 'rotate-180'
              )}
            />
          </Button>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm">
                {activeFilterCount} filtre aktif
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                <X className="mr-1 h-4 w-4" />
                Temizle
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                Tarih Aralığı
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Amount Range */}
            {showAmountFilter && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4" />
                  Tutar Aralığı (TRY)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.amountMin || ''}
                    onChange={(e) => handleAmountMinChange(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.amountMax || ''}
                    onChange={(e) => handleAmountMaxChange(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Options */}
      {showSortOptions && (
        <div className="border-t border-gray-100 bg-white p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ArrowUpDown className="h-4 w-4" />
            Sıralama
          </label>
          <select
            value={`${filters.sortBy || 'createdAt'}_${filters.sortOrder || 'desc'}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </Card>
  );
}
