// ================================================
// BUSINESS HOOKS - DOMAIN-SPECIFIC LOGIC PATTERNS
// ================================================
// Unified hooks for business logic and domain operations

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from '../../lib/shared/base';
import {
  useUserSearch,
  useJobsSearch,
  usePackagesSearch,
  useFavorites,
  useToggleFavorite,
  type SearchFilters,
} from '../infrastructure/api';
import { useAuthState } from '../shared/useAuth';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// SEARCH BUSINESS LOGIC
// ================================================

export function useUnifiedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [activeTab, setActiveTab] = useState<'jobs' | 'packages' | 'users'>(
    'jobs'
  );

  const debouncedFilters = useDebounce(filters, 300);

  const jobsSearch = useJobsSearch(debouncedFilters, {
    enabled: activeTab === 'jobs',
  });

  const packagesSearch = usePackagesSearch(debouncedFilters, {
    enabled: activeTab === 'packages',
  });

  const usersSearch = useUserSearch(debouncedFilters, {
    enabled: activeTab === 'users',
  });

  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev: SearchFilters) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const currentSearch = useMemo(() => {
    switch (activeTab) {
      case 'jobs':
        return jobsSearch;
      case 'packages':
        return packagesSearch;
      case 'users':
        return usersSearch;
      default:
        return jobsSearch;
    }
  }, [activeTab, jobsSearch, packagesSearch, usersSearch]);

  const isSearching = useMemo(() => {
    return Object.keys(debouncedFilters).some(
      (key) =>
        debouncedFilters[key as keyof SearchFilters] !== undefined &&
        debouncedFilters[key as keyof SearchFilters] !== ''
    );
  }, [debouncedFilters]);

  return {
    filters,
    debouncedFilters,
    activeTab,
    setActiveTab,
    updateFilter,
    clearFilters,
    isSearching,
    jobs: jobsSearch,
    packages: packagesSearch,
    users: usersSearch,
    current: currentSearch,
  };
}

// ================================================
// FAVORITES BUSINESS LOGIC
// ================================================

export function useFavoritesManager() {
  const { user } = useAuthState();
  const favorites = useFavorites(user?.id || '');
  const toggleFavorite = useToggleFavorite();

  const [optimisticFavorites, setOptimisticFavorites] = useState<{
    jobs: string[];
    packages: string[];
  }>({ jobs: [], packages: [] });

  // Sync with actual favorites
  useEffect(() => {
    if (favorites.data) {
      setOptimisticFavorites({
        jobs:
          favorites.data?.jobs?.map(
            (job: unknown) => (job as { id: string }).id
          ) || [],
        packages:
          favorites.data?.packages?.map(
            (pkg: unknown) => (pkg as { id: string }).id
          ) || [],
      });
    }
  }, [favorites.data]);

  const isJobFavorite = useCallback(
    (jobId: string) => {
      return optimisticFavorites.jobs.includes(jobId);
    },
    [optimisticFavorites.jobs]
  );

  const isPackageFavorite = useCallback(
    (packageId: string) => {
      return optimisticFavorites.packages.includes(packageId);
    },
    [optimisticFavorites.packages]
  );

  const toggleJobFavorite = useCallback(
    async (jobId: string) => {
      // Optimistic update
      setOptimisticFavorites((prev) => ({
        ...prev,
        jobs: prev.jobs.includes(jobId)
          ? prev.jobs.filter((id) => id !== jobId)
          : [...prev.jobs, jobId],
      }));

      try {
        await toggleFavorite.mutate({ type: 'job', id: jobId });
        // Refetch to get updated data
        if (favorites.execute) {
          await favorites.execute();
        }
      } catch {
        // Revert optimistic update on error
        setOptimisticFavorites((prev) => ({
          ...prev,
          jobs: prev.jobs.includes(jobId)
            ? [...prev.jobs, jobId]
            : prev.jobs.filter((id) => id !== jobId),
        }));
      }
    },
    [toggleFavorite, favorites]
  );

  const togglePackageFavorite = useCallback(
    async (packageId: string) => {
      // Optimistic update
      setOptimisticFavorites((prev) => ({
        ...prev,
        packages: prev.packages.includes(packageId)
          ? prev.packages.filter((id) => id !== packageId)
          : [...prev.packages, packageId],
      }));

      try {
        await toggleFavorite.mutate({ type: 'package', id: packageId });
        // Refetch to get updated data
        if (favorites.execute) {
          await favorites.execute();
        }
      } catch {
        // Revert optimistic update on error
        setOptimisticFavorites((prev) => ({
          ...prev,
          packages: prev.packages.includes(packageId)
            ? [...prev.packages, packageId]
            : prev.packages.filter((id) => id !== packageId),
        }));
      }
    },
    [toggleFavorite, favorites]
  );

  return {
    favorites: favorites.data,
    isLoading: favorites.loading,
    error: favorites.error,
    isJobFavorite,
    isPackageFavorite,
    toggleJobFavorite,
    togglePackageFavorite,
    refetch: favorites.execute,
  };
}

// ================================================
// FILTER MANAGEMENT
// ================================================

export function useFilterManager<T extends Record<string, unknown>>(
  initialFilters: T
) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count = Object.values(filters).filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        (Array.isArray(value) ? value.length > 0 : true)
    ).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback(<K extends keyof T>(key: K) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = activeFiltersCount > 0;

  return {
    filters,
    activeFiltersCount,
    hasActiveFilters,
    updateFilter,
    removeFilter,
    clearFilters,
  };
}

// ================================================
// BREADCRUMB NAVIGATION
// ================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export function useBreadcrumbs() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbs((prev) => [...prev, item]);
  }, []);

  const setBreadcrumbItems = useCallback((items: BreadcrumbItem[]) => {
    setBreadcrumbs(items);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  const updateBreadcrumb = useCallback(
    (index: number, item: Partial<BreadcrumbItem>) => {
      setBreadcrumbs((prev) =>
        prev.map((breadcrumb, i) =>
          i === index ? { ...breadcrumb, ...item } : breadcrumb
        )
      );
    },
    []
  );

  return {
    breadcrumbs,
    addBreadcrumb,
    setBreadcrumbItems,
    clearBreadcrumbs,
    updateBreadcrumb,
  };
}

// ================================================
// ANALYTICS TRACKING
// ================================================

export function useAnalyticsTracker() {
  const { user } = useAuthState();

  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      // Production note: Analytics tracking awaiting integration with third-party service
      // (Google Analytics, Mixpanel, Segment, etc.). Currently logs to console in development.
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Analytics:', event, {
          userId: user?.id,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    },
    [user?.id]
  );

  const trackPageView = useCallback(
    (page: string) => {
      track('page_view', { page });
    },
    [track]
  );

  const trackUserAction = useCallback(
    (action: string, target?: string) => {
      track('user_action', { action, target });
    },
    [track]
  );

  const trackSearch = useCallback(
    (query: string, filters: Record<string, unknown>) => {
      track('search', { query, filters });
    },
    [track]
  );

  const trackConversion = useCallback(
    (type: string, value?: number) => {
      track('conversion', { type, value });
    },
    [track]
  );

  return {
    track,
    trackPageView,
    trackUserAction,
    trackSearch,
    trackConversion,
  };
}

// ================================================
// NOTIFICATION MANAGEMENT
// ================================================

export function useNotificationManager() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message?: string;
      timestamp: Date;
      read: boolean;
    }>
  >([]);

  const addNotification = useCallback(
    (notification: {
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message?: string;
    }) => {
      const id = `notification-${Date.now()}`;
      setNotifications((prev) => [
        {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        },
        ...prev,
      ]);
      return id;
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
  };
}

// ================================================
// PERFORMANCE MONITORING
// ================================================

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    pageLoadTime?: number;
    apiResponseTimes: Record<string, number[]>;
    renderTimes: Record<string, number>;
  }>({
    apiResponseTimes: {},
    renderTimes: {},
  });

  const recordPageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime =
        window.performance.timing.loadEventEnd -
        window.performance.timing.navigationStart;
      setMetrics((prev) => ({ ...prev, pageLoadTime: loadTime }));
    }
  }, []);

  const recordApiCall = useCallback((endpoint: string, duration: number) => {
    setMetrics((prev) => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: [...(prev.apiResponseTimes[endpoint] || []), duration],
      },
    }));
  }, []);

  const recordRenderTime = useCallback(
    (component: string, duration: number) => {
      setMetrics((prev) => ({
        ...prev,
        renderTimes: {
          ...prev.renderTimes,
          [component]: duration,
        },
      }));
    },
    []
  );

  const getAverageApiTime = useCallback(
    (endpoint: string) => {
      const times = metrics.apiResponseTimes[endpoint] || [];
      return times.length > 0
        ? times.reduce((a, b) => a + b, 0) / times.length
        : 0;
    },
    [metrics.apiResponseTimes]
  );

  return {
    metrics,
    recordPageLoad,
    recordApiCall,
    recordRenderTime,
    getAverageApiTime,
  };
}

// ================================================
// EXPORTS
// ================================================

// Re-export auth state from shared hooks
export { useAuthState } from '../shared/useAuth';

// Re-export specific business hooks
export {
  useProfile,
  useAvatarUpload,
  useProfileValidation,
} from './useProfile';
export { useDashboard, useDashboardRefresh } from './useDashboard';
export { useProposal } from './useProposal';
export { useProposalEligibility } from './useProposalEligibility';
export { useFreelancerProposals } from './useFreelancerProposals';
export { useProposalNotifications } from './useProposalNotifications';
export {
  type ProposalNotificationData,
  type ProposalNotificationType,
} from './useProposalNotifications';
export { useReviewNotifications } from './useReviewNotifications';
export { useJobProposals } from './useJobProposals';
export {
  type JobProposalSummary,
  type JobProposalMap,
} from './useJobProposals';
export { useOrder } from './useOrder';
export { useProfileEdit } from './useProfileEdit';
export { useCommentSubmission } from './useCommentSubmission';
export {
  type CommentSubmissionData,
  type UseCommentSubmissionReturn,
  validateCommentContent,
} from './useCommentSubmission';
export { useCommentActions } from './useCommentActions';
export { type UseCommentActionsReturn } from './useCommentActions';
export {
  useCommentReports,
  REPORT_REASON_LABELS,
  REPORT_REASON_DESCRIPTIONS,
} from './useCommentReports';
export {
  type CommentReportReason,
  type CommentReportData,
  type UseCommentReportsReturn,
} from './useCommentReports';
export { useCommentModeration } from './useCommentModeration';
export {
  type CommentModerationStatus,
  type CommentModerationFilters,
  type CommentModerationData,
  type UseCommentModerationReturn,
  type BulkActionResult,
} from './useCommentModeration';
export { useSearchAnalytics } from './useSearchAnalytics';
export {
  type UseSearchAnalyticsOptions,
  type SearchAnalyticsState,
  type FormattedMetrics,
} from './useSearchAnalytics';

const BusinessHooks = {
  useUnifiedSearch,
  useFavoritesManager,
  useFilterManager,
  useBreadcrumbs,
  useAnalyticsTracker,
  useNotificationManager,
  usePerformanceMonitor,
};

export default BusinessHooks;
