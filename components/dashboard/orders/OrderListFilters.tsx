/**
 * ================================================
 * ORDER LIST FILTERS COMPONENT
 * ================================================
 * Filter component for order list pages
 *
 * Features:
 * - Status tabs with counts
 * - Search by order number
 * - Sort dropdown
 * - Clear filters action
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { Search, SortDesc } from 'lucide-react';
import { Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/api/validators/order';

// ================================================
// TYPES
// ================================================

export interface OrderStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface OrderListFiltersProps {
  /** Current selected status */
  selectedStatus: OrderStatus | 'all';
  /** Status change handler */
  onStatusChange: (status: OrderStatus | 'all') => void;
  /** Current search query */
  searchQuery: string;
  /** Search change handler */
  onSearchChange: (query: string) => void;
  /** Current sort option */
  sortBy: string;
  /** Sort change handler */
  onSortChange: (sort: string) => void;
  /** Order statistics for badge counts */
  stats?: OrderStats;
  /** Loading state */
  isLoading?: boolean;
}

// ================================================
// CONSTANTS
// ================================================

const STATUS_TABS: Array<{
  value: OrderStatus | 'all';
  label: string;
  countKey: keyof OrderStats;
}> = [
  { value: 'all', label: 'Tümü', countKey: 'total' },
  { value: 'PAID', label: 'Bekleyen', countKey: 'active' },
  { value: 'IN_PROGRESS', label: 'Devam Eden', countKey: 'active' },
  { value: 'DELIVERED', label: 'Teslim Edilen', countKey: 'active' },
  { value: 'COMPLETED', label: 'Tamamlanan', countKey: 'completed' },
  { value: 'CANCELED', label: 'İptal', countKey: 'cancelled' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'amount_high', label: 'Tutar: Yüksek → Düşük' },
  { value: 'amount_low', label: 'Tutar: Düşük → Yüksek' },
];

// ================================================
// COMPONENT
// ================================================

export function OrderListFilters({
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  stats,
  isLoading,
}: OrderListFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="border-b">
        <div className="-mb-px flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const count = stats?.[tab.countKey] || 0;
            const isActive = selectedStatus === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => onStatusChange(tab.value)}
                disabled={isLoading}
                className={cn(
                  'rounded-t-lg px-4 py-2.5 text-sm font-medium',
                  'border-b-2 transition-colors',
                  'hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50',
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : 'text-muted-foreground border-transparent'
                )}
              >
                {tab.label}
                {stats && (
                  <span
                    className={cn(
                      'ml-2 rounded-full px-2 py-0.5 text-xs',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Sipariş numarası ara
          </Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="search"
              type="text"
              placeholder="Sipariş numarası ile ara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-64">
          <Label htmlFor="sort" className="sr-only">
            Sırala
          </Label>
          <div className="relative">
            <SortDesc className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              disabled={isLoading}
              className={cn(
                'border-input bg-background w-full rounded-md border py-2 pr-3 pl-10',
                'focus:ring-ring text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
