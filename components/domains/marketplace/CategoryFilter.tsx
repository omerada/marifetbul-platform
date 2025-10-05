'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  TrendingUp,
  DollarSign,
  Hash,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button, Badge, Card, Slider } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';
import {
  CategoryFilterProps,
  CATEGORY_SORT_OPTIONS,
} from '@/types/business/features/marketplace-categories';

// Animation variants
const filterBarVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const filterItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  filters,
  onFiltersChange,
  onReset,
  totalResults,
  loading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 10000,
  ]);
  const [serviceCountRange, setServiceCountRange] = useState<[number, number]>([
    filters.serviceCountRange?.min || 0,
    filters.serviceCountRange?.max || 300,
  ]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  // Handle sort change
  const handleSortChange = (sortBy: typeof filters.sortBy) => {
    onFiltersChange({ sortBy });
  };

  // Handle filter toggles
  const handleToggleFilter = (key: keyof typeof filters, value: boolean) => {
    onFiltersChange({ [key]: value });
  };

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    const range: [number, number] = [values[0], values[1]];
    setPriceRange(range);
    onFiltersChange({
      priceRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  // Handle service count range change
  const handleServiceCountRangeChange = (values: number[]) => {
    const range: [number, number] = [values[0], values[1]];
    setServiceCountRange(range);
    onFiltersChange({
      serviceCountRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.featured) count++;
    if (filters.trending) count++;
    if (filters.priceRange) count++;
    if (filters.serviceCountRange) count++;
    if (filters.hasActiveFreelancers) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <motion.div
      variants={filterBarVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Main Filter Bar */}
      <Card className="border-0 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Results Count */}
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {formatNumber(totalResults)}
              </span>{' '}
              kategori bulundu
            </span>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Sırala:{' '}
                {
                  CATEGORY_SORT_OPTIONS.find(
                    (opt) => opt.value === filters.sortBy
                  )?.label
                }
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {CATEGORY_SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {filters.sortBy === option.value && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <Button
              variant={filters.featured ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleToggleFilter('featured', !filters.featured)}
              className="gap-2"
            >
              <Star className="h-3 w-3" />
              Öne Çıkan
            </Button>

            <Button
              variant={filters.trending ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleToggleFilter('trending', !filters.trending)}
              className="gap-2"
            >
              <TrendingUp className="h-3 w-3" />
              Trend
            </Button>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="ml-auto gap-2"
          >
            <Filter className="h-4 w-4" />
            Gelişmiş Filtreler
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
          </Button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-2 text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-3 w-3" />
              Sıfırla
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              variants={filterItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3"
            >
              {filters.featured && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  Öne Çıkan
                  <button
                    onClick={() => handleToggleFilter('featured', false)}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}

              {filters.trending && (
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trend
                  <button
                    onClick={() => handleToggleFilter('trending', false)}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}

              {filters.priceRange && (
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatPrice(filters.priceRange.min)} -{' '}
                  {formatPrice(filters.priceRange.max)}
                  <button
                    onClick={() => onFiltersChange({ priceRange: undefined })}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}

              {filters.serviceCountRange && (
                <Badge variant="outline" className="gap-1">
                  <Hash className="h-3 w-3" />
                  {filters.serviceCountRange.min} -{' '}
                  {filters.serviceCountRange.max} hizmet
                  <button
                    onClick={() =>
                      onFiltersChange({ serviceCountRange: undefined })
                    }
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            variants={filterBarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="border border-gray-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900">Fiyat Aralığı</h3>
                  </div>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      max={10000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Service Count Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900">Hizmet Sayısı</h3>
                  </div>
                  <div className="space-y-3">
                    <Slider
                      value={serviceCountRange}
                      onValueChange={handleServiceCountRangeChange}
                      max={300}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{serviceCountRange[0]} hizmet</span>
                      <span>{serviceCountRange[1]} hizmet</span>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-medium text-gray-900">Ek Seçenekler</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={
                        filters.hasActiveFreelancers ? 'primary' : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        handleToggleFilter(
                          'hasActiveFreelancers',
                          !filters.hasActiveFreelancers
                        )
                      }
                    >
                      Aktif Freelancer&apos;lar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Advanced Filter Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                <Button variant="ghost" onClick={onReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Tüm Filtreleri Sıfırla
                </Button>
                <Button
                  onClick={() => setShowAdvanced(false)}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Filtreleri Uygula
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Kategoriler güncelleniyor...
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryFilter;
