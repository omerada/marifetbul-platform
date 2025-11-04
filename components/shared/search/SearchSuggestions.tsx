'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Clock,
  TrendingUp,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchSuggestions Component - Sprint 4 Day 3
 *
 * Provides typeahead/autocomplete functionality for search:
 * - Real-time suggestions as user types
 * - Recent searches from localStorage
 * - Popular searches from API
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click outside to close
 *
 * Features:
 * - Debounced API calls (300ms)
 * - Max 10 recent searches
 * - Highlighted matching text
 * - Clear recent history
 */

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'suggestion' | 'recent' | 'popular';
  count?: number;
  category?: string;
}

export interface SearchSuggestionsProps {
  /** Current search query */
  query: string;
  /** Callback when suggestion is selected */
  onSelect: (suggestion: string) => void;
  /** Show suggestions dropdown */
  isOpen: boolean;
  /** Close suggestions dropdown */
  onClose: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Maximum number of suggestions to show */
  maxSuggestions?: number;
}

const RECENT_SEARCHES_KEY = 'marifetbul_recent_searches';
const MAX_RECENT_SEARCHES = 10;
const DEBOUNCE_DELAY = 300;

/**
 * Get recent searches from localStorage
 */
function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load recent searches:', error);
    return [];
  }
}

/**
 * Save search to recent searches
 */
function saveRecentSearch(query: string): void {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((q) => q !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
}

/**
 * Clear all recent searches
 */
function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
}

/**
 * Fetch suggestions from API
 * Connected to backend: GET /api/v1/analytics/search/suggestions
 */
async function fetchSuggestions(query: string): Promise<SearchSuggestion[]> {
  // Don't fetch for very short queries
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Call backend suggestions API
    const response = await fetch(
      `/api/v1/analytics/search/suggestions?prefix=${encodeURIComponent(query)}&limit=8`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Backend returns { success: true, data: string[], message: string }
    const suggestions: string[] = data.data || [];

    // Convert to SearchSuggestion format
    return suggestions.map((text, index) => ({
      id: `suggestion-${index}`,
      text,
      type: 'suggestion' as const,
      count: undefined, // Backend doesn't return counts yet
    }));
  } catch (error) {
    console.error('[fetchSuggestions] API error:', error);

    // Return empty array on error - graceful degradation
    // Users will still see recent searches and popular searches
    return [];
  }
}

/**
 * Get popular searches
 *
 * TODO: Backend Implementation Needed
 * Endpoint: GET /api/v1/analytics/search/popular?limit=10
 *
 * For now, returns hardcoded popular searches.
 * Should be replaced with real trending data from analytics.
 */
function getPopularSearches(): SearchSuggestion[] {
  // TODO: Fetch from API when backend implements popular searches endpoint
  // const response = await fetch('/api/v1/analytics/search/popular?limit=10');
  // const data = await response.json();
  // return data.data.map((item, idx) => ({
  //   id: `pop${idx}`,
  //   text: item.searchTerm,
  //   type: 'popular',
  //   count: item.searchCount
  // }));

  return [
    {
      id: 'pop1',
      text: 'logo tasarım',
      type: 'popular',
      count: 1240,
    },
    {
      id: 'pop2',
      text: 'web sitesi',
      type: 'popular',
      count: 980,
    },
    {
      id: 'pop3',
      text: 'mobil uygulama',
      type: 'popular',
      count: 756,
    },
    {
      id: 'pop4',
      text: 'içerik yazarlığı',
      type: 'popular',
      count: 623,
    },
  ];
}

export function SearchSuggestions({
  query,
  onSelect,
  isOpen,
  onClose,
  isLoading = false,
  className,
  maxSuggestions = 8,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch suggestions when query changes (debounced)
  useEffect(() => {
    if (!isOpen) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(query);
        setSuggestions(results.slice(0, maxSuggestions));
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, isOpen, maxSuggestions]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      const allItems = [
        ...suggestions,
        ...recentSearches.map((text, idx) => ({
          id: `recent-${idx}`,
          text,
          type: 'recent' as const,
        })),
      ];

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < allItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && allItems[selectedIndex]) {
            const text = allItems[selectedIndex].text;
            saveRecentSearch(text);
            setRecentSearches(getRecentSearches());
            onSelect(text);
            onClose();
            setSelectedIndex(-1);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, suggestions, recentSearches, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Handle suggestion selection
  const handleSelect = useCallback(
    (text: string) => {
      saveRecentSearch(text);
      setRecentSearches(getRecentSearches());
      onSelect(text);
      onClose();
      setSelectedIndex(-1);
    },
    [onSelect, onClose]
  );

  // Handle clear recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Prepare items to show
  const showSuggestions = suggestions.length > 0;
  const showRecent = !query && recentSearches.length > 0;
  const showPopular = !query && !showRecent;
  const popularSearches = showPopular ? getPopularSearches().slice(0, 5) : [];

  const hasContent = showSuggestions || showRecent || showPopular;

  if (!hasContent && !isLoading) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn('relative z-50', className)}>
      <Card className="absolute top-2 right-0 left-0 max-h-96 overflow-y-auto shadow-lg ring-1 ring-gray-200/60">
        {isLoading ? (
          // Loading state
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2">
            {/* Suggestions from API */}
            {showSuggestions && (
              <div className="mb-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500">
                  Öneriler
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelect(suggestion.text)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.text}</div>
                      {suggestion.category && (
                        <div className="text-xs text-gray-500">
                          {suggestion.category}
                        </div>
                      )}
                    </div>
                    {suggestion.count && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-gray-300 bg-gray-50 text-xs text-gray-600"
                      >
                        {suggestion.count}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches */}
            {showRecent && (
              <div>
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-medium text-gray-500">
                    Son Aramalar
                  </span>
                  <button
                    onClick={handleClearRecent}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Temizle
                  </button>
                </div>
                {recentSearches.map((text, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleSelect(text)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedIndex === suggestions.length + index
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex-1 font-medium">{text}</span>
                    <X className="h-4 w-4 shrink-0 text-gray-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {/* Popular searches */}
            {showPopular && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500">
                  Popüler Aramalar
                </div>
                {popularSearches.map((popular, index) => (
                  <button
                    key={popular.id}
                    onClick={() => handleSelect(popular.text)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <TrendingUp className="h-4 w-4 shrink-0 text-orange-500" />
                    <span className="flex-1 font-medium">{popular.text}</span>
                    {popular.count && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-orange-300 bg-orange-50 text-xs text-orange-600"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        {popular.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
