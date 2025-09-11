'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketplaceHeaderProps {
  mode: 'jobs' | 'packages';
  onModeChange: (mode: 'jobs' | 'packages') => void;
  onSearch: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function MarketplaceHeader({
  mode,
  onModeChange,
  onSearch,
  showFilters,
  onToggleFilters,
}: MarketplaceHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <Button
            variant={mode === 'jobs' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('jobs')}
            className={cn(
              'rounded-lg px-6 py-2 font-medium transition-all',
              mode === 'jobs'
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
            )}
          >
            İş İlanları
          </Button>
          <Button
            variant={mode === 'packages' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('packages')}
            className={cn(
              'rounded-lg px-6 py-2 font-medium transition-all',
              mode === 'packages'
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
            )}
          >
            Hizmet Paketleri
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder={
                mode === 'jobs'
                  ? 'İş ilanı, beceri veya kategori ara...'
                  : 'Hizmet, freelancer veya kategori ara...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-4 pl-10"
            />
          </div>
        </form>

        {/* Controls */}
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={cn(
              'px-4',
              showFilters && 'border-blue-200 bg-blue-50 text-blue-700'
            )}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtreler
          </Button>

          <Button type="submit" onClick={handleSearch} className="px-6">
            <Search className="mr-2 h-4 w-4" />
            Ara
          </Button>
        </div>
      </div>
    </div>
  );
}
