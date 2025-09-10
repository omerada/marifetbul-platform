'use client';

import React from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PackageFilters } from '@/types';
import {
  X,
  Search,
  DollarSign,
  Clock,
  Star,
  Filter as FilterIcon,
} from 'lucide-react';

interface MobilePackageFiltersProps {
  isOpen: boolean;
  onClose: () => void;
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

export function MobilePackageFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: MobilePackageFiltersProps) {
  const [localFilters, setLocalFilters] =
    React.useState<PackageFilters>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof PackageFilters,
    value: PackageFilters[keyof PackageFilters]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
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
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {/* Search */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Search className="h-4 w-4" />
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
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleFilterChange('category', '');
                  handleFilterChange('subcategory', '');
                }}
                className={`rounded-lg border p-3 text-sm transition-colors ${
                  !localFilters.category
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tümü
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    handleFilterChange('category', category);
                    handleFilterChange('subcategory', '');
                  }}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    localFilters.category === category
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          {localFilters.category && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Alt Kategori
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleFilterChange('subcategory', '')}
                  className={`rounded-lg border p-3 text-sm transition-colors ${
                    !localFilters.subcategory
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tümü
                </button>
                {subcategories[localFilters.category]?.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleFilterChange('subcategory', sub)}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      localFilters.subcategory === sub
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4" />
              Fiyat Aralığı
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Min</label>
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
              <div>
                <label className="mb-1 block text-xs text-gray-500">Max</label>
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
            </div>
          </div>

          {/* Delivery Time */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Teslimat Süresi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFilterChange('deliveryTime', undefined)}
                className={`rounded-lg border p-3 text-sm transition-colors ${
                  !localFilters.deliveryTime
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hepsi
              </button>
              {deliveryTimes.map((time) => (
                <button
                  key={time.value}
                  onClick={() => handleFilterChange('deliveryTime', time.value)}
                  className={`rounded-lg border p-3 text-sm transition-colors ${
                    localFilters.deliveryTime === time.value
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star className="h-4 w-4" />
              Minimum Puan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFilterChange('rating', undefined)}
                className={`rounded-lg border p-3 text-sm transition-colors ${
                  !localFilters.rating
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hepsi
              </button>
              {ratingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('rating', option.value)}
                  className={`rounded-lg border p-3 text-sm transition-colors ${
                    localFilters.rating === option.value
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
              disabled={!hasActiveFilters}
            >
              Temizle
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Uygula
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
