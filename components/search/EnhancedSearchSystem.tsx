'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import { Slider } from '@/components/ui/Slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Search,
  Filter,
  X,
  MapPin,
  TrendingUp,
  Zap,
  BookmarkPlus,
  BarChart3,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { SearchResult, SearchFilters } from '@/types/search';

// Enhanced types for Sprint 3
interface SearchFacet {
  id: string;
  name: string;
  count: number;
  selected: boolean;
  type: 'category' | 'location' | 'skill' | 'price' | 'rating' | 'time';
}

interface SmartFilter {
  id: string;
  name: string;
  type: 'range' | 'select' | 'multiselect' | 'toggle' | 'location';
  options?: { value: string; label: string; count?: number }[];
  value: unknown; // More specific than any
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

interface SearchMetrics {
  totalResults: number;
  searchTime: number;
  popularFilters: string[];
  relatedSearches: string[];
}

interface SavedFilterSet {
  id: string;
  name: string;
  filters: SmartFilter[];
  createdAt: string;
}

interface EnhancedSearchProps {
  mode?: 'jobs' | 'services' | 'freelancers' | 'all';
  onResults?: (results: SearchResult[]) => void;
  onMetrics?: (metrics: SearchMetrics) => void;
  className?: string;
  enableAnalytics?: boolean;
  enableSavedSearches?: boolean;
  enableRealtime?: boolean;
  placeholder?: string;
}

export function EnhancedSearchSystem({
  mode = 'all',
  onResults,
  onMetrics,
  className,
  enableAnalytics = true,
  enableSavedSearches = true,
  enableRealtime = true,
  placeholder = 'Gelişmiş arama: iş, hizmet, freelancer...',
}: EnhancedSearchProps) {
  // Enhanced search state
  const {
    query,
    results,
    suggestions,
    isLoading,
    filters,
    setQuery,
    search,
    applyFilter,
    removeFilter,
    clearSearch,
    saveCurrentSearch,
    getSearchAnalytics,
  } = useEnhancedSearch();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<
    'simple' | 'advanced' | 'expert'
  >('simple');
  const [facets, setFacets] = useState<SearchFacet[]>([]);
  const [smartFilters, setSmartFilters] = useState<SmartFilter[]>([]);
  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics | null>(
    null
  );
  const [savedFilterSets, setSavedFilterSets] = useState<SavedFilterSet[]>([]);
  const [realtimeEnabled, setRealtimeEnabled] = useState(enableRealtime);

  // Initialize smart filters based on mode
  useEffect(() => {
    const initializeFilters = () => {
      const baseFilters: SmartFilter[] = [
        {
          id: 'categories',
          name: 'Kategoriler',
          type: 'multiselect',
          value: [],
          options: [
            { value: 'web-dev', label: 'Web Geliştirme', count: 245 },
            { value: 'mobile-dev', label: 'Mobil Geliştirme', count: 189 },
            { value: 'design', label: 'Tasarım', count: 156 },
            { value: 'marketing', label: 'Pazarlama', count: 134 },
            { value: 'writing', label: 'Yazarlık', count: 98 },
            { value: 'translation', label: 'Çeviri', count: 87 },
          ],
        },
        {
          id: 'location',
          name: 'Lokasyon',
          type: 'location',
          value: '',
          placeholder: 'Şehir, ilçe veya uzaktan',
        },
        {
          id: 'budget',
          name: 'Bütçe Aralığı',
          type: 'range',
          value: [0, 10000],
          min: 0,
          max: 10000,
          step: 100,
        },
        {
          id: 'rating',
          name: 'Minimum Puan',
          type: 'select',
          value: '',
          options: [
            { value: '5', label: '5 Yıldız', count: 45 },
            { value: '4', label: '4+ Yıldız', count: 128 },
            { value: '3', label: '3+ Yıldız', count: 256 },
            { value: '2', label: '2+ Yıldız', count: 389 },
          ],
        },
        {
          id: 'availability',
          name: 'Müsaitlik',
          type: 'select',
          value: '',
          options: [
            { value: 'available', label: 'Şimdi Müsait', count: 67 },
            { value: 'this-week', label: 'Bu Hafta', count: 124 },
            { value: 'this-month', label: 'Bu Ay', count: 198 },
            { value: 'any', label: 'Herhangi', count: 456 },
          ],
        },
      ];

      // Mode-specific filters
      if (mode === 'jobs' || mode === 'all') {
        baseFilters.push({
          id: 'job-type',
          name: 'İş Türü',
          type: 'multiselect',
          value: [],
          options: [
            { value: 'full-time', label: 'Tam Zamanlı', count: 89 },
            { value: 'part-time', label: 'Yarı Zamanlı', count: 123 },
            { value: 'contract', label: 'Proje Bazlı', count: 167 },
            { value: 'remote', label: 'Uzaktan', count: 234 },
          ],
        });
      }

      if (mode === 'services' || mode === 'all') {
        baseFilters.push({
          id: 'delivery-time',
          name: 'Teslimat Süresi',
          type: 'select',
          value: '',
          options: [
            { value: '1', label: '1 Gün', count: 34 },
            { value: '3', label: '3 Gün', count: 78 },
            { value: '7', label: '1 Hafta', count: 123 },
            { value: '14', label: '2 Hafta', count: 89 },
            { value: '30', label: '1 Ay', count: 67 },
          ],
        });
      }

      if (mode === 'freelancers' || mode === 'all') {
        baseFilters.push({
          id: 'experience',
          name: 'Deneyim Seviyesi',
          type: 'select',
          value: '',
          options: [
            { value: 'entry', label: 'Başlangıç', count: 45 },
            { value: 'intermediate', label: 'Orta', count: 89 },
            { value: 'expert', label: 'Uzman', count: 67 },
            { value: 'top', label: 'En İyi', count: 23 },
          ],
        });
      }

      setSmartFilters(baseFilters);
    };

    initializeFilters();
  }, [mode]);

  // Mock facets based on search
  useEffect(() => {
    if (query || searchInput) {
      const mockFacets: SearchFacet[] = [
        {
          id: 'web-dev',
          name: 'Web Geliştirme',
          count: 145,
          selected: false,
          type: 'category',
        },
        {
          id: 'mobile',
          name: 'Mobil Geliştirme',
          count: 89,
          selected: false,
          type: 'category',
        },
        {
          id: 'design',
          name: 'Tasarım',
          count: 67,
          selected: false,
          type: 'category',
        },
        {
          id: 'istanbul',
          name: 'İstanbul',
          count: 234,
          selected: false,
          type: 'location',
        },
        {
          id: 'ankara',
          name: 'Ankara',
          count: 123,
          selected: false,
          type: 'location',
        },
        {
          id: 'react',
          name: 'React',
          count: 156,
          selected: false,
          type: 'skill',
        },
        {
          id: 'typescript',
          name: 'TypeScript',
          count: 134,
          selected: false,
          type: 'skill',
        },
        {
          id: 'nodejs',
          name: 'Node.js',
          count: 98,
          selected: false,
          type: 'skill',
        },
      ];
      setFacets(mockFacets);

      // Mock search metrics
      setSearchMetrics({
        totalResults: 456,
        searchTime: 0.12,
        popularFilters: ['Web Geliştirme', 'İstanbul', 'React'],
        relatedSearches: ['React Developer', 'Frontend', 'Full Stack'],
      });
    }
  }, [query, searchInput]);

  // Enhanced search function
  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const finalQuery = searchQuery || searchInput;
      if (!finalQuery.trim()) return;

      setQuery(finalQuery);

      try {
        await search({
          query: finalQuery,
          type: filters.type,
          filters: filters.filters,
          sort: filters.sort,
          location: filters.location,
        });

        if (enableAnalytics) {
          const analytics = await getSearchAnalytics();
          onMetrics?.(searchMetrics!);
        }

        // Convert results to expected format if needed
        const searchResults = results.map((result) => ({
          id: result.id,
          title: result.title,
          description: result.description || '',
          category: result.type,
          location: 'location' in result ? (result.location as string) : '',
          budget:
            'budget' in result
              ? typeof result.budget === 'object'
                ? (result.budget as {
                    min: number;
                    max: number;
                    currency: string;
                  })
                : {
                    min: result.budget as number,
                    max: result.budget as number,
                    currency: 'TRY',
                  }
              : { min: 0, max: 0, currency: 'TRY' },
          rating: 'rating' in result ? (result.rating as number) : 0,
          type:
            result.type === 'package'
              ? 'service'
              : (result.type as 'job' | 'freelancer' | 'service'),
          skills: 'skills' in result ? (result.skills as string[]) : [],
          freelancer:
            'freelancer' in result && result.freelancer
              ? {
                  id:
                    ((result.freelancer as Record<string, unknown>)
                      ?.id as string) || '',
                  name:
                    ((result.freelancer as Record<string, unknown>)
                      ?.name as string) || '',
                  avatar:
                    ((result.freelancer as Record<string, unknown>)
                      ?.avatar as string) || '',
                  title:
                    ((result.freelancer as Record<string, unknown>)
                      ?.title as string) || '',
                  hourlyRate:
                    ((result.freelancer as Record<string, unknown>)
                      ?.hourlyRate as number) || 0,
                  availability:
                    ((result.freelancer as Record<string, unknown>)
                      ?.availability as string) || 'available',
                  level:
                    ((result.freelancer as Record<string, unknown>)
                      ?.level as string) || 'beginner',
                }
              : undefined,
          employer:
            'employer' in result && result.employer
              ? {
                  id:
                    ((result.employer as Record<string, unknown>)
                      ?.id as string) || '',
                  name:
                    ((result.employer as Record<string, unknown>)
                      ?.name as string) || '',
                  avatar:
                    ((result.employer as Record<string, unknown>)
                      ?.avatar as string) || '',
                  verified:
                    ((result.employer as Record<string, unknown>)
                      ?.verified as boolean) || false,
                  rating:
                    ((result.employer as Record<string, unknown>)
                      ?.rating as number) || 0,
                }
              : undefined,
          price: 'price' in result ? (result.price as number) : undefined,
          deliveryTime:
            'deliveryTime' in result
              ? (result.deliveryTime as number)
              : undefined,
          createdAt:
            'createdAt' in result
              ? (result.createdAt as string)
              : new Date().toISOString(),
          // Default values for missing properties
          reviews: 'reviews' in result ? (result.reviews as number) : 0,
          featured: 'featured' in result ? (result.featured as boolean) : false,
          urgent: 'urgent' in result ? (result.urgent as boolean) : false,
          verified: 'verified' in result ? (result.verified as boolean) : false,
          tags: 'tags' in result ? (result.tags as string[]) : [],
          status: 'status' in result ? (result.status as string) : 'active',
          views: 'views' in result ? (result.views as number) : 0,
          postedAt:
            'postedAt' in result
              ? (result.postedAt as string)
              : new Date().toISOString(),
          metrics:
            'metrics' in result && result.metrics
              ? {
                  views:
                    ((result.metrics as Record<string, unknown>)
                      ?.views as number) || 0,
                  applications:
                    ((result.metrics as Record<string, unknown>)
                      ?.applications as number) || 0,
                  responseTime:
                    ((result.metrics as Record<string, unknown>)
                      ?.responseTime as string) || '24h',
                }
              : { views: 0, applications: 0, responseTime: '24h' },
          user:
            'user' in result && result.user
              ? {
                  id:
                    ((result.user as Record<string, unknown>)?.id as string) ||
                    '',
                  name:
                    ((result.user as Record<string, unknown>)
                      ?.name as string) || '',
                  avatar:
                    ((result.user as Record<string, unknown>)
                      ?.avatar as string) || undefined,
                  rating:
                    ((result.user as Record<string, unknown>)
                      ?.rating as number) || undefined,
                }
              : { id: '', name: '' },
          updatedAt:
            'updatedAt' in result
              ? (result.updatedAt as string)
              : new Date().toISOString(),
        }));

        onResults?.(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
    },
    [
      searchInput,
      search,
      setQuery,
      results,
      onResults,
      onMetrics,
      searchMetrics,
      enableAnalytics,
      getSearchAnalytics,
      filters.filters,
      filters.location,
      filters.sort,
      filters.type,
    ]
  );

  // Realtime search
  useEffect(() => {
    if (!realtimeEnabled || !searchInput || searchInput.length < 2) return;

    const timeoutId = setTimeout(() => {
      handleSearch(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, realtimeEnabled, handleSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterId: string, value: unknown) => {
      setSmartFilters((prev) =>
        prev.map((filter) =>
          filter.id === filterId ? { ...filter, value } : filter
        )
      );

      // Apply to search store
      applyFilter(
        filterId as keyof SearchFilters,
        value as string | number | string[]
      );
    },
    [applyFilter]
  );

  // Handle facet toggle
  const handleFacetToggle = useCallback((facetId: string) => {
    setFacets((prev) =>
      prev.map((facet) =>
        facet.id === facetId ? { ...facet, selected: !facet.selected } : facet
      )
    );
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return smartFilters.filter((filter) => {
      switch (filter.type) {
        case 'multiselect':
          return Array.isArray(filter.value) && filter.value.length > 0;
        case 'range':
          return (
            Array.isArray(filter.value) &&
            (filter.value[0] > (filter.min || 0) ||
              filter.value[1] < (filter.max || 10000))
          );
        case 'select':
        case 'location':
          return filter.value && filter.value !== '';
        case 'toggle':
          return filter.value === true;
        default:
          return false;
      }
    }).length;
  }, [smartFilters]);

  // Save current filter set
  const handleSaveFilterSet = useCallback(() => {
    const filterSet = {
      id: Date.now().toString(),
      name: `Filter Set ${savedFilterSets.length + 1}`,
      filters: smartFilters.filter(
        (f) =>
          f.value &&
          f.value !== '' &&
          (!Array.isArray(f.value) || f.value.length > 0)
      ),
      createdAt: new Date().toISOString(),
    };
    setSavedFilterSets((prev) => [...prev, filterSet]);
  }, [smartFilters, savedFilterSets.length]);

  // Render filter component
  const renderFilter = useCallback(
    (filter: SmartFilter) => {
      switch (filter.type) {
        case 'multiselect':
          return (
            <div key={filter.id} className="space-y-2">
              <Label className="text-sm font-medium">{filter.name}</Label>
              <div className="flex flex-wrap gap-1">
                {filter.options?.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      Array.isArray(filter.value) &&
                      filter.value.includes(option.value)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      const currentValues = Array.isArray(filter.value)
                        ? filter.value
                        : [];
                      const newValues = currentValues.includes(option.value)
                        ? currentValues.filter((v) => v !== option.value)
                        : [...currentValues, option.value];
                      handleFilterChange(filter.id, newValues);
                    }}
                  >
                    {option.label}
                    {option.count && (
                      <span className="ml-1">({option.count})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          );

        case 'range':
          return (
            <div key={filter.id} className="space-y-2">
              <Label className="text-sm font-medium">{filter.name}</Label>
              <div className="px-2">
                <Slider
                  value={
                    Array.isArray(filter.value) &&
                    typeof filter.value[0] === 'number'
                      ? ([filter.value[0], filter.value[1]] as [number, number])
                      : [filter.min || 0, filter.max || 10000]
                  }
                  onValueChange={(value) =>
                    handleFilterChange(filter.id, value)
                  }
                  max={filter.max}
                  min={filter.min}
                  step={filter.step}
                  className="w-full"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>
                    $
                    {Array.isArray(filter.value) ? filter.value[0] : filter.min}
                  </span>
                  <span>
                    $
                    {Array.isArray(filter.value) ? filter.value[1] : filter.max}
                  </span>
                </div>
              </div>
            </div>
          );

        case 'select':
          return (
            <div key={filter.id} className="space-y-2">
              <Label className="text-sm font-medium">{filter.name}</Label>
              <div className="flex flex-wrap gap-1">
                {filter.options?.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      filter.value === option.value ? 'default' : 'outline'
                    }
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      const newValue =
                        filter.value === option.value ? '' : option.value;
                      handleFilterChange(filter.id, newValue);
                    }}
                  >
                    {option.label}
                    {option.count && (
                      <span className="ml-1">({option.count})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          );

        case 'location':
          return (
            <div key={filter.id} className="space-y-2">
              <Label className="text-sm font-medium">{filter.name}</Label>
              <div className="relative">
                <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder={filter.placeholder}
                  value={filter.value as string}
                  onChange={(e) =>
                    handleFilterChange(filter.id, e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    },
    [handleFilterChange]
  );

  return (
    <div className={cn('enhanced-search-system', className)}>
      {/* Search Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Main Search Bar */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder={placeholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pr-20 pl-10"
              />
              <div className="absolute top-1/2 right-2 flex -translate-y-1/2 transform gap-1">
                {realtimeEnabled && <Zap className="h-4 w-4 text-green-500" />}
                <Button
                  size="sm"
                  onClick={() => handleSearch()}
                  disabled={isLoading}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  Filtreler
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                <Tabs defaultValue={searchMode}>
                  <TabsList className="h-8">
                    <TabsTrigger value="simple" className="text-xs">
                      Basit
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs">
                      Gelişmiş
                    </TabsTrigger>
                    <TabsTrigger value="expert" className="text-xs">
                      Uzman
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-2">
                {enableSavedSearches && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveFilterSet}
                    disabled={activeFilterCount === 0}
                  >
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                  className={realtimeEnabled ? 'text-green-600' : ''}
                >
                  <Zap className="h-4 w-4" />
                </Button>

                {enableAnalytics && (
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Metrics */}
            {searchMetrics && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{searchMetrics.totalResults} sonuç</span>
                <span>{searchMetrics.searchTime}s</span>
                {searchMetrics.popularFilters.length > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      Popüler: {searchMetrics.popularFilters.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">Gelişmiş Filtreler</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSmartFilters((prev) =>
                      prev.map((f) => ({
                        ...f,
                        value:
                          f.type === 'multiselect'
                            ? []
                            : f.type === 'range'
                              ? [f.min || 0, f.max || 10000]
                              : '',
                      }))
                    )
                  }
                >
                  <X className="mr-1 h-4 w-4" />
                  Temizle
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {smartFilters.map(renderFilter)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Facets */}
      {facets.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Hızlı Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {facets.map((facet) => (
                <Badge
                  key={facet.id}
                  variant={facet.selected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleFacetToggle(facet.id)}
                >
                  {facet.name} ({facet.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Filter Sets */}
      {enableSavedSearches && savedFilterSets.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Kayıtlı Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedFilterSets.map((filterSet) => (
                <Badge
                  key={filterSet.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSmartFilters((prev) =>
                      prev.map((filter) => {
                        const savedFilter = filterSet.filters.find(
                          (f: SmartFilter) => f.id === filter.id
                        );
                        return savedFilter
                          ? { ...filter, value: savedFilter.value }
                          : filter;
                      })
                    );
                  }}
                >
                  <Heart className="mr-1 h-3 w-3" />
                  {filterSet.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
