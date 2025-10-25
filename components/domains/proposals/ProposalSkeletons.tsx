'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Base skeleton element with pulse animation
 */
const Skeleton = memo<{ className?: string }>(({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
));
Skeleton.displayName = 'Skeleton';

/**
 * ProposalCardSkeleton Component
 *
 * Loading skeleton for ProposalCard components.
 * Matches the layout of actual proposal cards.
 *
 * @example
 * ```tsx
 * {loading ? (
 *   <ProposalCardSkeleton count={3} />
 * ) : (
 *   proposals.map(p => <ProposalCard key={p.id} proposal={p} />)
 * )}
 * ```
 */
export const ProposalCardSkeleton = memo<{ count?: number }>(
  ({ count = 1 }) => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-gray-200">
          <CardHeader className="space-y-3">
            {/* Header with badge and action */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" /> {/* Status badge */}
                <Skeleton className="h-6 w-24" /> {/* Date badge */}
              </div>
              <Skeleton className="h-5 w-5 rounded-full" /> {/* Menu icon */}
            </div>

            {/* Job title */}
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Cover letter preview */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
);
ProposalCardSkeleton.displayName = 'ProposalCardSkeleton';

/**
 * JobCardSkeleton Component
 *
 * Loading skeleton for JobCard components with proposal indicators.
 *
 * @example
 * ```tsx
 * {loading ? (
 *   <JobCardSkeleton layout="list" count={5} />
 * ) : (
 *   jobs.map(job => <JobCard key={job.id} job={job} layout="list" />)
 * )}
 * ```
 */
export const JobCardSkeleton = memo<{
  layout?: 'grid' | 'list';
  count?: number;
  showEmployerFeatures?: boolean;
}>(({ layout = 'list', count = 1, showEmployerFeatures = false }) => {
  if (layout === 'list') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Main content */}
                <div className="min-w-0 flex-1 space-y-4">
                  {/* Header with badges */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24" /> {/* Category */}
                    <Skeleton className="h-6 w-16" /> {/* Urgent/Popular */}
                  </div>

                  {/* Title */}
                  <Skeleton className="h-7 w-3/4" />

                  {/* Meta info */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                    {showEmployerFeatures && (
                      <>
                        <Skeleton className="h-8 w-28 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-20" />
                    ))}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end">
                  <Skeleton className="h-8 w-32" /> {/* Budget */}
                  <Skeleton className="h-6 w-24" /> {/* Level badge */}
                  <Skeleton className="h-10 w-32 rounded-lg" /> {/* Button */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  // Grid layout
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-gray-200">
          <CardHeader className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>

            {/* Title */}
            <Skeleton className="h-6 w-full" />

            {/* Meta */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>

            {/* Employer features */}
            {showEmployerFeatures && (
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
            )}

            {/* Timeline */}
            <Skeleton className="h-12 rounded-lg" />

            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t pt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
});
JobCardSkeleton.displayName = 'JobCardSkeleton';

/**
 * ProposalDetailSkeleton Component
 *
 * Loading skeleton for ProposalDetailModal content.
 *
 * @example
 * ```tsx
 * {loadingDetails ? (
 *   <ProposalDetailSkeleton />
 * ) : (
 *   <ProposalDetails proposal={proposal} />
 * )}
 * ```
 */
export const ProposalDetailSkeleton = memo(() => (
  <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>

    {/* Freelancer preview */}
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </CardContent>
    </Card>

    {/* Stats grid */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg bg-gray-50 p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>

    {/* Cover letter */}
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex gap-3 border-t pt-6">
      <Skeleton className="h-11 flex-1 rounded-lg" />
      <Skeleton className="h-11 flex-1 rounded-lg" />
    </div>
  </div>
));
ProposalDetailSkeleton.displayName = 'ProposalDetailSkeleton';

/**
 * NotificationListSkeleton Component
 *
 * Loading skeleton for notification lists.
 *
 * @example
 * ```tsx
 * {loading ? (
 *   <NotificationListSkeleton count={5} />
 * ) : (
 *   notifications.map(n => <NotificationItem key={n.id} notification={n} />)
 * )}
 * ```
 */
export const NotificationListSkeleton = memo<{ count?: number }>(
  ({ count = 3 }) => (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-lg border border-gray-200 p-3"
        >
          <Skeleton className="h-10 w-10 rounded-lg" /> {/* Icon */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" /> {/* Title */}
            <Skeleton className="h-4 w-full" /> {/* Message */}
            <Skeleton className="h-3 w-24" /> {/* Time */}
          </div>
          <Skeleton className="h-2 w-2 rounded-full" /> {/* Unread dot */}
        </div>
      ))}
    </div>
  )
);
NotificationListSkeleton.displayName = 'NotificationListSkeleton';

/**
 * DashboardStatsSkeleton Component
 *
 * Loading skeleton for dashboard statistics cards.
 *
 * @example
 * ```tsx
 * {loading ? (
 *   <DashboardStatsSkeleton count={4} />
 * ) : (
 *   <DashboardStats data={stats} />
 * )}
 * ```
 */
export const DashboardStatsSkeleton = memo<{ count?: number }>(
  ({ count = 4 }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <Skeleton className="h-8 w-16" /> {/* Value */}
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" /> {/* Icon */}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
);
DashboardStatsSkeleton.displayName = 'DashboardStatsSkeleton';

/**
 * FormSkeleton Component
 *
 * Loading skeleton for form layouts.
 *
 * @example
 * ```tsx
 * {loading ? (
 *   <FormSkeleton fields={3} />
 * ) : (
 *   <ProposalForm />
 * )}
 * ```
 */
export const FormSkeleton = memo<{ fields?: number }>(({ fields = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-5 w-32" /> {/* Label */}
        <Skeleton className="h-10 w-full rounded-lg" /> {/* Input */}
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton className="h-11 flex-1 rounded-lg" />
      <Skeleton className="h-11 w-32 rounded-lg" />
    </div>
  </div>
));
FormSkeleton.displayName = 'FormSkeleton';
