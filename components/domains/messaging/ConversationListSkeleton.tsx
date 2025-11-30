'use client';

import { Card } from '@/components/ui';

/**
 * Skeleton loading state for conversation list
 * Shows placeholder items while conversations are loading
 */
export function ConversationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar Skeleton */}
            <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />

            {/* Content Skeleton */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
