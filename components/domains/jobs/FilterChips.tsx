'use client';

/**
 * FilterChips Component
 * Display active filters as removable chips
 *
 * Sprint: Marketplace Advanced Filters (Task 1.3)
 * Provides visual feedback for active filters with one-click removal
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';
import type { JobFilters } from '@/lib/api/jobs';
import type { CategoryResponse } from '@/types/backend-aligned';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  BUDGET_TYPE_OPTIONS,
  JOB_SORT_OPTIONS,
} from '@/types/business/job';

interface FilterChipsProps {
  /** Current active filters */
  filters: JobFilters;

  /** Callback when a filter is removed */
  onRemoveFilter: (filterKey: keyof JobFilters, value?: string) => void;

  /** Callback to clear all filters */
  onClearAll: () => void;

  /** Categories for label resolution */
  categories?: CategoryResponse[];

  /** Loading state */
  isLoading?: boolean;
}

export function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  categories = [],
  isLoading = false,
}: FilterChipsProps) {
  const activeChips: Array<{
    key: keyof JobFilters;
    label: string;
    value?: string;
  }> = [];

  // Search
  if (filters.search) {
    activeChips.push({
      key: 'search',
      label: `Arama: "${filters.search}"`,
    });
  }

  // Category
  if (filters.categoryId) {
    const category = categories.find((c) => c.id === filters.categoryId);
    activeChips.push({
      key: 'categoryId',
      label: `Kategori: ${category?.name || 'Bilinmeyen'}`,
    });
  }

  // Budget range
  if (filters.budgetMin || filters.budgetMax) {
    const min = filters.budgetMin
      ? `₺${filters.budgetMin.toLocaleString('tr-TR')}`
      : '-';
    const max = filters.budgetMax
      ? `₺${filters.budgetMax.toLocaleString('tr-TR')}`
      : '-';
    activeChips.push({
      key: 'budgetMin', // Will clear both min/max
      label: `Bütçe: ${min} - ${max}`,
    });
  }

  // Budget type
  if (filters.budgetType) {
    const budgetType = BUDGET_TYPE_OPTIONS.find(
      (opt) => opt.value === filters.budgetType
    );
    activeChips.push({
      key: 'budgetType',
      label: `Bütçe Tipi: ${budgetType?.label || filters.budgetType}`,
    });
  }

  // Experience level
  if (filters.experienceLevel && Array.isArray(filters.experienceLevel)) {
    filters.experienceLevel.forEach((level) => {
      const option = EXPERIENCE_LEVEL_OPTIONS.find(
        (opt) => opt.value === level
      );
      activeChips.push({
        key: 'experienceLevel',
        label: `Deneyim: ${option?.label || level}`,
        value: level,
      });
    });
  }

  // Skills
  if (filters.skills && Array.isArray(filters.skills)) {
    filters.skills.forEach((skill) => {
      activeChips.push({
        key: 'skills',
        label: `Yetenek: ${skill}`,
        value: skill,
      });
    });
  }

  // Remote
  if (filters.isRemote !== undefined) {
    activeChips.push({
      key: 'isRemote',
      label: filters.isRemote ? 'Uzaktan Çalışma' : 'Yerinde Çalışma',
    });
  }

  // Location
  if (filters.location) {
    activeChips.push({
      key: 'location',
      label: `Konum: ${filters.location}`,
    });
  }

  // Sort (optional - usually shown separately)
  if (filters.sortBy && filters.sortBy !== 'latest') {
    const sortOption = JOB_SORT_OPTIONS.find(
      (opt) => opt.value === filters.sortBy
    );
    activeChips.push({
      key: 'sortBy',
      label: `Sıralama: ${sortOption?.label || filters.sortBy}`,
    });
  }

  // If no active filters, don't render anything
  if (activeChips.length === 0) {
    return null;
  }

  const handleRemoveFilter = (chip: (typeof activeChips)[0]) => {
    if (chip.key === 'budgetMin') {
      // Clear both budget min and max
      onRemoveFilter('budgetMin');
      onRemoveFilter('budgetMax');
    } else if (chip.value) {
      // For array filters (experienceLevel, skills), remove specific value
      onRemoveFilter(chip.key, chip.value);
    } else {
      // For single-value filters
      onRemoveFilter(chip.key);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-3">
      <span className="text-sm font-medium text-gray-700">
        Aktif Filtreler:
      </span>

      {activeChips.map((chip, index) => (
        <Badge
          key={`${chip.key}-${chip.value || index}`}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => handleRemoveFilter(chip)}
            disabled={isLoading}
            className="ml-1 rounded-full p-0.5 hover:bg-gray-300 disabled:opacity-50"
            aria-label={`${chip.label} filtresini kaldır`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        disabled={isLoading}
        className="ml-auto text-xs"
      >
        Tümünü Temizle
      </Button>
    </div>
  );
}
