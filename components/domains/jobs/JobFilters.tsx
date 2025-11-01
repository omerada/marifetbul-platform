/**
 * JobFilters Component
 * Filter controls for job listing page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, X, Filter, MapPin } from 'lucide-react';
import type { JobFilters as JobFiltersType } from '@/lib/api/jobs';
import type { CategoryResponse } from '@/types/backend-aligned';
import {
  JOB_SORT_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  BUDGET_TYPE_OPTIONS,
} from '@/types/business/job';

export interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (filters: JobFiltersType) => void;
  categories?: CategoryResponse[];
  isLoading?: boolean;
}

export function JobFilters({
  filters,
  onFilterChange,
  categories = [],
  isLoading = false,
}: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState<JobFiltersType>(filters);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setSearchQuery(filters.search || '');
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...localFilters, search: searchQuery, page: 0 });
  };

  const handleFilterChange = (key: keyof JobFiltersType, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value, page: 0 };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: JobFiltersType = {
      page: 0,
      size: filters.size || 20,
      sortBy: 'latest',
    };
    setLocalFilters(clearedFilters);
    setSearchQuery('');
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.categoryId ||
      filters.budgetMin ||
      filters.budgetMax ||
      filters.budgetType ||
      filters.experienceLevel ||
      filters.isRemote !== undefined ||
      filters.location ||
      filters.search
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.budgetMin || filters.budgetMax) count++;
    if (filters.budgetType) count++;
    if (filters.experienceLevel) count++;
    if (filters.isRemote !== undefined) count++;
    if (filters.location) count++;
    if (filters.search) count++;
    return count;
  };

  return (
    <Card className="p-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="İş ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 pl-10"
            disabled={isLoading}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                handleFilterChange('search', '');
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Filter Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filtreler</span>
          {hasActiveFilters() && (
            <Badge variant="secondary">{getActiveFilterCount()} aktif</Badge>
          )}
        </div>
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Temizle
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="space-y-4">
        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kategori
            </label>
            <select
              value={localFilters.categoryId || ''}
              onChange={(e) =>
                handleFilterChange('categoryId', e.target.value || undefined)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Budget Range */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bütçe Aralığı
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.budgetMin || ''}
              onChange={(e) =>
                handleFilterChange(
                  'budgetMin',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              disabled={isLoading}
              min="0"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.budgetMax || ''}
              onChange={(e) =>
                handleFilterChange(
                  'budgetMax',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              disabled={isLoading}
              min="0"
            />
          </div>
        </div>

        {/* Budget Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Ödeme Tipi
          </label>
          <select
            value={localFilters.budgetType || ''}
            onChange={(e) =>
              handleFilterChange('budgetType', e.target.value || undefined)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            <option value="">Tümü</option>
            {BUDGET_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Deneyim Seviyesi
          </label>
          <div className="space-y-2">
            {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(localFilters.experienceLevel) &&
                    localFilters.experienceLevel.includes(option.value)
                  }
                  onChange={(e) => {
                    const current = Array.isArray(localFilters.experienceLevel)
                      ? localFilters.experienceLevel
                      : [];
                    const newValue = e.target.checked
                      ? [...current, option.value]
                      : current.filter((v) => v !== option.value);
                    handleFilterChange(
                      'experienceLevel',
                      newValue.length > 0 ? newValue : undefined
                    );
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Remote Work */}
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={localFilters.isRemote || false}
              onChange={(e) =>
                handleFilterChange('isRemote', e.target.checked || undefined)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="font-medium text-gray-700">
              Sadece uzaktan çalışma
            </span>
          </label>
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <MapPin className="mr-1 inline h-4 w-4" />
            Konum
          </label>
          <Input
            type="text"
            placeholder="Şehir veya bölge"
            value={localFilters.location || ''}
            onChange={(e) =>
              handleFilterChange('location', e.target.value || undefined)
            }
            disabled={isLoading}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Sıralama
          </label>
          <select
            value={localFilters.sortBy || 'latest'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            {JOB_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}
