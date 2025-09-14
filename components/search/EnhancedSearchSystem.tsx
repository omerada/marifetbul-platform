'use client';'use client';'use client';



import React, { useState } from 'react';

import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';

import { Button } from '@/components/ui/Button';import React, { useState } from 'react';import React, { useState, useCallback, useEffect, useMemo } from 'react';

import { Input } from '@/components/ui/Input';

import { Badge } from '@/components/ui/Badge';import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { Search, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/Button';import { Button } from '@/components/ui/Button';

interface EnhancedSearchSystemProps {

  className?: string;import { Input } from '@/components/ui/Input';import { Input } from '@/components/ui/Input';

}

import { Badge } from '@/components/ui/Badge';import { Badge } from '@/components/ui/Badge';

const EnhancedSearchSystem: React.FC<EnhancedSearchSystemProps> = ({

  className = ''import { Search, Filter, MapPin } from 'lucide-react';import { Label } from '@/components/ui/Label';

}) => {

  const [query, setQuery] = useState('');import { Slider } from '@/components/ui/Slider';

  const [location, setLocation] = useState('');

  interface EnhancedSearchSystemProps {import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';

  const { results, isLoading, search } = useUnifiedSearch();

  className?: string;import {

  const handleSearch = async () => {

    await search(query, { location, type: 'all' });}  Search,

  };

  Filter,

  return (

    <div className={`space-y-6 ${className}`}>const EnhancedSearchSystem: React.FC<EnhancedSearchSystemProps> = ({  X,

      <div className="bg-white rounded-lg shadow-sm border p-6">

        <div className="flex flex-col md:flex-row gap-4">  className = ''  MapPin,

          <div className="flex-1">

            <div className="relative">}) => {  TrendingUp,

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Input  const [query, setQuery] = useState('');  Zap,

                value={query}

                onChange={(e) => setQuery(e.target.value)}  const [location, setLocation] = useState('');  BookmarkPlus,

                placeholder="Ne arıyorsunuz?"

                className="pl-10"  const [type, setType] = useState<'all' | 'jobs' | 'services' | 'users'>('all');  BarChart3,

              />

            </div>    Heart,

          </div>

            const { results, isLoading, search } = useUnifiedSearch();} from 'lucide-react';

          <div className="w-full md:w-64">

            <div className="relative">import { cn } from '@/lib/utils';

              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Input  const handleSearch = async () => {import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';

                value={location}

                onChange={(e) => setLocation(e.target.value)}    await search(query, { location, type });import { SearchResult, SearchFilters } from '@/types/search';

                placeholder="Konum"

                className="pl-10"  };

              />

            </div>// Enhanced types for Sprint 3

          </div>

            const searchTypes = [interface SearchFacet {

          <Button onClick={handleSearch} disabled={isLoading}>

            {isLoading ? 'Aranıyor...' : 'Ara'}    { value: 'all', label: 'Tümü' },  id: string;

          </Button>

        </div>    { value: 'jobs', label: 'İşler' },  name: string;

      </div>

    { value: 'services', label: 'Hizmetler' },  count: number;

      {results.length > 0 && (

        <div className="space-y-4">    { value: 'users', label: 'Kullanıcılar' }  selected: boolean;

          <h3 className="text-lg font-semibold">

            {results.length} sonuç bulundu  ];  type: 'category' | 'location' | 'skill' | 'price' | 'rating' | 'time';

          </h3>

          }

          <div className="grid gap-4">

            {results.map((result, index: number) => (  return (

              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">

                <h4 className="font-medium text-lg">{result.title}</h4>    <div className={`space-y-6 ${className}`}>interface SmartFilter {

                <p className="text-gray-600 mt-1">{result.description}</p>

                      {/* Search Header */}  id: string;

                <div className="flex items-center gap-2 mt-3">

                  <Badge variant="secondary">{result.type}</Badge>      <div className="bg-white rounded-lg shadow-sm border p-6">  name: string;

                  {result.location && (

                    <Badge variant="outline">        <div className="flex flex-col md:flex-row gap-4">  type: 'range' | 'select' | 'multiselect' | 'toggle' | 'location';

                      <MapPin className="h-3 w-3 mr-1" />

                      {result.location}          <div className="flex-1">  options?: { value: string; label: string; count?: number }[];

                    </Badge>

                  )}            <div className="relative">  value: unknown; // More specific than any

                </div>

              </div>              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />  min?: number;

            ))}

          </div>              <Input  max?: number;

        </div>

      )}                value={query}  step?: number;

      

      {query && !isLoading && results.length === 0 && (                onChange={(e) => setQuery(e.target.value)}  placeholder?: string;

        <div className="text-center py-8">

          <p className="text-gray-500">Arama kriterlerinize uygun sonuç bulunamadı.</p>                placeholder="Ne arıyorsunuz?"}

        </div>

      )}                className="pl-10"

    </div>

  );              />interface SearchMetrics {

};

            </div>  totalResults: number;

export default EnhancedSearchSystem;
          </div>  searchTime: number;

            popularFilters: string[];

          <div className="w-full md:w-64">  relatedSearches: string[];

            <div className="relative">}

              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Inputinterface SavedFilterSet {

                value={location}  id: string;

                onChange={(e) => setLocation(e.target.value)}  name: string;

                placeholder="Konum"  filters: SmartFilter[];

                className="pl-10"  createdAt: string;

              />}

            </div>

          </div>interface EnhancedSearchProps {

            mode?: 'jobs' | 'services' | 'freelancers' | 'all';

          <Button onClick={handleSearch} disabled={isLoading}>  onResults?: (results: SearchResult[]) => void;

            {isLoading ? 'Aranıyor...' : 'Ara'}  onMetrics?: (metrics: SearchMetrics) => void;

          </Button>  className?: string;

        </div>  enableAnalytics?: boolean;

          enableSavedSearches?: boolean;

        {/* Search Type Filters */}  enableRealtime?: boolean;

        <div className="flex gap-2 mt-4">  placeholder?: string;

          {searchTypes.map((searchType) => (}

            <Button

              key={searchType.value}export function EnhancedSearchSystem({

              variant={type === searchType.value ? 'default' : 'outline'}  mode = 'all',

              size="sm"  onResults,

              onClick={() => setType(searchType.value as any)}  onMetrics,

            >  className,

              {searchType.label}  enableAnalytics = true,

            </Button>  enableSavedSearches = true,

          ))}  enableRealtime = true,

        </div>  placeholder = 'Gelişmiş arama: iş, hizmet, freelancer...',

      </div>}: EnhancedSearchProps) {

  // Enhanced search state

      {/* Results */}  const {

      {results.length > 0 && (    query,

        <div className="space-y-4">    results,

          <div className="flex items-center justify-between">    suggestions,

            <h3 className="text-lg font-semibold">    isLoading,

              {results.length} sonuç bulundu    filters,

            </h3>    setQuery,

            <div className="flex items-center gap-2">    search,

              <Filter className="h-4 w-4" />    applyFilter,

              <span className="text-sm text-gray-600">Filtreler</span>    removeFilter,

            </div>    clearSearch,

          </div>    saveCurrentSearch,

              getSearchAnalytics,

          <div className="grid gap-4">  } = useUnifiedSearch();

            {results.map((result, index: number) => (

              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">  const [searchInput, setSearchInput] = useState('');

                <div className="flex items-start justify-between">  const [showFilters, setShowFilters] = useState(false);

                  <div className="flex-1">  const [showSuggestions, setShowSuggestions] = useState(false);

                    <h4 className="font-medium text-lg">{result.title}</h4>  const [searchMode, setSearchMode] = useState<

                    <p className="text-gray-600 mt-1">{result.description}</p>    'simple' | 'advanced' | 'expert'

                      >('simple');

                    <div className="flex items-center gap-2 mt-3">  const [facets, setFacets] = useState<SearchFacet[]>([]);

                      <Badge variant="secondary">{result.type}</Badge>  const [smartFilters, setSmartFilters] = useState<SmartFilter[]>([]);

                      {result.location && (  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics | null>(

                        <Badge variant="outline">    null

                          <MapPin className="h-3 w-3 mr-1" />  );

                          {result.location}  const [savedFilterSets, setSavedFilterSets] = useState<SavedFilterSet[]>([]);

                        </Badge>  const [realtimeEnabled, setRealtimeEnabled] = useState(enableRealtime);

                      )}

                    </div>  // Initialize smart filters based on mode

                  </div>  useEffect(() => {

                </div>    const initializeFilters = () => {

              </div>      const baseFilters: SmartFilter[] = [

            ))}        {

          </div>          id: 'categories',

        </div>          name: 'Kategoriler',

      )}          type: 'multiselect',

                value: [],

      {/* Empty State */}          options: [

      {query && !isLoading && results.length === 0 && (            { value: 'web-dev', label: 'Web Geliştirme', count: 245 },

        <div className="text-center py-8">            { value: 'mobile-dev', label: 'Mobil Geliştirme', count: 189 },

          <p className="text-gray-500">Arama kriterlerinize uygun sonuç bulunamadı.</p>            { value: 'design', label: 'Tasarım', count: 156 },

        </div>            { value: 'marketing', label: 'Pazarlama', count: 134 },

      )}            { value: 'writing', label: 'Yazarlık', count: 98 },

    </div>            { value: 'translation', label: 'Çeviri', count: 87 },

  );          ],

};        },

        {

export default EnhancedSearchSystem;          id: 'location',
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
