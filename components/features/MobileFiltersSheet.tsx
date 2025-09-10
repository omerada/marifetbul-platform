'use client';

import React, { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Filter, X, Check } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface MobileFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Record<string, string>) => void;
  filterOptions: {
    categories: FilterOption[];
    locations: FilterOption[];
    skills: FilterOption[];
    experienceLevels: FilterOption[];
    budgetRanges: FilterOption[];
  };
  currentFilters: Record<string, string>;
  mode: 'jobs' | 'services';
}

export function MobileFiltersSheet({
  isOpen,
  onClose,
  onApplyFilters,
  filterOptions,
  currentFilters,
  mode,
}: MobileFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [activeSection, setActiveSection] = useState<string>('category');

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
  };

  const filterSections = [
    {
      id: 'category',
      label: 'Kategori',
      options: filterOptions.categories,
      key: 'category',
    },
    ...(mode === 'jobs'
      ? [
          {
            id: 'location',
            label: 'Konum',
            options: filterOptions.locations,
            key: 'location',
          },
          {
            id: 'experience',
            label: 'Deneyim Seviyesi',
            options: filterOptions.experienceLevels,
            key: 'experienceLevel',
          },
          {
            id: 'budget',
            label: 'Bütçe Aralığı',
            options: filterOptions.budgetRanges,
            key: 'budget',
          },
        ]
      : []),
    {
      id: 'skills',
      label: 'Yetenekler',
      options: filterOptions.skills,
      key: 'skills',
    },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filtreler">
      <div className="flex h-full flex-col">
        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6 grid grid-cols-3 gap-2">
            {filterSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`rounded-lg p-3 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Active Section Content */}
          <div className="space-y-3">
            {filterSections
              .find((s) => s.id === activeSection)
              ?.options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <span className="text-gray-900">{option.label}</span>
                  <div className="relative">
                    <input
                      type="radio"
                      name={activeSection}
                      value={option.value}
                      checked={
                        localFilters[
                          filterSections.find((s) => s.id === activeSection)
                            ?.key || ''
                        ] === option.value
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          filterSections.find((s) => s.id === activeSection)
                            ?.key || '',
                          e.target.value
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        localFilters[
                          filterSections.find((s) => s.id === activeSection)
                            ?.key || ''
                        ] === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {localFilters[
                        filterSections.find((s) => s.id === activeSection)
                          ?.key || ''
                      ] === option.value && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
          </div>

          {/* Custom Search for Skills */}
          {activeSection === 'skills' && (
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Yetenek ara veya ekle..."
                value={localFilters.skills || ''}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
              size="lg"
            >
              Temizle
            </Button>
            <Button onClick={handleApply} className="flex-1" size="lg">
              Uygula ({Object.keys(localFilters).length})
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
