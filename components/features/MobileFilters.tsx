'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

interface FilterState {
  category: string;
  location: string;
  budget: string;
  experience: string;
  remote: boolean;
}

interface MobileFiltersProps {
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function MobileFilters({
  onSearchChange,
  onFiltersChange,
  onClose,
  isOpen,
}: MobileFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    location: '',
    budget: '',
    experience: '',
    remote: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    category: false,
    budget: false,
    location: false,
    experience: false,
  });

  const categories = [
    'Web Geliştirme',
    'Mobil Uygulama',
    'Tasarım',
    'Yazarlık',
    'Pazarlama',
    'Veri Analizi',
  ];

  const budgetRanges = [
    { label: '₺0 - ₺1.000', value: '0-1000' },
    { label: '₺1.000 - ₺5.000', value: '1000-5000' },
    { label: '₺5.000 - ₺15.000', value: '5000-15000' },
    { label: '₺15.000+', value: '15000+' },
  ];

  const experienceLevels = [
    { label: 'Başlangıç', value: 'beginner' },
    { label: 'Orta', value: 'intermediate' },
    { label: 'Uzman', value: 'expert' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean
  ) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      location: '',
      budget: '',
      experience: '',
      remote: false,
    };
    setActiveFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center">
          <SlidersHorizontal className="mr-2 h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Search */}
        <div>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </div>

        {/* Remote Work Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Uzaktan Çalışma
          </span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={activeFilters.remote}
              onChange={(e) => handleFilterChange('remote', e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('category')}
            className="flex w-full items-center justify-between py-2"
          >
            <span className="text-sm font-medium text-gray-700">Kategori</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                expandedSections.category ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.category && (
            <div className="space-y-2 pl-4">
              {categories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={activeFilters.category === category}
                    onChange={(e) =>
                      handleFilterChange('category', e.target.value)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Budget Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('budget')}
            className="flex w-full items-center justify-between py-2"
          >
            <span className="text-sm font-medium text-gray-700">Bütçe</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                expandedSections.budget ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.budget && (
            <div className="space-y-2 pl-4">
              {budgetRanges.map((range) => (
                <label key={range.value} className="flex items-center">
                  <input
                    type="radio"
                    name="budget"
                    value={range.value}
                    checked={activeFilters.budget === range.value}
                    onChange={(e) =>
                      handleFilterChange('budget', e.target.value)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Experience Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('experience')}
            className="flex w-full items-center justify-between py-2"
          >
            <span className="text-sm font-medium text-gray-700">
              Deneyim Seviyesi
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                expandedSections.experience ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.experience && (
            <div className="space-y-2 pl-4">
              {experienceLevels.map((level) => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="radio"
                    name="experience"
                    value={level.value}
                    checked={activeFilters.experience === level.value}
                    onChange={(e) =>
                      handleFilterChange('experience', e.target.value)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('location')}
            className="flex w-full items-center justify-between py-2"
          >
            <span className="text-sm font-medium text-gray-700">Konum</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                expandedSections.location ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.location && (
            <div className="pl-4">
              <Input
                type="text"
                placeholder="Şehir, ülke..."
                value={activeFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="space-y-3 border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="flex-1"
          >
            Temizle
          </Button>
          <Button onClick={onClose} className="flex-1">
            Filtreleri Uygula
          </Button>
        </div>
      </div>
    </div>
  );
}
