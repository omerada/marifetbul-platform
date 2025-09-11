'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  Filter,
  ChevronDown,
  MapPin,
  Briefcase,
  Star,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobFilters, PackageFilters } from '@/types';

interface MarketplaceFiltersProps {
  mode: 'jobs' | 'packages';
  onJobFiltersChange: (filters: Partial<JobFilters>) => void;
  onPackageFiltersChange: (filters: Partial<PackageFilters>) => void;
  onClose?: () => void;
}

// Mock categories for demo
const categories = [
  'Web Geliştirme',
  'Mobil Uygulama',
  'Tasarım',
  'Yazılım',
  'Pazarlama',
  'İçerik Yazımı',
  'SEO',
  'Sosyal Medya',
];

const skills = [
  'React',
  'Node.js',
  'TypeScript',
  'Python',
  'JavaScript',
  'Figma',
  'Photoshop',
  'WordPress',
  'SEO',
  'Google Ads',
];

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

    if (mode === 'jobs') {
      onJobFiltersChange({});
    } else {
      onPackageFiltersChange({});
    }
  };

  const hasActiveFilters =
    filters.category ||
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

      {/* Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Briefcase className="mr-2 h-4 w-4" />
          Kategori
        </div>
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
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
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
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
