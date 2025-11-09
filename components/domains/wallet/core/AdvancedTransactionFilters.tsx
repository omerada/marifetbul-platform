'use client';

/**
 * ================================================
 * ADVANCED TRANSACTION FILTERS
 * ================================================
 * Comprehensive filtering panel for transaction history
 *
 * Features:
 * - Transaction type multi-select
 * - Amount range slider
 * - Date range picker
 * - Search by description
 * - Quick filter presets
 * - Filter persistence
 * - Clear all filters
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.2 - Task 4 (1 story point)
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import {
  Filter,
  X,
  Search,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TransactionType } from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface TransactionFiltersState {
  search?: string;
  types?: TransactionType[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

export interface AdvancedTransactionFiltersProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
  onClear: () => void;
  className?: string;
}

// ================================================
// CONSTANTS
// ================================================

const TRANSACTION_TYPE_OPTIONS: Array<{
  value: TransactionType;
  label: string;
  color: string;
}> = [
  { value: TransactionType.CREDIT, label: 'Gelir', color: 'green' },
  { value: TransactionType.DEBIT, label: 'Gider', color: 'red' },
  { value: TransactionType.PAYOUT, label: 'Para Çekme', color: 'blue' },
  {
    value: TransactionType.ESCROW_HOLD,
    label: 'Emanet (Beklemede)',
    color: 'yellow',
  },
  {
    value: TransactionType.ESCROW_RELEASE,
    label: 'Emanet (Serbest)',
    color: 'purple',
  },
  { value: TransactionType.REFUND, label: 'İade', color: 'orange' },
  { value: TransactionType.FEE, label: 'Komisyon', color: 'gray' },
];

const QUICK_FILTERS: Array<{
  label: string;
  filters: Partial<TransactionFiltersState>;
}> = [
  {
    label: 'Son 7 Gün',
    filters: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
  {
    label: 'Son 30 Gün',
    filters: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
  {
    label: 'Sadece Gelir',
    filters: {
      types: [TransactionType.CREDIT, TransactionType.ESCROW_RELEASE],
    },
  },
  {
    label: 'Sadece Gider',
    filters: {
      types: [
        TransactionType.DEBIT,
        TransactionType.PAYOUT,
        TransactionType.FEE,
      ],
    },
  },
];

// ================================================
// COMPONENT
// ================================================

export const AdvancedTransactionFilters: React.FC<
  AdvancedTransactionFiltersProps
> = ({ filters, onFiltersChange, onClear, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  // ==================== HANDLERS ====================

  const handleTypeToggle = (type: TransactionType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    onFiltersChange({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleQuickFilter = (quickFilter: Partial<TransactionFiltersState>) => {
    onFiltersChange({ ...filters, ...quickFilter });
  };

  const handleAmountChange = (
    field: 'minAmount' | 'maxAmount',
    value: string
  ) => {
    const numValue = value ? parseFloat(value) : undefined;
    onFiltersChange({ ...filters, [field]: numValue });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ ...filters, [field]: value || undefined });
  };

  const activeFiltersCount = [
    filters.search,
    filters.types?.length,
    filters.minAmount,
    filters.maxAmount,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  // ==================== RENDER ====================

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtreler</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="default">{activeFiltersCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-600 hover:text-red-700"
            >
              <X className="mr-1 h-4 w-4" />
              Temizle
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar (Always Visible) */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Açıklama ile ara..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 p-4">
          {/* Quick Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hızlı Filtreler</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_FILTERS.map((quickFilter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(quickFilter.filters)}
                >
                  {quickFilter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Transaction Types */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">İşlem Tipi</Label>
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPE_OPTIONS.map((option) => {
                const isSelected = filters.types?.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleTypeToggle(option.value)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
                      isSelected
                        ? option.color === 'green'
                          ? 'bg-green-600 text-white'
                          : option.color === 'red'
                            ? 'bg-red-600 text-white'
                            : option.color === 'blue'
                              ? 'bg-blue-600 text-white'
                              : option.color === 'yellow'
                                ? 'bg-yellow-600 text-white'
                                : option.color === 'purple'
                                  ? 'bg-purple-600 text-white'
                                  : option.color === 'orange'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-semibold">Tutar Aralığı</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="minAmount" className="text-xs text-gray-600">
                  Min (₺)
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="0"
                  value={filters.minAmount || ''}
                  onChange={(e) =>
                    handleAmountChange('minAmount', e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxAmount" className="text-xs text-gray-600">
                  Max (₺)
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="10000"
                  value={filters.maxAmount || ''}
                  onChange={(e) =>
                    handleAmountChange('maxAmount', e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-semibold">Tarih Aralığı</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-xs text-gray-600">
                  Başlangıç
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) =>
                    handleDateChange('startDate', e.target.value)
                  }
                  max={filters.endDate || undefined}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate" className="text-xs text-gray-600">
                  Bitiş
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={filters.startDate || undefined}
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-900">
                Aktif Filtreler ({activeFiltersCount})
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="outline">Arama: {filters.search}</Badge>
                )}
                {filters.types && filters.types.length > 0 && (
                  <Badge variant="outline">
                    Tipler: {filters.types.length}
                  </Badge>
                )}
                {(filters.minAmount || filters.maxAmount) && (
                  <Badge variant="outline">
                    Tutar: {filters.minAmount || 0} - {filters.maxAmount || '∞'}
                  </Badge>
                )}
                {(filters.startDate || filters.endDate) && (
                  <Badge variant="outline">Tarih aralığı seçili</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default AdvancedTransactionFilters;
