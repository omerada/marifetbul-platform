/**
 * RecentActivity Component
 *
 * Card displaying recent moderation activities
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  ACTIVITY_DOT_COLORS,
  DEFAULT_ACTIVITIES,
} from '../utils/moderationConstants';
import type { RecentActivityProps } from '../types/moderationDashboardTypes';

export function RecentActivity({
  activities = DEFAULT_ACTIVITIES,
}: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Son Aktiviteler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${ACTIVITY_DOT_COLORS[activity.color]}`}
              ></div>
              <span className="text-gray-600">{activity.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
