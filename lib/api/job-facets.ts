/**
 * Job Facets API Client
 * Sprint 1 - Task 5: Faceted Search Implementation
 *
 * Handles fetching facet counts for job search filters
 *
 * @module lib/api/job-facets
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-01-13
 */

import { apiClient } from '@/lib/infrastructure/api/client';

/**
 * Job facets data structure
 */
export interface JobFacetsData {
  categories: Record<string, number>;
  skills: Record<string, number>;
  locations: Record<string, number>;
  budgetRanges?: Record<string, number>;
}

/**
 * API response structure
 */
interface JobFacetsResponse {
  success: boolean;
  data: JobFacetsData;
  message: string;
}

/**
 * Fetch job facets from API
 *
 * Retrieves facet counts for:
 * - Categories (e.g., "Web Geliştirme": 142)
 * - Skills (e.g., "React": 89)
 * - Locations (e.g., "İstanbul": 234, "Uzaktan": 456)
 * - Budget Ranges (e.g., "0-500": 45)
 *
 * @param filters - Optional filters to apply (category, location, minBudget, maxBudget)
 * @returns Promise<JobFacetsData>
 *
 * @example
 * ```typescript
 * const facets = await fetchJobFacets();
 * console.log(facets.categories); // { "Web Geliştirme": 142, ... }
 * ```
 *
 * @example With filters
 * ```typescript
 * const facets = await fetchJobFacets({
 *   category: 'Web Geliştirme',
 *   location: 'İstanbul'
 * });
 * ```
 */
export async function fetchJobFacets(
  filters?: Record<string, string | number | undefined>
): Promise<JobFacetsData> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const url = `/api/v1/jobs/facets${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await apiClient.get<JobFacetsResponse>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch job facets');
    }

    return response.data;
  } catch (error) {
    console.error('[fetchJobFacets] Error:', error);

    // Return empty facets on error (graceful degradation)
    return {
      categories: {},
      skills: {},
      locations: {},
      budgetRanges: {},
    };
  }
}

/**
 * Fetch job facets with caching
 * Uses browser cache with 1 minute TTL
 *
 * @param filters - Optional filters
 * @returns Promise<JobFacetsData>
 */
export async function fetchJobFacetsWithCache(
  filters?: Record<string, string | number | undefined>
): Promise<JobFacetsData> {
  const cacheKey = `job-facets-${JSON.stringify(filters || {})}`;
  const cacheTTL = 60 * 1000; // 1 minute

  // Check cache
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheTTL) {
      return data;
    }
  }

  // Fetch fresh data
  const data = await fetchJobFacets(filters);

  // Store in cache
  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({ data, timestamp: Date.now() })
  );

  return data;
}

/**
 * Export API object for consistency with other API modules
 */
export const jobFacetsApi = {
  fetchJobFacets,
  fetchJobFacetsWithCache,
};
