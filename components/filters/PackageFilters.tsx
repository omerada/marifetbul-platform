'use client';

import React, { useState, useEffect } from 'react';
import { PackageFilters } from '@/types';
import { Button, Input } from '@/components/ui';
import { Filter, X, DollarSign, Clock, Star } from 'lucide-react';

interface PackageFiltersComponentProps {
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
}

const categories = [
  'Web Geliştirme',
  'Mobil Uygulama',
  'Tasarım',
  'İçerik Yazımı',
  'Dijital Pazarlama',
  'Veri Analizi',
  'İş Danışmanlığı',
];

const subcategories: Record<string, string[]> = {
  'Web Geliştirme': [
    'Frontend',
    'Backend',
    'Full Stack',
    'WordPress',
    'E-ticaret',
  ],
  'Mobil Uygulama': ['iOS', 'Android', 'React Native', 'Flutter', 'Hybrid'],
  Tasarım: [
    'UI/UX',
    'Logo Tasarım',
    'Web Tasarım',
    'Grafik Tasarım',
    'İllüstrasyon',
  ],
  'İçerik Yazımı': [
    'Blog Yazımı',
    'Copywriting',
    'Teknik Yazım',
    'SEO Yazımı',
    'E-book',
  ],
  'Dijital Pazarlama': [
    'Google Ads',
    'Facebook Ads',
    'SEO',
    'Social Media',
    'Email Marketing',
  ],
  'Veri Analizi': ['Excel', 'Power BI', 'Python', 'SQL', 'Machine Learning'],
  'İş Danışmanlığı': [
    'Strateji',
    'Operasyon',
    'İnsan Kaynakları',
    'Finans',
    'Pazarlama',
  ],
};

const deliveryTimes = [
  { value: '1', label: '1 Gün' },
  { value: '3', label: '3 Gün' },
  { value: '7', label: '1 Hafta' },
  { value: '14', label: '2 Hafta' },
  { value: '30', label: '1 Ay' },
];

export function PackageFiltersComponent({
  filters,
  onFiltersChange,
}: PackageFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<PackageFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof PackageFilters,
    value: PackageFilters[keyof PackageFilters]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: PackageFilters = {
      search: '',
      category: '',
      subcategory: '',
      priceMin: undefined,
      priceMax: undefined,
      deliveryTime: undefined,
      rating: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some((value) =>
    Array.isArray(value)
      ? value.length > 0
      : value !== undefined && value !== ''
  );

  return (
    <div className="space-y-4">
      {/* Clear filters button if active */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <X className="mr-1 h-4 w-4" />
            Tüm Filtreleri Temizle
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            <Filter className="mr-1 inline h-4 w-4" />
            Kategori
          </label>
          <select
            value={localFilters.category || ''}
            onChange={(e) => {
              handleFilterChange('category', e.target.value);
              handleFilterChange('subcategory', ''); // Reset subcategory
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        {localFilters.category && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Alt Kategori
            </label>
            <select
              value={localFilters.subcategory || ''}
              onChange={(e) =>
                handleFilterChange('subcategory', e.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Tüm Alt Kategoriler</option>
              {subcategories[localFilters.category]?.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            <DollarSign className="mr-1 inline h-4 w-4" />
            Fiyat Aralığı
          </label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.priceMin || ''}
              onChange={(e) =>
                handleFilterChange(
                  'priceMin',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.priceMax || ''}
              onChange={(e) =>
                handleFilterChange(
                  'priceMax',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="flex-1"
            />
          </div>
        </div>

        {/* Delivery Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            <Clock className="mr-1 inline h-4 w-4" />
            Teslimat Süresi
          </label>
          <select
            value={localFilters.deliveryTime || ''}
            onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tüm Süreler</option>
            {deliveryTimes.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            <Star className="mr-1 inline h-4 w-4" />
            Minimum Puan
          </label>
          <select
            value={localFilters.rating || ''}
            onChange={(e) =>
              handleFilterChange(
                'rating',
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tüm Puanlar</option>
            <option value="4.5">4.5+ Yıldız</option>
            <option value="4.0">4.0+ Yıldız</option>
            <option value="3.5">3.5+ Yıldız</option>
            <option value="3.0">3.0+ Yıldız</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-3">
          <Button onClick={handleApplyFilters} className="flex-1">
            Filtreleri Uygula
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export as default for compatibility
export default PackageFiltersComponent;
