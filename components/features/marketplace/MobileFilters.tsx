'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MapPin,
  DollarSign,
  Clock,
  Filter,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobFilters, PackageFilters } from '@/types';

interface MobileFiltersProps {
  mode: 'jobs' | 'packages';
  filters: JobFilters | PackageFilters;
  onFiltersChange: (filters: Partial<JobFilters | PackageFilters>) => void;
  onClear: () => void;
  className?: string;
}

interface FilterSection {
  key: string;
  title: string;
  icon: React.ReactNode;
  type: 'select' | 'multiselect' | 'range' | 'text';
  options?: Array<{ value: string; label: string; count?: number }>;
  placeholder?: string;
}

const categoryOptions = [
  { value: 'web-development', label: 'Web Geliştirme', count: 45 },
  { value: 'mobile-development', label: 'Mobil Geliştirme', count: 32 },
  { value: 'design', label: 'Tasarım', count: 28 },
  { value: 'data-science', label: 'Veri Bilimi', count: 19 },
  { value: 'marketing', label: 'Pazarlama', count: 24 },
  { value: 'content', label: 'İçerik', count: 16 },
];

const locationOptions = [
  { value: 'istanbul', label: 'İstanbul', count: 89 },
  { value: 'ankara', label: 'Ankara', count: 34 },
  { value: 'izmir', label: 'İzmir', count: 28 },
  { value: 'remote', label: 'Uzaktan', count: 156 },
  { value: 'bursa', label: 'Bursa', count: 12 },
  { value: 'antalya', label: 'Antalya', count: 8 },
];

const budgetRanges = [
  { value: '0-500', label: '0 - 500 ₺', count: 23 },
  { value: '500-1500', label: '500 - 1.500 ₺', count: 45 },
  { value: '1500-5000', label: '1.500 - 5.000 ₺', count: 67 },
  { value: '5000-15000', label: '5.000 - 15.000 ₺', count: 34 },
  { value: '15000+', label: '15.000 ₺ +', count: 12 },
];

const experienceLevels = [
  { value: 'entry', label: 'Başlangıç', count: 45 },
  { value: 'intermediate', label: 'Orta', count: 67 },
  { value: 'expert', label: 'Uzman', count: 34 },
  { value: 'senior', label: 'Kıdemli', count: 18 },
];

export function MobileFilters({
  mode,
  filters,
  onFiltersChange,
  onClear,
  className,
}: MobileFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category'])
  );
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    setLocalFilters(filters);

    // Count active filters
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === 'page' || key === 'limit') return acc;
      if (Array.isArray(value)) return acc + value.length;
      if (value && value !== '') return acc + 1;
      return acc;
    }, 0);

    setActiveFiltersCount(count);
  }, [filters]);

  const filterSections: FilterSection[] = [
    {
      key: 'category',
      title: 'Kategori',
      icon: <Filter className="h-4 w-4" />,
      type: 'select',
      options: categoryOptions,
    },
    {
      key: 'location',
      title: 'Konum',
      icon: <MapPin className="h-4 w-4" />,
      type: 'multiselect',
      options: locationOptions,
    },
    {
      key: mode === 'jobs' ? 'budget' : 'price',
      title: mode === 'jobs' ? 'Bütçe' : 'Fiyat',
      icon: <DollarSign className="h-4 w-4" />,
      type: 'select',
      options: budgetRanges,
    },
    ...(mode === 'jobs'
      ? [
          {
            key: 'experienceLevel',
            title: 'Deneyim Seviyesi',
            icon: <Clock className="h-4 w-4" />,
            type: 'select' as const,
            options: experienceLevels,
          },
        ]
      : []),
  ];

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleMultiselectChange = (key: string, value: string) => {
    const currentValues =
      ((localFilters as Record<string, unknown>)[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];

    handleFilterChange(key, newValues);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { page: 1, limit: 12 } as
      | JobFilters
      | PackageFilters;
    setLocalFilters(clearedFilters);
    onClear();
  };

  const renderFilterSection = (section: FilterSection) => {
    const isExpanded = expandedSections.has(section.key);
    const currentValue = (localFilters as Record<string, unknown>)[section.key];

    return (
      <div
        key={section.key}
        className="border-b border-gray-200 last:border-b-0 dark:border-gray-700"
      >
        <button
          onClick={() => toggleSection(section.key)}
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            {section.icon}
            <span className="font-medium">{section.title}</span>
            {currentValue &&
              (typeof currentValue === 'string' ||
                Array.isArray(currentValue)) && (
                <Badge variant="secondary" className="text-xs">
                  {Array.isArray(currentValue) ? currentValue.length : '1'}
                </Badge>
              )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded && 'rotate-180 transform'
            )}
          />
        </button>

        {isExpanded && (
          <div className="px-4 pb-4">
            {section.type === 'select' && (
              <div className="space-y-2">
                {section.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={section.key}
                        value={option.value}
                        checked={currentValue === option.value}
                        onChange={(e) =>
                          handleFilterChange(section.key, e.target.value)
                        }
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <span className="text-sm">{option.label}</span>
                    </div>
                    {option.count && (
                      <span className="text-xs text-gray-500">
                        ({option.count})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {section.type === 'multiselect' && (
              <div className="space-y-2">
                {section.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={
                          Array.isArray(currentValue) &&
                          currentValue.includes(option.value)
                        }
                        onChange={() =>
                          handleMultiselectChange(section.key, option.value)
                        }
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </div>
                    {option.count && (
                      <span className="text-xs text-gray-500">
                        ({option.count})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filtreler</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Temizle
        </Button>
      </div>

      {/* Filter Sections */}
      <div className="max-h-96 overflow-y-auto">
        {filterSections.map(renderFilterSection)}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex gap-3">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            Sıfırla
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Uygula
          </Button>
        </div>
      </div>
    </div>
  );
}
