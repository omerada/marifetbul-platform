/**
 * Popular Searches API Client
 * Sprint 1 - Task 2: Search Analytics (Popular Searches)
 *
 * @module lib/api/popular-searches
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { logger } from '@/lib/shared/utils/logger';

/**
 * Popular Search Data Types
 */
export interface PopularSearch {
  searchTerm: string;
  searchCount: number;
  category?: string | null;
  percentage?: number;
}

export interface PopularSearchesResponse {
  data: PopularSearch[];
}

/**
 * Fetch popular searches (trending search terms)
 *
 * @param limit - Number of popular searches to return (default: 10)
 * @param days - Number of days to look back for trending data (default: 7)
 * @returns List of popular searches with counts
 */
export async function fetchPopularSearches(
  limit: number = 10,
  days: number = 7
): Promise<PopularSearch[]> {
  try {
    logger.debug('[PopularSearches] Fetching popular searches', {
      limit,
      days,
    });

    const response = await apiClient.get<PopularSearch[]>(
      '/analytics/search/popular',
      {
        limit: String(limit),
        days: String(days),
      },
      {
        caching: {
          enabled: true,
          ttl: 1800, // 30 minutes cache
        },
      }
    );

    logger.info('[PopularSearches] Popular searches fetched successfully', {
      count: response.length,
      limit,
      days,
    });

    return response;
  } catch (error) {
    logger.error('[PopularSearches] Failed to fetch popular searches', {
      error,
      limit,
      days,
    });

    // Return empty array on error - graceful degradation
    // Frontend will handle empty state
    return [];
  }
}

/**
 * Fetch popular searches with custom cache settings
 *
 * @param limit - Number of results
 * @param days - Days to look back
 * @param forceRefresh - Force cache refresh
 * @returns List of popular searches
 */
export async function fetchPopularSearchesWithCache(
  limit: number = 10,
  days: number = 7,
  forceRefresh: boolean = false
): Promise<PopularSearch[]> {
  try {
    logger.debug('[PopularSearches] Fetching with cache control', {
      limit,
      days,
      forceRefresh,
    });

    const response = await apiClient.get<PopularSearch[]>(
      '/analytics/search/popular',
      {
        limit: String(limit),
        days: String(days),
      },
      {
        caching: {
          enabled: !forceRefresh,
          ttl: 1800,
          forceRefresh,
        },
      }
    );

    return response;
  } catch (error) {
    logger.error('[PopularSearches] Failed to fetch with cache', {
      error,
      limit,
      days,
      forceRefresh,
    });
    return [];
  }
}
