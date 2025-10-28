/**
 * Search and Discovery Types
 * @module types/business/features/search
 * @description Advanced search, suggestions, saved searches, and search analytics
 */

import type { Job, ServicePackage } from './marketplace';
import type { User, PaginationMeta } from '../../core/base';

/**
 * Advanced search request with filters
 */
export interface AdvancedSearchRequest {
  query: string;
  category?: string;
  location?: string;
  pageSize?: number;
  skills?: string[];
  budget?: { min: number; max: number };
  rating?: number;
  availability?: string;
  remoteOk?: boolean;
  deliveryTime?: number;
  experienceLevel?: string;
  sortBy?: string;
  page?: number;
  filters?: {
    category?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    location?: string;
    skills?: string[];
    rating?: number;
  };
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'recent';
  limit?: number;
}

/**
 * Advanced search response with facets
 */
export interface AdvancedSearchResponse {
  jobs: Job[];
  freelancers: User[];
  packages: ServicePackage[];
  total: number;
  facets: SearchFacets;
  pagination: PaginationMeta;
  // Store compatibility
  success?: boolean;
  data?: {
    results: Job[] | User[] | ServicePackage[];
    pagination: PaginationMeta;
    facets: SearchFacets;
    searchId: string;
  };
  error?: string;
}

/**
 * Search suggestions response
 */
export interface SearchSuggestionsResponse {
  queries: string[];
  categories: string[];
  skills: string[];
  locations: string[];
  // Store compatibility
  success?: boolean;
  data?: {
    suggestions: string[];
  };
  error?: string;
}

/**
 * Saved search entity
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: AdvancedSearchRequest['filters'];
  createdAt: string;
  updatedAt: string;
}

/**
 * Save search request
 */
export interface SaveSearchRequest {
  name: string;
  query: string;
  filters?: AdvancedSearchRequest['filters'];
  notifyOnNewResults?: boolean;
}

/**
 * Search facets for filtering
 */
export interface SearchFacets {
  categories: Array<{
    name: string;
    count: number;
  }>;
  skills: Array<{
    name: string;
    count: number;
  }>;
  locations: Array<{
    name: string;
    count: number;
  }>;
  priceRanges: Array<{
    range: string;
    min: number;
    max: number;
    count: number;
  }>;
  ratings: Array<{
    rating: number;
    count: number;
  }>;
}

/**
 * Enhanced search result
 */
export interface EnhancedSearchResult {
  id: string;
  type: 'job' | 'freelancer' | 'package';
  title: string;
  description: string;
  score: number;
  highlights: string[];
  metadata: Record<string, unknown>;
}

/**
 * Enhanced search filters
 */
export interface EnhancedSearchFilters {
  category?: string[];
  subcategory?: string[];
  skills?: string[];
  location?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: {
    min: number;
    max: number;
  };
  deliveryTime?: {
    min: number;
    max: number;
  };
  experienceLevel?: ('beginner' | 'intermediate' | 'expert')[];
  availability?: ('available' | 'busy' | 'not_available')[];
  verified?: boolean;
  topRated?: boolean;
}

/**
 * Search analytics
 */
export interface SearchAnalytics {
  searchId: string;
  query: string;
  resultsCount: number;
  clickedResults: string[];
  timestamp: string;
  userId?: string;
  filters: EnhancedSearchFilters;
  duration: number;
}

/**
 * Generic search result
 */
export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  score: number;
}

/**
 * Hook return type for enhanced search
 */
export interface UseEnhancedSearchReturn {
  results: EnhancedSearchResult[];
  isLoading: boolean;
  error: Error | null;
  facets: SearchFacets;
  pagination: PaginationMeta;
  search: (query: string, filters?: EnhancedSearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * Message search result
 */
export interface MessageSearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  highlights: string[];
}
