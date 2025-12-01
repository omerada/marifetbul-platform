/**
 * DASHBOARD NOTIFICATIONS PAGE
 *
 * Unified notification center for all user notifications
 * Sprint 8 - Story 6: Comprehensive Notification Center
 *
 * Features:
 * - Real-time notifications via WebSocket
 * - Filter by type (all/unread/payment/order/message)
 * - Bulk actions (mark all read, archive, delete)
 * - Checkbox selection
 * - Pagination with infinite scroll
 * - Mark as read/unread
 */

'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationCenter } from '@/components/domains/notifications';
import { Skeleton } from '@/components/ui/skeleton';

function NotificationCenterContent() {
  const router = useRouter();
  
  return (
    <NotificationCenter
      className="w-full"
      maxHeight="h-[calc(100vh-12rem)]"
      onSettingsClick={() => router.push('/dashboard/settings/notifications')}
    />
  );
}

export default function DashboardNotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationCenterContent />
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
