/**
 * ModerationSidebar Component
 *
 * Sidebar with category breakdown, quick actions, and recent activity
 */

import { CategoryBreakdown } from './CategoryBreakdown';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import type { ModerationSidebarProps } from '../types/moderationDashboardTypes';

export function ModerationSidebar({
  stats,
  activities,
}: ModerationSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <CategoryBreakdown categories={stats?.categoryBreakdown || []} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity activities={activities} />
    </div>
  );
}
