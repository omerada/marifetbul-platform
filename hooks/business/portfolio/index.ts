/**
 * Portfolio Business Hooks Index
 * Sprint 1: Portfolio & Analytics System
 * Sprint 17: Added Image Upload Hook
 */

export { usePortfolio } from './usePortfolio';
export type { UsePortfolioReturn } from './usePortfolio';

// Story 2 - Reordering
export { usePortfolioReorder } from './usePortfolioReorder';
export type { UsePortfolioReorderReturn } from './usePortfolioReorder';

// Story 3 - Analytics
export { usePortfolioAnalytics } from './usePortfolioAnalytics';
export type {
  UsePortfolioAnalyticsReturn,
  PortfolioAnalytics,
} from './usePortfolioAnalytics';

// Story 4 - Search & Filter
export { usePortfolioSearch } from './usePortfolioSearch';
export type { UsePortfolioSearchReturn } from './usePortfolioSearch';

export { usePortfolioFilters } from './usePortfolioFilters';
export type {
  UsePortfolioFiltersReturn,
  PortfolioFilters,
} from './usePortfolioFilters';

// Sprint 17 - Image Upload
export { usePortfolioImageUpload } from './usePortfolioImageUpload';
export type { UsePortfolioImageUploadReturn } from './usePortfolioImageUpload';
