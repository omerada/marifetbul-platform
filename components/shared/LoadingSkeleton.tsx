/**
 * Reusable Loading Skeleton Components
 * Sprint 1.2.3 - Enhanced Loading States
 */

import React from 'react';
import { Card } from '@/components/ui/Card';

export const OrderCardSkeleton = () => {
  return (
    <Card className="animate-pulse p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 rounded bg-gray-200" />
            <div className="h-4 w-48 rounded bg-gray-200" />
          </div>
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>

        {/* Package info */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 border-t pt-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded bg-gray-200" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded bg-gray-200" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t pt-4">
          <div className="h-9 flex-1 rounded bg-gray-200" />
          <div className="h-9 flex-1 rounded bg-gray-200" />
        </div>
      </div>
    </Card>
  );
};

export const OrderListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const OrderDetailSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 animate-pulse">
        <div className="mb-4 h-4 w-32 rounded bg-gray-200" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-5 w-32 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-6 w-32 rounded bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Buyer/Seller Info Card */}
          <Card className="animate-pulse p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 rounded bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-200" />
              </div>
              <div className="h-9 w-24 rounded bg-gray-200" />
            </div>
          </Card>

          {/* Order Details Card */}
          <Card className="animate-pulse p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div className="space-y-4">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-4/6 rounded bg-gray-200" />
              <div className="mt-4 h-32 w-full rounded bg-gray-200" />
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="animate-pulse p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="animate-pulse p-6">
            <div className="mb-4 h-5 w-24 rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-gray-200" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          </Card>

          {/* Escrow Card */}
          <Card className="animate-pulse p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const StatsCardSkeleton = () => {
  return (
    <Card className="animate-pulse p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-6 w-16 rounded bg-gray-200" />
        </div>
        <div className="h-12 w-12 rounded-lg bg-gray-200" />
      </div>
    </Card>
  );
};
