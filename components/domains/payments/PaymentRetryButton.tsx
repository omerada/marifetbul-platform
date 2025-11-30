/**
 * ================================================
 * PAYMENT RETRY BUTTON COMPONENT
 * ================================================
 * Sprint 1.3: Payment Retry System - Frontend UI (3 SP)
 *
 * Features:
 * ✅ Display retry eligibility status
 * ✅ Show countdown timer to next retry
 * ✅ Manual retry trigger button
 * ✅ Retry attempt counter (X/5 attempts)
 * ✅ Real-time status updates
 * ✅ Error handling & user feedback
 *
 * Usage:
 * ```tsx
 * <PaymentRetryButton paymentId="xxx-xxx-xxx" />
 * ```
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1.3 - Payment Retry & Recovery
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

interface PaymentRetryStatus {
  id: string;
  paymentId: string;
  retryCount: number;
  maxRetries: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'EXHAUSTED' | 'CANCELLED';
  nextRetryAt: string | null;
  lastRetryAt: string | null;
  lastFailureReason: string | null;
  userNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RetryResult {
  success: boolean;
  paymentId: string;
  status: string;
  message: string;
  attemptNumber: number;
  nextRetryAt: string | null;
}

interface PaymentRetryButtonProps {
  paymentId: string;
  className?: string;
  onRetrySuccess?: () => void;
  onRetryFailure?: (reason: string) => void;
}

// ==================== COUNTDOWN HOOK ====================

const useCountdown = (targetDate: Date | null) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds, total: difference };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// ==================== MAIN COMPONENT ====================

export function PaymentRetryButton({
  paymentId,
  className,
  onRetrySuccess,
  onRetryFailure,
}: PaymentRetryButtonProps) {
  const [retryStatus, setRetryStatus] = useState<PaymentRetryStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown to next retry
  const nextRetryDate = retryStatus?.nextRetryAt
    ? new Date(retryStatus.nextRetryAt)
    : null;
  const countdown = useCountdown(nextRetryDate);

  // ==================== FETCH RETRY STATUS ====================

  const fetchRetryStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PaymentRetryStatus>(
        `/payments/${paymentId}/retry/status`
      );

      setRetryStatus(response);
      logger.info('Payment retry status fetched', {
        paymentId,
        status: response.status,
        retryCount: response.retryCount,
      });
    } catch (err) {
      // If retry doesn't exist yet (404), it's not necessarily an error
      const error = err as { status?: number; message?: string };
      if (error.status === 404) {
        setRetryStatus(null);
        logger.debug('No retry record found for payment', { paymentId });
      } else {
        const message = error.message || 'Retry durumu alınamadı';
        setError(message);
        logger.error(
          `Failed to fetch retry status: ${message}`,
          error as Error,
          { paymentId }
        );
      }
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  // Initial load
  useEffect(() => {
    fetchRetryStatus();
  }, [fetchRetryStatus]);

  // Refresh when countdown reaches zero
  useEffect(() => {
    if (countdown.total === 0 && retryStatus?.status === 'PENDING') {
      logger.info('Retry countdown complete, refreshing status', { paymentId });
      fetchRetryStatus();
    }
  }, [countdown.total, retryStatus?.status, fetchRetryStatus, paymentId]);

  // ==================== MANUAL RETRY ====================

  const handleManualRetry = async () => {
    setRetrying(true);
    setError(null);

    try {
      logger.info('Triggering manual retry', { paymentId });

      const result = await apiClient.post<RetryResult>(
        `/payments/${paymentId}/retry`,
        {}
      );

      if (result.success) {
        toast.success('💳 Ödeme Başarılı!', {
          description: 'Ödemeniz başarıyla tamamlandı.',
        });

        logger.info('Payment retry succeeded', {
          paymentId,
          attemptNumber: result.attemptNumber,
        });

        onRetrySuccess?.();

        // Refresh status
        await fetchRetryStatus();
      } else {
        toast.error('⚠️ Ödeme Başarısız', {
          description:
            result.message ||
            'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.',
        });

        logger.warn('Payment retry failed', {
          paymentId,
          reason: result.message,
          attemptNumber: result.attemptNumber,
        });

        onRetryFailure?.(result.message);

        // Refresh status to show updated retry info
        await fetchRetryStatus();
      }
    } catch (err) {
      const error = err as { message?: string };
      const message = error.message || 'Ödeme tekrar denemesi başarısız oldu';
      toast.error('❌ İşlem Hatası', {
        description: message,
      });

      logger.error(`Manual retry failed: ${message}`, error as Error, {
        paymentId,
      });
      setError(message);
    } finally {
      setRetrying(false);
    }
  };

  // ==================== RENDER HELPERS ====================

  const getStatusBadge = () => {
    if (!retryStatus) return null;

    switch (retryStatus.status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Beklemede
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            İşleniyor
          </Badge>
        );
      case 'SUCCEEDED':
        return (
          <Badge
            variant="success"
            className="flex items-center gap-1 border-green-200 bg-green-100 text-green-800"
          >
            <CheckCircle2 className="h-3 w-3" />
            Başarılı
          </Badge>
        );
      case 'EXHAUSTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Tükendi
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            İptal Edildi
          </Badge>
        );
    }
  };

  const formatCountdown = () => {
    const { hours, minutes, seconds } = countdown;

    if (hours > 0) {
      return `${hours}s ${minutes}d ${seconds}sn`;
    } else if (minutes > 0) {
      return `${minutes}d ${seconds}sn`;
    } else {
      return `${seconds}sn`;
    }
  };

  const canRetry = () => {
    if (!retryStatus) return false;
    if (retryStatus.status === 'SUCCEEDED') return false;
    if (retryStatus.status === 'EXHAUSTED') return false;
    if (retryStatus.status === 'CANCELLED') return false;
    if (retryStatus.retryCount >= retryStatus.maxRetries) return false;
    return true;
  };

  const isRetryAvailable = () => {
    return canRetry() && countdown.total === 0;
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <Card className={cn('border-gray-200', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ödeme durumu kontrol ediliyor...
          </div>
        </CardContent>
      </Card>
    );
  }

  // No retry record exists
  if (!retryStatus) {
    return null;
  }

  // Payment succeeded - show success message
  if (retryStatus.status === 'SUCCEEDED') {
    return (
      <Card className={cn('border-green-200 bg-green-50', className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-green-900">Ödeme Başarılı</p>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-green-700">
                Ödemeniz {retryStatus.retryCount + 1}. denemede başarıyla
                tamamlandı.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Payment exhausted - show error message
  if (retryStatus.status === 'EXHAUSTED') {
    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-red-900">Ödeme Başarısız</p>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-red-700">
                Ödemeniz {retryStatus.maxRetries} denemeye rağmen tamamlanamadı.
                {retryStatus.lastFailureReason && (
                  <span className="mt-1 block text-xs">
                    Son hata: {retryStatus.lastFailureReason}
                  </span>
                )}
              </p>
              <p className="mt-2 text-sm text-red-600">
                Lütfen ödeme yönteminizi kontrol edin veya destek ekibimizle
                iletişime geçin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Payment pending/in-progress - show retry UI
  return (
    <Card className={cn('border-blue-200 bg-blue-50', className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-blue-900">
                    Otomatik Ödeme Denemesi
                  </p>
                  {getStatusBadge()}
                </div>
                <p className="text-sm text-blue-700">
                  Ödemeniz otomatik olarak yeniden denenecek.
                </p>
              </div>
            </div>
          </div>

          {/* Retry Progress */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {retryStatus.retryCount} / {retryStatus.maxRetries}
              </span>
              <span className="text-blue-700">deneme</span>
            </div>

            {countdown.total > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {formatCountdown()}
                </span>
                <span className="text-blue-700">sonra</span>
              </div>
            )}
          </div>

          {/* Last Failure Reason */}
          {retryStatus.lastFailureReason && (
            <div className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
              Son hata: {retryStatus.lastFailureReason}
            </div>
          )}

          {/* Manual Retry Button */}
          {canRetry() && (
            <Button
              onClick={handleManualRetry}
              disabled={retrying || !isRetryAvailable()}
              className="w-full"
              variant={isRetryAvailable() ? 'primary' : 'secondary'}
            >
              {retrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deneniyor...
                </>
              ) : countdown.total > 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  {formatCountdown()} sonra deneyebilirsiniz
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Şimdi Tekrar Dene
                </>
              )}
            </Button>
          )}

          {/* Error Display */}
          {error && (
            <div className="rounded bg-red-100 px-2 py-1 text-xs text-red-600">
              ⚠️ {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentRetryButton;
