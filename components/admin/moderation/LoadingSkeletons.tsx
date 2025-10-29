/**
 * ================================================
 * LOADING SKELETONS FOR ADMIN MODERATION
 * ================================================
 * Reusable skeleton components for moderation UI
 * Provides consistent loading states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3: Production Readiness
 */

import React from 'react';

// ================================================
// COMMENT CARD SKELETON
// ================================================

export const CommentCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
    <div className="flex items-start gap-4">
      {/* Checkbox */}
      <div className="h-5 w-5 rounded bg-gray-200" />

      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>

        {/* Comment text */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ================================================
// STATS CARD SKELETON
// ================================================

export const StatsCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-8 w-16 rounded bg-gray-200" />
      </div>
      <div className="h-12 w-12 rounded-full bg-gray-200" />
    </div>
  </div>
);

// ================================================
// MODERATION QUEUE SKELETON
// ================================================

export const ModerationQueueSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex animate-pulse items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded bg-gray-200" />
        <div className="h-9 w-24 rounded bg-gray-200" />
      </div>
    </div>

    {/* Comment cards */}
    {[1, 2, 3, 4, 5].map((i) => (
      <CommentCardSkeleton key={i} />
    ))}

    {/* Pagination */}
    <div className="flex animate-pulse items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="flex gap-2">
        <div className="h-9 w-9 rounded bg-gray-200" />
        <div className="h-9 w-9 rounded bg-gray-200" />
        <div className="h-9 w-9 rounded bg-gray-200" />
      </div>
    </div>
  </div>
);

// ================================================
// DASHBOARD WIDGET SKELETON
// ================================================

export const DashboardWidgetSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
    <div className="space-y-4">
      {/* Title */}
      <div className="h-6 w-48 rounded bg-gray-200" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
      </div>

      {/* Chart/List */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full rounded bg-gray-200" />
        ))}
      </div>
    </div>
  </div>
);

// ================================================
// RECENT COMMENTS SKELETON
// ================================================

export const RecentCommentsSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-16 rounded bg-gray-200" />
              <div className="h-6 w-16 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ================================================
// EXPORTS
// ================================================

const LoadingSkeletons = {
  CommentCardSkeleton,
  StatsCardSkeleton,
  ModerationQueueSkeleton,
  DashboardWidgetSkeleton,
  RecentCommentsSkeleton,
};

export default LoadingSkeletons;
