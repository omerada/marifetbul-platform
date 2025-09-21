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
import { Card } from '@/components/ui/Card';

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
  placeholder = 'Ne arıyorsun?',
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

  // Mock data - replace with real API calls
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      type: 'service',
      title: 'Logo Tasarım',
      subtitle: '₺200 - ₺2.000',
      category: 'Tasarım',
    },
    {
      id: '2',
      type: 'service',
      title: 'Web Sitesi Geliştirme',
      subtitle: '₺1.500 - ₺15.000',
      category: 'Geliştirme',
    },
    {
      id: '3',
      type: 'job',
      title: 'E-ticaret Sitesi Projesi',
      subtitle: '₺5.000 - ₺10.000',
      category: 'Geliştirme',
    },
    {
      id: '4',
      type: 'job',
      title: 'Kurumsal Logo Tasarımı',
      subtitle: '₺1.000 - ₺3.000',
      category: 'Tasarım',
    },
    {
      id: '5',
      type: 'freelancer',
      title: 'Ahmet Yılmaz',
      subtitle: 'React Developer • 4.8★',
      category: 'Geliştirme',
    },
    {
      id: '6',
      type: 'skill',
      title: 'React.js',
      subtitle: '1,247 freelancer',
      category: 'Yazılım',
    },
    {
      id: '7',
      type: 'location',
      title: 'İstanbul',
      subtitle: '3,456 iş',
      category: 'Konum',
    },
  ];

  const trendingSearches = [
    'Web tasarım',
    'Logo yapımı',
    'SEO',
    'Mobil uygulama',
    'İçerik yazımı',
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

    // Simulate API call
    setTimeout(() => {
      const filteredSuggestions = mockSuggestions.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSuggestions(filteredSuggestions);

      // Group results by type
      const results: SearchResultGroup = {
        services: filteredSuggestions.filter((item) => item.type === 'service'),
        jobs: filteredSuggestions.filter((item) => item.type === 'job'),
        freelancers: filteredSuggestions.filter(
          (item) => item.type === 'freelancer'
        ),
      };

      setSearchResults(results);
      setIsLoading(false);
    }, 300);
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
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
          className="pr-4 pl-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setSearchResults(null);
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <Card className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-hidden border bg-white shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Aranıyor...</p>
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
                    Öneriler
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
                              Tüm hizmetleri gör (
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
                          İş İlanları ({searchResults.jobs.length})
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
                              Tüm iş ilanlarını gör ({searchResults.jobs.length}
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
                  <strong>&quot;{query}&quot;</strong> için sonuç bulunamadı
                </p>
                <p className="text-xs text-gray-400">
                  Farklı kelimeler deneyin veya yazım hatası kontrol edin
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
