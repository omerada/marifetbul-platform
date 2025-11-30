'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useUnifiedSearch } from '@/hooks';
import type { SearchSuggestion } from '@/types/shared/search';
import logger from '@/lib/infrastructure/monitoring/logger';

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
  autoFocus?: boolean;
  showHistory?: boolean;
  showTrending?: boolean;
}

export function SearchAutocomplete({
  placeholder = 'Ara...',
  onSearch,
  onSuggestionSelect,
  className,
  autoFocus = false,
  showHistory = true,
  showTrending = true,
}: SearchAutocompleteProps) {
  const [localQuery, setLocalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    isLoadingSuggestions,
    setQuery,
    fetchSuggestions,
    clearQuery,
  } = useUnifiedSearch({
    autoSuggestions: true,
    suggestionsDelay: 200,
  });

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalQuery(value);

      if (value.length >= 2) {
        fetchSuggestions(value);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
    [fetchSuggestions]
  );

  // Handle search submission
  const handleSearch = useCallback(() => {
    if (localQuery.trim()) {
      setQuery(localQuery);
      onSearch?.(localQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [localQuery, setQuery, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: SearchSuggestion) => {
      setLocalQuery(suggestion.text);
      setQuery(suggestion.text);
      onSuggestionSelect?.(suggestion);
      onSearch?.(suggestion.text);
      setShowSuggestions(false);
      inputRef.current?.blur();
    },
    [setQuery, onSuggestionSelect, onSearch]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalQuery('');
    clearQuery();
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [clearQuery]);

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    },
    [handleSearch]
  );

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Production: Fetch search history and trending data from backend on mount
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>(
    []
  );

  useEffect(() => {
    // Fetch search history and trending on mount
    const fetchSearchData = async () => {
      try {
        const [historyRes, trendingRes] = await Promise.all([
          fetch('/api/v1/search/history', { credentials: 'include' }),
          fetch('/api/v1/search/trending', { credentials: 'include' }),
        ]);

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setSearchHistory(historyData.history || []);
        }

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          setTrendingSearches(trendingData.trending || []);
        }
      } catch (error) {
        logger.error(
          'Failed to fetch search data',
          error
        );
      }
    };

    fetchSearchData();
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (localQuery.length >= 2 || showHistory || showTrending) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="pr-12 pl-10"
          autoFocus={autoFocus}
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-80 overflow-y-auto border shadow-lg">
          <div className="p-2">
            {/* Loading state */}
            {isLoadingSuggestions && (
              <div className="py-4 text-center text-sm text-gray-500">
                Aranıyor...
              </div>
            )}

            {/* Search suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Öneriler
                </div>
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{suggestion.text}</span>
                    {suggestion.count && (
                      <Badge variant="secondary" size="sm">
                        {suggestion.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Search history */}
            {showHistory && !localQuery && searchHistory.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Son Aramalar
                </div>
                {searchHistory.map((item, index) => (
                  <button
                    key={`history-${index}`}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{item.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Trending */}
            {showTrending && !localQuery && trendingSearches.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Trend Aramalar
                </div>
                {trendingSearches.map((item, index) => (
                  <button
                    key={`trending-${index}`}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{item.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {!isLoadingSuggestions &&
              suggestions.length === 0 &&
              localQuery.length >= 2 && (
                <div className="py-4 text-center text-sm text-gray-500">
                  Öneri bulunamadı
                </div>
              )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default SearchAutocomplete;
