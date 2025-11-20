'use client';

/**
 * JobFilters Component
 * Filter controls for job listing page
 *
 * Sprint: Marketplace Advanced Filters
 * Enhanced with skills multi-select and budget range slider
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Slider } from '@/components/ui/Slider';
import {
  Search,
  X,
  Filter,
  MapPin,
  ArrowDown,
  ArrowUp,
  TrendingDown,
  TrendingUp,
  Calendar,
  Users,
  ChevronDown,
} from 'lucide-react';
import type { JobFilters as JobFiltersType } from '@/lib/api/jobs';
import type { CategoryResponse } from '@/types/backend-aligned';
import {
  JOB_SORT_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  BUDGET_TYPE_OPTIONS,
  POPULAR_SKILLS,
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
      filters.skills?.length ||
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
    if (filters.skills?.length) count++;
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

        {/* Budget Range - ENHANCED with Slider */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bütçe Aralığı
          </label>

          {/* Show current range */}
          <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">
              ₺{(localFilters.budgetMin || 0).toLocaleString('tr-TR')}
            </span>
            <span className="font-medium">
              ₺{(localFilters.budgetMax || 100000).toLocaleString('tr-TR')}
            </span>
          </div>

          {/* Range slider */}
          <Slider
            value={[
              localFilters.budgetMin || 0,
              localFilters.budgetMax || 100000,
            ]}
            onValueChange={(range) => {
              const [min, max] = range;
              const newFilters = { ...localFilters };
              newFilters.budgetMin = min > 0 ? min : undefined;
              newFilters.budgetMax = max < 100000 ? max : undefined;
              setLocalFilters(newFilters);
              onFilterChange(newFilters);
            }}
            min={0}
            max={100000}
            step={1000}
            disabled={isLoading}
            className="mb-3"
          />

          {/* Manual inputs (collapsible) */}
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              Manuel giriş
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
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
          </details>
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

        {/* Skills Multi-Select - NEW */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Yetenekler
          </label>
          <MultiSelect
            options={POPULAR_SKILLS.map((skill) => ({
              value: skill.toLowerCase(),
              label: skill,
            }))}
            value={localFilters.skills || []}
            onChange={(skills) =>
              handleFilterChange(
                'skills',
                skills.length > 0 ? skills : undefined
              )
            }
            placeholder="Yetenek seç..."
            disabled={isLoading}
            maxDisplay={2}
            searchable
          />
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

        {/* Sort - ENHANCED with Icons */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Sıralama
          </label>

          {/* Custom sort dropdown with icons */}
          <div className="relative">
            <select
              value={localFilters.sortBy || 'latest'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pr-8 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              disabled={isLoading}
            >
              {JOB_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Icon for selected option */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              {(() => {
                const selectedOption = JOB_SORT_OPTIONS.find(
                  (opt) => opt.value === (localFilters.sortBy || 'latest')
                );
                const IconComponent = {
                  ArrowDown,
                  ArrowUp,
                  TrendingDown,
                  TrendingUp,
                  Calendar,
                  Users,
                }[selectedOption?.icon || 'ArrowDown'];
                return <IconComponent className="h-4 w-4" />;
              })()}
            </div>

            {/* Chevron down */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
