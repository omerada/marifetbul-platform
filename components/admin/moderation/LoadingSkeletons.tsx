/**
 * ================================================
 * COMMENT MODERATION LOADING SKELETONS
 * ================================================
 * Loading skeleton components for comment moderation
 * Provides consistent loading experience
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React from 'react';

// ================================================
// COMMENT CARD SKELETON
// ================================================

export function CommentCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="h-5 w-5 rounded bg-gray-200"></div>

        {/* Avatar and content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>

              {/* Author info */}
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200"></div>
                <div className="h-3 w-24 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Status badge */}
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          </div>

          {/* Comment content */}
          <div className="mb-3 ml-12 space-y-2 rounded-lg bg-gray-50 p-3">
            <div className="h-3 w-full rounded bg-gray-200"></div>
            <div className="h-3 w-5/6 rounded bg-gray-200"></div>
            <div className="h-3 w-4/6 rounded bg-gray-200"></div>
          </div>

          {/* Actions */}
          <div className="ml-12 flex items-center gap-2">
            <div className="h-8 w-24 rounded-lg bg-gray-200"></div>
            <div className="h-8 w-24 rounded-lg bg-gray-200"></div>
            <div className="h-8 w-20 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// STATS CARD SKELETON
// ================================================

export function StatsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-5 rounded bg-gray-200"></div>
        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
      <div className="mb-2 h-8 w-16 rounded bg-gray-200"></div>
      <div className="h-3 w-20 rounded bg-gray-200"></div>
    </div>
  );
}

// ================================================
// MODERATION QUEUE SKELETON
// ================================================

export function ModerationQueueSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-64 rounded bg-gray-200"></div>
          <div className="h-4 w-48 rounded bg-gray-200"></div>
        </div>
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Search and Filters */}
      <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="h-10 flex-1 rounded-lg bg-gray-200"></div>
          <div className="h-10 w-24 rounded-lg bg-gray-200"></div>
        </div>
      </div>

      {/* Comment Cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <CommentCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex animate-pulse items-center justify-between">
        <div className="h-4 w-48 rounded bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
          <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
          <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
          <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// DASHBOARD WIDGET SKELETON
// ================================================

export function DashboardWidgetSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-gray-50 p-6">
        <div className="mb-2 h-4 w-24 rounded bg-gray-200"></div>
        <div className="h-10 w-20 rounded bg-gray-200"></div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 h-3 w-16 rounded bg-gray-200"></div>
            <div className="h-8 w-12 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>

      <div className="h-10 rounded-lg bg-gray-200"></div>
    </div>
  );
}

// ================================================
// RECENT COMMENTS SKELETON
// ================================================

export function RecentCommentsSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-gray-200"></div>
        <div className="h-4 w-20 rounded bg-gray-200"></div>
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200"></div>
                <div className="h-3 w-24 rounded bg-gray-200"></div>
              </div>
              <div className="h-5 w-16 rounded-full bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-200"></div>
              <div className="h-3 w-3/4 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const LoadingSkeletons = {
  CommentCardSkeleton,
  StatsCardSkeleton,
  ModerationQueueSkeleton,
  DashboardWidgetSkeleton,
  RecentCommentsSkeleton,
};

export default LoadingSkeletons;
