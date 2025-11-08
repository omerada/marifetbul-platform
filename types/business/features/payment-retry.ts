/**
 * ================================================
 * PAYMENT RETRY TYPES
 * ================================================
 * Types for payment retry and recovery system
 *
 * Sprint: Payment & Refund System Hardening
 * @version 1.0.0
 */

// ================================================
// ENUMS
// ================================================

export enum PaymentRetryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  EXHAUSTED = 'EXHAUSTED',
  CANCELLED = 'CANCELLED',
}

// ================================================
// RETRY INTERFACES
// ================================================

export interface PaymentRetry {
  id: string;
  paymentId: string;
  retryCount: number;
  maxRetries: number;
  status: PaymentRetryStatus;
  lastRetryAt: string | null;
  nextRetryAt: string | null;
  failureReason: string | null;
  userNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRetryResult {
  success: boolean;
  retryId: string;
  paymentId: string;
  attemptNumber: number;
  message: string;
  nextRetryAt: string | null;
  exhausted: boolean;
}

export interface RetrySuccessRateStats {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  pendingRetries: number;
  successRate: number;
}

// ================================================
// FILTERS & REQUEST TYPES
// ================================================

export interface PaymentRetryFilters {
  status?: PaymentRetryStatus;
  failureReason?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface ManualRetryRequest {
  paymentId: string;
  reason?: string;
}

// ================================================
// RESPONSE TYPES
// ================================================

export interface PaymentRetryListResponse {
  retries: PaymentRetry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FailureReasonStats {
  reason: string;
  count: number;
  percentage: number;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

export const getRetryStatusLabel = (status: PaymentRetryStatus): string => {
  const labels: Record<PaymentRetryStatus, string> = {
    PENDING: 'Bekliyor',
    IN_PROGRESS: 'İşleniyor',
    SUCCESS: 'Başarılı',
    EXHAUSTED: 'Tükendi',
    CANCELLED: 'İptal Edildi',
  };
  return labels[status];
};

export const getRetryStatusColor = (status: PaymentRetryStatus): string => {
  const colors: Record<PaymentRetryStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    SUCCESS: 'bg-green-100 text-green-800',
    EXHAUSTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
};

export const calculateRetryProgress = (
  retryCount: number,
  maxRetries: number
): number => {
  return Math.min((retryCount / maxRetries) * 100, 100);
};

export const getNextRetryLabel = (nextRetryAt: string | null): string => {
  if (!nextRetryAt) return 'Bilinmiyor';

  const now = new Date();
  const nextRetry = new Date(nextRetryAt);
  const diffMs = nextRetry.getTime() - now.getTime();

  if (diffMs < 0) return 'Şimdi';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} gün sonra`;
  if (diffHours > 0) return `${diffHours} saat sonra`;
  if (diffMins > 0) return `${diffMins} dakika sonra`;
  return 'Çok yakında';
};

export const isRetryActive = (retry: PaymentRetry): boolean => {
  return (
    retry.status === PaymentRetryStatus.PENDING ||
    retry.status === PaymentRetryStatus.IN_PROGRESS
  );
};

export const canManualRetry = (retry: PaymentRetry): boolean => {
  return (
    retry.status === PaymentRetryStatus.PENDING ||
    retry.status === PaymentRetryStatus.EXHAUSTED
  );
};
