/**
 * ================================================
 * ADVANCED SEARCH FILTERS COMPONENT
 * ================================================
 * Sprint 2: Search & Discovery - Story 1
 *
 * Comprehensive filter panel for package search with:
 * - Category selection
 * - Price range
 * - Rating filter
 * - Delivery time
 * - Seller verification
 * - Featured packages
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import {
  SlidersHorizontal,
  X,
  Star,
  Clock,
  DollarSign,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDeliveryDays?: number;
  onlyFeatured?: boolean;
  onlyVerified?: boolean;
}

export interface AdvancedSearchFiltersProps {
  /** Current active filters */
  filters: SearchFilters;

  /** Callback when filters change */
  onChange: (filters: SearchFilters) => void;

  /** Available categories for selection */
  categories?: Array<{ id: string; name: string }>;

  /** Show as sidebar or inline */
  variant?: 'sidebar' | 'inline';

  /** Custom class name */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AdvancedSearchFilters Component
 *
 * Provides comprehensive filtering options for package search.
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<SearchFilters>({});
 *
 * <AdvancedSearchFilters
 *   filters={filters}
 *   onChange={setFilters}
 *   categories={categories}
 *   variant="sidebar"
 * />
 * ```
 */
export function AdvancedSearchFilters({
  filters,
  onChange,
  categories = [],
  variant = 'sidebar',
  className,
}: AdvancedSearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    price: true,
    rating: true,
    delivery: true,
    options: true,
  });

  /**
   * Toggle section expansion
   */
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  /**
   * Update filter value
   */
  const updateFilter = useCallback(
    (
      key: keyof SearchFilters,
      value: string | number | boolean | undefined
    ) => {
      onChange({
        ...filters,
        [key]: value,
      });
    },
    [filters, onChange]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    onChange({});
  }, [onChange]);

  /**
   * Count active filters
   */
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null
  ).length;

  /**
   * Render section header
   */
  const renderSectionHeader = (
    sectionId: string,
    title: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => {
    const isExpanded = expandedSections[sectionId];

    return (
      <button
        onClick={() => toggleSection(sectionId)}
        className="flex w-full items-center justify-between py-3 text-left hover:text-blue-600"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
    );
  };

  return (
    <Card
      className={cn(
        'overflow-hidden',
        variant === 'sidebar' ? 'sticky top-4' : '',
        className
      )}
    >
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Filtreler</h3>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                {activeFilterCount}
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="mr-1 h-4 w-4" />
              Temizle
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100 p-4">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="pb-4">
            <Label className="mb-2 block font-semibold text-gray-900">
              Kategori
            </Label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) =>
                updateFilter('categoryId', e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        <div className="py-4">
          {renderSectionHeader('price', 'Fiyat Aralığı', DollarSign)}

          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 text-xs text-gray-600">
                    Min. Fiyat
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      updateFilter(
                        'minPrice',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="mb-1 text-xs text-gray-600">
                    Max. Fiyat
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      updateFilter(
                        'maxPrice',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="∞"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Quick price ranges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '< 100₺', max: 100 },
                  { label: '100-500₺', min: 100, max: 500 },
                  { label: '500-1000₺', min: 500, max: 1000 },
                  { label: '> 1000₺', min: 1000 },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      updateFilter('minPrice', range.min);
                      updateFilter('maxPrice', range.max);
                    }}
                    className={cn(
                      'rounded-md border px-2 py-1 text-xs transition-colors',
                      filters.minPrice === range.min &&
                        filters.maxPrice === range.max
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-blue-400'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="py-4">
          {renderSectionHeader('rating', 'Minimum Puan', Star)}

          {expandedSections.rating && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {filters.minRating ? filters.minRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-sm text-gray-500">ve üzeri</span>
              </div>

              <Slider
                value={[filters.minRating || 0, 5]}
                onValueChange={([value]) =>
                  updateFilter('minRating', value > 0 ? value : undefined)
                }
                min={0}
                max={5}
                step={0.5}
                className="w-full"
              />

              {/* Quick rating buttons */}
              <div className="grid grid-cols-5 gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      updateFilter(
                        'minRating',
                        rating === (filters.minRating || 0) ? undefined : rating
                      )
                    }
                    className={cn(
                      'flex items-center justify-center rounded-md border px-2 py-1.5 text-sm transition-colors',
                      filters.minRating === rating
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-blue-400'
                    )}
                  >
                    <Star className="mr-0.5 h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Time */}
        <div className="py-4">
          {renderSectionHeader('delivery', 'Teslimat Süresi', Clock)}

          {expandedSections.delivery && (
            <div className="mt-3 space-y-3">
              <Label className="text-sm text-gray-600">
                Maksimum {filters.maxDeliveryDays || '∞'} gün
              </Label>

              <Slider
                value={[1, filters.maxDeliveryDays || 30]}
                onValueChange={([, value]) =>
                  updateFilter(
                    'maxDeliveryDays',
                    value < 30 ? value : undefined
                  )
                }
                min={1}
                max={30}
                step={1}
                className="w-full"
              />

              {/* Quick delivery options */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 7, 14].map((days) => (
                  <button
                    key={days}
                    onClick={() =>
                      updateFilter(
                        'maxDeliveryDays',
                        days === filters.maxDeliveryDays ? undefined : days
                      )
                    }
                    className={cn(
                      'rounded-md border px-2 py-1.5 text-xs transition-colors',
                      filters.maxDeliveryDays === days
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-blue-400'
                    )}
                  >
                    {days}g
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Special Options */}
        <div className="pt-4">
          {renderSectionHeader('options', 'Özel Seçenekler', Sparkles)}

          {expandedSections.options && (
            <div className="mt-3 space-y-3">
              {/* Verified Sellers */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Onaylı Satıcılar
                    </p>
                    <p className="text-xs text-gray-500">
                      Kimliği doğrulanmış satıcılar
                    </p>
                  </div>
                </div>
                <Switch
                  checked={filters.onlyVerified || false}
                  onCheckedChange={(checked) =>
                    updateFilter('onlyVerified', checked || undefined)
                  }
                />
              </div>

              {/* Featured Packages */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Öne Çıkan Paketler
                    </p>
                    <p className="text-xs text-gray-500">Editörün seçtikleri</p>
                  </div>
                </div>
                <Switch
                  checked={filters.onlyFeatured || false}
                  onCheckedChange={(checked) =>
                    updateFilter('onlyFeatured', checked || undefined)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default AdvancedSearchFilters;
