'use client';

import React, { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button, Input } from '@/components/ui';
import type { JobFilters as JobFiltersType } from '@/types';
import { Search, X, MapPin, DollarSign, Star, Filter } from 'lucide-react';

interface MobileJobFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClearFilters: () => void;
}

export function MobileJobFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
}: MobileJobFiltersProps) {
  const [localFilters, setLocalFilters] = useState<JobFiltersType>(filters);

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'DevOps',
    'Other',
  ];

  const popularSkills = [
    'React',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Python',
    'PHP',
    'Laravel',
    'Vue.js',
    'Angular',
    'WordPress',
    'Figma',
    'Photoshop',
    'UI/UX',
    'HTML',
    'CSS',
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Başlangıç' },
    { value: 'intermediate', label: 'Orta' },
    { value: 'expert', label: 'Uzman' },
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
    'Şanlıurfa',
    'Kayseri',
  ];

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const handleFilterChange = (key: keyof JobFiltersType, value: unknown) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = localFilters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];

    handleFilterChange('skills', newSkills.length > 0 ? newSkills : undefined);
  };

  const handleLocationToggle = (location: string) => {
    const currentLocations = localFilters.location || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter((l) => l !== location)
      : [...currentLocations, location];

    handleFilterChange(
      'location',
      newLocations.length > 0 ? newLocations : undefined
    );
  };

  const hasActiveFilters = Object.entries(localFilters).some(([key, value]) => {
    if (key === 'search') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[60, 90]}
      initialSnap={0}
      title="Filtreler"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-red-600"
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

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
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
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Kategori
            </label>
            <select
              value={localFilters.category || ''}
              onChange={(e) =>
                handleFilterChange('category', e.target.value || undefined)
              }
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

          {/* Budget */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              <DollarSign className="mr-1 inline h-4 w-4" />
              Bütçe
            </label>

            {/* Budget Type */}
            <div className="mb-3 flex space-x-2">
              <button
                onClick={() =>
                  handleFilterChange(
                    'jobType',
                    localFilters.jobType === 'fixed' ? undefined : 'fixed'
                  )
                }
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  localFilters.jobType === 'fixed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sabit Fiyat
              </button>
              <button
                onClick={() =>
                  handleFilterChange(
                    'jobType',
                    localFilters.jobType === 'hourly' ? undefined : 'hourly'
                  )
                }
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  localFilters.jobType === 'hourly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Saatlik
              </button>
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min ₺"
                value={localFilters.budgetMin || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'budgetMin',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              />
              <Input
                type="number"
                placeholder="Max ₺"
                value={localFilters.budgetMax || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'budgetMax',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              <MapPin className="mr-1 inline h-4 w-4" />
              Lokasyon
            </label>

            {/* Remote Toggle */}
            <label className="mb-3 flex cursor-pointer items-center space-x-2">
              <input
                type="checkbox"
                checked={localFilters.location?.includes('remote') || false}
                onChange={() => handleLocationToggle('remote')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Uzaktan Çalışma</span>
            </label>

            {/* City Checkboxes */}
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {locations.map((location) => (
                <label
                  key={location}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.location?.includes(location) || false}
                    onChange={() => handleLocationToggle(location)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{location}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              <Star className="mr-1 inline h-4 w-4" />
              Deneyim Seviyesi
            </label>
            <div className="space-y-2">
              {experienceLevels.map((level) => (
                <label
                  key={level.value}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    checked={localFilters.experienceLevel === level.value}
                    onChange={() =>
                      handleFilterChange(
                        'experienceLevel',
                        localFilters.experienceLevel === level.value
                          ? undefined
                          : (level.value as
                              | 'beginner'
                              | 'intermediate'
                              | 'expert')
                      )
                    }
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Yetenekler
            </label>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    localFilters.skills?.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-3">
          <Button onClick={handleApplyFilters} className="flex-1">
            <Filter className="mr-2 h-4 w-4" />
            Filtreleri Uygula
          </Button>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
