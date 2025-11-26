/**
 * ================================================
 * ENHANCED SEARCH AUTOCOMPLETE COMPONENT
 * ================================================
 * Sprint 2: Search & Discovery - Story 2
 *
 * Advanced autocomplete with:
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Category-based suggestions
 * - Recent searches with delete
 * - Trending searches
 * - Search highlighting
 * - Debounced API calls
 * - Loading states
 * - Empty states
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface SearchSuggestion {
  text: string;
  type: 'keyword' | 'category' | 'package';
  count?: number;
  categoryId?: string;
  categoryName?: string;
  packageId?: string;
  rating?: number;
}

export interface EnhancedSearchAutocompleteProps {
  /** Placeholder text */
  placeholder?: string;

  /** Callback when search is submitted */
  onSearch?: (query: string, categoryId?: string) => void;

  /** Callback when a suggestion is selected */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;

  /** Custom class name */
  className?: string;

  /** Auto focus on mount */
  autoFocus?: boolean;

  /** Show search history */
  showHistory?: boolean;

  /** Show trending searches */
  showTrending?: boolean;

  /** Show category suggestions */
  showCategories?: boolean;

  /** Maximum suggestions to show */
  maxSuggestions?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * EnhancedSearchAutocomplete Component
 *
 * Advanced search autocomplete with keyboard navigation and rich suggestions.
 *
 * @example
 * ```tsx
 * <EnhancedSearchAutocomplete
 *   placeholder="Hizmet ara..."
 *   onSearch={(query) => console.log('Search:', query)}
 *   showCategories
 *   maxSuggestions={8}
 * />
 * ```
 */
export function EnhancedSearchAutocomplete({
  placeholder = 'Ara...',
  onSearch,
  onSuggestionSelect: _onSuggestionSelect,
  className,
  autoFocus = false,
  showHistory = true,
  showTrending = true,
  showCategories: _showCategories = true,
  maxSuggestions = 10,
}: EnhancedSearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State for suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);

  /**
   * Fetch autocomplete suggestions from backend
   */
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1/search/suggest?prefix=${encodeURIComponent(searchQuery)}&limit=${maxSuggestions}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data || []);

          logger.debug('Suggestions fetched', {
            query: searchQuery,
            count: data.data?.length || 0,
          });
        } else {
          logger.warn('Suggestions fetch failed', { status: response.status });
          setSuggestions([]);
        }
      } catch (error) {
        logger.error(
          'Suggestions fetch error',
          error instanceof Error ? error : new Error(String(error))
        );
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [maxSuggestions]
  );

  /**
   * Fetch search history and trending
   */
  const fetchInitialData = useCallback(async () => {
    try {
      // Load from localStorage for history
      const savedHistory = localStorage.getItem('marifet_search_history');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory).slice(0, 5));
      }

      // Fetch trending from backend
      const trendingRes = await fetch(
        '/api/v1/search/packages/featured?size=5',
        {
          credentials: 'include',
        }
      );

      if (trendingRes.ok) {
        const data = await trendingRes.json();
        const trendingTerms =
          data.data?.content?.map((pkg: { title: string }) => pkg.title) || [];
        setTrending(trendingTerms.slice(0, 5));
      }
    } catch (error) {
      logger.debug('Initial data fetch failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  /**
   * Save search to history
   */
  const saveToHistory = useCallback(
    (searchQuery: string) => {
      const history = [
        searchQuery,
        ...searchHistory.filter((h) => h !== searchQuery),
      ].slice(0, 10);

      setSearchHistory(history);
      localStorage.setItem('marifet_search_history', JSON.stringify(history));
    },
    [searchHistory]
  );

  /**
   * Remove item from history
   */
  const removeFromHistory = useCallback(
    (item: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newHistory = searchHistory.filter((h) => h !== item);
      setSearchHistory(newHistory);
      localStorage.setItem(
        'marifet_search_history',
        JSON.stringify(newHistory)
      );
    },
    [searchHistory]
  );

  /**
   * Handle input change with debounce
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setSelectedIndex(-1);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce API call
      if (value.length >= 2) {
        const timer = setTimeout(() => {
          fetchSuggestions(value);
        }, 300);
        debounceTimerRef.current = timer;
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(value.length === 0 && (showHistory || showTrending));
      }
    },
    [fetchSuggestions, showHistory, showTrending]
  );

  /**
   * Handle search submission
   */
  const handleSearch = useCallback(
    (searchQuery?: string) => {
      const finalQuery = searchQuery || query;
      if (finalQuery.trim()) {
        saveToHistory(finalQuery.trim());
        onSearch?.(finalQuery.trim());
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    },
    [query, onSearch, saveToHistory]
  );

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      handleSearch(suggestion);
    },
    [handleSearch]
  );

  /**
   * Handle clear
   */
  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setShowDropdown(false);
    inputRef.current?.focus();
  }, []);

  /**
   * Get all available suggestions
   */
  const getAllSuggestions = useCallback(() => {
    const items: string[] = [];

    if (query.length >= 2) {
      items.push(...suggestions);
    } else {
      if (showHistory && searchHistory.length > 0) {
        items.push(...searchHistory);
      }
      if (showTrending && trending.length > 0) {
        items.push(...trending);
      }
    }

    return items;
  }, [query, suggestions, searchHistory, trending, showHistory, showTrending]);

  /**
   * Keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const allSuggestions = getAllSuggestions();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allSuggestions.length - 1 ? prev + 1 : prev
          );
          setShowDropdown(true);
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
            handleSuggestionClick(allSuggestions[selectedIndex]);
          } else {
            handleSearch();
          }
          break;

        case 'Escape':
          e.preventDefault();
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;

        case 'Tab':
          if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
            e.preventDefault();
            setQuery(allSuggestions[selectedIndex]);
            setSelectedIndex(-1);
          }
          break;
      }
    },
    [getAllSuggestions, selectedIndex, handleSearch, handleSuggestionClick]
  );

  /**
   * Click outside to close
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Fetch initial data on mount
   */
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  /**
   * Cleanup debounce timer
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Highlight matching text
   */
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <strong className="font-semibold text-blue-600">
          {text.slice(index, index + query.length)}
        </strong>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query || showHistory || showTrending) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="h-12 pr-12 pl-11 text-base"
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 p-0 text-gray-400 hover:text-gray-600"
            aria-label="Temizle"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[480px] overflow-hidden border shadow-xl">
          <div className="max-h-[480px] overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aranıyor...
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && query.length >= 2 && suggestions.length > 0 && (
              <div className="border-b border-gray-100 p-2">
                <div className="px-2 py-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Öneriler
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="flex-1 text-sm">
                      {highlightMatch(suggestion, query)}
                    </span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {!isLoading &&
              !query &&
              showHistory &&
              searchHistory.length > 0 && (
                <div className="border-b border-gray-100 p-2">
                  <div className="px-2 py-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Son Aramalar
                  </div>
                  {searchHistory.map((item, index) => {
                    const currentIndex = suggestions.length + index;
                    return (
                      <button
                        key={`history-${index}`}
                        onClick={() => handleSuggestionClick(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          selectedIndex === currentIndex
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="flex-1 text-sm">{item}</span>
                        <button
                          onClick={(e) => removeFromHistory(item, e)}
                          className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Sil"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Trending Searches */}
            {!isLoading && !query && showTrending && trending.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Trend Aramalar
                </div>
                {trending.map((item, index) => {
                  const currentIndex =
                    suggestions.length + searchHistory.length + index;
                  return (
                    <button
                      key={`trending-${index}`}
                      onClick={() => handleSuggestionClick(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        selectedIndex === currentIndex
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <TrendingUp className="h-4 w-4 flex-shrink-0 text-orange-500" />
                      <span className="flex-1 text-sm">{item}</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
              <div className="py-8 text-center">
                <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">Öneri bulunamadı</p>
                <p className="mt-1 text-xs text-gray-400">
                  Farklı anahtar kelimeler deneyin
                </p>
              </div>
            )}

            {/* Empty State - No query */}
            {!isLoading &&
              !query &&
              searchHistory.length === 0 &&
              trending.length === 0 && (
                <div className="py-8 text-center">
                  <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">Aramaya başlayın</p>
                </div>
              )}
          </div>

          {/* Keyboard Shortcuts Hint */}
          {showDropdown && getAllSuggestions().length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm">
                      ↑↓
                    </kbd>{' '}
                    Gezin
                  </span>
                  <span>
                    <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm">
                      Enter
                    </kbd>{' '}
                    Seç
                  </span>
                  <span>
                    <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm">
                      Esc
                    </kbd>{' '}
                    Kapat
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default EnhancedSearchAutocomplete;
