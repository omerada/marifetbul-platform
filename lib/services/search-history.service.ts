/**
 * ================================================
 * SEARCH HISTORY SERVICE
 * ================================================
 * Sprint DAY 3 - Task 10: Search Functionality Enhancement
 *
 * Manages search history with localStorage persistence
 * Features:
 * - Save search queries to localStorage
 * - Retrieve recent searches
 * - Clear history
 * - Limit history size
 * - Deduplicate searches
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Enhanced
 */

import logger from '@/lib/infrastructure/monitoring/logger';

const STORAGE_KEY = 'marifet_search_history';
const MAX_HISTORY_SIZE = 20;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount?: number;
  filters?: Record<string, unknown>;
}

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored) as SearchHistoryItem[];
    return Array.isArray(history) ? history : [];
  } catch (error) {
    logger.error(
      'Failed to get search history', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Add search query to history
 */
export function addToSearchHistory(
  query: string,
  resultCount?: number,
  filters?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  if (!query.trim()) return;

  try {
    const history = getSearchHistory();

    // Remove existing entry with same query (move to top)
    const filtered = history.filter(
      (item) => item.query.toLowerCase() !== query.toLowerCase()
    );

    // Add new entry at the beginning
    const newHistory: SearchHistoryItem[] = [
      {
        query: query.trim(),
        timestamp: Date.now(),
        resultCount,
        filters,
      },
      ...filtered,
    ].slice(0, MAX_HISTORY_SIZE);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    logger.debug('Search history updated', { query, countnewHistorylength });
  } catch (error) {
    logger.error(
      'Failed to add to search history', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Remove specific search from history
 */
export function removeFromSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getSearchHistory();
    const filtered = history.filter(
      (item) => item.query.toLowerCase() !== query.toLowerCase()
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    logger.debug('Search removed from history', { query });
  } catch (error) {
    logger.error(
      'Failed to remove from search history', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    logger.info('Search history cleared');
  } catch (error) {
    logger.error(
      'Failed to clear search history', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get recent search queries (last N)
 */
export function getRecentSearches(limit: number = 5): string[] {
  const history = getSearchHistory();
  return history.slice(0, limit).map((item) => item.query);
}

/**
 * Get most searched queries
 */
export function getMostSearched(limit: number = 5): SearchHistoryItem[] {
  const history = getSearchHistory();

  // Count occurrences
  const counts = new Map<string, number>();
  history.forEach((item) => {
    const lower = item.query.toLowerCase();
    counts.set(lower, (counts.get(lower) || 0) + 1);
  });

  // Get unique items and sort by count
  const uniqueMap = new Map<string, SearchHistoryItem>();
  history.forEach((item) => {
    const lower = item.query.toLowerCase();
    if (!uniqueMap.has(lower)) {
      uniqueMap.set(lower, item);
    }
  });

  const uniqueItems = Array.from(uniqueMap.values());

  return uniqueItems
    .sort((a, b) => {
      const countA = counts.get(a.query.toLowerCase()) || 0;
      const countB = counts.get(b.query.toLowerCase()) || 0;
      return countB - countA;
    })
    .slice(0, limit);
}

/**
 * Search in history
 */
export function searchHistory(query: string): SearchHistoryItem[] {
  if (!query.trim()) return [];

  const history = getSearchHistory();
  const searchLower = query.toLowerCase();

  return history.filter((item) =>
    item.query.toLowerCase().includes(searchLower)
  );
}

/**
 * Get search history statistics
 */
export function getSearchHistoryStats(): {
  totalSearches: number;
  uniqueQueries: number;
  lastSearchDate: number | null;
  topQuery: string | null;
} {
  const history = getSearchHistory();

  if (history.length === 0) {
    return {
      totalSearches: 0,
      uniqueQueries: 0,
      lastSearchDate: null,
      topQuery: null,
    };
  }

  const uniqueQueries = new Set(
    history.map((item) => item.query.toLowerCase())
  );

  const mostSearched = getMostSearched(1);

  return {
    totalSearches: history.length,
    uniqueQueries: uniqueQueries.size,
    lastSearchDate: history[0]?.timestamp || null,
    topQuery: mostSearched[0]?.query || null,
  };
}

/**
 * Export history as JSON
 */
export function exportSearchHistory(): string {
  const history = getSearchHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import history from JSON
 */
export function importSearchHistory(jsonData: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const imported = JSON.parse(jsonData) as SearchHistoryItem[];

    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array');
    }

    // Validate items
    const valid = imported.every(
      (item) =>
        typeof item.query === 'string' && typeof item.timestamp === 'number'
    );

    if (!valid) {
      throw new Error('Invalid format: missing required fields');
    }

    // Merge with existing history
    const existing = getSearchHistory();
    const merged = [...imported, ...existing];

    // Deduplicate by query (keep latest)
    const uniqueMap = new Map<string, SearchHistoryItem>();
    merged.forEach((item) => {
      const key = item.query.toLowerCase();
      const existing = uniqueMap.get(key);
      if (!existing || item.timestamp > existing.timestamp) {
        uniqueMap.set(key, item);
      }
    });

    const deduplicated = Array.from(uniqueMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY_SIZE);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated));
    logger.info('Search history imported', { count: imported.length });
    return true;
  } catch (error) {
    logger.error(
      'Failed to import search history', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}
