'use client';

/**
 * ================================================
 * ORDER REVISION LIST
 * ================================================
 * Displays revision history for an order with timeline view
 *
 * Features:
 * - Revision timeline with status badges
 * - Buyer revision notes display
 * - Seller response notes
 * - Status indicators (pending/accepted/completed/rejected)
 * - Revision number tracking
 * - Timestamps for all status changes
 *
 * Backend Endpoint: GET /api/v1/orders/:orderId/revisions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Revision System
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  RefreshCw,
  Check,
  X,
  Clock,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { orderApi, type OrderRevisionResponse } from '@/lib/api/orders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface OrderRevisionListProps {
  /** Order ID to fetch revisions for */
  orderId: string;
  /** Custom class name */
  className?: string;
}

type RevisionStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';

// ================================================
// HELPER FUNCTIONS
// ================================================

const getStatusColor = (status: RevisionStatus): string => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusLabel = (status: RevisionStatus): string => {
  const labels = {
    PENDING: 'Beklemede',
    ACCEPTED: 'Kabul Edildi',
    COMPLETED: 'Tamamlandı',
    REJECTED: 'Reddedildi',
  };
  return labels[status] || status;
};

const getStatusIcon = (status: RevisionStatus) => {
  const icons = {
    PENDING: Clock,
    ACCEPTED: Check,
    COMPLETED: Check,
    REJECTED: X,
  };
  const Icon = icons[status] || AlertCircle;
  return <Icon className="h-4 w-4" />;
};

// Sprint 1 Cleanup: formatDate removed - using canonical formatter from @/lib/shared/formatters

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ================================================
// COMPONENT
// ================================================

export function OrderRevisionList({
  orderId,
  className,
}: OrderRevisionListProps) {
  const [revisions, setRevisions] = useState<OrderRevisionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // DATA FETCHING
  // ================================================

  const fetchRevisions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await orderApi.getOrderRevisions(orderId);
      setRevisions(response.data || []);

      logger.info('Revisions loaded:', response.data?.length || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Revizyonlar yüklenemedi';
      setError(errorMessage);
      toast.error('Hata', {
        description: errorMessage,
      });
      logger.error(
        'Failed to load revisions:',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchRevisions();
    }
  }, [orderId, fetchRevisions]);

  // ================================================
  // RENDER HELPERS
  // ================================================

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <RefreshCw className="mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-medium text-gray-900">
        Henüz revizyon talebi yok
      </h3>
      <p className="text-sm text-gray-500">
        Bu sipariş için henüz revizyon talebi bulunmuyor.
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h3 className="mb-2 text-lg font-medium text-gray-900">
        Bir hata oluştu
      </h3>
      <p className="mb-4 text-sm text-gray-500">{error}</p>
      <Button onClick={fetchRevisions} variant="outline" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Tekrar Dene
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-gray-200"></div>
            <div className="h-6 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRevisionCard = (revision: OrderRevisionResponse) => {
    const hasResponse = revision.status !== 'PENDING' && revision.responseNote;

    return (
      <Card
        key={revision.id}
        className={cn(
          'overflow-hidden transition-all hover:shadow-md',
          revision.status === 'PENDING' && 'border-l-4 border-l-yellow-500'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white">
                #{revision.revisionNumber}
              </div>
              <div>
                <CardTitle className="text-base">
                  Revizyon #{revision.revisionNumber}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  {formatDate(revision.createdAt, 'DATETIME')}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-1 border',
                getStatusColor(revision.status)
              )}
            >
              {getStatusIcon(revision.status)}
              {getStatusLabel(revision.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Buyer Request */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {revision.requestedBy.avatarUrl && (
                  <AvatarImage
                    src={revision.requestedBy.avatarUrl}
                    alt={revision.requestedBy.fullName}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(revision.requestedBy.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {revision.requestedBy.fullName}
              </span>
              <MessageSquare className="ml-auto h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm whitespace-pre-wrap text-gray-600">
              {revision.revisionNote}
            </p>
          </div>

          {/* Seller Response */}
          {hasResponse && (
            <div
              className={cn(
                'rounded-lg p-4',
                revision.status === 'COMPLETED' && 'bg-green-50',
                revision.status === 'ACCEPTED' && 'bg-blue-50',
                revision.status === 'REJECTED' && 'bg-red-50'
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Satıcı Yanıtı
                </span>
                {revision.status === 'COMPLETED' && (
                  <Badge
                    variant="outline"
                    className="ml-auto border-green-200 bg-green-100 text-green-800"
                  >
                    Tamamlandı
                  </Badge>
                )}
                {revision.status === 'ACCEPTED' && (
                  <Badge
                    variant="outline"
                    className="ml-auto border-blue-200 bg-blue-100 text-blue-800"
                  >
                    Kabul Edildi
                  </Badge>
                )}
                {revision.status === 'REJECTED' && (
                  <Badge
                    variant="outline"
                    className="ml-auto border-red-200 bg-red-100 text-red-800"
                  >
                    Reddedildi
                  </Badge>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap text-gray-600">
                {revision.responseNote}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {revision.status === 'ACCEPTED' &&
                  `Kabul edildi: ${formatDate(revision.acceptedAt, 'DATETIME')}`}
                {revision.status === 'COMPLETED' &&
                  `Tamamlandı: ${formatDate(revision.completedAt, 'DATETIME')}`}
                {revision.status === 'REJECTED' &&
                  `Reddedildi: ${formatDate(revision.rejectedAt, 'DATETIME')}`}
              </p>
            </div>
          )}

          {/* Pending State Info */}
          {revision.status === 'PENDING' && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
              <p className="text-xs text-yellow-800">
                Satıcının yanıtı bekleniyor. Satıcı bu revizyon talebini kabul
                edebilir, reddedebilir veya doğrudan tamamlayabilir.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ================================================
  // MAIN RENDER
  // ================================================

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Revizyon Geçmişi
        </h3>
        {revisions.length > 0 && (
          <Button
            onClick={fetchRevisions}
            variant="ghost"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')}
            />
            Yenile
          </Button>
        )}
      </div>

      {isLoading && renderLoadingState()}
      {error && !isLoading && renderErrorState()}
      {!isLoading && !error && revisions.length === 0 && renderEmptyState()}
      {!isLoading && !error && revisions.length > 0 && (
        <div className="space-y-4">
          {revisions.map((revision) => renderRevisionCard(revision))}
        </div>
      )}
    </div>
  );
}

export default OrderRevisionList;
