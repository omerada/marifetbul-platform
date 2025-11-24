'use client';

/**
 * AdvancedJobSearchModal Component
 * Modal for advanced job search with multiple filter options
 *
 * Sprint 3 - Story 3.2: Advanced Job Search & Filtering
 *
 * Features:
 * - Multi-filter support (category, budget, skills, experience, location, dates)
 * - Budget range slider with quick presets
 * - Skills multi-select with popular options
 * - Experience level checkboxes
 * - Date range filters
 * - Sort options
 * - URL param synchronization
 * - Clear filters functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-01-24
 */

import { useState, useEffect } from 'react';
import {
  Search,
  X,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button, Input, Label, Checkbox } from '@/components/ui';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { BudgetRangeSlider } from './BudgetRangeSlider';
import type { AdvancedJobSearchRequest } from '@/lib/api/jobs';
import type {
  JobBudgetType,
  JobExperienceLevel,
} from '@/types/backend-aligned';
import type { CategoryResponse } from '@/types/backend-aligned';
import { POPULAR_SKILLS, BUDGET_TYPE_OPTIONS } from '@/types/business/job';

export interface AdvancedJobSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (filters: AdvancedJobSearchRequest) => void;
  categories?: CategoryResponse[];
  initialFilters?: Partial<AdvancedJobSearchRequest>;
}

const EXPERIENCE_LEVELS: { value: JobExperienceLevel; label: string }[] = [
  { value: 'ENTRY', label: 'Başlangıç' },
  { value: 'INTERMEDIATE', label: 'Orta Seviye' },
  { value: 'EXPERT', label: 'Uzman' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Yayın Tarihi' },
  { value: 'budgetAmount', label: 'Bütçe' },
  { value: 'deadline', label: 'Son Başvuru' },
  { value: 'title', label: 'Başlık' },
];

export function AdvancedJobSearchModal({
  open,
  onOpenChange,
  onSearch,
  categories = [],
  initialFilters = {},
}: AdvancedJobSearchModalProps) {
  const [filters, setFilters] = useState<AdvancedJobSearchRequest>({
    query: initialFilters.query || '',
    categoryId: initialFilters.categoryId,
    skills: initialFilters.skills || [],
    budgetMin: initialFilters.budgetMin || 0,
    budgetMax: initialFilters.budgetMax || 50000,
    budgetType: initialFilters.budgetType,
    experienceLevels: initialFilters.experienceLevels || [],
    isRemote: initialFilters.isRemote,
    location: initialFilters.location || '',
    postedAfter: initialFilters.postedAfter,
    deadlineBefore: initialFilters.deadlineBefore,
    sortBy: initialFilters.sortBy || 'createdAt',
    sortDirection: initialFilters.sortDirection || 'DESC',
    page: 0,
    size: 20,
  });

  // Update filters when initialFilters change
  useEffect(() => {
    if (open) {
      setFilters({
        query: initialFilters.query || '',
        categoryId: initialFilters.categoryId,
        skills: initialFilters.skills || [],
        budgetMin: initialFilters.budgetMin || 0,
        budgetMax: initialFilters.budgetMax || 50000,
        budgetType: initialFilters.budgetType,
        experienceLevels: initialFilters.experienceLevels || [],
        isRemote: initialFilters.isRemote,
        location: initialFilters.location || '',
        postedAfter: initialFilters.postedAfter,
        deadlineBefore: initialFilters.deadlineBefore,
        sortBy: initialFilters.sortBy || 'createdAt',
        sortDirection: initialFilters.sortDirection || 'DESC',
        page: 0,
        size: 20,
      });
    }
  }, [open, initialFilters]);

  const handleSearch = () => {
    // Remove empty/undefined values
    const cleanedFilters: AdvancedJobSearchRequest = Object.entries(
      filters
    ).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value) && value.length === 0) return acc;
        acc[key as keyof AdvancedJobSearchRequest] = value as never;
      }
      return acc;
    }, {} as AdvancedJobSearchRequest);

    onSearch(cleanedFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      skills: [],
      budgetMin: 0,
      budgetMax: 50000,
      experienceLevels: [],
      location: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      page: 0,
      size: 20,
    });
  };

  const toggleExperienceLevel = (level: JobExperienceLevel) => {
    setFilters((prev) => ({
      ...prev,
      experienceLevels: prev.experienceLevels?.includes(level)
        ? prev.experienceLevels.filter((l) => l !== level)
        : [...(prev.experienceLevels || []), level],
    }));
  };

  const hasActiveFilters = () => {
    return !!(
      filters.query ||
      filters.categoryId ||
      (filters.skills && filters.skills.length > 0) ||
      filters.budgetMin !== 0 ||
      filters.budgetMax !== 50000 ||
      filters.budgetType ||
      (filters.experienceLevels && filters.experienceLevels.length > 0) ||
      filters.isRemote !== undefined ||
      filters.location ||
      filters.postedAfter ||
      filters.deadlineBefore
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Gelişmiş İş Arama
          </DialogTitle>
          <DialogDescription>
            İhtiyacınıza en uygun işleri bulmak için detaylı filtreler kullanın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="query" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Anahtar Kelime
            </Label>
            <Input
              id="query"
              placeholder="İş başlığı veya açıklamasında ara..."
              value={filters.query || ''}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value })
              }
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={filters.categoryId || ''}
                onValueChange={(value) =>
                  setFilters({ ...filters, categoryId: value || undefined })
                }
              >
                <SelectTrigger placeholder="Kategori seçin" />
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Skills Multi-Select */}
          <div className="space-y-2">
            <Label htmlFor="skills">Beceriler</Label>
            <MultiSelect
              options={POPULAR_SKILLS.map((skill) => ({
                value: skill,
                label: skill,
              }))}
              value={filters.skills || []}
              onChange={(skills) => setFilters({ ...filters, skills })}
              placeholder="Beceri seçin veya yazın..."
            />
          </div>

          {/* Budget Range Slider */}
          <BudgetRangeSlider
            min={0}
            max={50000}
            value={[filters.budgetMin || 0, filters.budgetMax || 50000]}
            onChange={([min, max]) =>
              setFilters({ ...filters, budgetMin: min, budgetMax: max })
            }
          />

          {/* Budget Type */}
          <div className="space-y-2">
            <Label htmlFor="budgetType" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Bütçe Tipi
            </Label>
            <Select
              value={filters.budgetType || ''}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  budgetType: (value as JobBudgetType) || undefined,
                })
              }
            >
              <SelectTrigger placeholder="Bütçe tipi seçin" />
              <SelectContent>
                <SelectItem value="">Tümü</SelectItem>
                {BUDGET_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level Checkboxes */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Deneyim Seviyesi
            </Label>
            <div className="flex flex-wrap gap-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exp-${level.value}`}
                    checked={filters.experienceLevels?.includes(level.value)}
                    onChange={() => toggleExperienceLevel(level.value)}
                  />
                  <label
                    htmlFor={`exp-${level.value}`}
                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {level.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Remote */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Konum
              </Label>
              <Input
                id="location"
                placeholder="Şehir veya bölge..."
                value={filters.location || ''}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isRemote">Çalışma Şekli</Label>
              <Select
                value={
                  filters.isRemote === undefined ? '' : String(filters.isRemote)
                }
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    isRemote: value === '' ? undefined : value === 'true',
                  })
                }
              >
                <SelectTrigger placeholder="Çalışma şekli seçin" />
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="true">Uzaktan</SelectItem>
                  <SelectItem value="false">Yerinde</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postedAfter" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Yayın Tarihi (Sonrası)
              </Label>
              <Input
                id="postedAfter"
                type="date"
                value={filters.postedAfter?.split('T')[0] || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    postedAfter: e.target.value
                      ? `${e.target.value}T00:00:00`
                      : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadlineBefore">Son Başvuru (Öncesi)</Label>
              <Input
                id="deadlineBefore"
                type="date"
                value={filters.deadlineBefore?.split('T')[0] || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    deadlineBefore: e.target.value
                      ? `${e.target.value}T23:59:59`
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sıralama</Label>
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    sortBy: value as AdvancedJobSearchRequest['sortBy'],
                  })
                }
              >
                <SelectTrigger placeholder="Sıralama seçin" />
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortDirection">Yön</Label>
              <Select
                value={filters.sortDirection || 'DESC'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    sortDirection: value as 'ASC' | 'DESC',
                  })
                }
              >
                <SelectTrigger placeholder="Sıralama yönü" />
                <SelectContent>
                  <SelectItem value="DESC">Azalan</SelectItem>
                  <SelectItem value="ASC">Artan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={!hasActiveFilters()}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Filtreleri Temizle
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Ara
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
