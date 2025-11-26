// ================================================
// SEARCH DOMAIN COMPONENTS
// ================================================
// All search related components
// Includes advanced search, filters, and search results

// Search Components
export { default as AdvancedSearch } from './AdvancedSearch';
export { AdvancedSearchForm } from './AdvancedSearchForm';
export { UniversalSearch } from './UniversalSearch';
export { LocationSearch } from './LocationSearch';
export { EnhancedSearchResults } from './EnhancedSearchResults';
export type { EnhancedSearchResultsProps } from './EnhancedSearchResults';
export { NoResultsState } from './NoResultsState';
export type { NoResultsStateProps } from './NoResultsState';
export { ZeroResultsState } from './ZeroResultsState';
export type { ZeroResultsStateProps } from './ZeroResultsState';

// Filters
export { EnhancedFilters } from './EnhancedFilters';
export { EnhancedSearchSystem } from './EnhancedSearchSystem';
export { AdvancedSearchFiltersSidebar } from './AdvancedSearchFiltersSidebar';
export { AdvancedSearchFilters } from './AdvancedSearchFilters';
export type {
  SearchFilters,
  AdvancedSearchFiltersProps,
} from './AdvancedSearchFilters';

// Autocomplete & History
export { SearchAutocomplete } from './SearchAutocomplete';
export { EnhancedSearchAutocomplete } from './EnhancedSearchAutocomplete';
export { SearchHistoryPanel } from './SearchHistoryPanel';

// Legacy search components (moved from search folder)
export * from './search';
