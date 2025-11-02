'use client';

import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState } from '@/components/shared/filters';

/**
 * FilterChips Component - Sprint 4 Day 1
 *
 * Displays active filters as removable chips.
 * Allows users to quickly see and remove individual filters.
 */

export interface FilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (
    filterKey: keyof FilterState,
    value?: string | number
  ) => void;
  onClearAll?: () => void;
  className?: string;
}

const DELIVERY_OPTIONS = {
  '24h': '24 Saat',
  '3d': '3 Gün',
  '7d': '7 Gün',
  '14d+': '14+ Gün',
};

const SELLER_LEVELS = {
  NEW: 'Yeni Satıcı',
  LEVEL_1: 'Seviye 1',
  LEVEL_2: 'Seviye 2',
  TOP_RATED: 'Top Rated',
};

export function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: FilterChipsProps) {
  const hasFilters =
    filters.priceRange[0] !== 100 ||
    filters.priceRange[1] !== 10000 ||
    filters.minRating !== null ||
    filters.deliveryTime !== null ||
    filters.sellerLevels.length > 0 ||
    filters.location !== null;

  if (!hasFilters) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Price Range */}
      {(filters.priceRange[0] !== 100 || filters.priceRange[1] !== 10000) && (
        <Badge
          variant="outline"
          className="group flex items-center gap-1.5 border-blue-300 bg-blue-50 pr-1 text-blue-700 hover:bg-blue-100"
        >
          <span>
            {formatPrice(filters.priceRange[0])} -{' '}
            {formatPrice(filters.priceRange[1])}
          </span>
          <button
            onClick={() => onRemoveFilter('priceRange')}
            className="rounded-full p-0.5 hover:bg-blue-200"
            aria-label="Fiyat filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Min Rating */}
      {filters.minRating !== null && (
        <Badge
          variant="outline"
          className="group flex items-center gap-1.5 border-yellow-300 bg-yellow-50 pr-1 text-yellow-700 hover:bg-yellow-100"
        >
          <span>{filters.minRating}+ Yıldız</span>
          <button
            onClick={() => onRemoveFilter('minRating')}
            className="rounded-full p-0.5 hover:bg-yellow-200"
            aria-label="Puan filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Delivery Time */}
      {filters.deliveryTime && (
        <Badge
          variant="outline"
          className="group flex items-center gap-1.5 border-green-300 bg-green-50 pr-1 text-green-700 hover:bg-green-100"
        >
          <span>Teslimat: {DELIVERY_OPTIONS[filters.deliveryTime]}</span>
          <button
            onClick={() => onRemoveFilter('deliveryTime')}
            className="rounded-full p-0.5 hover:bg-green-200"
            aria-label="Teslimat süresi filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Seller Levels */}
      {filters.sellerLevels.map((level) => (
        <Badge
          key={level}
          variant="outline"
          className="group flex items-center gap-1.5 border-purple-300 bg-purple-50 pr-1 text-purple-700 hover:bg-purple-100"
        >
          <span>{SELLER_LEVELS[level]}</span>
          <button
            onClick={() => onRemoveFilter('sellerLevels', level)}
            className="rounded-full p-0.5 hover:bg-purple-200"
            aria-label={`${SELLER_LEVELS[level]} filtresini kaldır`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Location */}
      {filters.location && (
        <Badge
          variant="outline"
          className="group flex items-center gap-1.5 border-orange-300 bg-orange-50 pr-1 text-orange-700 hover:bg-orange-100"
        >
          <span>📍 {filters.location}</span>
          <button
            onClick={() => onRemoveFilter('location')}
            className="rounded-full p-0.5 hover:bg-orange-200"
            aria-label="Konum filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Clear All Button */}
      {onClearAll && (
        <button
          onClick={onClearAll}
          className="ml-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          Tümünü Temizle
        </button>
      )}
    </div>
  );
}
