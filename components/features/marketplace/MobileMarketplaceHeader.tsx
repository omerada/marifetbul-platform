'use client';

import { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
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
        'border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/50 backdrop-blur-sm',
        className
      )}
    >
      {/* Mode Toggle */}
      <div className="p-4 pb-3">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 p-1.5 shadow-inner">
            <Button
              variant={mode === 'jobs' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('jobs')}
              className={cn(
                'rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                mode === 'jobs'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'text-blue-700 hover:bg-white/60 hover:text-blue-800'
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
                'rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                mode === 'packages'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'text-blue-700 hover:bg-white/60 hover:text-blue-800'
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
              'relative flex items-center rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300',
              isSearchFocused
                ? 'border-blue-300 shadow-lg ring-2 ring-blue-100'
                : 'border-blue-200 hover:border-blue-300'
            )}
          >
            <div className="flex items-center pl-4">
              <Search
                className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  isSearchFocused ? 'text-blue-500' : 'text-blue-400'
                )}
              />
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
              className="flex-1 border-0 bg-transparent px-3 py-3 placeholder:text-blue-400/70 focus:ring-0 focus:outline-none"
            />
            <div className="flex items-center gap-2 pr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onFiltersToggle}
                className="h-10 w-10 rounded-full p-2 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSortToggle}
                className="h-10 w-10 rounded-full p-2 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center gap-2 rounded-xl bg-blue-50/80 px-3 py-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="text-sm">
            {totalResults > 0 ? (
              <div className="flex items-center gap-1">
                <span className="font-bold text-blue-900">
                  {totalResults.toLocaleString()}
                </span>
                <span className="text-blue-700">
                  {mode === 'jobs' ? 'iş ilanı' : 'hizmet paketi'} bulundu
                </span>
              </div>
            ) : (
              <span className="text-gray-600">Sonuç bulunamadı</span>
            )}
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 p-1.5 shadow-inner">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'h-9 w-9 rounded-lg p-2 transition-all duration-200',
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-blue-600 hover:bg-white/60 hover:text-blue-800'
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'h-9 w-9 rounded-lg p-2 transition-all duration-200',
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-blue-600 hover:bg-white/60 hover:text-blue-800'
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
