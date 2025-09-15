'use client';

import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Grid, List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewPreferences } from '@/lib/validations/marketplace';

interface MarketplaceStatsProps {
  mode: 'jobs' | 'packages';
  total: number;
  showing: number;
  page: number;
  totalPages: number;
  viewPreferences: ViewPreferences;
  onViewPreferencesChange: (preferences: Partial<ViewPreferences>) => void;
}

export function MarketplaceStats({
  mode,
  total,
  page,
  viewPreferences,
  onViewPreferencesChange,
}: MarketplaceStatsProps) {
  const startItem = (page - 1) * viewPreferences.itemsPerPage + 1;
  const endItem = Math.min(page * viewPreferences.itemsPerPage, total);

  return (
    <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-center dark:border-gray-700">
      {/* Results Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {total > 0 ? (
          <>
            <span className="font-medium text-gray-900 dark:text-white">
              {startItem} - {endItem}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {total.toLocaleString()}
            </span>{' '}
            {mode === 'jobs' ? 'iş ilanı' : 'hizmet paketi'}
          </>
        ) : (
          <span>Sonuç bulunamadı</span>
        )}
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={`${viewPreferences.sortBy}-${viewPreferences.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [
                ViewPreferences['sortBy'],
                ViewPreferences['sortOrder'],
              ];
              onViewPreferencesChange({ sortBy, sortOrder });
            }}
            className="appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="newest-desc">En Yeni</option>
            <option value="oldest-asc">En Eski</option>
            {mode === 'jobs' ? (
              <>
                <option value="budget-desc">Bütçe (Yüksek → Düşük)</option>
                <option value="budget-asc">Bütçe (Düşük → Yüksek)</option>
              </>
            ) : (
              <>
                <option value="price-desc">Fiyat (Yüksek → Düşük)</option>
                <option value="price-asc">Fiyat (Düşük → Yüksek)</option>
                <option value="rating-desc">En Yüksek Puanlı</option>
              </>
            )}
            <option value="relevance-desc">İlgi Düzeyi</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        </div>

        {/* Items per page */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Sayfa başına:
          </span>
          <select
            value={viewPreferences.itemsPerPage}
            onChange={(e) =>
              onViewPreferencesChange({ itemsPerPage: Number(e.target.value) })
            }
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={36}>36</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-md bg-gray-100 p-1 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewPreferencesChange({ layout: 'grid' })}
            className={cn(
              'p-2',
              viewPreferences.layout === 'grid'
                ? 'bg-white shadow-sm dark:bg-gray-900'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewPreferencesChange({ layout: 'list' })}
            className={cn(
              'p-2',
              viewPreferences.layout === 'list'
                ? 'bg-white shadow-sm dark:bg-gray-900'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
