'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useUnifiedSearch } from '@/hooks';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Search,
  MapPin,
  Filter,
  X,
  Star,
  Clock,
  DollarSign,
  Eye,
  MessageCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult, SearchFilters } from '@/types/shared/search';
import { trackSearch } from '@/lib/api/search-analytics';
import { logger } from '@/lib/shared/utils/logger';

interface EnhancedSearchSystemProps {
  className?: string;
  onResults?: (results: SearchResult[]) => void;
  onSearch?: (query: string, type?: string) => void;
  placeholder?: string;
  defaultFilters?: Partial<SearchFilters>;
  showFilters?: boolean;
  enableRealtime?: boolean;
  mode?: 'jobs' | 'services' | 'freelancers' | 'all';
}

const searchCategories = [
  { value: 'all', label: 'Tümü' },
  { value: 'jobs', label: 'İşler' },
  { value: 'services', label: 'Hizmetler' },
  { value: 'users', label: 'Freelancerlar' },
];

const experienceLevels = [
  { value: '', label: 'Tüm Seviyeler' },
  { value: 'entry', label: 'Başlangıç' },
  { value: 'intermediate', label: 'Orta' },
  { value: 'expert', label: 'Uzman' },
];

const sortOptions = [
  { value: 'relevance', label: 'Alakalılık' },
  { value: 'date', label: 'Tarih' },
  { value: 'rating', label: 'Puan' },
  { value: 'price', label: 'Fiyat' },
  { value: 'popularity', label: 'Popülerlik' },
];

export function EnhancedSearchSystem({
  className,
  onResults,
  onSearch,
  placeholder = 'İş, hizmet veya freelancer arayın...',
  defaultFilters = {},
  showFilters: initialShowFilters = false,
  enableRealtime = true,
  mode = 'all',
}: EnhancedSearchSystemProps) {
  const [showFilters, setShowFilters] = useState(initialShowFilters);
  const [localQuery, setLocalQuery] = useState('');
  const [localLocation, setLocalLocation] = useState('');

  const {
    query,
    results,
    isLoading,
    filters,
    search,
    setQuery,
    updateFilters,
    clearQuery,
  } = useUnifiedSearch({
    defaultFilters: {
      type: mode as SearchFilters['type'],
      sortBy: 'relevance',
      sortOrder: 'desc',
      ...defaultFilters,
    },
    autoSuggestions: true,
    suggestionsDelay: 300,
  });

  // Handle search submission
  const handleSearch = useCallback(async () => {
    if (!localQuery.trim()) return;

    const searchFilters: Partial<SearchFilters> = {
      ...filters,
    };

    if (localLocation.trim()) {
      searchFilters.location = localLocation;
    }

    setQuery(localQuery);

    // Notify parent component about search action
    onSearch?.(localQuery, filters.type);

    await search(localQuery, searchFilters);

    // Track search analytics
    trackSearch({
      query: localQuery,
      resultCount: results.length,
      categoryId: filters.category,
      filters: {
        type: filters.type || 'all',
        location: searchFilters.location,
        sortBy: filters.sortBy,
      },
    }).catch((err) => {
      // Silent fail - analytics shouldn't break user experience
      logger.debug('Failed to track search', err);
    });

    // Notify parent component
    if (onResults) {
      onResults(results);
    }
  }, [
    localQuery,
    localLocation,
    filters,
    setQuery,
    search,
    onResults,
    onSearch,
    results,
  ]);

  // Handle real-time search
  useEffect(() => {
    if (!enableRealtime || !localQuery.trim() || localQuery.length < 2) return;

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localQuery, enableRealtime, handleSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
      updateFilters({ [key]: value });
    },
    [updateFilters]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    updateFilters({
      type: mode as SearchFilters['type'],
      category: undefined,
      subcategory: undefined,
      priceRange: undefined,
      location: undefined,
      rating: undefined,
      availability: undefined,
      experience: undefined,
      skills: undefined,
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
    setLocalLocation('');
  }, [updateFilters, mode]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setLocalQuery('');
    clearQuery();
  }, [clearQuery]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.location) count++;
    if (filters.priceRange) count++;
    if (filters.rating && filters.rating > 0) count++;
    if (filters.experience) count++;
    if (filters.skills && filters.skills.length > 0) count++;
    return count;
  }, [filters]);

  // Format budget display
  const formatBudget = (budget: {
    min: number;
    max: number;
    currency: string;
  }) => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: budget.currency || 'TRY',
      minimumFractionDigits: 0,
    });

    if (budget.min === budget.max) {
      return formatter.format(budget.min);
    }

    return `${formatter.format(budget.min)} - ${formatter.format(budget.max)}`;
  };

  // Format rating display
  const formatRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={cn('enhanced-search-system space-y-4', className)}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Input Row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={placeholder}
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="pr-20 pl-10"
                  />
                  <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-1">
                    {enableRealtime && localQuery && (
                      <Zap className="h-4 w-4 text-green-500" />
                    )}
                    {localQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-64">
                <div className="relative">
                  <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Konum (isteğe bağlı)"
                    value={localLocation}
                    onChange={(e) => setLocalLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading || !localQuery.trim()}
                loading={isLoading}
              >
                {isLoading ? 'Aranıyor...' : 'Ara'}
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {searchCategories.map((category) => (
                  <Button
                    key={category.value}
                    variant={
                      filters.type === category.value ? 'primary' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleFilterChange('type', category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtreler
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gelişmiş Filtreler</span>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="mr-1 h-4 w-4" />
                Temizle
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Deneyim Seviyesi</label>
                <div className="flex flex-wrap gap-1">
                  {experienceLevels.map((level) => (
                    <Badge
                      key={level.value}
                      variant={
                        filters.experience === level.value
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        handleFilterChange('experience', level.value)
                      }
                    >
                      {level.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Puan</label>
                <div className="flex flex-wrap gap-1">
                  {[0, 3, 4, 4.5, 5].map((rating) => (
                    <Badge
                      key={rating}
                      variant={
                        filters.rating === rating ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        handleFilterChange(
                          'rating',
                          rating === 0 ? undefined : rating
                        )
                      }
                    >
                      {rating === 0 ? 'Tümü' : `${rating}+ ⭐`}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sıralama</label>
                <div className="flex flex-wrap gap-1">
                  {sortOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant={
                        filters.sortBy === option.value ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => handleFilterChange('sortBy', option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {results.length} sonuç bulundu
              {query && ` "${query}" için`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {result.title}
                        </h3>
                        {result.featured && (
                          <Badge variant="premium" size="sm">
                            Öne Çıkan
                          </Badge>
                        )}
                        {result.urgent && (
                          <Badge variant="warning" size="sm">
                            Acil
                          </Badge>
                        )}
                        {result.verified && (
                          <Badge variant="success" size="sm">
                            Doğrulanmış
                          </Badge>
                        )}
                      </div>

                      <p className="line-clamp-2 text-gray-600">
                        {result.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" size="sm">
                            {result.category}
                          </Badge>
                        </div>

                        {result.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{result.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(result.postedAt).toLocaleDateString(
                              'tr-TR'
                            )}
                          </span>
                        </div>

                        {result.rating > 0 && formatRating(result.rating)}

                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{result.metrics.views}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{result.metrics.applications}</span>
                        </div>
                      </div>

                      {result.skills && result.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="outline" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {result.skills.length > 5 && (
                            <Badge variant="outline" size="sm">
                              +{result.skills.length - 5} daha
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-right">
                      <div className="flex items-center gap-1 text-lg font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {formatBudget(result.budget)}
                      </div>

                      {result.type === 'freelancer' && result.freelancer && (
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div>{result.freelancer.title}</div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {result.freelancer.hourlyRate} TL/saat
                            </span>
                          </div>
                          <Badge
                            variant={
                              result.freelancer.availability === 'available'
                                ? 'success'
                                : 'secondary'
                            }
                            size="sm"
                          >
                            {result.freelancer.availability === 'available'
                              ? 'Müsait'
                              : 'Meşgul'}
                          </Badge>
                        </div>
                      )}

                      {result.employer && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>{result.employer.name}</span>
                            {result.employer.verified && (
                              <Badge variant="success" size="sm">
                                ✓
                              </Badge>
                            )}
                          </div>
                          {result.employer.rating > 0 && (
                            <div className="mt-1">
                              {formatRating(result.employer.rating)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {query && !isLoading && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Sonuç bulunamadı
            </h3>
            <p className="text-gray-600">
              &quot;{query}&quot; araması için sonuç bulunamadı. Farklı
              kelimeler deneyin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EnhancedSearchSystem;
