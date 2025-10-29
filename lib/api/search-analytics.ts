/**
 * ================================================
 * SEARCH ANALYTICS API CLIENT
 * ================================================
 * Handles search tracking, metrics, and analytics operations
 *
 * Sprint 1: Search Analytics Implementation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-29
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { z } from 'zod';

// ============================================================================
// Schemas & Types
// ============================================================================

/**
 * Track Search Request Schema
 */
const TrackSearchRequestSchema = z.object({
  query: z.string().min(1).max(255),
  resultCount: z.number().int().nonnegative(),
  categoryId: z.string().uuid().optional(),
  filters: z.record(z.string(), z.any()).optional(),
});

export type TrackSearchRequest = z.infer<typeof TrackSearchRequestSchema>;

/**
 * Search Analytics DTO Schema
 */
const SearchAnalyticsDtoSchema = z.object({
  id: z.string().uuid(),
  query: z.string(),
  resultCount: z.number(),
  userId: z.string().uuid().nullable(),
  categoryId: z.string().uuid().nullable(),
  clickedPackageId: z.string().uuid().nullable(),
  clickPosition: z.number().nullable(),
  converted: z.boolean(),
  searchTimestamp: z.string().datetime(),
  clickTimestamp: z.string().datetime().nullable(),
  conversionTimestamp: z.string().datetime().nullable(),
});

export type SearchAnalyticsDto = z.infer<typeof SearchAnalyticsDtoSchema>;

/**
 * Search Metrics Schema
 */
const SearchMetricsSchema = z.object({
  totalSearches: z.number(),
  uniqueUsers: z.number(),
  zeroResultSearches: z.number(),
  averageResults: z.number(),
  clickThroughRate: z.number(),
  conversionRate: z.number(),
  topQueries: z.record(z.string(), z.number()),
  topCategories: z.record(z.string(), z.number()),
  averageTimeToClick: z.number().nullable(),
  averageTimeToConversion: z.number().nullable(),
});

export type SearchMetrics = z.infer<typeof SearchMetricsSchema>;

/**
 * Top Queries Schema
 */
const TopQueriesSchema = z.record(z.string(), z.number());

export type TopQueries = z.infer<typeof TopQueriesSchema>;

/**
 * Query Suggestions Schema
 */
const QuerySuggestionsSchema = z.array(z.string());

export type QuerySuggestions = z.infer<typeof QuerySuggestionsSchema>;

// ============================================================================
// Public Tracking Functions
// ============================================================================

/**
 * Track a search query
 * POST /api/v1/analytics/search/track
 *
 * @param {TrackSearchRequest} request - Search query data
 * @returns {Promise<void>}
 *
 * @throws {ValidationError} Invalid request data
 * @throws {ApiError} Server error
 *
 * @example
 * await trackSearch({
 *   query: 'web development',
 *   resultCount: 15,
 *   categoryId: '550e8400-e29b-41d4-a716-446655440000',
 *   filters: { priceMin: 100, priceMax: 500 }
 * });
 */
export async function trackSearch(request: TrackSearchRequest): Promise<void> {
  TrackSearchRequestSchema.parse(request);

  await apiClient.post('/analytics/search/track', request);
}

/**
 * Track click on search result
 * POST /api/v1/analytics/search/{searchId}/click
 *
 * @param {string} searchId - Search analytics ID
 * @param {string} packageId - Clicked package ID
 * @param {number} position - Position in search results (1-based)
 * @returns {Promise<void>}
 *
 * @throws {ValidationError} Invalid parameters
 * @throws {NotFoundError} Search not found
 * @throws {ApiError} Server error
 *
 * @example
 * await trackClick('search-uuid', 'package-uuid', 3);
 */
export async function trackClick(
  searchId: string,
  packageId: string,
  position: number
): Promise<void> {
  if (!z.string().uuid().safeParse(searchId).success) {
    throw new Error('Invalid searchId format');
  }
  if (!z.string().uuid().safeParse(packageId).success) {
    throw new Error('Invalid packageId format');
  }
  if (position < 1) {
    throw new Error('Position must be >= 1');
  }

  await apiClient.post(
    `/analytics/search/${searchId}/click?packageId=${packageId}&position=${position}`,
    null
  );
}

/**
 * Track conversion (order placed after search)
 * POST /api/v1/analytics/search/{searchId}/conversion
 *
 * @param {string} searchId - Search analytics ID
 * @param {string} orderId - Created order ID
 * @returns {Promise<void>}
 *
 * @throws {ValidationError} Invalid parameters
 * @throws {NotFoundError} Search not found
 * @throws {ApiError} Server error
 *
 * @example
 * await trackConversion('search-uuid', 'order-uuid');
 */
export async function trackConversion(
  searchId: string,
  orderId: string
): Promise<void> {
  if (!z.string().uuid().safeParse(searchId).success) {
    throw new Error('Invalid searchId format');
  }
  if (!z.string().uuid().safeParse(orderId).success) {
    throw new Error('Invalid orderId format');
  }

  await apiClient.post(
    `/analytics/search/${searchId}/conversion?orderId=${orderId}`,
    null
  );
}

// ============================================================================
// Admin Analytics Functions
// ============================================================================

/**
 * Get search metrics for time period
 * GET /api/v1/analytics/search/metrics
 *
 * @param {string} startDate - Start date (ISO format)
 * @param {string} endDate - End date (ISO format)
 * @returns {Promise<SearchMetrics>} Search metrics
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not admin
 * @throws {ValidationError} Invalid date format
 * @throws {ApiError} Server error
 *
 * @example
 * const metrics = await getSearchMetrics('2025-10-01', '2025-10-29');
 * console.log('Total searches:', metrics.totalSearches);
 * console.log('Conversion rate:', metrics.conversionRate);
 */
export async function getSearchMetrics(
  startDate: string,
  endDate: string
): Promise<SearchMetrics> {
  const response = await apiClient.get<{ data: SearchMetrics }>(
    '/analytics/search/metrics',
    { startDate, endDate }
  );

  return SearchMetricsSchema.parse(response.data);
}

/**
 * Get top search queries
 * GET /api/v1/analytics/search/top-queries
 *
 * @param {number} limit - Number of results (default: 10)
 * @param {number} days - Days to look back (default: 30)
 * @returns {Promise<TopQueries>} Query -> count mapping
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not admin
 * @throws {ApiError} Server error
 *
 * @example
 * const topQueries = await getTopQueries(10, 30);
 * // { "web development": 142, "logo design": 89, ... }
 */
export async function getTopQueries(
  limit: number = 10,
  days: number = 30
): Promise<TopQueries> {
  const response = await apiClient.get<{ data: TopQueries }>(
    '/analytics/search/top-queries',
    { limit: String(limit), days: String(days) }
  );

  return TopQueriesSchema.parse(response.data);
}

/**
 * Get zero-result queries
 * GET /api/v1/analytics/search/zero-results
 *
 * @param {number} limit - Number of results (default: 10)
 * @param {number} days - Days to look back (default: 30)
 * @returns {Promise<TopQueries>} Query -> count mapping
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not admin
 * @throws {ApiError} Server error
 *
 * @example
 * const zeroResults = await getZeroResultQueries(10, 30);
 * // { "blockchain expert": 23, "machine learning specialist": 18, ... }
 */
export async function getZeroResultQueries(
  limit: number = 10,
  days: number = 30
): Promise<TopQueries> {
  const response = await apiClient.get<{ data: TopQueries }>(
    '/analytics/search/zero-results',
    { limit: String(limit), days: String(days) }
  );

  return TopQueriesSchema.parse(response.data);
}

/**
 * Get search conversion rate
 * GET /api/v1/analytics/search/conversion-rate
 *
 * @param {number} days - Days to look back (default: 30)
 * @returns {Promise<number>} Conversion rate percentage
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not admin
 * @throws {ApiError} Server error
 *
 * @example
 * const rate = await getConversionRate(30);
 * console.log(`Conversion rate: ${rate.toFixed(2)}%`);
 */
export async function getConversionRate(days: number = 30): Promise<number> {
  const response = await apiClient.get<{ data: number }>(
    '/analytics/search/conversion-rate',
    { days: String(days) }
  );

  return z.number().parse(response.data);
}

/**
 * Get click-through rate (CTR)
 * GET /api/v1/analytics/search/click-through-rate
 *
 * @param {number} days - Days to look back (default: 30)
 * @returns {Promise<number>} CTR percentage
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not admin
 * @throws {ApiError} Server error
 *
 * @example
 * const ctr = await getClickThroughRate(30);
 * console.log(`CTR: ${ctr.toFixed(2)}%`);
 */
export async function getClickThroughRate(days: number = 30): Promise<number> {
  const response = await apiClient.get<{ data: number }>(
    '/analytics/search/click-through-rate',
    { days: String(days) }
  );

  return z.number().parse(response.data);
}

/**
 * Get most clicked packages from search
 * GET /api/v1/analytics/search/most-clicked-packages
 *
 * @param {number} limit - Number of results (default: 10)
 * @param {number} days - Days to look back (default: 30)
 * @returns {Promise<Record<string, number>>} PackageId -> clicks mapping
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not admin
 * @throws {ApiError} Server error
 *
 * @example
 * const mostClicked = await getMostClickedPackages(10, 30);
 * // { "uuid1": 342, "uuid2": 289, ... }
 */
export async function getMostClickedPackages(
  limit: number = 10,
  days: number = 30
): Promise<Record<string, number>> {
  const response = await apiClient.get<{ data: Record<string, number> }>(
    '/analytics/search/most-clicked-packages',
    { limit: String(limit), days: String(days) }
  );

  return z.record(z.string(), z.number()).parse(response.data);
}

/**
 * Get query suggestions (autocomplete)
 * GET /api/v1/analytics/search/suggestions
 *
 * @param {string} prefix - Query prefix
 * @param {number} limit - Number of suggestions (default: 5)
 * @returns {Promise<string[]>} Suggested queries
 *
 * @throws {ValidationError} Invalid prefix
 * @throws {ApiError} Server error
 *
 * @example
 * const suggestions = await getQuerySuggestions('web', 5);
 * // ["web development", "web design", "website creation", ...]
 */
export async function getQuerySuggestions(
  prefix: string,
  limit: number = 5
): Promise<string[]> {
  if (!prefix || prefix.length === 0) {
    return [];
  }

  const response = await apiClient.get<{ data: string[] }>(
    '/analytics/search/suggestions',
    { prefix, limit: String(limit) }
  );

  return QuerySuggestionsSchema.parse(response.data);
}

/**
 * Get zero-result searches list (paginated)
 * GET /api/v1/analytics/search/zero-results/list
 *
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise<{ content: SearchAnalyticsDto[], totalElements: number, totalPages: number }>}
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not admin
 * @throws {ApiError} Server error
 *
 * @example
 * const { content, totalElements } = await getZeroResultSearchesList(0, 20);
 * console.log(`${totalElements} zero-result searches found`);
 */
export async function getZeroResultSearchesList(
  page: number = 0,
  size: number = 20
): Promise<{
  content: SearchAnalyticsDto[];
  totalElements: number;
  totalPages: number;
}> {
  const response = await apiClient.get<{
    data: {
      content: SearchAnalyticsDto[];
      totalElements: number;
      totalPages: number;
    };
  }>('/analytics/search/zero-results/list', {
    page: String(page),
    size: String(size),
  });

  const pageSchema = z.object({
    content: z.array(SearchAnalyticsDtoSchema),
    totalElements: z.number(),
    totalPages: z.number(),
  });

  return pageSchema.parse(response.data);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate zero-result percentage
 * @param totalSearches Total number of searches
 * @param zeroResults Number of zero-result searches
 * @returns Percentage (0-100)
 */
export function calculateZeroResultPercentage(
  totalSearches: number,
  zeroResults: number
): number {
  if (totalSearches === 0) return 0;
  return (zeroResults / totalSearches) * 100;
}

/**
 * Format search metrics for display
 * @param metrics Search metrics object
 * @returns Formatted metrics
 */
export function formatSearchMetrics(metrics: SearchMetrics) {
  return {
    totalSearches: metrics.totalSearches.toLocaleString('tr-TR'),
    uniqueUsers: metrics.uniqueUsers.toLocaleString('tr-TR'),
    zeroResultRate: `${metrics.zeroResultSearches > 0 ? calculateZeroResultPercentage(metrics.totalSearches, metrics.zeroResultSearches).toFixed(2) : '0.00'}%`,
    clickThroughRate: `${metrics.clickThroughRate.toFixed(2)}%`,
    conversionRate: `${metrics.conversionRate.toFixed(2)}%`,
    averageResults: metrics.averageResults.toFixed(1),
    avgTimeToClick: metrics.averageTimeToClick
      ? `${(metrics.averageTimeToClick / 1000).toFixed(1)}s`
      : 'N/A',
    avgTimeToConversion: metrics.averageTimeToConversion
      ? `${(metrics.averageTimeToConversion / 1000).toFixed(1)}s`
      : 'N/A',
  };
}
