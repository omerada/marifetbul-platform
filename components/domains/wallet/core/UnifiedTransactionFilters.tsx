'use client';

/**
 * ================================================
 * UNIFIED TRANSACTION FILTERS
 * ================================================
 * Single source of truth for transaction filtering UI
 * Consolidates: TransactionFilters, TransactionFiltersPanel, AdvancedTransactionFilters
 *
 * Features:
 * - Two variants: 'simple' and 'advanced'
 * - Transaction type filtering
 * - Date range selection
 * - Amount range filtering
 * - Search by description/reference
 * - Quick filter presets
 * - Active filter display
 * - Collapsible/expandable
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @created November 14, 2025
 * @sprint Sprint 1 - Code Quality & Deduplication
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
import type { TransactionFilters } from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export type FilterVariant = 'simple' | 'advanced';

export interface UnifiedTransactionFiltersProps {
  variant?: FilterVariant;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClear: () => void;
  className?: string;
  totalCount?: number;
  filteredCount?: number;
  defaultExpanded?: boolean;
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
  filters: Partial<TransactionFilters>;
}> = [
  {
    label: 'Bugün',
    filters: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
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
    label: 'Bu Ay',
    filters: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
];

// ================================================
// HELPER FUNCTIONS
// ================================================

function countActiveFilters(filters: TransactionFilters): number {
  let count = 0;
  if (filters.type) count++;
  if (filters.startDate) count++;
  if (filters.endDate) count++;
  if (filters.minAmount !== undefined) count++;
  if (filters.maxAmount !== undefined) count++;
  return count;
}

function getTypeLabel(type: TransactionType): string {
  return (
    TRANSACTION_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function UnifiedTransactionFilters({
  variant = 'simple',
  filters,
  onFiltersChange,
  onClear,
  className = '',
  totalCount,
  filteredCount,
  defaultExpanded = false,
}: UnifiedTransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;

  // Update a single filter field
  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Apply quick filter preset
  const applyQuickFilter = (quickFilters: Partial<TransactionFilters>) => {
    onFiltersChange({
      ...filters,
      ...quickFilters,
    });
  };

  // Clear all filters
  const handleClear = () => {
    onClear();
    setIsExpanded(false);
  };

  return (
    <Card className={className}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Filtreler</CardTitle>
            </div>
            {hasActiveFilters && (
              <Badge variant="default" className="bg-blue-100 text-blue-700">
                {activeFilterCount} aktif
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalCount !== undefined && filteredCount !== undefined && (
              <span className="text-sm text-gray-600">
                {filteredCount} / {totalCount} işlem
              </span>
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
                <span className="ml-1">Temizle</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span className="ml-1">Gizle</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span className="ml-1">Göster</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Filter Form */}
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Transaction Type */}
          <div>
            <Label
              htmlFor="transaction-type"
              className="mb-2 flex items-center gap-2"
            >
              İşlem Tipi
            </Label>
            <select
              id="transaction-type"
              value={filters.type || ''}
              onChange={(e) =>
                updateFilter(
                  'type',
                  (e.target.value || undefined) as TransactionType | undefined
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="">Tümü</option>
              {TRANSACTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="start-date"
                className="mb-2 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Başlangıç Tarihi
              </Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  updateFilter('startDate', e.target.value || undefined)
                }
                max={filters.endDate || undefined}
              />
            </div>
            <div>
              <Label
                htmlFor="end-date"
                className="mb-2 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Bitiş Tarihi
              </Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  updateFilter('endDate', e.target.value || undefined)
                }
                min={filters.startDate || undefined}
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="min-amount"
                className="mb-2 flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Minimum Tutar (₺)
              </Label>
              <Input
                id="min-amount"
                type="number"
                placeholder="0.00"
                value={filters.minAmount || ''}
                onChange={(e) =>
                  updateFilter(
                    'minAmount',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label
                htmlFor="max-amount"
                className="mb-2 flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Maksimum Tutar (₺)
              </Label>
              <Input
                id="max-amount"
                type="number"
                placeholder="0.00"
                value={filters.maxAmount || ''}
                onChange={(e) =>
                  updateFilter(
                    'maxAmount',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                min={filters.minAmount || 0}
                step="0.01"
              />
            </div>
          </div>

          {/* Quick Filters - Advanced variant only */}
          {variant === 'advanced' && (
            <div>
              <Label className="mb-2 block">Hızlı Filtreler</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK_FILTERS.map((quickFilter) => (
                  <Button
                    key={quickFilter.label}
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickFilter(quickFilter.filters)}
                  >
                    {quickFilter.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Summary - Advanced variant only */}
          {variant === 'advanced' && hasActiveFilters && (
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="mb-2 text-sm font-medium text-blue-900">
                Aktif Filtreler:
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.type && (
                  <Badge variant="secondary" className="bg-white text-blue-900">
                    {getTypeLabel(filters.type)}
                    <button
                      onClick={() => updateFilter('type', undefined)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.startDate || filters.endDate) && (
                  <Badge variant="secondary" className="bg-white text-blue-900">
                    {filters.startDate || '...'} - {filters.endDate || '...'}
                    <button
                      onClick={() => {
                        updateFilter('startDate', undefined);
                        updateFilter('endDate', undefined);
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.minAmount !== undefined ||
                  filters.maxAmount !== undefined) && (
                  <Badge variant="secondary" className="bg-white text-blue-900">
                    {filters.minAmount || 0}₺ - {filters.maxAmount || '∞'}₺
                    <button
                      onClick={() => {
                        updateFilter('minAmount', undefined);
                        updateFilter('maxAmount', undefined);
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default UnifiedTransactionFilters;
