/**
 * User Growth Analytics Widget
 * Displays user registration trends with real backend API
 *
 * @module components/admin/dashboard
 * @since Sprint 3 - Analytics & Reporting
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  getDailyNewUserTrend,
  getMonthlyNewUserTrend,
} from '@/lib/api/admin-analytics';
import { TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

type TimeFrame = 'daily' | 'monthly';

/**
 * User Growth Widget Component
 * Displays:
 * - Daily registration trends (last 30 days)
 * - Monthly registration trends (last 12 months)
 * - Growth rate indicators
 * - Visual trend chart
 */
export function UserGrowthWidget() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [dailyData, setDailyData] = useState<Map<string, number>>(new Map());
  const [monthlyData, setMonthlyData] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch daily trend (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        const dailyTrend = await getDailyNewUserTrend(
          startDate.toISOString(),
          endDate.toISOString()
        );
        setDailyData(new Map(Object.entries(dailyTrend)));

        // Fetch monthly trend (last 12 months)
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - 12);

        const monthlyTrend = await getMonthlyNewUserTrend(
          monthStart.toISOString()
        );
        setMonthlyData(new Map(Object.entries(monthlyTrend)));

        logger.info('User growth analytics loaded successfully');
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Failed to load user growth data';
        setError(errorMsg);
        logger.error(
          'Failed to fetch user growth analytics',
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGrowth();
  }, []);

  const currentData = timeFrame === 'daily' ? dailyData : monthlyData;
  const dataArray = Array.from(currentData.entries());

  // Calculate metrics
  const totalUsers = dataArray.reduce((sum, [, count]) => sum + count, 0);
  const avgPerPeriod = totalUsers / (dataArray.length || 1);

  // Calculate growth rate (comparing first half vs second half)
  const midpoint = Math.floor(dataArray.length / 2);
  const firstHalf = dataArray
    .slice(0, midpoint)
    .reduce((sum, [, count]) => sum + count, 0);
  const secondHalf = dataArray
    .slice(midpoint)
    .reduce((sum, [, count]) => sum + count, 0);
  const growthRate =
    firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

  // Find max for chart scaling
  const maxCount = Math.max(...Array.from(currentData.values()), 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Growth Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Growth Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Growth Analytics
          </CardTitle>

          {/* Time Frame Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFrame('daily')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                timeFrame === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeFrame('monthly')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                timeFrame === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Avg / Period</span>
            </div>
            <p className="text-2xl font-bold">{avgPerPeriod.toFixed(1)}</p>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">Growth Rate</span>
            </div>
            <p
              className={`text-2xl font-bold ${
                growthRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {growthRate >= 0 ? '+' : ''}
              {growthRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BarChart3 className="h-4 w-4" />
            <span>
              {timeFrame === 'daily' ? 'Daily' : 'Monthly'} Registration Trend
            </span>
          </div>

          <div className="space-y-1">
            {dataArray.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No data available for this period
              </p>
            ) : (
              dataArray.map(([date, count]) => {
                const percentage = (count / maxCount) * 100;
                const label =
                  timeFrame === 'daily'
                    ? new Date(date).toLocaleDateString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : date;

                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="w-16 text-right text-xs text-gray-600">
                      {label}
                    </span>
                    <div className="h-6 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="flex h-full items-center justify-end bg-gradient-to-r from-blue-500 to-blue-600 px-2 transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Period Info */}
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          <p>
            {timeFrame === 'daily' ? (
              <>Showing last 30 days of registration activity</>
            ) : (
              <>Showing last 12 months of registration activity</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
