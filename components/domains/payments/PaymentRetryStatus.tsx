'use client';

/**
 * ================================================
 * PAYMENT RETRY STATUS COMPONENT
 * ================================================
 * Displays payment retry status with countdown and progress
 *
 * Sprint: Payment & Refund System Hardening
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui/Progress';
import {
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import type {
  PaymentRetry,
  PaymentRetryStatus as RetryStatus,
} from '@/types/business/features/payment-retry';
import { getRetryStatusLabel } from '@/types/business/features/payment-retry';
import { paymentRetryApi } from '@/lib/api/payment-retry';
import { useToast } from '@/hooks/core/useToast';
import { Logger } from '@/lib/infrastructure/monitoring/logger';

const logger = new Logger({});

interface PaymentRetryStatusProps {
  paymentId: string;
  className?: string;
  showDetails?: boolean;
  onRetrySuccess?: () => void;
}

const getStatusIcon = (status: RetryStatus) => {
  const iconClass = 'h-5 w-5';

  switch (status) {
    case 'PENDING':
      return <Clock className={iconClass} />;
    case 'IN_PROGRESS':
      return <RefreshCw className={`${iconClass} animate-spin`} />;
    case 'SUCCESS':
      return <CheckCircle2 className={iconClass} />;
    case 'EXHAUSTED':
      return <AlertCircle className={iconClass} />;
    case 'CANCELLED':
      return <Ban className={iconClass} />;
    default:
      return <XCircle className={iconClass} />;
  }
};

export function PaymentRetryStatus({
  paymentId,
  className,
  showDetails = true,
  onRetrySuccess,
}: PaymentRetryStatusProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [retry, setRetry] = useState<PaymentRetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Fetch retry status
  useEffect(() => {
    const fetchRetry = async () => {
      try {
        const data = await paymentRetryApi.getPaymentRetryStatus(paymentId);
        setRetry(data);
      } catch (error) {
        logger.error('Failed to fetch retry status', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetry();
  }, [paymentId]);

  // Countdown timer for next retry
  useEffect(() => {
    if (!retry || !retry.nextRetryAt) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const nextRetry = new Date(retry.nextRetryAt!).getTime();
      const diff = Math.max(0, Math.floor((nextRetry - now) / 1000));

      setCountdown(diff);

      // Refresh data when countdown reaches 0
      if (diff === 0 && retry.status === 'PENDING') {
        setTimeout(async () => {
          const updated =
            await paymentRetryApi.getPaymentRetryStatus(paymentId);
          setRetry(updated);
        }, 1000);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [retry, paymentId]);

  // Manual retry handler
  const handleManualRetry = async () => {
    if (!retry) return;

    setIsRetrying(true);

    try {
      const result = await paymentRetryApi.manualRetryPayment(paymentId);

      if (result.success) {
        success('Ödeme başarılı', 'Ödemeniz başarıyla tamamlandı.');

        onRetrySuccess?.();
        router.refresh();
      } else {
        error(
          'Ödeme başarısız',
          result.message || 'Ödeme tekrar başarısız oldu.'
        );

        // Refresh retry status
        const updated = await paymentRetryApi.getPaymentRetryStatus(paymentId);
        setRetry(updated);
      }
    } catch (err) {
      logger.error('Manual retry failed', err as Error);
      error('Hata', 'Ödeme yeniden denenirken bir hata oluştu.');
    } finally {
      setIsRetrying(false);
    }
  };

  // Cancel retry handler
  const handleCancelRetry = async () => {
    if (!retry) return;

    try {
      await paymentRetryApi.cancelPaymentRetry(paymentId);

      success('İptal edildi', 'Otomatik ödeme denemesi iptal edildi.');

      setRetry({ ...retry, status: 'CANCELLED' as RetryStatus });
    } catch (err) {
      logger.error('Cancel retry failed', err as Error);
      error('Hata', 'İptal işlemi başarısız oldu.');
    }
  };

  // Calculate progress
  const calculateProgress = (r: PaymentRetry) => {
    if (r.maxRetries === 0) return 100;
    return Math.min((r.retryCount / r.maxRetries) * 100, 100);
  };

  // Format countdown
  const formatCountdown = (seconds: number): string => {
    if (seconds < 60) return `${seconds} saniye`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} dakika`;
    const hours = Math.floor(minutes / 60);
    return `${hours} saat`;
  };

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

  const progress = calculateProgress(retry);
  const statusLabel = getRetryStatusLabel(retry.status);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon(retry.status)}
            Ödeme Yeniden Deneme
          </CardTitle>
          <Badge variant="default">{statusLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        {showDetails &&
          retry.status !== 'SUCCESS' &&
          retry.status !== 'CANCELLED' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">İlerleme</span>
                <span className="font-medium">
                  {retry.retryCount} / {retry.maxRetries} deneme
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

        {/* Failure Reason */}
        {retry.failureReason && (
          <div className="bg-destructive/10 flex items-start gap-2 rounded-md p-3">
            <AlertCircle className="text-destructive mt-0.5 h-4 w-4" />
            <div className="flex-1">
              <p className="text-destructive text-sm font-medium">
                Hata Nedeni
              </p>
              <p className="text-muted-foreground text-sm">
                {retry.failureReason}
              </p>
            </div>
          </div>
        )}

        {/* Countdown for Next Retry */}
        {retry.status === 'PENDING' &&
          retry.nextRetryAt &&
          countdown !== null && (
            <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Sonraki Deneme
                </p>
                <p className="text-muted-foreground text-sm">
                  {countdown > 0 ? formatCountdown(countdown) : 'Deneniyor...'}
                </p>
              </div>
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {(retry.status === 'PENDING' || retry.status === 'EXHAUSTED') && (
            <Button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deneniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Şimdi Dene
                </>
              )}
            </Button>
          )}

          {retry.status === 'PENDING' && (
            <Button
              onClick={handleCancelRetry}
              variant="outline"
              className="flex-1"
            >
              <Ban className="mr-2 h-4 w-4" />
              İptal Et
            </Button>
          )}
        </div>

        {/* Info Text */}
        {retry.status === 'EXHAUSTED' && (
          <p className="text-muted-foreground text-center text-xs">
            Otomatik denemeler tükendi. Ödemeyi manuel olarak yeniden
            deneyebilir veya sipariş iptal edebilirsiniz.
          </p>
        )}

        {retry.status === 'SUCCESS' && retry.lastRetryAt && (
          <p className="text-center text-xs text-green-600 dark:text-green-400">
            ✓ Ödeme {new Date(retry.lastRetryAt).toLocaleString('tr-TR')}{' '}
            tarihinde başarıyla tamamlandı
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentRetryStatus;
