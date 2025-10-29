/**
 * Portfolio Components Index
 * Sprint 1 & 2: Portfolio & Analytics System with Performance Optimization
 */

import dynamic from 'next/dynamic';

// ============================================================================
// LAZY LOADED COMPONENTS (for better code splitting)
// ============================================================================

// CRUD Modals - Lazy loaded since they're not always needed
export const PortfolioCreateModal = dynamic(
  () =>
    import('./PortfolioCreateModal').then((mod) => ({
      default: mod.PortfolioCreateModal,
    })),
  {
    loading: () => null, // No loading state needed for modals
    ssr: false, // Modals don't need SSR
  }
);

export const PortfolioEditModal = dynamic(
  () =>
    import('./PortfolioEditModal').then((mod) => ({
      default: mod.PortfolioEditModal,
    })),
  {
    loading: () => null,
    ssr: false,
  }
);

export const PortfolioDeleteModal = dynamic(
  () =>
    import('./PortfolioDeleteModal').then((mod) => ({
      default: mod.PortfolioDeleteModal,
    })),
  {
    loading: () => null,
    ssr: false,
  }
);

// Analytics Dashboard - Lazy loaded (heavy with Recharts)
export const PortfolioAnalyticsDashboard = dynamic(
  () =>
    import('./PortfolioAnalyticsDashboard').then((mod) => ({
      default: mod.PortfolioAnalyticsDashboard,
    })),
  {
    ssr: false, // Charts don't need SSR
  }
);

// Analytics Charts - Lazy loaded with dashboard
export const ViewCountChart = dynamic(
  () =>
    import('./PortfolioAnalyticsCharts').then((mod) => ({
      default: mod.ViewCountChart,
    })),
  { ssr: false }
);

export const CategoryChart = dynamic(
  () =>
    import('./PortfolioAnalyticsCharts').then((mod) => ({
      default: mod.CategoryChart,
    })),
  { ssr: false }
);

export const TopSkillsList = dynamic(
  () =>
    import('./PortfolioAnalyticsCharts').then((mod) => ({
      default: mod.TopSkillsList,
    })),
  { ssr: false }
);

export const TopPortfoliosTable = dynamic(
  () =>
    import('./PortfolioAnalyticsCharts').then((mod) => ({
      default: mod.TopPortfoliosTable,
    })),
  { ssr: false }
);

// ============================================================================
// EAGERLY LOADED COMPONENTS (needed immediately or lightweight)
// ============================================================================

// Reordering - Keep eager (used in dedicated page)
export { PortfolioReorderList } from './PortfolioReorderList';

// Search & Filter - Keep eager (lightweight, used frequently)
export {
  PortfolioSearchBar,
  PortfolioFilterPanel,
  ActiveFilters,
} from './PortfolioSearchAndFilter';

// Profile components - Keep eager (core functionality)
export { PortfolioGallery } from '../profile/PortfolioGallery';
export { PortfolioModal } from '../profile/PortfolioModal';
export { PortfolioShare } from '../profile/PortfolioShare';
export { PortfolioAnalytics } from '../profile/PortfolioAnalytics';

// Skeleton components - Keep eager (lightweight, needed for loading states)
export {
  PortfolioCardSkeleton,
  PortfolioListSkeleton,
  PortfolioReorderItemSkeleton,
  PortfolioReorderListSkeleton,
  AnalyticsCardSkeleton,
  AnalyticsChartSkeleton,
  AnalyticsDashboardSkeleton,
  PortfolioTableRowSkeleton,
  PortfolioTableSkeleton,
  Skeleton,
} from './PortfolioSkeletons';

// Error boundary components - Keep eager (needed for error handling)
export {
  PortfolioErrorBoundary,
  PortfolioErrorFallback,
  CompactErrorBoundary,
} from './PortfolioErrorBoundary';
