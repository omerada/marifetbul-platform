'use client';

/**
 * Package List Filters Component
 * Search, status filter, sort options
 */

import { Search } from 'lucide-react';
import type {
  PackageStatus,
  PackageSortBy,
} from '@/types/business/features/package';
import { Input } from '@/components/ui';

interface PackageListFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: PackageStatus | 'ALL';
  onStatusChange: (status: PackageStatus | 'ALL') => void;
  sortBy: PackageSortBy;
  onSortChange: (sortBy: PackageSortBy) => void;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tüm Durumlar' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'PAUSED', label: 'Duraklatıldı' },
  { value: 'DRAFT', label: 'Taslak' },
  { value: 'INACTIVE', label: 'İnaktif' },
] as const;

const SORT_OPTIONS = [
  { value: 'CREATED_AT', label: 'En Yeni' },
  { value: 'ORDER_COUNT', label: 'En Çok Satılan' },
  { value: 'RATING', label: 'En Yüksek Puanlı' },
  { value: 'VIEWS', label: 'En Çok Görüntülenen' },
  { value: 'PRICE_ASC', label: 'Fiyat (Düşük → Yüksek)' },
  { value: 'PRICE_DESC', label: 'Fiyat (Yüksek → Düşük)' },
] as const;

export function PackageListFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: PackageListFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Paket ara..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Durum:</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusChange(e.target.value as PackageStatus | 'ALL')
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sırala:</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as PackageSortBy)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
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
  );
}
