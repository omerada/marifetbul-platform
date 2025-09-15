export interface SearchSuggestion {
  text: string;
  type: 'job' | 'service' | 'user' | 'skill' | 'location' | 'category';
  count: number;
  category?: string;
  icon?: string;
}

export interface SearchSuggestionsResponse {
  data: {
    suggestions: SearchSuggestion[];
    trending: string[];
    recent: string[];
    categories: Array<{ name: string; count: number }>;
  };
}

export interface SearchFilters {
  type: 'all' | 'jobs' | 'services' | 'users';
  category?: string;
  subcategory?: string;
  priceRange?: { min: number; max: number };
  location?: string;
  rating?: number;
  availability?: boolean;
  experience?: 'entry' | 'intermediate' | 'expert';
  skills?: string[];
  sortBy: 'relevance' | 'price' | 'rating' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

export interface AdvancedSearchRequest {
  query: string;
  filters: SearchFilters;
  page: number;
  limit: number;
  includeAggregations?: boolean;
}

export interface SearchFacet {
  name: string;
  count: number;
  selected?: boolean;
}

export interface SearchFacets {
  categories: SearchFacet[];
  priceRanges: SearchFacet[];
  locations: SearchFacet[];
  skills: SearchFacet[];
  ratings: SearchFacet[];
  experience: SearchFacet[];
}

export interface SearchResult {
  id: string;
  type: 'job' | 'service' | 'freelancer';
  title: string;
  description: string;
  category: string;
  location: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  rating: number;
  reviews: number;
  featured: boolean;
  urgent: boolean;
  verified: boolean;
  postedAt: string;
  deadline?: string;
  skills: string[];
  employer?: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
  };
  freelancer?: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    hourlyRate: number;
    availability: string;
    level: string;
  };
  metrics: {
    views: number;
    applications: number;
    responseTime: string;
  };
  // Backward compatibility fields
  price?: number;
  currency?: string;
  reviewCount?: number;
  image?: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
  createdAt: string;
  updatedAt: string;
  highlighted?: boolean;
}

export interface AdvancedSearchResponse {
  data: {
    results: SearchResult[];
    facets: SearchFacets;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    searchTime: number;
    suggestions?: string[];
    didYouMean?: string;
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: string;
  resultCount: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  alertsEnabled: boolean;
  createdAt: string;
  lastNotified?: string;
}

export interface SearchAnalytics {
  query: string;
  timestamp: string;
  resultCount: number;
  clickedResults: string[];
  timeSpent: number;
  sessionId: string;
}

export interface SearchConfig {
  enableAutocomplete: boolean;
  enableSuggestions: boolean;
  enableHistory: boolean;
  enableAnalytics: boolean;
  maxHistoryItems: number;
  maxSuggestions: number;
  debounceMs: number;
  minQueryLength: number;
}

export interface SearchAutoComplete {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  showSuggestions: boolean;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  facets: SearchFacets | null;
  filters: SearchFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTime: number;
  history: SearchHistory[];
  savedSearches: SavedSearch[];
  config: SearchConfig;
}
