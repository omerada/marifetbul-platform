'use client';

/**
 * ================================================
 * JOB QUICK ACTIONS COMPONENT
 * ================================================
 * Floating action buttons for job management
 *
 * Features:
 * - Quick filters
 * - Search
 * - Export data
 * - Bulk actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 * Sprint 1: Dashboard Integration - Task 3
 */

import React, { useState } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface JobQuickActionsProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  activeFiltersCount?: number;
  isRefreshing?: boolean;
  className?: string;
}

/**
 * Quick Actions Bar for Job Dashboard
 *
 * Provides search, filter, export, and refresh functionality
 */
export function JobQuickActions({
  onSearch,
  onFilter,
  onExport,
  onRefresh,
  searchPlaceholder = 'İş ara...',
  activeFiltersCount = 0,
  isRefreshing = false,
  className = '',
}: JobQuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
    setShowSearch(false);
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Search Input - Expandable on mobile */}
      {showSearch ? (
        <div className="relative flex-1 md:w-64 md:flex-initial">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pr-8 pl-10"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(true)}
          className="md:hidden"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}

      {/* Desktop Search - Always visible */}
      <div className="relative hidden md:block md:w-64">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-8 pl-10"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="hidden h-6 w-px bg-gray-300 md:block" />

      {/* Filter Button */}
      {onFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Filtrele</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Export Button */}
      {onExport && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="hidden md:flex"
        >
          <Download className="h-4 w-4" />
          <span className="ml-2">Dışa Aktar</span>
        </Button>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
          />
          <span className="ml-2 hidden md:inline">Yenile</span>
        </Button>
      )}
    </div>
  );
}

/**
 * Filter Pills - Active filters display
 */
export interface FilterPill {
  id: string;
  label: string;
  value: string;
}

export interface ActiveFiltersPillsProps {
  filters: FilterPill[];
  onRemove: (filterId: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function ActiveFiltersPills({
  filters,
  onRemove,
  onClearAll,
  className = '',
}: ActiveFiltersPillsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-gray-600">Aktif Filtreler:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1"
        >
          <span className="text-xs">
            {filter.label}: {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-1 rounded-full hover:bg-gray-300"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {filters.length > 1 && onClearAll && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Tümünü Temizle
        </Button>
      )}
    </div>
  );
}
