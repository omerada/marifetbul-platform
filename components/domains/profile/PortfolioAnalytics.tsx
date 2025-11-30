'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { PortfolioItem } from '@/types';
import { Eye, TrendingUp, Award, Calendar } from 'lucide-react';

interface PortfolioAnalyticsProps {
  portfolios: PortfolioItem[];
}

export function PortfolioAnalytics({ portfolios }: PortfolioAnalyticsProps) {
  // Calculate analytics with memoization for performance
  const analytics = React.useMemo(() => {
    const totalViews = portfolios.reduce(
      (sum, item) => sum + (item.viewCount || 0),
      0
    );

    const averageViews =
      portfolios.length > 0 ? Math.round(totalViews / portfolios.length) : 0;

    // Find most viewed portfolio
    const mostViewed = portfolios.reduce((prev, current) => {
      return (current.viewCount || 0) > (prev.viewCount || 0) ? current : prev;
    }, portfolios[0]);

    // Calculate views from last 7 days (simulated)
    const recentViews = Math.round(totalViews * 0.3);

    return { totalViews, averageViews, mostViewed, recentViews };
  }, [portfolios]);

  if (portfolios.length === 0) {
    return null;
  }

  const { totalViews, averageViews, mostViewed, recentViews } = analytics;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Views */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-sm font-medium text-gray-600"
              id="total-views-label"
            >
              Toplam Görüntüleme
            </p>
            <p
              className="mt-1 text-2xl font-bold text-gray-900"
              aria-labelledby="total-views-label"
            >
              {totalViews}
            </p>
          </div>
          <div className="rounded-full bg-blue-100 p-3" aria-hidden="true">
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Average Views per Portfolio */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Ortalama Görüntüleme
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {averageViews}
            </p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Most Viewed Portfolio */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600">En Popüler</p>
            <p className="mt-1 truncate text-lg font-bold text-gray-900">
              {mostViewed?.title || '-'}
            </p>
            <p className="text-sm text-gray-500">
              {mostViewed?.viewCount || 0} görüntüleme
            </p>
          </div>
          <div className="rounded-full bg-yellow-100 p-3">
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </Card>

      {/* Recent Views (Last 7 days) */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Son 7 Gün</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {recentViews}
            </p>
            <p className="text-xs text-gray-500">
              ~{Math.round((recentViews / totalViews) * 100)}% of total
            </p>
          </div>
          <div className="rounded-full bg-purple-100 p-3">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
