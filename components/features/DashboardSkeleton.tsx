'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface DashboardSkeletonProps {
  type?: 'freelancer' | 'employer';
}

export function DashboardSkeleton({
  type = 'freelancer',
}: DashboardSkeletonProps) {
  return (
    <div className={`space-y-4 p-4 lg:space-y-6 lg:p-6 skeleton-${type}`}>
      {/* Welcome Section Skeleton */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="h-6 w-96 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 rounded bg-gray-200"></div>
                  <div className="h-8 w-16 rounded bg-gray-200"></div>
                  <div className="h-3 w-24 rounded bg-gray-200"></div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Metrics Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="h-8 w-12 rounded bg-gray-200"></div>
                  <div className="h-3 w-20 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-200"></div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activity Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <div className="border-b border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 rounded bg-gray-200"></div>
                  <div className="h-8 w-20 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200"></div>
                      <div className="h-3 w-24 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-6 w-16 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats Summary Skeleton */}
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-40 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-gray-200"></div>
                    <div className="h-8 w-8 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-8 w-20 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
