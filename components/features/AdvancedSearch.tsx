'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useAdvancedSearch,
  SearchFilters,
  SearchSuggestion,
} from '@/hooks/useAdvancedSearch';
import { Job, ServicePackage } from '@/types';
import {
  Search,
  Filter,
  X,
  Star,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  History,
} from 'lucide-react';

interface AdvancedSearchProps {
  mode: 'jobs' | 'services';
  items: (Job | ServicePackage)[];
  onResultsChange: (results: (Job | ServicePackage)[]) => void;
  className?: string;
}

export function AdvancedSearch({
  mode,
  items,
  onResultsChange,
  className = '',
}: AdvancedSearchProps) {
  const {
    filters,
    filteredItems,
    suggestions,
    searchHistory,
    updateFilter,
    addToSearchHistory,
    clearFilters,
    activeFilterCount,
  } = useAdvancedSearch({ mode, items });

  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Update parent component with filtered results
  useEffect(() => {
    onResultsChange(filteredItems);
  }, [filteredItems, onResultsChange]);

  // Close suggestions and filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    updateFilter('query', query);
    if (query.trim()) {
      addToSearchHistory(query);
    }
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const applySuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'query') {
      handleSearch(suggestion.text);
    } else if (suggestion.type === 'category') {
      updateFilter('category', suggestion.text);
    } else if (suggestion.type === 'skill') {
      const currentSkills = filters.skills;
      if (!currentSkills.includes(suggestion.text)) {
        updateFilter('skills', [...currentSkills, suggestion.text]);
      }
    } else if (suggestion.type === 'location') {
      updateFilter('location', suggestion.text);
    }
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    updateFilter(
      'skills',
      filters.skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Data Science',
    'DevOps',
    'Content Writing',
    'Digital Marketing',
    'Translation',
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Başlangıç' },
    { value: 'intermediate', label: 'Orta' },
    { value: 'expert', label: 'Uzman' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'oldest', label: 'En Eski' },
    { value: 'budget_low', label: 'Düşük Bütçe' },
    { value: 'budget_high', label: 'Yüksek Bütçe' },
    { value: 'rating', label: 'En İyi Puanlar' },
    { value: 'popular', label: 'En Popüler' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Tüm Zamanlar' },
    { value: 'today', label: 'Bugün' },
    { value: 'week', label: 'Bu Hafta' },
    { value: 'month', label: 'Bu Ay' },
  ];

  return (
    <div className={`space-y-4 ${className}`} ref={filtersRef}>
      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={mode === 'jobs' ? 'İş ara...' : 'Hizmet ara...'}
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(filters.query);
                }
              }}
              onFocus={() => {
                if (filters.query.length === 0 && searchHistory.length > 0) {
                  setShowHistory(true);
                } else if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="pr-20 pl-10"
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
              {filters.query && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    updateFilter('query', '');
                    setShowSuggestions(false);
                    setShowHistory(false);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto">
              <div className="p-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-2">
                        {suggestion.type === 'category' && (
                          <TrendingUp className="h-3 w-3" />
                        )}
                        {suggestion.type === 'skill' && (
                          <Star className="h-3 w-3" />
                        )}
                        {suggestion.type === 'location' && (
                          <MapPin className="h-3 w-3" />
                        )}
                        {suggestion.text}
                      </span>
                      {suggestion.count && (
                        <span className="text-xs text-gray-500">
                          ({suggestion.count})
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && (
            <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto">
              <div className="p-2">
                <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                  <History className="h-3 w-3" />
                  Son Aramalar
                </div>
                {searchHistory.map((query, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => handleSearch(query)}
                  >
                    <Search className="mr-2 h-3 w-3" />
                    {query}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Active Skills */}
        {filters.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                {skill}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSkill(skill)}
                  className="h-3 w-3 p-0 hover:bg-blue-200"
                >
                  <X className="h-2 w-2" />
                </Button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Gelişmiş Filtreler</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
            >
              Temizle
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Category Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Konum</label>
              <div className="relative">
                <MapPin className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Şehir..."
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Experience Level (for jobs) */}
            {mode === 'jobs' && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Deneyim Seviyesi
                </label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) =>
                    updateFilter('experienceLevel', e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Seviyeler</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Budget Range */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                <DollarSign className="mr-1 inline h-4 w-4" />
                Bütçe Aralığı (₺)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minBudget || ''}
                  onChange={(e) =>
                    updateFilter('minBudget', Number(e.target.value) || 0)
                  }
                  min="0"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxBudget || ''}
                  onChange={(e) =>
                    updateFilter('maxBudget', Number(e.target.value) || 10000)
                  }
                  min="0"
                />
              </div>
            </div>

            {/* Delivery Time (for services) */}
            {mode === 'services' && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Teslimat Süresi (gün)
                </label>
                <Input
                  type="number"
                  placeholder="Max gün"
                  value={filters.deliveryTime || ''}
                  onChange={(e) =>
                    updateFilter('deliveryTime', Number(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>
            )}

            {/* Rating Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Star className="mr-1 inline h-4 w-4" />
                Minimum Puan
              </label>
              <select
                value={filters.rating}
                onChange={(e) => updateFilter('rating', Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Tüm Puanlar</option>
                <option value="1">1+ Yıldız</option>
                <option value="2">2+ Yıldız</option>
                <option value="3">3+ Yıldız</option>
                <option value="4">4+ Yıldız</option>
                <option value="5">5 Yıldız</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Calendar className="mr-1 inline h-4 w-4" />
                Tarih Aralığı
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  updateFilter(
                    'dateRange',
                    e.target.value as SearchFilters['dateRange']
                  )
                }
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="mb-2 block text-sm font-medium">Sıralama</label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilter(
                    'sortBy',
                    e.target.value as SearchFilters['sortBy']
                  )
                }
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredItems.length} {mode === 'jobs' ? 'iş' : 'hizmet'} bulundu
          {activeFilterCount > 0 && ` (${activeFilterCount} filtre aktif)`}
        </span>
        {activeFilterCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800"
          >
            Tüm filtreleri temizle
          </Button>
        )}
      </div>
    </div>
  );
}
