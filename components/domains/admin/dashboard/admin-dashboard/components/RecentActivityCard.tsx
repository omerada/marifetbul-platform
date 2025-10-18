/**
 * RecentActivityCard Component
 *
 * Recent activity list display
 */

import { Activity, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  DEFAULT_ACTIVITIES,
  ACTIVITY_COLOR_MAP,
} from '../utils/dashboardConstants';
import type { RecentActivityCardProps } from '../types/adminDashboardTypes';

export function RecentActivityCard({
  activities = DEFAULT_ACTIVITIES,
}: RecentActivityCardProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 shadow-md">
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Son Aktiviteler
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            const colorClass = ACTIVITY_COLOR_MAP[activity.color];

            return (
              <div
                key={index}
                className="group flex items-start space-x-4 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 transition-all duration-300 hover:border-gray-200 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 ${colorClass}`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {activity.detail}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
