'use client';

/**
 * Portfolio Search and Filter Bar
 * Sprint 1: Story 4.3 - Search & Filter UI
 *
 * Search bar with filter controls
 */

'use client';

import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui';
import type { PortfolioFilters } from '@/hooks/business/portfolio/usePortfolioFilters';

// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================

interface PortfolioSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
  className?: string;
}

export function PortfolioSearchBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  placeholder = 'Portfolio ara...',
  className = '',
}: PortfolioSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-300 py-2 pr-10 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
      />
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// FILTER PANEL COMPONENT
// ============================================================================

interface PortfolioFilterPanelProps {
  filters: PortfolioFilters;
  onFiltersChange: (filters: Partial<PortfolioFilters>) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  availableSkills: string[];
  activeFilterCount: number;
  className?: string;
}

export function PortfolioFilterPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories,
  availableSkills,
  activeFilterCount,
  className = '',
}: PortfolioFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtrele
        {activeFilterCount > 0 && (
          <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {/* Filter Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <Card className="absolute top-full right-0 z-20 mt-2 w-80 p-4 shadow-lg">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filtreler</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Tümünü Temizle
                  </button>
                )}
              </div>

              {/* Visibility Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Görünürlük
                </label>
                <div className="space-y-2">
                  {(['all', 'public', 'private'] as const).map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        checked={filters.visibility === option}
                        onChange={() => onFiltersChange({ visibility: option })}
                        className="mr-2 h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {option === 'all'
                          ? 'Tümü'
                          : option === 'public'
                            ? 'Açık'
                            : 'Gizli'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              {availableCategories.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kategori
                  </label>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {availableCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...filters.categories, category]
                              : filters.categories.filter(
                                  (c) => c !== category
                                );
                            onFiltersChange({ categories: newCategories });
                          }}
                          className="mr-2 h-4 w-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Filter */}
              {availableSkills.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Yetenekler
                  </label>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {availableSkills.slice(0, 15).map((skill) => (
                      <label key={skill} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.skills.includes(skill)}
                          onChange={(e) => {
                            const newSkills = e.target.checked
                              ? [...filters.skills, skill]
                              : filters.skills.filter((s) => s !== skill);
                            onFiltersChange({ skills: newSkills });
                          }}
                          className="mr-2 h-4 w-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                    {availableSkills.length > 15 && (
                      <p className="text-xs text-gray-500">
                        +{availableSkills.length - 15} daha fazla
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ============================================================================
// ACTIVE FILTERS DISPLAY
// ============================================================================

interface ActiveFiltersProps {
  filters: PortfolioFilters;
  onRemoveCategory: (category: string) => void;
  onRemoveSkill: (skill: string) => void;
  onClearVisibility: () => void;
  className?: string;
}

export function ActiveFilters({
  filters,
  onRemoveCategory,
  onRemoveSkill,
  onClearVisibility,
  className = '',
}: ActiveFiltersProps) {
  const hasFilters =
    filters.categories.length > 0 ||
    filters.skills.length > 0 ||
    filters.visibility !== 'all';

  if (!hasFilters) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Visibility Badge */}
      {filters.visibility !== 'all' && (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
          {filters.visibility === 'public' ? 'Açık' : 'Gizli'}
          <button onClick={onClearVisibility} className="hover:text-purple-900">
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Category Badges */}
      {filters.categories.map((category) => (
        <span
          key={category}
          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
        >
          {category}
          <button
            onClick={() => onRemoveCategory(category)}
            className="hover:text-blue-900"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {/* Skill Badges */}
      {filters.skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
        >
          {skill}
          <button
            onClick={() => onRemoveSkill(skill)}
            className="hover:text-green-900"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export default PortfolioSearchBar;
