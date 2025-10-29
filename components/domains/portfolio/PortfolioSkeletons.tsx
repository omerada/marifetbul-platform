/**
 * Portfolio Skeleton Components
 * Sprint 2: Story 4.2 - Loading States & Skeletons
 *
 * Skeleton loaders for better perceived performance
 */

import React from 'react';

// ============================================================================
// PORTFOLIO CARD SKELETON
// ============================================================================

export function PortfolioCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Image Skeleton */}
      <div className="aspect-video w-full animate-pulse bg-gray-200" />

      {/* Content Skeleton */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Skills */}
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PORTFOLIO LIST SKELETON
// ============================================================================

interface PortfolioListSkeletonProps {
  count?: number;
}

export function PortfolioListSkeleton({
  count = 6,
}: PortfolioListSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <PortfolioCardSkeleton key={index} />
      ))}
    </div>
  );
}

// ============================================================================
// PORTFOLIO REORDER ITEM SKELETON
// ============================================================================

export function PortfolioReorderItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      {/* Drag Handle */}
      <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />

      {/* Thumbnail */}
      <div className="h-12 w-12 animate-pulse rounded bg-gray-200" />

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Metadata */}
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

// ============================================================================
// PORTFOLIO REORDER LIST SKELETON
// ============================================================================

interface PortfolioReorderListSkeletonProps {
  count?: number;
}

export function PortfolioReorderListSkeleton({
  count = 5,
}: PortfolioReorderListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <PortfolioReorderItemSkeleton key={index} />
      ))}
    </div>
  );
}

// ============================================================================
// ANALYTICS CARD SKELETON
// ============================================================================

export function AnalyticsCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        {/* Title */}
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

        {/* Value */}
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />

        {/* Subtitle */}
        <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS CHART SKELETON
// ============================================================================

export function AnalyticsChartSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        {/* Title */}
        <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />

        {/* Chart */}
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS DASHBOARD SKELETON
// ============================================================================

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AnalyticsCardSkeleton key={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <AnalyticsChartSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PORTFOLIO TABLE ROW SKELETON
// ============================================================================

export function PortfolioTableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </td>
    </tr>
  );
}

// ============================================================================
// PORTFOLIO TABLE SKELETON
// ============================================================================

interface PortfolioTableSkeletonProps {
  rows?: number;
}

export function PortfolioTableSkeleton({
  rows = 5,
}: PortfolioTableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-300" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <PortfolioTableRowSkeleton key={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// GENERIC LOADING SKELETON
// ============================================================================

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({
  className = 'h-4 w-full',
  count = 1,
}: SkeletonProps) {
  if (count === 1) {
    return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded bg-gray-200 ${className}`}
        />
      ))}
    </div>
  );
}
