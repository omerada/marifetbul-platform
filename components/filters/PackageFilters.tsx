'use client';

import React, { useState, useEffect } from 'react';
import { PackageFilters } from '@/types';
import { Button, Input, Card } from '@/components/ui';
import {
  Filter,
  X,
  Search,
  DollarSign,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PackageFiltersComponentProps {
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
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
    'SEO İçerik',
    'Çeviri',
  ],
  'Dijital Pazarlama': [
    'SEO',
    'SEM',
    'Sosyal Medya',
    'İçerik Pazarlama',
    'Email Pazarlama',
  ],
  'Veri Analizi': ['Excel', 'Python', 'R', 'SQL', 'Business Intelligence'],
  'İş Danışmanlığı': [
    'Strateji',
    'Süreç Yönetimi',
    'Finans',
    'İnsan Kaynakları',
    'Proje Yönetimi',
  ],
};

const deliveryTimes = [
  { value: 1, label: '1 gün' },
  { value: 3, label: '3 gün' },
  { value: 7, label: '1 hafta' },
  { value: 14, label: '2 hafta' },
  { value: 30, label: '1 ay' },
];

const ratingOptions = [
  { value: 4.5, label: '4.5+ Yıldız' },
  { value: 4.0, label: '4.0+ Yıldız' },
  { value: 3.5, label: '3.5+ Yıldız' },
  { value: 3.0, label: '3.0+ Yıldız' },
];

export function PackageFiltersComponent({
  filters,
  onFiltersChange,
  isVisible,
  onToggleVisibility,
}: PackageFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<PackageFilters>(filters);

  // Update local filters when props change
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

  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value !== undefined && value !== ''
  );

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggleVisibility}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filtreler</span>
          {isVisible ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="mr-1 h-4 w-4" />
            Temizle
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isVisible && (
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                <Search className="mr-1 inline h-4 w-4" />
                Arama
              </label>
              <Input
                type="text"
                placeholder="Hizmet ara..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kategori
              </label>
              <select
                value={localFilters.category || ''}
                onChange={(e) => {
                  handleFilterChange('category', e.target.value);
                  handleFilterChange('subcategory', ''); // Reset subcategory
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Alt Kategori
              </label>
              <select
                value={localFilters.subcategory || ''}
                onChange={(e) =>
                  handleFilterChange('subcategory', e.target.value)
                }
                disabled={!localFilters.category}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Tüm Alt Kategoriler</option>
                {localFilters.category &&
                  subcategories[localFilters.category]?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                <DollarSign className="mr-1 inline h-4 w-4" />
                Min Fiyat
              </label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.priceMin || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMin',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Max Fiyat
              </label>
              <Input
                type="number"
                placeholder="99999"
                value={localFilters.priceMax || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMax',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            {/* Delivery Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                <Clock className="mr-1 inline h-4 w-4" />
                Teslimat Süresi
              </label>
              <select
                value={localFilters.deliveryTime || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'deliveryTime',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Hepsi</option>
                {deliveryTimes.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
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
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Hepsi</option>
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
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
        </Card>
      )}
    </div>
  );
}
