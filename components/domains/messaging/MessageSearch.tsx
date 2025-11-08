/**
 * MessageSearch Component
 *
 * Provides search functionality for messages within a conversation:
 * - Real-time search with debouncing
 * - Advanced filters (date range, attachments, type)
 * - Highlight search results
 * - Navigate between results
 * - Clear search
 *
 * @sprint Sprint 1.4 - Message Search & Filter
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useDebounce } from '@/lib/shared/base';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  searchMessages as apiSearchMessages,
  searchMessagesAdvanced,
  type MessageSearchParams,
} from '@/lib/api/messaging';
import type { Message } from '@/types/business/features/messaging';
import {
  MessageSearchFilters,
  type MessageSearchFilters as FilterType,
} from './MessageSearchFilters';

interface MessageSearchProps {
  /** Conversation ID to search within */
  conversationId: string;
  /** Callback when search results change */
  onSearchResults?: (results: Message[]) => void;
  /** Callback when active result changes (for scrolling) */
  onResultNavigate?: (messageId: string) => void;
  /** Whether search is expanded */
  isExpanded?: boolean;
  /** Toggle expansion */
  onToggle?: () => void;
  /** Show advanced filters */
  showFilters?: boolean;
}

/**
 * MessageSearch Component
 */
export function MessageSearch({
  conversationId,
  onSearchResults,
  onResultNavigate,
  isExpanded = false,
  onToggle,
  showFilters = true,
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<FilterType>({});
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: FilterType = {}) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        onSearchResults?.([]);
        return;
      }

      setIsSearching(true);

      try {
        // Use advanced search if filters are applied
        const hasFilters = Object.keys(searchFilters).length > 0;

        let response;
        if (hasFilters) {
          const params: MessageSearchParams = {
            query: searchQuery,
            conversationId,
            ...searchFilters,
            page: 0,
            size: 100,
          };
          response = await searchMessagesAdvanced(params);
        } else {
          response = await apiSearchMessages(
            searchQuery,
            conversationId,
            0,
            100
          );
        }

        const searchResults = (response.content || []) as unknown as Message[];

        setResults(searchResults);
        setCurrentIndex(0);
        onSearchResults?.(searchResults);

        logger.info('Search completed', {
          querysearchQuery,
          resultCountsearchResultslength,
          hasFilters,
        });
      } catch (error) {
        logger.error('Search failed', error as Error);
        setResults([]);
        onSearchResults?.([]);
      } finally {
        setIsSearching(false);
      }
    },
    [conversationId, onSearchResults]
  );

  // Trigger search on debounced query or filter change
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, filters);
    } else {
      setResults([]);
      onSearchResults?.([]);
    }
  }, [debouncedQuery, filters, performSearch, onSearchResults]);

  // Navigate to previous result
  const handlePrevious = useCallback(() => {
    if (results.length === 0) return;

    const newIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
    setCurrentIndex(newIndex);
    onResultNavigate?.(results[newIndex].id);
  }, [results, currentIndex, onResultNavigate]);

  // Navigate to next result
  const handleNext = useCallback(() => {
    if (results.length === 0) return;

    const newIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onResultNavigate?.(results[newIndex].id);
  }, [results, currentIndex, onResultNavigate]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setCurrentIndex(0);
    onSearchResults?.([]);
  }, [onSearchResults]);

  // Handle input change
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  // Handle key down
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrevious();
        } else {
          handleNext();
        }
      } else if (e.key === 'Escape') {
        handleClear();
        onToggle?.();
      }
    },
    [handlePrevious, handleNext, handleClear, onToggle]
  );

  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center justify-center p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        aria-label="Mesajlarda ara"
        title="Mesajlarda ara"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Mesajlarda ara..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            autoFocus
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Aramayı temizle"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Result Counter & Navigation */}
        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {results.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={handlePrevious}
                className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={results.length === 0}
                aria-label="Önceki sonuç"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={results.length === 0}
                aria-label="Sonraki sonuç"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isSearching && (
          <div className="text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onToggle}
          className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Aramayı kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-4">
          <MessageSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            isExpanded={isFiltersExpanded}
            onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
          />
        </div>
      )}
    </div>
  );
}
