'use client';

import React, { useState, useEffect } from 'react';
import type { JobFilters as JobFiltersType } from '@/types';
import { Button, Input } from '@/components/ui';
import { Filter, X, MapPin, DollarSign, Star } from 'lucide-react';

interface JobFiltersComponentProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
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
    'UI/UX Tasarım',
    'Grafik Tasarım',
    'Web Tasarım',
    'Logo Tasarım',
    'Branding',
  ],
  'İçerik Yazımı': [
    'Blog Yazımı',
    'Copywriting',
    'Teknik Yazım',
    'Sosyal Medya',
    'SEO Yazımı',
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

const availableSkills = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'PHP',
  'Laravel',
  'WordPress',
  'Shopify',
  'TypeScript',
  'HTML/CSS',
  'Figma',
  'Adobe Photoshop',
  'Adobe Illustrator',
  'Sketch',
  'SEO',
  'Google Ads',
  'Facebook Ads',
  'Content Marketing',
  'Excel',
  'SQL',
  'Power BI',
  'Tableau',
  'Google Analytics',
];

const experienceLevels = [
  { value: 'beginner', label: 'Başlangıç (0-2 yıl)' },
  { value: 'intermediate', label: 'Orta (2-5 yıl)' },
  { value: 'expert', label: 'Uzman (5+ yıl)' },
];

export function JobFiltersComponent({
  filters,
  onFiltersChange,
}: JobFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<JobFiltersType>(filters);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    filters.skills || []
  );

  useEffect(() => {
    setLocalFilters(filters);
    setSelectedSkills(filters.skills || []);
  }, [filters]);

  const handleFilterChange = (
    key: keyof JobFiltersType,
    value: JobFiltersType[keyof JobFiltersType]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];

    setSelectedSkills(newSkills);
    handleFilterChange('skills', newSkills);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: JobFiltersType = {
      search: '',
      category: '',
      subcategory: '',
      budgetMin: undefined,
      budgetMax: undefined,
      budgetType: undefined,
      experienceLevel: undefined,
      location: [],
      isRemote: undefined,
      skills: [],
    };
    setLocalFilters(clearedFilters);
    setSelectedSkills([]);
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

        {/* Budget Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            <DollarSign className="mr-1 inline h-4 w-4" />
            Bütçe Aralığı
          </label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.budgetMin || ''}
              onChange={(e) =>
                handleFilterChange(
                  'budgetMin',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.budgetMax || ''}
              onChange={(e) =>
                handleFilterChange(
                  'budgetMax',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="flex-1"
            />
          </div>
        </div>

        {/* Budget Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bütçe Türü
          </label>
          <select
            value={localFilters.budgetType || ''}
            onChange={(e) => handleFilterChange('budgetType', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tüm Türler</option>
            <option value="fixed">Sabit Fiyat</option>
            <option value="hourly">Saatlik</option>
          </select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            <Star className="mr-1 inline h-4 w-4" />
            Deneyim Seviyesi
          </label>
          <select
            value={localFilters.experienceLevel || ''}
            onChange={(e) =>
              handleFilterChange('experienceLevel', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tüm Seviyeler</option>
            {experienceLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            <MapPin className="mr-1 inline h-4 w-4" />
            Konum
          </label>
          <Input
            type="text"
            placeholder="Şehir ara..."
            value={
              Array.isArray(localFilters.location)
                ? localFilters.location.join(', ')
                : localFilters.location || ''
            }
            onChange={(e) => {
              const locations = e.target.value
                .split(',')
                .map((loc) => loc.trim())
                .filter(Boolean);
              handleFilterChange('location', locations);
            }}
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remote"
              checked={localFilters.isRemote || false}
              onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remote" className="text-sm text-gray-600">
              Uzaktan çalışma kabul ediliyor
            </label>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Yetenekler
          </label>
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">
            {availableSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedSkills.includes(skill)
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                } `}
              >
                {skill}
              </button>
            ))}
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
      </div>
    </div>
  );
}

// Export as JobFilters for compatibility
export const JobFilters = JobFiltersComponent;
