'use client';

/**
 * ================================================
 * ADVANCED JOB FILTERS COMPONENT
 * ================================================
 * Comprehensive filtering system for job listings
 *
 * Features:
 * - Multi-select categories and skills
 * - Date range picker
 * - Budget range slider
 * - Location filter
 * - Save/Load filter presets
 * - Reset filters
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 * Sprint 1: Analytics & Polish - Task 4
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  Star,
  Save,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/backend-aligned';

export interface AdvancedJobFiltersState {
  search?: string;
  categories?: string[];
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  status?: JobStatus[];
  experienceLevel?: ('beginner' | 'intermediate' | 'expert')[];
}

export interface AdvancedJobFiltersProps {
  filters: AdvancedJobFiltersState;
  onFiltersChange: (filters: AdvancedJobFiltersState) => void;
  onReset?: () => void;
  availableCategories?: string[];
  availableSkills?: string[];
  showPresets?: boolean;
  className?: string;
}

const statusOptions: { value: JobStatus; label: string; color: string }[] = [
  { value: 'DRAFT', label: 'Taslak', color: 'bg-gray-100 text-gray-700' },
  { value: 'OPEN', label: 'Açık', color: 'bg-green-100 text-green-700' },
  {
    value: 'IN_PROGRESS',
    label: 'Devam Ediyor',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'COMPLETED',
    label: 'Tamamlandı',
    color: 'bg-purple-100 text-purple-700',
  },
  { value: 'CLOSED', label: 'Kapalı', color: 'bg-red-100 text-red-700' },
];

const experienceLevels = [
  { value: 'beginner' as const, label: 'Başlangıç' },
  { value: 'intermediate' as const, label: 'Orta' },
  { value: 'expert' as const, label: 'Uzman' },
];

/**
 * Advanced Job Filters Component
 *
 * Provides comprehensive filtering for job listings
 */
export function AdvancedJobFilters({
  filters,
  onFiltersChange,
  onReset,
  availableCategories = [],
  availableSkills = [],
  showPresets = true,
  className = '',
}: AdvancedJobFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<AdvancedJobFiltersState>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof AdvancedJobFiltersState,
    value: string | string[] | number | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = <K extends keyof AdvancedJobFiltersState>(
    key: K,
    value: string
  ) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];

    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  };

  const handleReset = () => {
    const emptyFilters: AdvancedJobFiltersState = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    onReset?.();
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    (key) => localFilters[key as keyof AdvancedJobFiltersState] !== undefined
  ).length;

  return (
    <Card className={cn('space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-600">
                {activeFilterCount} filtre aktif
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Temizle
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Daralt' : 'Genişlet'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Arama
        </label>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="İş başlığı veya açıklama..."
            value={localFilters.search || ''}
            onChange={(e) =>
              handleFilterChange('search', e.target.value || undefined)
            }
            className="pl-10"
          />
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Durum
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => {
                const isSelected = localFilters.status?.includes(status.value);
                return (
                  <Badge
                    key={status.value}
                    className={cn(
                      'cursor-pointer transition-all',
                      isSelected
                        ? status.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    onClick={() => toggleArrayFilter('status', status.value)}
                  >
                    {status.label}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <DollarSign className="mr-1 inline h-4 w-4" />
                Min Bütçe (₺)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.budgetMin || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'budgetMin',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                min="0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <DollarSign className="mr-1 inline h-4 w-4" />
                Max Bütçe (₺)
              </label>
              <Input
                type="number"
                placeholder="100000"
                value={localFilters.budgetMax || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'budgetMax',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                min="0"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Başlangıç Tarihi
              </label>
              <Input
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) =>
                  handleFilterChange('dateFrom', e.target.value || undefined)
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Bitiş Tarihi
              </label>
              <Input
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) =>
                  handleFilterChange('dateTo', e.target.value || undefined)
                }
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <MapPin className="mr-1 inline h-4 w-4" />
              Konum
            </label>
            <Input
              type="text"
              placeholder="Şehir veya bölge..."
              value={localFilters.location || ''}
              onChange={(e) =>
                handleFilterChange('location', e.target.value || undefined)
              }
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <Star className="mr-1 inline h-4 w-4" />
              Deneyim Seviyesi
            </label>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((level) => {
                const isSelected = localFilters.experienceLevel?.includes(
                  level.value
                );
                return (
                  <Badge
                    key={level.value}
                    className={cn(
                      'cursor-pointer transition-all',
                      isSelected
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    onClick={() =>
                      toggleArrayFilter('experienceLevel', level.value)
                    }
                  >
                    {level.label}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Tag className="mr-1 inline h-4 w-4" />
                Kategoriler
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.slice(0, 10).map((category) => {
                  const isSelected =
                    localFilters.categories?.includes(category);
                  return (
                    <Badge
                      key={category}
                      className={cn(
                        'cursor-pointer transition-all',
                        isSelected
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                      onClick={() => toggleArrayFilter('categories', category)}
                    >
                      {category}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills */}
          {availableSkills.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Tag className="mr-1 inline h-4 w-4" />
                Beceriler
              </label>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {availableSkills.slice(0, 20).map((skill) => {
                  const isSelected = localFilters.skills?.includes(skill);
                  return (
                    <Badge
                      key={skill}
                      className={cn(
                        'cursor-pointer transition-all',
                        isSelected
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                      onClick={() => toggleArrayFilter('skills', skill)}
                    >
                      {skill}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Filter Presets */}
      {showPresets && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Filtre Ön Ayarları
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Yükle
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
