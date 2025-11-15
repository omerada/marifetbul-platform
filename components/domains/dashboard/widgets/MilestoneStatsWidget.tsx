/**
 * ================================================
 * MILESTONE STATS WIDGET
 * ================================================
 * Dashboard widget showing milestone statistics
 *
 * Features:
 * - Pending milestones count
 * - In-progress milestones count
 * - Completed milestones count
 * - Click to navigate to milestone list
 * - Loading state
 * - Empty state
 *
 * Sprint 1 - Story 1.5: Dashboard Stats
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useOrderMilestones } from '@/hooks/business/useMilestones';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ================================================
// TYPES
// ================================================

interface MilestoneStatsWidgetProps {
  /** Order ID to show milestones for (optional, shows all if not provided) */
  orderId?: string;
  /** Show compact version */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

interface MilestoneStats {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}

// ================================================
// HELPERS
// ================================================

/**
 * Calculate milestone statistics from milestone list
 */
function calculateStats(milestones: OrderMilestone[]): MilestoneStats {
  const stats: MilestoneStats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: milestones.length,
  };

  milestones.forEach((milestone) => {
    switch (milestone.status) {
      case 'PENDING':
        stats.pending++;
        break;
      case 'IN_PROGRESS':
      case 'DELIVERED':
      case 'REVISION_REQUESTED':
        stats.inProgress++;
        break;
      case 'ACCEPTED':
        stats.completed++;
        break;
      case 'CANCELED':
        // Don't count canceled milestones
        break;
    }
  });

  return stats;
}

// ================================================
// COMPONENT
// ================================================

export function MilestoneStatsWidget({
  orderId,
  compact = false,
  className = '',
}: MilestoneStatsWidgetProps) {
  // Fetch milestones
  const { milestones, isLoading, error } = useOrderMilestones(orderId);

  // Calculate stats
  const stats = useMemo(() => {
    if (!milestones) return null;
    return calculateStats(milestones);
  }, [milestones]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Milestone İstatistikleri</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">İstatistikler yüklenemedi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!stats || stats.total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold">Milestone İstatistikleri</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              Henüz milestone bulunmuyor
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Milestone tabanlı paketler oluşturduğunuzda burada görünecek
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact version (for sidebar or limited space)
  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Bekleyen
              </span>
              <Badge
                variant="outline"
                className="border-yellow-200 bg-yellow-50 text-yellow-700"
              >
                {stats.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                Devam Eden
              </span>
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700"
              >
                {stats.inProgress}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4" />
                Tamamlanan
              </span>
              <Badge
                variant="outline"
                className="border-green-200 bg-green-50 text-green-700"
              >
                {stats.completed}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Milestone İstatistikleri</h3>
          </div>
          {orderId && (
            <Link
              href={`/dashboard/orders/${orderId}/milestones`}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Tümünü Gör →
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Pending */}
          <Link
            href={
              orderId
                ? `/dashboard/orders/${orderId}/milestones?filter=pending`
                : '/dashboard/orders?filter=milestones-pending'
            }
            className="group block rounded-lg border border-yellow-200 bg-yellow-50 p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">
                  {stats.pending}
                </p>
                <p className="text-sm text-yellow-600">Bekleyen</p>
              </div>
            </div>
          </Link>

          {/* In Progress */}
          <Link
            href={
              orderId
                ? `/dashboard/orders/${orderId}/milestones?filter=in-progress`
                : '/dashboard/orders?filter=milestones-active'
            }
            className="group block rounded-lg border border-blue-200 bg-blue-50 p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.inProgress}
                </p>
                <p className="text-sm text-blue-600">Devam Eden</p>
              </div>
            </div>
          </Link>

          {/* Completed */}
          <Link
            href={
              orderId
                ? `/dashboard/orders/${orderId}/milestones?filter=completed`
                : '/dashboard/orders?filter=milestones-completed'
            }
            className="group block rounded-lg border border-green-200 bg-green-50 p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {stats.completed}
                </p>
                <p className="text-sm text-green-600">Tamamlanan</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Total summary */}
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-sm text-gray-600">
            Toplam{' '}
            <span className="font-semibold text-gray-900">{stats.total}</span>{' '}
            milestone
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MilestoneStatsWidget;
