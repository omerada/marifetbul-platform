/**
 * ================================================
 * PAYOUT STATUS TRACKER
 * ================================================
 * Sprint 1 - Task 1.2.3
 *
 * Visual status tracker for payout progress
 * Shows current status, timeline, and actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatRelativeTime } from '@/lib/shared/formatters';
import type { Payout } from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutStatusTrackerProps {
  /**
   * Payout object with status details
   */
  payout: Payout;

  /**
   * Show detailed timeline
   * @default true
   */
  showTimeline?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

type PayoutStage =
  | 'submitted'
  | 'reviewing'
  | 'processing'
  | 'completed'
  | 'failed';

interface StatusInfo {
  stage: PayoutStage;
  label: string;
  description: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<string, StatusInfo> = {
  PENDING: {
    stage: 'submitted',
    label: 'İnceleme Bekliyor',
    description: 'Talebiniz alındı ve inceleme sırasında',
    icon: Clock,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  REVIEWING: {
    stage: 'reviewing',
    label: 'İnceleniyor',
    description: 'Talebiniz güvenlik kontrolünden geçiriliyor',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  PROCESSING: {
    stage: 'processing',
    label: 'İşleniyor',
    description: 'Paranız banka hesabınıza aktarılıyor',
    icon: TrendingUp,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  COMPLETED: {
    stage: 'completed',
    label: 'Tamamlandı',
    description: 'Para başarıyla hesabınıza aktarıldı',
    icon: CheckCircle,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  FAILED: {
    stage: 'failed',
    label: 'Başarısız',
    description: 'İşlem başarısız oldu',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  CANCELLED: {
    stage: 'failed',
    label: 'İptal Edildi',
    description: 'Talep iptal edildi',
    icon: AlertCircle,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

// ============================================================================
// TIMELINE STAGES
// ============================================================================

const TIMELINE_STAGES: PayoutStage[] = [
  'submitted',
  'reviewing',
  'processing',
  'completed',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusInfo(status: string): StatusInfo {
  return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
}

function getStageIndex(stage: PayoutStage): number {
  return TIMELINE_STAGES.indexOf(stage);
}

function isStageCompleted(
  currentStage: PayoutStage,
  checkStage: PayoutStage
): boolean {
  const currentIndex = getStageIndex(currentStage);
  const checkIndex = getStageIndex(checkStage);
  return currentIndex >= checkIndex && currentStage !== 'failed';
}

function isStageActive(
  currentStage: PayoutStage,
  checkStage: PayoutStage
): boolean {
  return currentStage === checkStage;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function TimelineStep({
  stage,
  currentStage,
  isLast,
}: {
  stage: PayoutStage;
  currentStage: PayoutStage;
  isLast: boolean;
}) {
  const completed = isStageCompleted(currentStage, stage);
  const active = isStageActive(currentStage, stage);
  const failed = currentStage === 'failed';

  const stageLabels: Record<PayoutStage, string> = {
    submitted: 'Gönderildi',
    reviewing: 'İnceleme',
    processing: 'İşleniyor',
    completed: 'Tamamlandı',
    failed: 'Başarısız',
  };

  return (
    <div className="flex flex-1 items-center">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
            completed
              ? 'border-green-500 bg-green-500 text-white'
              : active
                ? 'border-blue-500 bg-blue-500 text-white'
                : failed && stage === currentStage
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
          }`}
        >
          {completed ? (
            <CheckCircle className="h-5 w-5" />
          ) : active ? (
            <Clock className="h-5 w-5 animate-pulse" />
          ) : failed && stage === currentStage ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          )}
        </div>
        <span
          className={`mt-2 text-xs font-medium ${
            completed || active ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          {stageLabels[stage]}
        </span>
      </div>
      {!isLast && (
        <div
          className={`mx-2 h-0.5 flex-1 transition-all ${
            completed ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PayoutStatusTracker({
  payout,
  showTimeline = true,
  className = '',
}: PayoutStatusTrackerProps) {
  // ==================== COMPUTED ====================

  const statusInfo = useMemo(
    () => getStatusInfo(payout.status),
    [payout.status]
  );
  const Icon = statusInfo.icon;

  // ==================== RENDER ====================

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Para Çekme Durumu
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Current Status */}
        <div
          className={`rounded-lg border-2 p-6 ${statusInfo.borderColor} ${statusInfo.bgColor}`}
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${statusInfo.color}`}>
              <Icon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
                  {statusInfo.label}
                </h3>
                <Badge
                  variant={
                    payout.status === 'COMPLETED'
                      ? 'default'
                      : payout.status === 'FAILED' ||
                          payout.status === 'CANCELLED'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {payout.status}
                </Badge>
              </div>
              <p className="mb-3 text-sm text-gray-600">
                {statusInfo.description}
              </p>

              {/* Amount */}
              <div className="rounded-lg bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tutar:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(payout.amount, payout.currency)}
                  </span>
                </div>
                {payout.description && (
                  <div className="mt-2 text-xs text-gray-500">
                    {payout.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {showTimeline &&
          payout.status !== 'FAILED' &&
          payout.status !== 'CANCELLED' && (
            <div className="mt-6">
              <h4 className="mb-4 text-sm font-semibold text-gray-700">
                İşlem Süreci
              </h4>
              <div className="flex items-center">
                {TIMELINE_STAGES.map((stage, index) => (
                  <TimelineStep
                    key={stage}
                    stage={stage}
                    currentStage={statusInfo.stage}
                    isLast={index === TIMELINE_STAGES.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Failure Reason */}
        {payout.failureReason && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Hata Nedeni</p>
                <p className="mt-1 text-sm text-red-700">
                  {payout.failureReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Talep Zamanı:</span>
            <span className="font-medium text-gray-900">
              {formatRelativeTime(payout.requestedAt)}
            </span>
          </div>
          {payout.completedAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tamamlanma Zamanı:</span>
              <span className="font-medium text-gray-900">
                {formatRelativeTime(payout.completedAt)}
              </span>
            </div>
          )}
          {payout.paymentMethodDetails && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hedef Hesap:</span>
              <span className="font-medium text-gray-900">
                {payout.paymentMethodDetails}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">İşlem ID:</span>
            <span className="font-mono text-xs text-gray-500">{payout.id}</span>
          </div>
        </div>

        {/* Estimated Time */}
        {payout.status === 'PENDING' || payout.status === 'PROCESSING' ? (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              Tahmini tamamlanma süresi: <strong>1-3 iş günü</strong>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default PayoutStatusTracker;
