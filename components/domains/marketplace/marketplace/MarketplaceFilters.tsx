'use client';

import { useState, useMemo } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  Filter,
  ChevronDown,
  ChevronRight,
  MapPin,
  Briefcase,
  Star,
  Clock,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobFilters, PackageFilters } from '@/types';
import { MARKETPLACE_CATEGORIES } from '@/lib/domains/marketplace/categories-data';

interface MarketplaceFiltersProps {
  mode: 'jobs' | 'packages';
  onJobFiltersChange: (filters: Partial<JobFilters>) => void;
  onPackageFiltersChange: (filters: Partial<PackageFilters>) => void;
  onClose?: () => void;
}

const locations = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
];

export function MarketplaceFilters({
  mode,
  onJobFiltersChange,
  onPackageFiltersChange,
  onClose,
}: MarketplaceFiltersProps) {
  const [filters, setFilters] = useState<{
    category: string;
    subcategory: string;
    service: string;
    minBudget: string;
    maxBudget: string;
    minPrice: string;
    maxPrice: string;
    location: string;
    experienceLevel: string;
    isRemote: boolean;
    selectedSkills: string[];
    deliveryTime: string;
    rating: string;
  }>({
    category: '',
    subcategory: '',
    service: '',
    minBudget: '',
    maxBudget: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    experienceLevel: '',
    isRemote: false,
    selectedSkills: [],
    deliveryTime: '',
    rating: '',
  });

  const [expandedCategory, setExpandedCategory] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState('');

  // Get selected category data
  const selectedCategoryData = useMemo(() => {
    return MARKETPLACE_CATEGORIES.find((cat) => cat.id === filters.category);
  }, [filters.category]);

  // Get all unique skills from all categories
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    MARKETPLACE_CATEGORIES.forEach((cat) => {
      cat.topSkills.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, []);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return MARKETPLACE_CATEGORIES;
    const searchLower = categorySearch.toLowerCase();
    return MARKETPLACE_CATEGORIES.filter(
      (cat) =>
        cat.title.toLowerCase().includes(searchLower) ||
        cat.description.toLowerCase().includes(searchLower) ||
        cat.topSkills.some((skill) => skill.toLowerCase().includes(searchLower))
    );
  }, [categorySearch]);

  const handleFilterChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
  };

  const applyFilters = () => {
    const commonFilters = {
      category: filters.category || undefined,
      location: filters.location ? [filters.location] : undefined,
      skills:
        filters.selectedSkills.length > 0 ? filters.selectedSkills : undefined,
      isRemote: filters.isRemote || undefined,
      experienceLevel:
        (filters.experienceLevel as 'beginner' | 'intermediate' | 'expert') ||
        undefined,
    };

    if (mode === 'jobs') {
      onJobFiltersChange({
        ...commonFilters,
        budgetMin: filters.minBudget ? Number(filters.minBudget) : undefined,
        budgetMax: filters.maxBudget ? Number(filters.maxBudget) : undefined,
      });
    } else {
      onPackageFiltersChange({
        ...commonFilters,
        priceMin: filters.minPrice ? Number(filters.minPrice) : undefined,
        priceMax: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        deliveryTime: filters.deliveryTime
          ? Number(filters.deliveryTime)
          : undefined,
        rating: filters.rating ? Number(filters.rating) : undefined,
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      service: '',
      minBudget: '',
      maxBudget: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      experienceLevel: '',
      isRemote: false,
      selectedSkills: [],
      deliveryTime: '',
      rating: '',
    });
    setCategorySearch('');

    if (mode === 'jobs') {
      onJobFiltersChange({});
    } else {
      onPackageFiltersChange({});
    }
  };

  const hasActiveFilters =
    filters.category ||
    filters.subcategory ||
    filters.service ||
    filters.minBudget ||
    filters.maxBudget ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.location ||
    filters.experienceLevel ||
    filters.isRemote ||
    filters.selectedSkills.length > 0 ||
    filters.deliveryTime ||
    filters.rating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <Filter className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">
            Filtreler
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Temizle
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter - Hierarchical Structure */}
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Briefcase className="mr-2 h-4 w-4" />
          Kategoriler
        </div>

        {/* Category Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Kategori ara..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {/* Main Category Selection */}
        <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => {
                  if (filters.category === category.id) {
                    // Deselect
                    handleFilterChange('category', '');
                    handleFilterChange('subcategory', '');
                    handleFilterChange('service', '');
                    setExpandedCategory('');
                  } else {
                    // Select
                    handleFilterChange('category', category.id);
                    handleFilterChange('subcategory', '');
                    handleFilterChange('service', '');
                    setExpandedCategory(category.id);
                  }
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all',
                  filters.category === category.id
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{category.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      filters.category === category.id
                        ? 'border-blue-300 bg-blue-100 text-blue-700'
                        : 'border-gray-300 bg-gray-50 text-gray-600'
                    )}
                  >
                    {category.serviceCount}
                  </Badge>
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    expandedCategory === category.id ? 'rotate-90' : ''
                  )}
                />
              </button>

              {/* Subcategories - shown when category is selected */}
              {expandedCategory === category.id && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                  {category.subcategories.map((sub) => (
                    <div key={sub.id} className="space-y-1">
                      <button
                        onClick={() => {
                          if (filters.subcategory === sub.id) {
                            handleFilterChange('subcategory', '');
                            handleFilterChange('service', '');
                          } else {
                            handleFilterChange('subcategory', sub.id);
                            handleFilterChange('service', '');
                          }
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-all',
                          filters.subcategory === sub.id
                            ? 'bg-blue-50 font-medium text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        <span>{sub.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            filters.subcategory === sub.id
                              ? 'border-blue-300 bg-blue-100 text-blue-600'
                              : 'border-gray-300 bg-gray-50 text-gray-600'
                          )}
                        >
                          {sub.serviceCount}
                        </Badge>
                      </button>

                      {/* Services - shown when subcategory is selected */}
                      {filters.subcategory === sub.id &&
                        sub.popularServices && (
                          <div className="mt-1 ml-2 space-y-0.5">
                            {sub.popularServices.slice(0, 10).map((service) => (
                              <button
                                key={service}
                                onClick={() => {
                                  if (filters.service === service) {
                                    handleFilterChange('service', '');
                                  } else {
                                    handleFilterChange('service', service);
                                  }
                                }}
                                className={cn(
                                  'flex w-full items-start rounded-md px-2 py-1 text-left text-xs transition-all',
                                  filters.service === service
                                    ? 'bg-blue-100 font-medium text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                )}
                              >
                                {service}
                              </button>
                            ))}
                            {sub.popularServices.length > 10 && (
                              <p className="px-2 py-1 text-xs text-gray-400">
                                +{sub.popularServices.length - 10} hizmet
                                daha...
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Category Path Display */}
        {filters.category && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Badge variant="default" className="bg-blue-600 text-white">
              {selectedCategoryData?.title}
            </Badge>
            {filters.subcategory && (
              <>
                <ChevronRight className="h-3 w-3 self-center text-gray-400" />
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-blue-700"
                >
                  {
                    selectedCategoryData?.subcategories.find(
                      (s) => s.id === filters.subcategory
                    )?.name
                  }
                </Badge>
              </>
            )}
            {filters.service && (
              <>
                <ChevronRight className="h-3 w-3 self-center text-gray-400" />
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-xs text-blue-700"
                >
                  {filters.service}
                </Badge>
              </>
            )}
          </div>
        )}
      </div>

      {/* Price/Budget Range */}
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <span className="mr-2">💰</span>
          {mode === 'jobs' ? 'Bütçe Aralığı' : 'Fiyat Aralığı'}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              type="number"
              placeholder={mode === 'jobs' ? 'Min bütçe' : 'Min fiyat'}
              value={mode === 'jobs' ? filters.minBudget : filters.minPrice}
              onChange={(e) =>
                handleFilterChange(
                  mode === 'jobs' ? 'minBudget' : 'minPrice',
                  e.target.value
                )
              }
              className="text-sm"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder={mode === 'jobs' ? 'Max bütçe' : 'Max fiyat'}
              value={mode === 'jobs' ? filters.maxBudget : filters.maxPrice}
              onChange={(e) =>
                handleFilterChange(
                  mode === 'jobs' ? 'maxBudget' : 'maxPrice',
                  e.target.value
                )
              }
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <MapPin className="mr-2 h-4 w-4" />
          Konum
        </div>
        <div className="relative">
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="">Tüm Konumlar</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Star className="mr-2 h-4 w-4" />
          Deneyim Seviyesi
        </div>
        <div className="space-y-2">
          {['beginner', 'intermediate', 'expert'].map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center space-x-3"
            >
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={filters.experienceLevel === level}
                onChange={(e) =>
                  handleFilterChange('experienceLevel', e.target.value)
                }
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {level === 'beginner' && 'Başlangıç'}
                {level === 'intermediate' && 'Orta Seviye'}
                {level === 'expert' && 'Uzman'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Package-specific filters */}
      {mode === 'packages' && (
        <>
          <div className="space-y-3">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <Clock className="mr-2 h-4 w-4" />
              Teslimat Süresi
            </div>
            <Input
              type="number"
              placeholder="Max gün sayısı"
              value={filters.deliveryTime}
              onChange={(e) =>
                handleFilterChange('deliveryTime', e.target.value)
              }
              className="text-sm"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <Star className="mr-2 h-4 w-4" />
              Minimum Rating
            </div>
            <div className="space-y-2">
              {[
                { value: '', label: 'Tüm Ratingler' },
                { value: '4', label: '4+ Yıldız' },
                { value: '4.5', label: '4.5+ Yıldız' },
                { value: '5', label: '5 Yıldız' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center space-x-3"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={option.value}
                    checked={filters.rating === option.value}
                    onChange={(e) =>
                      handleFilterChange('rating', e.target.value)
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Remote Work Toggle */}
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <span className="mr-2">🏠</span>
          Çalışma Şekli
        </div>
        <label className="flex cursor-pointer items-center space-x-3">
          <input
            type="checkbox"
            checked={filters.isRemote}
            onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Uzaktan çalışma</span>
        </label>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <span className="mr-2">🛠️</span>
          Beceriler
        </div>
        <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
          {allSkills.map((skill) => (
            <Badge
              key={skill}
              variant={
                filters.selectedSkills.includes(skill) ? 'default' : 'outline'
              }
              className={cn(
                'cursor-pointer transition-all duration-200',
                filters.selectedSkills.includes(skill)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              )}
              onClick={() => handleSkillToggle(skill)}
            >
              {skill}
              {filters.selectedSkills.includes(skill) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
        {filters.selectedSkills.length > 0 && (
          <p className="text-xs text-gray-500">
            {filters.selectedSkills.length} beceri seçildi
          </p>
        )}
      </div>

      {/* Apply Filters Button */}
      <div className="space-y-3 border-t border-gray-200 pt-6">
        <Button
          onClick={applyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          Filtreleri Uygula
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {
                Object.values(filters).filter((v) =>
                  Array.isArray(v) ? v.length > 0 : Boolean(v)
                ).length
              }
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Tüm Filtreleri Temizle
          </Button>
        )}
      </div>
    </div>
  );
}
