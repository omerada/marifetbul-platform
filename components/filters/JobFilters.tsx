'use client';

import React, { useState, useEffect } from 'react';
import { JobFilters } from '@/types';
import { Button, Input, Card } from '@/components/ui';
import {
  Filter,
  X,
  Search,
  MapPin,
  DollarSign,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JobFiltersComponentProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
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

const skillsList = [
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'PHP',
  'Laravel',
  'WordPress',
  'Shopify',
  'JavaScript',
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
  isVisible,
  onToggleVisibility,
}: JobFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    filters.skills || []
  );

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setSelectedSkills(filters.skills || []);
  }, [filters]);

  const handleFilterChange = (
    key: keyof JobFilters,
    value: JobFilters[keyof JobFilters]
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
    const clearedFilters: JobFilters = {
      search: '',
      category: '',
      subcategory: '',
      budgetMin: undefined,
      budgetMax: undefined,
      budgetType: undefined,
      experienceLevel: undefined,
      location: '',
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
                placeholder="İş ara..."
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

            {/* Budget Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                <DollarSign className="mr-1 inline h-4 w-4" />
                Bütçe Türü
              </label>
              <select
                value={localFilters.budgetType || ''}
                onChange={(e) =>
                  handleFilterChange('budgetType', e.target.value || undefined)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Hepsi</option>
                <option value="fixed">Sabit Fiyat</option>
                <option value="hourly">Saatlik</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Min Bütçe
              </label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.budgetMin || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'budgetMin',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Max Bütçe
              </label>
              <Input
                type="number"
                placeholder="99999"
                value={localFilters.budgetMax || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'budgetMax',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
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
                  handleFilterChange(
                    'experienceLevel',
                    e.target.value || undefined
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Hepsi</option>
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
                Lokasyon
              </label>
              <Input
                type="text"
                placeholder="Şehir girin..."
                value={localFilters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Remote Work */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Çalışma Şekli
              </label>
              <select
                value={
                  localFilters.isRemote === undefined
                    ? ''
                    : String(localFilters.isRemote)
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange(
                    'isRemote',
                    value === '' ? undefined : value === 'true'
                  );
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Hepsi</option>
                <option value="true">Uzaktan</option>
                <option value="false">Ofiste</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Yetenekler
            </label>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        </Card>
      )}
    </div>
  );
}
