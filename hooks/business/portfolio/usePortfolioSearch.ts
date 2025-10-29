/**
 * Portfolio Search Hook
 * Sprint 1: Story 4.1 - Portfolio Search & Filter
 *
 * Provides real-time portfolio search functionality
 */

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/shared/base';
import type { PortfolioResponse } from '@/lib/api/portfolio';

// ============================================================================
// TYPES
// ============================================================================

export interface UsePortfolioSearchReturn {
  // State
  searchQuery: string;
  searchResults: PortfolioResponse[];
  isSearching: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Helpers
  highlightText: (text: string) => string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Search portfolios by query
 */
function searchPortfolios(
  portfolios: PortfolioResponse[],
  query: string
): PortfolioResponse[] {
  if (!query || query.trim().length === 0) {
    return portfolios;
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  return portfolios.filter((portfolio) => {
    const searchableText = [
      portfolio.title,
      portfolio.description,
      portfolio.category,
      portfolio.client,
      ...(portfolio.skills || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // All search terms must be found
    return searchTerms.every((term) => searchableText.includes(term));
  });
}

// ============================================================================
// HOOK
// ============================================================================

export function usePortfolioSearch(
  portfolios: PortfolioResponse[]
): UsePortfolioSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Debounce search query (300ms)
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Handle search query change
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 300);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    return searchPortfolios(portfolios, debouncedQuery);
  }, [portfolios, debouncedQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsTyping(false);
  }, []);

  // Highlight matching text (basic implementation)
  const highlightText = useCallback(
    (text: string): string => {
      if (!debouncedQuery || !text) return text;

      const searchTerms = debouncedQuery.toLowerCase().trim().split(/\s+/);
      let highlightedText = text;

      searchTerms.forEach((term: string) => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(
          regex,
          '<mark class="bg-yellow-200 px-0.5">$1</mark>'
        );
      });

      return highlightedText;
    },
    [debouncedQuery]
  );

  return {
    searchQuery,
    searchResults,
    isSearching: isTyping,
    setSearchQuery: handleSetSearchQuery,
    clearSearch,
    highlightText,
  };
}

export default usePortfolioSearch;
