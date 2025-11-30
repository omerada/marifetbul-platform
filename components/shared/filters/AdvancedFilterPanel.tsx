'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import {
  X,
  Filter,
  DollarSign,
  Star,
  Clock,
  Award,
  MapPin,
  ChevronDown,
  Save,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Advanced Filter Panel - Sprint 4 Day 1
 *
 * Comprehensive filtering system with:
 * - Price range slider (100-10,000 TL)
 * - Star rating filter (1-5 stars)
 * - Delivery time options (24h, 3d, 7d, 14d+)
 * - Seller level filter (NEW, LEVEL_1, LEVEL_2, TOP_RATED)
 * - Location filter with city dropdown
 *
 * Features:
 * - Real-time filter updates
 * - Filter presets (save/load)
 * - Responsive design (mobile drawer, desktop sidebar)
 * - Clear filters functionality
 * - Active filter count badge
 */

export interface FilterState {
  priceRange: [number, number];
  minRating: number | null;
  deliveryTime: '24h' | '3d' | '7d' | '14d+' | null;
  sellerLevels: SellerLevel[];
  location: string | null;
}

export type SellerLevel = 'NEW' | 'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED';

export interface AdvancedFilterPanelProps {
  /** Initial filter state */
  initialFilters?: Partial<FilterState>;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterState) => void;
  /** Optional close handler for mobile drawer */
  onClose?: () => void;
  /** Show/hide specific filter sections */
  enabledFilters?: {
    priceRange?: boolean;
    rating?: boolean;
    deliveryTime?: boolean;
    sellerLevel?: boolean;
    location?: boolean;
  };
  /** Custom className */
  className?: string;
  /** Mobile mode (drawer style) */
  isMobile?: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  priceRange: [100, 10000],
  minRating: null,
  deliveryTime: null,
  sellerLevels: [],
  location: null,
};

const PRICE_RANGE = {
  min: 100,
  max: 10000,
  step: 100,
};

const DELIVERY_OPTIONS = [
  { value: '24h', label: '24 Saat', hours: 24 },
  { value: '3d', label: '3 Gün', hours: 72 },
  { value: '7d', label: '7 Gün', hours: 168 },
  { value: '14d+', label: '14+ Gün', hours: 336 },
] as const;

const SELLER_LEVELS: Array<{
  value: SellerLevel;
  label: string;
  description: string;
}> = [
  {
    value: 'NEW',
    label: 'Yeni Satıcı',
    description: "Platform'a yeni katıldı",
  },
  { value: 'LEVEL_1', label: 'Seviye 1', description: '10+ başarılı iş' },
  { value: 'LEVEL_2', label: 'Seviye 2', description: '50+ başarılı iş' },
  {
    value: 'TOP_RATED',
    label: 'Top Rated',
    description: '100+ başarılı iş, 4.8+ puan',
  },
];

const CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Mersin',
  'Kayseri',
  'Eskişehir',
  'Diyarbakır',
  'Samsun',
  'Denizli',
  'Şanlıurfa',
  'Adapazarı',
  'Malatya',
  'Kahramanmaraş',
  'Erzurum',
  'Van',
];

export function AdvancedFilterPanel({
  initialFilters = {},
  onFiltersChange,
  onClose,
  enabledFilters = {
    priceRange: true,
    rating: true,
    deliveryTime: true,
    sellerLevel: true,
    location: true,
  },
  className,
  isMobile = false,
}: AdvancedFilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Price range changed from default
    if (
      filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
      filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]
    ) {
      count++;
    }

    if (filters.minRating !== null) count++;
    if (filters.deliveryTime !== null) count++;
    if (filters.sellerLevels.length > 0) count++;
    if (filters.location !== null) count++;

    return count;
  }, [filters]);

  // Update filters and notify parent
  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      onFiltersChange(updated);
    },
    [filters, onFiltersChange]
  );

  // Price range handler
  const handlePriceRangeChange = useCallback(
    (value: [number, number]) => {
      updateFilters({ priceRange: value });
    },
    [updateFilters]
  );

  // Rating filter handler
  const handleRatingChange = useCallback(
    (rating: number) => {
      updateFilters({
        minRating: filters.minRating === rating ? null : rating,
      });
    },
    [filters.minRating, updateFilters]
  );

  // Delivery time handler
  const handleDeliveryTimeChange = useCallback(
    (time: FilterState['deliveryTime']) => {
      updateFilters({
        deliveryTime: filters.deliveryTime === time ? null : time,
      });
    },
    [filters.deliveryTime, updateFilters]
  );

  // Seller level handler
  const handleSellerLevelToggle = useCallback(
    (level: SellerLevel) => {
      const newLevels = filters.sellerLevels.includes(level)
        ? filters.sellerLevels.filter((l) => l !== level)
        : [...filters.sellerLevels, level];
      updateFilters({ sellerLevels: newLevels });
    },
    [filters.sellerLevels, updateFilters]
  );

  // Location handler
  const handleLocationChange = useCallback(
    (location: string) => {
      updateFilters({ location: location || null });
    },
    [updateFilters]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  // Save preset to localStorage
  const handleSavePreset = useCallback(() => {
    const presetName = prompt('Filtre preset adı:');
    if (presetName) {
      const presets = JSON.parse(localStorage.getItem('filterPresets') || '{}');
      presets[presetName] = filters;
      localStorage.setItem('filterPresets', JSON.stringify(presets));
      alert(`"${presetName}" kaydedildi!`);
    }
  }, [filters]);

  // Format price in Turkish Lira
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={cn(
        'space-y-6 p-6',
        isMobile && 'h-full rounded-none border-x-0 border-t-0',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gelişmiş Filtreler
            </h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-500">
                {activeFilterCount} filtre aktif
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      {enabledFilters.priceRange && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Fiyat Aralığı</h4>
          </div>

          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              min={PRICE_RANGE.min}
              max={PRICE_RANGE.max}
              step={PRICE_RANGE.step}
              className="w-full"
            />

            <div className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Min</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(filters.priceRange[0])}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-500">Max</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(filters.priceRange[1])}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const value = Math.max(
                    PRICE_RANGE.min,
                    Math.min(Number(e.target.value), filters.priceRange[1])
                  );
                  updateFilters({ priceRange: [value, filters.priceRange[1]] });
                }}
                min={PRICE_RANGE.min}
                max={filters.priceRange[1]}
                step={PRICE_RANGE.step}
                className="text-sm"
                placeholder="Min"
              />
              <Input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const value = Math.min(
                    PRICE_RANGE.max,
                    Math.max(Number(e.target.value), filters.priceRange[0])
                  );
                  updateFilters({ priceRange: [filters.priceRange[0], value] });
                }}
                min={filters.priceRange[0]}
                max={PRICE_RANGE.max}
                step={PRICE_RANGE.step}
                className="text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rating Filter */}
      {enabledFilters.rating && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Minimum Puan</h4>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all duration-200',
                  filters.minRating === rating
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/50'
                )}
              >
                <Star
                  className={cn(
                    'h-6 w-6',
                    filters.minRating === rating
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-400'
                  )}
                />
                <span
                  className={cn(
                    'mt-1 text-xs font-medium',
                    filters.minRating === rating
                      ? 'text-yellow-700'
                      : 'text-gray-600'
                  )}
                >
                  {rating}+
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Time Filter */}
      {enabledFilters.deliveryTime && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Teslimat Süresi</h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DELIVERY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDeliveryTimeChange(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all duration-200',
                  filters.deliveryTime === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                )}
              >
                <Clock
                  className={cn(
                    'h-5 w-5',
                    filters.deliveryTime === option.value
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  )}
                />
                <span
                  className={cn(
                    'mt-2 text-sm font-medium',
                    filters.deliveryTime === option.value
                      ? 'text-blue-700'
                      : 'text-gray-700'
                  )}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seller Level Filter */}
      {enabledFilters.sellerLevel && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Satıcı Seviyesi</h4>
          </div>

          <div className="space-y-2">
            {SELLER_LEVELS.map((level) => (
              <label
                key={level.value}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all duration-200',
                  filters.sellerLevels.includes(level.value)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={filters.sellerLevels.includes(level.value)}
                  onChange={() => handleSellerLevelToggle(level.value)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-medium',
                        filters.sellerLevels.includes(level.value)
                          ? 'text-purple-900'
                          : 'text-gray-900'
                      )}
                    >
                      {level.label}
                    </span>
                    {level.value === 'TOP_RATED' && (
                      <Badge
                        variant="default"
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                      >
                        ⭐ Pro
                      </Badge>
                    )}
                  </div>
                  <p
                    className={cn(
                      'mt-0.5 text-xs',
                      filters.sellerLevels.includes(level.value)
                        ? 'text-purple-700'
                        : 'text-gray-500'
                    )}
                  >
                    {level.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Location Filter */}
      {enabledFilters.location && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Konum</h4>
          </div>

          <div className="relative">
            <select
              value={filters.location || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="">Tüm Türkiye</option>
              <optgroup label="Şehirler">
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          {filters.location && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-blue-300 bg-blue-50 text-blue-700"
              >
                <MapPin className="mr-1 h-3 w-3" />
                {filters.location}
                <button
                  onClick={() => handleLocationChange('')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 border-t border-gray-200 pt-6">
        <Button
          onClick={handleSavePreset}
          variant="outline"
          className="w-full"
          disabled={activeFilterCount === 0}
        >
          <Save className="mr-2 h-4 w-4" />
          Preset Olarak Kaydet
        </Button>

        {activeFilterCount > 0 && (
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <X className="mr-2 h-4 w-4" />
            Tüm Filtreleri Temizle ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900">
            <Filter className="h-4 w-4" />
            Aktif Filtreler
          </div>
          <div className="flex flex-wrap gap-2">
            {(filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
              filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) && (
              <Badge
                variant="outline"
                className="border-blue-300 bg-white text-blue-700"
              >
                {formatPrice(filters.priceRange[0])} -{' '}
                {formatPrice(filters.priceRange[1])}
              </Badge>
            )}
            {filters.minRating && (
              <Badge
                variant="outline"
                className="border-blue-300 bg-white text-blue-700"
              >
                {filters.minRating}+ Yıldız
              </Badge>
            )}
            {filters.deliveryTime && (
              <Badge
                variant="outline"
                className="border-blue-300 bg-white text-blue-700"
              >
                {
                  DELIVERY_OPTIONS.find((o) => o.value === filters.deliveryTime)
                    ?.label
                }
              </Badge>
            )}
            {filters.sellerLevels.map((level) => (
              <Badge
                key={level}
                variant="outline"
                className="border-blue-300 bg-white text-blue-700"
              >
                {SELLER_LEVELS.find((l) => l.value === level)?.label}
              </Badge>
            ))}
            {filters.location && (
              <Badge
                variant="outline"
                className="border-blue-300 bg-white text-blue-700"
              >
                {filters.location}
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
