/**
 * Portfolio Analytics Hook
 * Sprint 1: Story 3 - Analytics Dashboard
 *
 * Provides portfolio analytics and statistics
 */

import { useMemo } from 'react';
import useSWR from 'swr';
import { getMyPortfolio, type PortfolioResponse } from '@/lib/api/portfolio';
import { useAuthState } from '@/hooks/shared/useAuth';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface PortfolioAnalytics {
  // Overview metrics
  totalPortfolios: number;
  totalViews: number;
  averageViews: number;
  publicPortfolios: number;
  privatePortfolios: number;

  // Top performers
  topViewedPortfolios: PortfolioResponse[];
  leastViewedPortfolios: PortfolioResponse[];

  // Category breakdown
  categoryDistribution: Array<{ name: string; value: number; count: number }>;

  // Skills analysis
  topSkills: Array<{ skill: string; count: number; totalViews: number }>;

  // Time-based data (for charts)
  viewTrend: Array<{
    portfolio: string;
    views: number;
    title: string;
  }>;
}

export interface UsePortfolioAnalyticsReturn {
  analytics: PortfolioAnalytics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePortfolioAnalytics(): UsePortfolioAnalyticsReturn {
  const { user } = useAuthState();

  // Fetch all user's portfolios
  const {
    data: portfolios,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<PortfolioResponse[]>(
    user?.id ? '/portfolios/analytics/my' : null,
    () => getMyPortfolio(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!portfolios || portfolios.length === 0) return null;

    logger.debug('[usePortfolioAnalytics] Calculating analytics', { countportfolioslength,  });

    // Basic metrics
    const totalPortfolios = portfolios.length;
    const totalViews = portfolios.reduce((sum, p) => sum + p.viewCount, 0);
    const averageViews = totalViews / totalPortfolios;
    const publicPortfolios = portfolios.filter((p) => p.isPublic).length;
    const privatePortfolios = totalPortfolios - publicPortfolios;

    // Top performers (sorted by views)
    const sortedByViews = [...portfolios].sort(
      (a, b) => b.viewCount - a.viewCount
    );
    const topViewedPortfolios = sortedByViews.slice(0, 5);
    const leastViewedPortfolios = sortedByViews.slice(-5).reverse();

    // Category distribution
    const categoryMap = new Map<
      string,
      { count: number; totalViews: number }
    >();
    portfolios.forEach((p) => {
      const category = p.category || 'Kategorizilmemiş';
      const existing = categoryMap.get(category) || {
        count: 0,
        totalViews: 0,
      };
      categoryMap.set(category, {
        count: existing.count + 1,
        totalViews: existing.totalViews + p.viewCount,
      });
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.totalViews,
        count: data.count,
      }))
      .sort((a, b) => b.value - a.value);

    // Skills analysis
    const skillsMap = new Map<string, { count: number; totalViews: number }>();
    portfolios.forEach((p) => {
      if (p.skills && p.skills.length > 0) {
        p.skills.forEach((skill) => {
          const existing = skillsMap.get(skill) || { count: 0, totalViews: 0 };
          skillsMap.set(skill, {
            count: existing.count + 1,
            totalViews: existing.totalViews + p.viewCount,
          });
        });
      }
    });

    const topSkills = Array.from(skillsMap.entries())
      .map(([skill, data]) => ({
        skill,
        count: data.count,
        totalViews: data.totalViews,
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10);

    // View trend (for line chart)
    const viewTrend = portfolios
      .map((p) => ({
        portfolio: p.id,
        views: p.viewCount,
        title: p.title,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10); // Top 10 for chart

    return {
      totalPortfolios,
      totalViews,
      averageViews: Math.round(averageViews * 10) / 10, // 1 decimal
      publicPortfolios,
      privatePortfolios,
      topViewedPortfolios,
      leastViewedPortfolios,
      categoryDistribution,
      topSkills,
      viewTrend,
    };
  }, [portfolios]);

  return {
    analytics,
    isLoading,
    error: error || null,
    refresh: async () => {
      await refresh();
    },
  };
}

export default usePortfolioAnalytics;
