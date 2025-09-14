// ================================================
// BUSINESS HOOKS - DOMAIN-SPECIFIC LOGIC PATTERNS
// ================================================
// Unified hooks for business logic and domain operations

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage, useDebounce } from '../base';
import {
  useCurrentUser,
  useUserSearch,
  useJobsSearch,
  usePackagesSearch,
  useFavorites,
  useToggleFavorite,
  type User,
  type SearchFilters,
} from '../api';

// ================================================
// AUTHENTICATION BUSINESS LOGIC
// ================================================

export function useAuthState() {
  const currentUser = useCurrentUser();
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(
    'isAuthenticated',
    false
  );

  useEffect(() => {
    if (currentUser.data) {
      setIsAuthenticated(true);
    } else if (currentUser.error) {
      setIsAuthenticated(false);
    }
  }, [currentUser.data, currentUser.error, setIsAuthenticated]);

  const isLoading = currentUser.isLoading;
  const user = currentUser.data;
  const error = currentUser.error;

  const hasRole = useCallback(
    (role: User['role']) => {
      return user?.role === role;
    },
    [user?.role]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      // Implement permission logic based on user role
      if (!user) return false;

      switch (permission) {
        case 'admin':
          return user.role === 'admin';
        case 'create_job':
          return user.role === 'client' || user.role === 'admin';
        case 'create_package':
          return user.role === 'freelancer' || user.role === 'admin';
        case 'manage_users':
          return user.role === 'admin';
        default:
          return true;
      }
    },
    [user]
  );

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    hasRole,
    hasPermission,
    isFreelancer: user?.role === 'freelancer',
    isClient: user?.role === 'client',
    isAdmin: user?.role === 'admin',
  };
}

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
      setFilters((prev) => ({ ...prev, [key]: value }));
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
        jobs: favorites.data.jobs.map((job) => job.id),
        packages: favorites.data.packages.map((pkg) => pkg.id),
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
        favorites.refetch();
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
        favorites.refetch();
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
    isLoading: favorites.isLoading,
    error: favorites.error,
    isJobFavorite,
    isPackageFavorite,
    toggleJobFavorite,
    togglePackageFavorite,
    refetch: favorites.refetch,
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
      // Implement analytics tracking
      console.log('Analytics:', event, {
        userId: user?.id,
        timestamp: new Date().toISOString(),
        ...properties,
      });

      // Here you would integrate with your analytics service
      // e.g., Google Analytics, Mixpanel, etc.
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

const BusinessHooks = {
  useAuthState,
  useUnifiedSearch,
  useFavoritesManager,
  useFilterManager,
  useBreadcrumbs,
  useAnalyticsTracker,
  useNotificationManager,
  usePerformanceMonitor,
};

export default BusinessHooks;
