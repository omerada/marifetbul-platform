'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  MapPin,
  Briefcase,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileMarketplaceHeaderProps {
  mode: 'jobs' | 'packages';
  viewMode: 'grid' | 'list';
  searchQuery: string;
  totalResults: number;
  onModeChange: (mode: 'jobs' | 'packages') => void;
  onViewModeChange: (viewMode: 'grid' | 'list') => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onFiltersToggle: () => void;
  onSortToggle: () => void;
  className?: string;
}

export function MobileMarketplaceHeader({
  mode,
  viewMode,
  searchQuery,
  totalResults,
  onModeChange,
  onViewModeChange,
  onSearchChange,
  onSearchSubmit,
  onFiltersToggle,
  onSortToggle,
  className,
}: MobileMarketplaceHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div
      className={cn(
        'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      {/* Mode Toggle */}
      <div className="p-4 pb-2">
        <div className="flex justify-center">
          <div className="rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
            <Button
              variant={mode === 'jobs' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('jobs')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-all duration-200',
                mode === 'jobs'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              )}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              İş İlanları
            </Button>
            <Button
              variant={mode === 'packages' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('packages')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-all duration-200',
                mode === 'packages'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              )}
            >
              <Package className="mr-2 h-4 w-4" />
              Hizmet Paketleri
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4 pb-4">
        <div className="relative">
          <div
            className={cn(
              'relative flex items-center rounded-xl border transition-all duration-200',
              isSearchFocused
                ? 'border-primary-500 ring-primary-500/20 shadow-sm ring-1'
                : 'border-gray-300 dark:border-gray-600'
            )}
          >
            <div className="flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={
                mode === 'jobs'
                  ? 'İş ilanlarında ara...'
                  : 'Hizmet paketlerinde ara...'
              }
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="flex-1 border-0 bg-transparent px-2 focus:ring-0 focus:outline-none"
            />
            <div className="flex items-center gap-1 pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onFiltersToggle}
                className="h-8 w-8 p-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSortToggle}
                className="h-8 w-8 p-2"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalResults > 0 ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalResults.toLocaleString()}
                </span>{' '}
                {mode === 'jobs' ? 'iş ilanı' : 'hizmet paketi'} bulundu
              </>
            ) : (
              <span>Sonuç bulunamadı</span>
            )}
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'h-8 w-8 p-2',
              viewMode === 'grid'
                ? 'bg-white shadow-sm dark:bg-gray-800'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'h-8 w-8 p-2',
              viewMode === 'list'
                ? 'bg-white shadow-sm dark:bg-gray-800'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
