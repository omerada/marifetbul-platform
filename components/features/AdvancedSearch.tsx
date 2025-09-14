'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  useAdvancedSearch,
  type AdvancedSearchResult,
} from '@/hooks/useAdvancedSearch';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Search,
  MapPin,
  Star,
  Filter,
  X,
  Loader2,
  History,
  Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isJobBudgetObject } from '@/lib/utils/typeGuards';
import type {
  AdvancedSearchRequest,
  Job,
  ServicePackage,
  Freelancer,
} from '@/types';
import {
  Slider,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui';

interface AdvancedSearchProps {
  mode?: 'jobs' | 'services' | 'freelancers';
  onResultSelect?: (result: Job | ServicePackage | Freelancer) => void;
  className?: string;
  compact?: boolean;
  showFilters?: boolean;
  initialQuery?: string;
  autoFocus?: boolean;
}

interface SearchFilters {
  categories: string[];
  skills: string[];
  location: string;
  priceRange: [number, number];
  rating: number;
  deliveryTime: string;
  experienceLevel: string;
  availability: string;
  remote: boolean;
}

const initialFilters: SearchFilters = {
  categories: [],
  skills: [],
  location: '',
  priceRange: [0, 10000],
  rating: 0,
  deliveryTime: '',
  experienceLevel: '',
  availability: '',
  remote: false,
};

const categories = [
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Business',
  'Lifestyle',
];

const skills = [
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'PHP',
  'JavaScript',
  'TypeScript',
  'HTML/CSS',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'SEO',
  'Social Media Marketing',
  'Video Editing',
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

const deliveryTimes = [
  { value: '1', label: '1 Day' },
  { value: '3', label: '3 Days' },
  { value: '7', label: '1 Week' },
  { value: '14', label: '2 Weeks' },
  { value: '30', label: '1 Month' },
];

const availabilityOptions = [
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' },
  { value: 'any', label: 'Any' },
];

export function AdvancedSearch({
  mode = 'jobs',
  onResultSelect,
  className,
  compact = false,
  showFilters = true,
  initialQuery = '',
  autoFocus = false,
}: AdvancedSearchProps) {
  const {
    searchResults,
    suggestions,
    recentSearches,
    isLoading,
    error,
    totalResults,
    hasNextPage,
    currentPage,
    setSearchQuery,
    getSuggestions,
    performSearch,
    loadMore,
    saveSearch,
    addToRecentSearches,
    clearError,
  } = useAdvancedSearch();

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(initialQuery);

  // Initialize search query
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setSearchInput(initialQuery);
    }
  }, [initialQuery, setSearchQuery]);

  // Perform search
  const handleSearch = useCallback(
    async (query?: string) => {
      try {
        await performSearch(query || searchInput || '');
        if (query || searchInput) {
          addToRecentSearches(query || searchInput);
        }
      } catch (err) {
        console.error('Search failed:', err);
      }
    },
    [searchInput, performSearch, addToRecentSearches]
  );

  // Handle search input changes with suggestions
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      setSearchQuery(value);

      if (value.length >= 2) {
        getSuggestions(value);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
    [setSearchQuery, getSuggestions]
  );

  // Helper function to get display data from any result type
  const getResultDisplayData = (
    result: Job | ServicePackage | Freelancer | AdvancedSearchResult
  ) => {
    // If it's an AdvancedSearchResult, map it directly
    if (
      'title' in result &&
      'description' in result &&
      !('firstName' in result) &&
      !('deliveryTime' in result)
    ) {
      const searchResult = result as AdvancedSearchResult;
      return {
        title: searchResult.title,
        description: searchResult.description,
        category: searchResult.category,
        rating: searchResult.rating,
        location: searchResult.location,
        price: searchResult.price,
        priceLabel: '',
      };
    } else if ('firstName' in result) {
      // Freelancer
      const freelancer = result as Freelancer;
      return {
        title: `${freelancer.firstName} ${freelancer.lastName}`,
        description: freelancer.bio || '',
        category: freelancer.skills?.[0] || '',
        rating: freelancer.rating,
        location: freelancer.location,
        price: freelancer.hourlyRate,
        priceLabel: '/hr',
      };
    } else if ('deliveryTime' in result) {
      // ServicePackage
      const service = result as ServicePackage;
      return {
        title: service.title,
        description: service.description,
        category: service.category,
        rating: service.rating,
        location: undefined,
        price: service.price,
        priceLabel: '',
      };
    } else {
      // Job
      const job = result as Job;
      return {
        title: job.title,
        description: job.description,
        category: job.category,
        rating: undefined,
        location: job.location,
        price: isJobBudgetObject(job.budget) ? job.budget.amount : job.budget,
        priceLabel:
          isJobBudgetObject(job.budget) && job.budget.type === 'hourly'
            ? '/hr'
            : '',
      };
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setSearchInput(suggestion);
      setSearchQuery(suggestion);
      setShowSuggestions(false);
      handleSearch(suggestion);
    },
    [setSearchQuery, handleSearch]
  );

  // Handle filter updates
  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Get active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.skills.length > 0) count++;
    if (filters.location) count++;
    if (filters.rating > 0) count++;
    if (filters.deliveryTime) count++;
    if (filters.experienceLevel) count++;
    if (filters.availability) count++;
    if (filters.remote) count++;
    return count;
  }, [filters]);

  // Handle load more results
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      const searchRequest: AdvancedSearchRequest = {
        query: searchInput,
        page: currentPage + 1,
        pageSize: 20,
      };
      loadMore(searchRequest);
    }
  }, [hasNextPage, isLoading, searchInput, currentPage, loadMore]);

  // Handle result click
  const handleResultClick = useCallback(
    (result: Job | ServicePackage | Freelancer | AdvancedSearchResult) => {
      // Convert AdvancedSearchResult to compatible type if needed
      if (
        'title' in result &&
        'description' in result &&
        !('firstName' in result) &&
        !('deliveryTime' in result)
      ) {
        // This is an AdvancedSearchResult, create a compatible object for onResultSelect
        const searchResult = result as AdvancedSearchResult;
        const compatibleResult = {
          id: searchResult.id,
          title: searchResult.title,
          description: searchResult.description,
          category: searchResult.category,
          rating: searchResult.rating || 0,
          location: searchResult.location,
          price: searchResult.price || 0,
          skills: searchResult.skills || [],
          // Add required properties for ServicePackage type
          deliveryTime: 7, // default
          freelancerId: searchResult.id,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as ServicePackage;
        onResultSelect?.(compatibleResult);
      } else {
        onResultSelect?.(result as Job | ServicePackage | Freelancer);
      }
    },
    [onResultSelect]
  );

  // Save current search
  const handleSaveSearch = useCallback(async () => {
    const searchRequest: AdvancedSearchRequest = {
      query: searchInput,
      category: filters.categories[0],
      skills: filters.skills,
      location: filters.location,
      budget: { min: filters.priceRange[0], max: filters.priceRange[1] },
      rating: filters.rating,
      availability: filters.availability as 'available' | 'busy' | 'any',
      remoteOk: filters.remote,
    };

    try {
      await saveSearch(`Search: ${searchInput}`, searchRequest);
    } catch (err) {
      console.error('Failed to save search:', err);
    }
  }, [searchInput, filters, saveSearch]);

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={`Search ${mode}...`}
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10 pl-10"
            autoFocus={autoFocus}
          />
          {isLoading && (
            <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full right-0 left-0 z-50 mt-1">
            <CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion.text)}
                  className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
                >
                  <div className="font-medium">{suggestion.text}</div>
                  {suggestion.count && (
                    <div className="text-muted-foreground text-xs">
                      {suggestion.count} results
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Badge variant="secondary">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}{' '}
                  active
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={`Search ${mode}...`}
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-32 pl-10"
              autoFocus={autoFocus}
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Button onClick={() => handleSearch()} disabled={isLoading}>
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {recentSearches.slice(0, 3).map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionSelect(search)}
              >
                <History className="mr-1 h-3 w-3" />
                {search}
              </Button>
            ))}
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card>
              <CardContent className="p-2">
                <div className="mb-2 text-sm font-medium">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion.text)}
                    className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
                  >
                    <div className="font-medium">{suggestion.text}</div>
                    {suggestion.count && (
                      <div className="text-muted-foreground text-xs">
                        {suggestion.count} results
                      </div>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveSearch}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      filters.categories.includes(category)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const newCategories = filters.categories.includes(
                        category
                      )
                        ? filters.categories.filter((c) => c !== category)
                        : [...filters.categories, category];
                      updateFilter('categories', newCategories);
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={
                      filters.skills.includes(skill) ? 'default' : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const newSkills = filters.skills.includes(skill)
                        ? filters.skills.filter((s) => s !== skill)
                        : [...filters.skills, skill];
                      updateFilter('skills', newSkills);
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="City, District, or Remote"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={filters.remote}
                  onChange={(e) => updateFilter('remote', e.target.checked)}
                />
                <Label htmlFor="remote">Remote work available</Label>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value: [number, number]) =>
                    updateFilter('priceRange', value)
                  }
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="text-muted-foreground mt-1 flex justify-between text-sm">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      updateFilter(
                        'rating',
                        rating === filters.rating ? 0 : rating
                      )
                    }
                    className={cn(
                      'flex items-center gap-1 rounded px-2 py-1 text-sm',
                      rating <= filters.rating
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    <Star className="h-3 w-3 fill-current" />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level (for jobs) */}
            {mode === 'jobs' && (
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={filters.experienceLevel}
                  onValueChange={(value: string) =>
                    updateFilter('experienceLevel', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Delivery Time (for services) */}
            {mode === 'services' && (
              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Select
                  value={filters.deliveryTime}
                  onValueChange={(value: string) =>
                    updateFilter('deliveryTime', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTimes.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Availability (for freelancers) */}
            {mode === 'freelancers' && (
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={filters.availability}
                  onValueChange={(value: string) =>
                    updateFilter('availability', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Results</CardTitle>
              <div className="text-muted-foreground text-sm">
                {totalResults} results found
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result, index) => {
                const displayData = getResultDisplayData(result);
                return (
                  <div
                    key={result.id || index}
                    className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {displayData.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {displayData.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          {displayData.category && (
                            <Badge variant="secondary">
                              {displayData.category}
                            </Badge>
                          )}
                          {displayData.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{displayData.rating}</span>
                            </div>
                          )}
                          {displayData.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{displayData.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {displayData.price && (
                          <div className="font-semibold">
                            ${displayData.price}
                            {displayData.priceLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Results'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchInput && !isLoading && searchResults.length === 0 && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
