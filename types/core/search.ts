// Unified Search types - consolidating all search functionality
import { PaginationMeta } from './base';

export type SearchType = 'jobs' | 'services' | 'freelancers' | 'all';
export type SortBy =
  | 'relevance'
  | 'rating'
  | 'price'
  | 'date'
  | 'popularity'
  | 'distance';
export type SortOrder = 'asc' | 'desc';

// Base search suggestion interface
export interface SearchSuggestion {
  id: string;
  text: string;
  type:
    | 'category'
    | 'skill'
    | 'location'
    | 'freelancer'
    | 'job'
    | 'service'
    | 'history';
  count?: number;
  category?: string;
  icon?: string;
}

// Advanced search filters - unified for all search types
export interface AdvancedSearchFilters {
  // General filters
  type?: SearchType;
  category?: string;
  subcategory?: string;
  search?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;

  // Location filters
  location?: {
    city?: string;
    district?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    radius?: number; // km
  };

  // Budget/Price filters
  budget?: {
    min?: number;
    max?: number;
    type?: 'fixed' | 'hourly'; // for jobs
  };

  // Quality filters
  rating?: number;
  verified?: boolean;

  // Specific filters
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  availability?: 'available' | 'busy' | 'any';
  deliveryTime?: number; // for services
  remoteOk?: boolean;

  // Time filters
  dateFrom?: string;
  dateTo?: string;
}

// Search request
export interface AdvancedSearchRequest {
  query?: string;
  filters: AdvancedSearchFilters;
  page?: number;
  limit?: number;
  includeAggregations?: boolean;
}

// Search result item
export interface SearchResult {
  id: string;
  type: 'job' | 'service' | 'freelancer';
  title: string;
  description: string;
  category: string;
  location?: string;

  // Budget/Price info
  budget?: {
    min: number;
    max: number;
    currency: string;
    type?: 'fixed' | 'hourly';
  };

  // Quality indicators
  rating: number;
  reviews: number;
  verified: boolean;
  featured: boolean;
  urgent: boolean;

  // User/employer info
  user: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    verified?: boolean;
  };

  // Metadata
  skills?: string[];
  postedAt: string;
  deadline?: string;
  highlighted?: boolean;

  // Type-specific fields
  availability?: string; // for freelancers
  responseTime?: string; // for freelancers
  proposalsCount?: number; // for jobs
  ordersCount?: number; // for services
  deliveryTime?: number; // for services
}

// Search facets for filtering
export interface SearchFacet {
  name: string;
  count: number;
  selected?: boolean;
}

export interface SearchFacets {
  categories: SearchFacet[];
  locations: SearchFacet[];
  skills: SearchFacet[];
  priceRanges: SearchFacet[];
  ratings: SearchFacet[];
  experienceLevels: SearchFacet[];
}

// Search response
export interface AdvancedSearchResponse {
  success: boolean;
  data?: {
    results: SearchResult[];
    facets: SearchFacets;
    pagination: PaginationMeta;
    searchTime: number;
    suggestions?: string[];
    didYouMean?: string;
    totalResults: number;
  };
  error?: string;
  message?: string;
}

// Search suggestions response
export interface SearchSuggestionsResponse {
  success: boolean;
  data?: {
    suggestions: SearchSuggestion[];
    trending: string[];
    recent: string[];
    categories: Array<{ name: string; count: number }>;
  };
  error?: string;
}

// Search history
export interface SearchHistory {
  id: string;
  userId: string;
  query?: string;
  filters: AdvancedSearchFilters;
  resultsCount: number;
  searchedAt: string;
  clickedResults: string[];
  bookmarked: boolean;
}

// Saved search
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query?: string;
  filters: AdvancedSearchFilters;
  alertEnabled: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  lastRun?: string;
  resultsCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Search analytics
export interface SearchAnalytics {
  searchId: string;
  query?: string;
  filters: AdvancedSearchFilters;
  resultsCount: number;
  clickedResults: string[];
  searchTime: number;
  userId?: string;
  sessionId: string;
  timestamp: string;
}

// Search state for UI
export interface SearchState {
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  facets: SearchFacets | null;
  filters: AdvancedSearchFilters;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTime: number;
  history: SearchHistory[];
  savedSearches: SavedSearch[];
}

// Form types
export interface SearchFormData {
  query?: string;
  filters: AdvancedSearchFilters;
}

export interface SaveSearchFormData {
  name: string;
  filters: AdvancedSearchFilters;
  alertEnabled?: boolean;
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
}

// API request/response interfaces
export interface SearchSuggestionsRequest {
  query: string;
  type?: SearchType;
  limit?: number;
}

export interface SaveSearchRequest {
  name: string;
  query?: string;
  filters: AdvancedSearchFilters;
  alertEnabled?: boolean;
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
}

export interface SaveSearchResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    savedAt: string;
  };
  error?: string;
}
