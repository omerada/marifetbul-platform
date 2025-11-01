/**
 * ================================================
 * DISPUTE LIST COMPONENT
 * ================================================
 * Container component for displaying disputes list
 *
 * Features:
 * - Grid/List layout
 * - Empty state
 * - Loading state
 * - Pagination
 * - Filtering
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 16: Dispute System Completion
 */

'use client';

import React, { useState } from 'react';
import { DisputeCard } from './DisputeCard';
import { Loading } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import type { DisputeResponse, DisputeStatus } from '@/types/dispute';
import { disputeStatusLabels } from '@/types/dispute';
import { AlertTriangle, Filter, RefreshCw } from 'lucide-react';

// ================================================
// TYPES
// ================================================

interface DisputeListProps {
  disputes: DisputeResponse[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDisputeClick?: (dispute: DisputeResponse) => void;
  showFilters?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function DisputeList({
  disputes,
  isLoading = false,
  error = null,
  onRefresh,
  onDisputeClick,
  showFilters = true,
  emptyMessage = 'Henüz itirazınız bulunmuyor.',
  className = '',
}: DisputeListProps) {
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'ALL'>(
    'ALL'
  );

  // Filter disputes by status
  const filteredDisputes =
    statusFilter === 'ALL'
      ? disputes
      : disputes.filter((d) => d.status === statusFilter);

  // Get status counts
  const statusCounts = disputes.reduce(
    (acc, dispute) => {
      acc[dispute.status] = (acc[dispute.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Loading state
  if (isLoading && disputes.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="lg" text="İtirazlar yükleniyor..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Bir Hata Oluştu
          </h3>
          <p className="mb-4 text-red-700">{error}</p>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && disputes.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" />
              <span>Filtrele:</span>
            </div>

            {/* All Filter */}
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü ({disputes.length})
            </button>

            {/* Status Filters */}
            {(
              ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'] as DisputeStatus[]
            ).map(
              (status) =>
                statusCounts[status] > 0 && (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {disputeStatusLabels[status]} ({statusCounts[status]})
                  </button>
                )
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="ml-auto rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                title="Yenile"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Disputes Grid */}
      {filteredDisputes.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            {statusFilter === 'ALL' ? emptyMessage : 'Sonuç Bulunamadı'}
          </h3>
          <p className="text-gray-600">
            {statusFilter === 'ALL'
              ? 'Bir sipariş ile ilgili sorun yaşadığınızda itiraz açabilirsiniz.'
              : `${disputeStatusLabels[statusFilter]} durumunda itiraz bulunmuyor.`}
          </p>
          {statusFilter !== 'ALL' && (
            <Button
              variant="outline"
              onClick={() => setStatusFilter('ALL')}
              className="mt-4"
            >
              Tüm İtirazları Gör
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredDisputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onClick={
                onDisputeClick ? () => onDisputeClick(dispute) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && disputes.length > 0 && (
        <div className="flex justify-center py-4">
          <Loading size="sm" text="Güncelleniyor..." />
        </div>
      )}
    </div>
  );
}

export default DisputeList;
