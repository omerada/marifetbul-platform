/**
 * Dashboard Loading Skeleton
 * Provides smooth loading states for dashboard components
 * Sprint 1 - Epic 1.3: Loading States & Skeletons
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui';

// Simple skeleton component
function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

interface DashboardSkeletonProps {
  variant?: 'freelancer' | 'employer' | 'admin';
}

export function DashboardSkeleton({
  variant = 'freelancer',
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-8 w-64" />
          <SkeletonBox className="h-4 w-48" />
        </div>
        <SkeletonBox className="h-10 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-8 w-32" />
              <SkeletonBox className="h-3 w-20" />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1 */}
        <Card className="p-6">
          <div className="space-y-4">
            <SkeletonBox className="h-6 w-40" />
            <SkeletonBox className="h-64 w-full" />
          </div>
        </Card>

        {/* Chart 2 */}
        <Card className="p-6">
          <div className="space-y-4">
            <SkeletonBox className="h-6 w-40" />
            <SkeletonBox className="h-64 w-full" />
          </div>
        </Card>
      </div>

      {/* Recent Activity Skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <SkeletonBox className="h-6 w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SkeletonBox className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <SkeletonBox className="h-4 w-48" />
                    <SkeletonBox className="h-3 w-32" />
                  </div>
                </div>
                <SkeletonBox className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Additional variant-specific skeletons */}
      {variant === 'freelancer' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <SkeletonBox className="mb-4 h-6 w-40" />
            <SkeletonBox className="h-48 w-full" />
          </Card>
          <Card className="p-6">
            <SkeletonBox className="mb-4 h-6 w-32" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        </div>
      )}

      {variant === 'employer' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <SkeletonBox className="mb-4 h-6 w-40" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-20 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <SkeletonBox className="mb-4 h-6 w-40" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-20 w-full" />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Compact skeleton for mobile or sidebar views
 */
export function DashboardSkeletonCompact() {
  return (
    <div className="space-y-4 p-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <SkeletonBox className="mb-2 h-3 w-16" />
            <SkeletonBox className="h-6 w-20" />
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="p-4">
        <SkeletonBox className="mb-3 h-5 w-32" />
        <SkeletonBox className="h-40 w-full" />
      </Card>

      {/* Recent Items */}
      <Card className="p-4">
        <SkeletonBox className="mb-3 h-5 w-28" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <SkeletonBox className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-2 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Stats card skeleton - reusable component
 */
export function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-8 w-32" />
          <div className="flex items-center space-x-2">
            <SkeletonBox className="h-3 w-16" />
            <SkeletonBox className="h-3 w-12" />
          </div>
        </div>
        <SkeletonBox className="h-12 w-12 rounded-lg" />
      </div>
    </Card>
  );
}
