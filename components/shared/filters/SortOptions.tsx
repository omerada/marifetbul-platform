'use client';

import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowUpDown,
  Grid3x3,
  List,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/shared/formatters';

/**
 * SortOptions Component - Sprint 4 Day 2
 *
 * Provides sorting and view controls for search results:
 * - Sort dropdown (relevance, price, rating, date, popularity)
 * - View toggle (grid vs list)
 * - Results count display
 *
 * Features:
 * - 6 sort options with icons
 * - Responsive layout
 * - Active state indicators
 */

export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'newest'
  | 'popular';

export type ViewMode = 'grid' | 'list';

export interface SortOptionsProps {
  /** Current sort option */
  sortBy: SortOption;
  /** Callback when sort changes */
  onSortChange: (sortBy: SortOption) => void;
  /** Current view mode */
  viewMode?: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange?: (viewMode: ViewMode) => void;
  /** Total number of results */
  resultCount?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Show view toggle buttons */
  showViewToggle?: boolean;
  /** Custom className */
  className?: string;
}

interface SortOptionConfig {
  value: SortOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SORT_OPTIONS: SortOptionConfig[] = [
  {
    value: 'relevance',
    label: 'En İlgili',
    icon: TrendingUp,
  },
  {
    value: 'price_asc',
    label: 'Fiyat: Düşük → Yüksek',
    icon: DollarSign,
  },
  {
    value: 'price_desc',
    label: 'Fiyat: Yüksek → Düşük',
    icon: DollarSign,
  },
  {
    value: 'rating',
    label: 'En Yüksek Puan',
    icon: Star,
  },
  {
    value: 'newest',
    label: 'En Yeni',
    icon: Clock,
  },
  {
    value: 'popular',
    label: 'En Popüler',
    icon: TrendingUp,
  },
];

export function SortOptions({
  sortBy,
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  resultCount,
  isLoading = false,
  showViewToggle = true,
  className,
}: SortOptionsProps) {
  const handleViewToggle = useCallback(
    (mode: ViewMode) => {
      if (onViewModeChange) {
        onViewModeChange(mode);
      }
    },
    [onViewModeChange]
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Left Side: Results Count */}
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        ) : (
          resultCount !== undefined && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-gray-300 bg-gray-50 px-2.5 py-1 text-sm font-medium text-gray-700"
              >
                {formatNumber(resultCount)}
              </Badge>
              <span className="text-sm text-gray-600">
                {resultCount === 1 ? 'sonuç' : 'sonuç'}
              </span>
            </div>
          )
        )}
      </div>

      {/* Right Side: Sort & View Controls */}
      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="hidden h-4 w-4 text-gray-500 sm:block" />
          <Select
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <SelectTrigger className="w-[200px] sm:w-[220px]" />
            <SelectContent>
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewToggle('grid')}
              className={cn(
                'h-8 w-8 p-0',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              aria-label="Grid görünümü"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewToggle('list')}
              className={cn(
                'h-8 w-8 p-0',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              aria-label="Liste görünümü"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Default sort option
 */
export const DEFAULT_SORT: SortOption = 'relevance';
