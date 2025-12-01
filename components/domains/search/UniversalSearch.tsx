'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Briefcase,
  Package,
  Users,
  Clock,
  MapPin,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import { trackSearch } from '@/lib/api/search-analytics';

interface SearchSuggestion {
  id: string;
  type: 'service' | 'job' | 'freelancer' | 'skill' | 'location';
  title: string;
  subtitle?: string;
  category?: string;
}

interface SearchResultGroup {
  services: SearchSuggestion[];
  jobs: SearchSuggestion[];
  freelancers: SearchSuggestion[];
}

interface UniversalSearchProps {
  onSearch?: (query: string, type?: string) => void;
  placeholder?: string;
  className?: string;
}

export function UniversalSearch({
  onSearch,
  placeholder = 'Ne ar�yorsun?',
  className,
}: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResultGroup | null>(
    null
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trendingSearches = [
    'Web tasar�m',
    'Logo yap�m�',
    'SEO',
    'Mobil uygulama',
    '��erik yaz�m�',
    'Sosyal medya',
  ];

  // Search functionality
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setSearchResults(null);
      return;
    }

    setIsLoading(true);

    try {
      // Production: Real backend API call for universal search suggestions
      const response = await fetch(
        `/api/v1/search/suggestions?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const filteredSuggestions = data.suggestions || [];

      setSuggestions(filteredSuggestions);

      // Group results by type
      const results: SearchResultGroup = {
        services: filteredSuggestions.filter(
          (item: SearchSuggestion) => item.type === 'service'
        ),
        jobs: filteredSuggestions.filter(
          (item: SearchSuggestion) => item.type === 'job'
        ),
        freelancers: filteredSuggestions.filter(
          (item: SearchSuggestion) => item.type === 'freelancer'
        ),
      };

      setSearchResults(results);

      // Track search analytics
      trackSearch({
        query: searchQuery,
        resultCount:
          results.services.length +
          results.jobs.length +
          results.freelancers.length,
      }).catch((err) => {
        // Silent fail - analytics shouldn't break user experience
        logger.debug('Failed to track search', err);
      });
    } catch (error) {
      logger.error(
        'Search error', error instanceof Error ? error : new Error(String(error)));
      // Fallback to empty results
      setSuggestions([]);
      setSearchResults({ services: [], jobs: [], freelancers: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    performSearch(value);
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query, type?: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    setRecentSearches((prev) => {
      const updated = [
        searchQuery,
        ...prev.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });

    // Close dropdown
    setIsOpen(false);

    // Trigger search callback
    onSearch?.(searchQuery, type);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    handleSearch(suggestion.title, suggestion.type);
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'job':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'freelancer':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'skill':
        return <Search className="h-4 w-4 text-orange-500" />;
      case 'location':
        return <MapPin className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          leftIcon={<Search className="h-5 w-5" />}
          rightIcon={
            query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setSearchResults(null);
                  inputRef.current?.focus();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )
          }
          className="w-full"
        />
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <Card className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-hidden border bg-white shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Aran�yor...</p>
              </div>
            )}

            {/* No Query State */}
            {!query && !isLoading && (
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Son Aramalar
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900">
                    Trend Aramalar
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {query && !isLoading && suggestions.length > 0 && (
              <div className="p-4">
                {/* Quick Suggestions */}
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-900">
                    �neriler
                  </h4>
                  <div className="space-y-1">
                    {suggestions.slice(0, 5).map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-100"
                      >
                        {getIcon(suggestion.type)}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {suggestion.title}
                          </div>
                          {suggestion.subtitle && (
                            <div className="truncate text-xs text-gray-500">
                              {suggestion.subtitle}
                            </div>
                          )}
                        </div>
                        {suggestion.category && (
                          <span className="text-xs text-gray-400">
                            {suggestion.category}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grouped Results */}
                {searchResults && (
                  <div className="space-y-4">
                    {searchResults.services.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Package className="h-4 w-4 text-green-500" />
                          Hizmetler ({searchResults.services.length})
                        </h4>
                        <div className="space-y-1">
                          {searchResults.services.slice(0, 3).map((service) => (
                            <button
                              key={service.id}
                              onClick={() => handleSuggestionClick(service)}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium text-gray-900">
                                  {service.title}
                                </div>
                                <div className="truncate text-xs text-gray-500">
                                  {service.subtitle}
                                </div>
                              </div>
                            </button>
                          ))}
                          {searchResults.services.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => handleSearch(query, 'services')}
                            >
                              T�m hizmetleri g�r (
                              {searchResults.services.length})
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {searchResults.jobs.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          �� �lanlar� ({searchResults.jobs.length})
                        </h4>
                        <div className="space-y-1">
                          {searchResults.jobs.slice(0, 3).map((job) => (
                            <button
                              key={job.id}
                              onClick={() => handleSuggestionClick(job)}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium text-gray-900">
                                  {job.title}
                                </div>
                                <div className="truncate text-xs text-gray-500">
                                  {job.subtitle}
                                </div>
                              </div>
                            </button>
                          ))}
                          {searchResults.jobs.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => handleSearch(query, 'jobs')}
                            >
                              T�m i� ilanlar�n� g�r ({searchResults.jobs.length}
                              )
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {searchResults.freelancers.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Users className="h-4 w-4 text-purple-500" />
                          Freelancerlar ({searchResults.freelancers.length})
                        </h4>
                        <div className="space-y-1">
                          {searchResults.freelancers
                            .slice(0, 3)
                            .map((freelancer) => (
                              <button
                                key={freelancer.id}
                                onClick={() =>
                                  handleSuggestionClick(freelancer)
                                }
                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium text-gray-900">
                                    {freelancer.title}
                                  </div>
                                  <div className="truncate text-xs text-gray-500">
                                    {freelancer.subtitle}
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {query && !isLoading && suggestions.length === 0 && (
              <div className="p-4 text-center">
                <Search className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  <strong>&quot;{query}&quot;</strong> i�in sonu� bulunamad�
                </p>
                <p className="text-xs text-gray-400">
                  Farkl� kelimeler deneyin veya yaz�m hatas� kontrol edin
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
