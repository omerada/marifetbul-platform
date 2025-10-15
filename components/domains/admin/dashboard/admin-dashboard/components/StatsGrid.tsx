/**
 * StatsGrid Component
 *
 * Dashboard statistics grid
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getStatColorConfig } from '../utils/dashboardHelpers';
import type { StatsGridProps } from '../types/adminDashboardTypes';

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const colorConfig = getStatColorConfig(stat.name);
        const IconComponent = stat.icon;
        const isPositive = stat.trend === 'up';

        return (
          <Card
            key={index}
            className="group relative overflow-hidden border-2 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <div
              className={`absolute top-0 left-0 h-full w-1.5 ${colorConfig.gradient}`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {stat.name}
              </CardTitle>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorConfig.bg} ${colorConfig.text} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-gray-900">
                {stat.value}
              </div>
              <div className="mt-2 flex items-center space-x-2 text-sm">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
