/**
 * ================================================
 * PAYMENT RETRY HISTORY COMPONENT
 * ================================================
 * Timeline view of payment retry attempts
 *
 * Sprint: Payment & Refund System Hardening
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  RefreshCw,
} from 'lucide-react';
import type { PaymentRetry } from '@/types/business/features/payment-retry';
import { getRetryStatusLabel } from '@/types/business/features/payment-retry';
import { paymentRetryApi } from '@/lib/api/payment-retry';
import { Logger } from '@/lib/infrastructure/monitoring/logger';

const logger = new Logger({});

interface PaymentRetryHistoryProps {
  paymentId: string;
  className?: string;
}

const getStatusIcon = (
  status: PaymentRetry['status'],
  size: string = 'h-5 w-5'
) => {
  const iconClass = size;

  switch (status) {
    case 'SUCCESS':
      return <CheckCircle2 className={`${iconClass} text-green-600`} />;
    case 'EXHAUSTED':
      return <AlertCircle className={`${iconClass} text-red-600`} />;
    case 'CANCELLED':
      return <XCircle className={`${iconClass} text-gray-600`} />;
    case 'IN_PROGRESS':
      return (
        <RefreshCw className={`${iconClass} animate-spin text-blue-600`} />
      );
    case 'PENDING':
    default:
      return <Clock className={`${iconClass} text-yellow-600`} />;
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function PaymentRetryHistory({
  paymentId,
  className,
}: PaymentRetryHistoryProps) {
  const [retry, setRetry] = useState<PaymentRetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchRetry = async () => {
      try {
        const data = await paymentRetryApi.getPaymentRetryStatus(paymentId);
        setRetry(data);
      } catch (error) {
        logger.error('Failed to fetch retry history', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetry();
  }, [paymentId]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!retry) {
    return null;
  }

  // Generate timeline items based on retry count and status
  const generateTimelineItems = () => {
    const items: Array<{
      id: number;
      status: 'success' | 'failed' | 'pending';
      timestamp: string;
      description: string;
    }> = [];

    // Initial payment attempt
    items.push({
      id: 0,
      status: 'failed',
      timestamp: retry.createdAt,
      description: 'İlk ödeme denemesi başarısız oldu',
    });

    // Retry attempts
    for (let i = 1; i <= retry.retryCount; i++) {
      const isLastAttempt = i === retry.retryCount;
      const estimatedTimestamp = new Date(
        new Date(retry.createdAt).getTime() + i * 15 * 60 * 1000
      ).toISOString();

      items.push({
        id: i,
        status:
          isLastAttempt && retry.status === 'SUCCESS'
            ? 'success'
            : isLastAttempt && retry.status === 'IN_PROGRESS'
              ? 'pending'
              : 'failed',
        timestamp: retry.lastRetryAt || estimatedTimestamp,
        description: `${i}. yeniden deneme ${
          isLastAttempt && retry.status === 'SUCCESS'
            ? 'başarılı'
            : isLastAttempt && retry.status === 'IN_PROGRESS'
              ? 'devam ediyor'
              : 'başarısız oldu'
        }`,
      });
    }

    // Pending next retry
    if (retry.status === 'PENDING' && retry.nextRetryAt) {
      items.push({
        id: retry.retryCount + 1,
        status: 'pending',
        timestamp: retry.nextRetryAt,
        description: `${retry.retryCount + 1}. deneme planlandı`,
      });
    }

    return items;
  };

  const timelineItems = generateTimelineItems();
  const displayItems = expanded ? timelineItems : timelineItems.slice(-3);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Ödeme Deneme Geçmişi
          </CardTitle>
          <Badge variant="default">
            {retry.retryCount} / {retry.maxRetries} Deneme
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {displayItems.map((item, index) => (
            <div key={item.id} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    item.status === 'success'
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : item.status === 'pending'
                        ? 'bg-blue-100 dark:bg-blue-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                  }`}
                >
                  {item.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : item.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-blue-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`font-medium ${
                        item.status === 'success'
                          ? 'text-green-700 dark:text-green-400'
                          : item.status === 'pending'
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {item.description}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Error message for failed attempts */}
                {item.status === 'failed' &&
                  retry.failureReason &&
                  index === displayItems.length - 1 && (
                    <div className="mt-2 rounded bg-red-50 p-2 dark:bg-red-900/10">
                      <p className="text-xs text-red-700 dark:text-red-400">
                        Hata: {retry.failureReason}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {timelineItems.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary-600 hover:text-primary-700 w-full text-center text-sm font-medium"
          >
            {expanded
              ? 'Daha Az Göster'
              : `${timelineItems.length - 3} Önceki Denemeyi Göster`}
          </button>
        )}

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Toplam Deneme</p>
              <p className="font-semibold">{retry.retryCount + 1}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Durum</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(retry.status, 'h-4 w-4')}
                <p className="font-semibold">
                  {getRetryStatusLabel(retry.status)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentRetryHistory;
