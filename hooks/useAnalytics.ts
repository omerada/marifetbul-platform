import { useCallback, useEffect } from 'react';
import { useAnalyticsStore } from '@/lib/store/analyticsStore';
import type {
  AnalyticsTimeframe,
  AnalyticsFilters,
  AnalyticsExport,
  FreelancerAnalytics,
  EmployerAnalytics,
} from '@/types';

export function useAnalytics(
  userType: 'freelancer' | 'employer',
  autoLoad = true
) {
  const {
    analytics,
    timeframe,
    filters,
    isLoading,
    error,
    lastUpdated,
    fetchAnalytics,
    updateTimeframe,
    updateFilters,
    exportAnalytics,
    refreshAnalytics,
    clearError,
    reset,
  } = useAnalyticsStore();

  // Load analytics when component mounts
  useEffect(() => {
    if (autoLoad) {
      fetchAnalytics(userType);
    }
  }, [userType, fetchAnalytics, autoLoad]);

  // Memoized functions
  const handleTimeframeChange = useCallback(
    (newTimeframe: AnalyticsTimeframe) => {
      updateTimeframe(newTimeframe);
      fetchAnalytics(userType, newTimeframe);
    },
    [updateTimeframe, fetchAnalytics, userType]
  );

  const handleFiltersChange = useCallback(
    (newFilters: Partial<AnalyticsFilters>) => {
      updateFilters(newFilters);
      // Optionally refetch with new filters
      fetchAnalytics(userType, filters.timeframe);
    },
    [updateFilters, fetchAnalytics, userType, filters.timeframe]
  );

  const handleExport = useCallback(
    async (options: AnalyticsExport) => {
      return await exportAnalytics(options);
    },
    [exportAnalytics]
  );

  const handleRefresh = useCallback(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  // Type guards for analytics data
  const freelancerAnalytics = analytics as FreelancerAnalytics | null;
  const employerAnalytics = analytics as EmployerAnalytics | null;
  const isFreelancerAnalytics = analytics && 'earnings' in analytics;
  const isEmployerAnalytics = analytics && 'spending' in analytics;

  return {
    // State
    analytics,
    timeframe,
    filters,
    isLoading,
    error,
    lastUpdated,

    // Actions
    changeTimeframe: handleTimeframeChange,
    updateFilters: handleFiltersChange,
    exportData: handleExport,
    refresh: handleRefresh,
    clearError,
    reset,

    // Computed values
    hasData: !!analytics,
    isFreelancer: isFreelancerAnalytics,
    isEmployer: isEmployerAnalytics,

    // Quick access to common metrics
    overview: analytics?.overview,
    totalEarnings: isFreelancerAnalytics
      ? freelancerAnalytics?.overview.totalEarnings || 0
      : 0,
    totalSpent: isEmployerAnalytics
      ? employerAnalytics?.overview.totalSpent || 0
      : 0,
    completedOrders: isFreelancerAnalytics
      ? freelancerAnalytics?.overview.completedOrders || 0
      : 0,
    completedProjects: isEmployerAnalytics
      ? employerAnalytics?.overview.completedProjects || 0
      : 0,

    // Chart data helpers
    earningsTrend: isFreelancerAnalytics
      ? freelancerAnalytics?.earnings.earningsTrend || []
      : [],
    spendingTrend: isEmployerAnalytics
      ? employerAnalytics?.spending.spendingTrend || []
      : [],
  };
}

// Simplified hook for dashboard widgets
export function useAnalyticsSummary(userType: 'freelancer' | 'employer') {
  const { analytics, isLoading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics(userType);
  }, [userType, fetchAnalytics]);

  const freelancerAnalytics = analytics as FreelancerAnalytics | null;
  const employerAnalytics = analytics as EmployerAnalytics | null;

  if (!analytics) {
    return {
      overview: null,
      isLoading,
      error,
    };
  }

  return {
    overview: analytics.overview,
    isLoading,
    error,
    totalEarnings:
      userType === 'freelancer'
        ? freelancerAnalytics?.overview.totalEarnings || 0
        : 0,
    totalSpent:
      userType === 'employer' ? employerAnalytics?.overview.totalSpent || 0 : 0,
    completedOrders:
      userType === 'freelancer'
        ? freelancerAnalytics?.overview.completedOrders || 0
        : 0,
    completedProjects:
      userType === 'employer'
        ? employerAnalytics?.overview.completedProjects || 0
        : 0,
    activeOrders:
      userType === 'freelancer'
        ? freelancerAnalytics?.overview.activeOrders || 0
        : 0,
    activeProjects:
      userType === 'employer'
        ? employerAnalytics?.overview.activeProjects || 0
        : 0,
  };
}

// Hook for specific chart data
export function useAnalyticsChart(
  userType: 'freelancer' | 'employer',
  chartType: 'earnings' | 'orders' | 'spending' | 'projects'
) {
  const { analytics, isLoading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics(userType);
  }, [userType, fetchAnalytics]);

  const getChartData = useCallback(() => {
    if (!analytics) return [];

    const freelancerAnalytics = analytics as FreelancerAnalytics;
    const employerAnalytics = analytics as EmployerAnalytics;

    if (userType === 'freelancer' && 'earnings' in analytics) {
      switch (chartType) {
        case 'earnings':
          return freelancerAnalytics.earnings.earningsTrend;
        case 'orders':
          return freelancerAnalytics.orders.ordersTrend;
        default:
          return [];
      }
    }

    if (userType === 'employer' && 'spending' in analytics) {
      switch (chartType) {
        case 'spending':
          return employerAnalytics.spending.spendingTrend;
        case 'projects':
          return employerAnalytics.projects.projectsTrend;
        default:
          return [];
      }
    }

    return [];
  }, [analytics, userType, chartType]);

  return {
    data: getChartData(),
    isLoading,
    error,
  };
}

// Hook for KPI cards
export function useKPICards(userType: 'freelancer' | 'employer') {
  const { analytics } = useAnalyticsStore();

  const getKPICards = useCallback(() => {
    if (!analytics) return [];

    const { overview } = analytics;

    if (userType === 'freelancer' && 'totalEarnings' in overview) {
      return [
        {
          id: 'total-earnings',
          title: 'Toplam Kazanç',
          value: overview.totalEarnings,
          formattedValue: `₺${overview.totalEarnings.toLocaleString('tr-TR')}`,
          unit: '₺',
          icon: 'currency',
          color: 'green' as const,
        },
        {
          id: 'completed-orders',
          title: 'Tamamlanan Sipariş',
          value: overview.completedOrders,
          formattedValue: overview.completedOrders.toString(),
          icon: 'check',
          color: 'blue' as const,
        },
        {
          id: 'client-satisfaction',
          title: 'Müşteri Memnuniyeti',
          value: overview.clientSatisfaction,
          formattedValue: `${overview.clientSatisfaction}/5`,
          icon: 'star',
          color: 'orange' as const,
        },
        {
          id: 'response-time',
          title: 'Yanıt Süresi',
          value: overview.responseTime,
          formattedValue: overview.responseTime,
          icon: 'clock',
          color: 'purple' as const,
        },
      ];
    }

    if (userType === 'employer' && 'totalSpent' in overview) {
      const employerOverview = overview as EmployerAnalytics['overview'];
      return [
        {
          id: 'total-spent',
          title: 'Toplam Harcama',
          value: employerOverview.totalSpent,
          formattedValue: `₺${employerOverview.totalSpent.toLocaleString('tr-TR')}`,
          unit: '₺',
          icon: 'currency',
          color: 'red' as const,
        },
        {
          id: 'completed-projects',
          title: 'Tamamlanan Proje',
          value: overview.completedProjects || 0,
          formattedValue: (overview.completedProjects || 0).toString(),
          icon: 'check',
          color: 'blue' as const,
        },
        {
          id: 'active-projects',
          title: 'Aktif Proje',
          value: overview.activeProjects || 0,
          formattedValue: (overview.activeProjects || 0).toString(),
          icon: 'play',
          color: 'green' as const,
        },
        {
          id: 'avg-cost',
          title: 'Ortalama Proje Maliyeti',
          value: employerOverview.averageProjectCost || 0,
          formattedValue: `₺${(employerOverview.averageProjectCost || 0).toLocaleString('tr-TR')}`,
          unit: '₺',
          icon: 'calculator',
          color: 'purple' as const,
        },
      ];
    }

    return [];
  }, [analytics, userType]);

  return {
    kpiCards: getKPICards(),
  };
}
