/**
 * DASHBOARD NOTIFICATIONS PAGE
 *
 * Unified notification center for all user notifications
 * Sprint 1 - Route Cleanup: Moved from root /notifications
 *
 * Features:
 * - Real-time notifications
 * - Mark as read/unread
 * - Filter by type
 * - Notification preferences link
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import NotificationListClient from './NotificationListClient';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Bildirimler | MarifetBul',
  description: 'Tüm bildirimlerinizi görüntüleyin ve yönetin',
};

export default function DashboardNotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationListClient />
      </Suspense>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
