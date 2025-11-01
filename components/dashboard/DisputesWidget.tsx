'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui';
import { useDisputeList } from '@/hooks/business/disputes/useDisputeList';

/**
 * DisputesWidget - Dashboard widget for disputes overview
 *
 * Features:
 * - Active disputes count
 * - Status breakdown (open, under review, resolved)
 * - Quick action button to disputes page
 * - Loading and error states
 *
 * @example
 * ```tsx
 * <DisputesWidget />
 * ```
 */
export const DisputesWidget: React.FC = () => {
  const { disputes, isLoading, error } = useDisputeList({ page: 0, size: 100 });

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    if (!disputes || disputes.length === 0) {
      return { open: 0, underReview: 0, resolved: 0, total: 0 };
    }

    const counts = disputes.reduce(
      (acc, dispute) => {
        if (dispute.status === 'OPEN') acc.open++;
        else if (dispute.status === 'UNDER_REVIEW') acc.underReview++;
        else if (dispute.status === 'RESOLVED') acc.resolved++;
        return acc;
      },
      { open: 0, underReview: 0, resolved: 0, total: disputes.length }
    );

    return counts;
  }, [disputes]);

  // Calculate active disputes (not resolved or closed)
  const activeCount = statusCounts.open + statusCounts.underReview;

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="font-semibold text-gray-900">İtirazlar</h3>
            <p className="text-sm text-red-600">Yüklenirken hata oluştu</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">İtirazlar</h3>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Yükleniyor...' : `${activeCount} aktif itiraz`}
            </p>
          </div>
        </div>

        <Link
          href="/disputes"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
        >
          Tümünü Gör →
        </Link>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {/* Open Disputes */}
        <div className="rounded-lg bg-red-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <Clock className="h-4 w-4 text-red-600" />
            <span className="text-xl font-bold text-red-900">
              {isLoading ? '...' : statusCounts.open}
            </span>
          </div>
          <p className="text-xs font-medium text-red-700">Açık</p>
        </div>

        {/* Under Review */}
        <div className="rounded-lg bg-yellow-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-xl font-bold text-yellow-900">
              {isLoading ? '...' : statusCounts.underReview}
            </span>
          </div>
          <p className="text-xs font-medium text-yellow-700">İncelemede</p>
        </div>

        {/* Resolved */}
        <div className="rounded-lg bg-green-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xl font-bold text-green-900">
              {isLoading ? '...' : statusCounts.resolved}
            </span>
          </div>
          <p className="text-xs font-medium text-green-700">Çözüldü</p>
        </div>
      </div>

      {/* Alert for Active Disputes */}
      {!isLoading && activeCount > 0 && (
        <div className="mt-4 rounded-lg bg-orange-50 p-3">
          <p className="text-xs text-orange-800">
            <strong>{activeCount} itiraz</strong> dikkat gerektiriyor.{' '}
            <Link
              href="/disputes"
              className="font-medium text-orange-900 hover:underline"
            >
              Detayları görüntüleyin
            </Link>
          </p>
        </div>
      )}

      {/* No Disputes State */}
      {!isLoading && statusCounts.total === 0 && (
        <div className="mt-4 rounded-lg bg-green-50 p-3">
          <p className="text-xs text-green-800">
            ✅ Harika! Şu anda aktif itirazınız yok.
          </p>
        </div>
      )}
    </Card>
  );
};

export default DisputesWidget;
