'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import type { JobFilters as JobFiltersType } from '@/types';
import {
  MapPin,
  DollarSign,
  Clock,
  Star,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClearFilters: () => void;
  className?: string;
}

export function JobFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: JobFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    budget: true,
    location: true,
    skills: false,
    experience: true,
    deadline: false,
  });

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

  const deadlineOptions = [
    { value: 'urgent', label: 'Acil (1 hafta)' },
    { value: 'week', label: '1-2 hafta' },
    { value: 'month', label: '1 ay' },
    { value: 'flexible', label: 'Esnek' },
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];

    onFiltersChange({
      ...filters,
      skills: newSkills.length > 0 ? newSkills : undefined,
    });
  };

  const handleLocationToggle = (location: string) => {
    const currentLocations = filters.location || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter((l) => l !== location)
      : [...currentLocations, location];

    onFiltersChange({
      ...filters,
      location: newLocations.length > 0 ? newLocations : undefined,
    });
  };

  const handleBudgetChange = (
    field: 'budgetMin' | 'budgetMax',
    value: string
  ) => {
    const numValue = value ? parseInt(value) : undefined;
    onFiltersChange({
      ...filters,
      [field]: numValue,
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  return (
    <Card className={`w-full p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="mr-1 h-4 w-4" />
            Temizle
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-900">Kategori</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center space-x-2"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category}
                  onChange={() => handleCategoryChange(category)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Budget Filter */}
        <div>
          <button
            onClick={() => toggleSection('budget')}
            className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-900"
          >
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Bütçe
            </div>
            {expandedSections.budget ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.budget && (
            <div className="space-y-3">
              {/* Budget Type */}
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      jobType:
                        filters.jobType === 'fixed' ? undefined : 'fixed',
                    })
                  }
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    filters.jobType === 'fixed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sabit Fiyat
                </button>
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      jobType:
                        filters.jobType === 'hourly' ? undefined : 'hourly',
                    })
                  }
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    filters.jobType === 'hourly'
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
                  value={filters.budgetMin || ''}
                  onChange={(e) =>
                    handleBudgetChange('budgetMin', e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Max ₺"
                  value={filters.budgetMax || ''}
                  onChange={(e) =>
                    handleBudgetChange('budgetMax', e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div>
          <button
            onClick={() => toggleSection('location')}
            className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-900"
          >
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Lokasyon
            </div>
            {expandedSections.location ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.location && (
            <div className="space-y-3">
              {/* Remote Toggle */}
              <label className="flex cursor-pointer items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.location?.includes('remote') || false}
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
                      checked={filters.location?.includes(location) || false}
                      onChange={() => handleLocationToggle(location)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <button
            onClick={() => toggleSection('experience')}
            className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-900"
          >
            <div className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Deneyim Seviyesi
            </div>
            {expandedSections.experience ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.experience && (
            <div className="space-y-2">
              {experienceLevels.map((level) => (
                <label
                  key={level.value}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    checked={filters.experienceLevel === level.value}
                    onChange={() =>
                      onFiltersChange({
                        ...filters,
                        experienceLevel:
                          filters.experienceLevel === level.value
                            ? undefined
                            : (level.value as
                                | 'beginner'
                                | 'intermediate'
                                | 'expert'),
                      })
                    }
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Deadline Filter */}
        <div>
          <button
            onClick={() => toggleSection('deadline')}
            className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-900"
          >
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Teslim Süresi
            </div>
            {expandedSections.deadline ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.deadline && (
            <div className="space-y-2">
              {deadlineOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="radio"
                    name="deadline"
                    checked={filters.deadline === option.value}
                    onChange={() =>
                      onFiltersChange({
                        ...filters,
                        deadline:
                          filters.deadline === option.value
                            ? undefined
                            : (option.value as
                                | 'urgent'
                                | 'week'
                                | 'month'
                                | 'flexible'),
                      })
                    }
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Skills Filter */}
        <div>
          <button
            onClick={() => toggleSection('skills')}
            className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-900"
          >
            <span>Yetenekler</span>
            {expandedSections.skills ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.skills && (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {popularSkills.map((skill) => (
                <label
                  key={skill}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={filters.skills?.includes(skill) || false}
                    onChange={() => handleSkillToggle(skill)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
