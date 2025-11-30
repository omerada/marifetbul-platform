'use client';

/**
 * ================================================
 * ADMIN PAYOUT APPROVAL WIDGET
 * ================================================
 * Sprint 1 - Task 1.2.4
 *
 * Admin dashboard widget for pending payout approvals
 * Quick overview and action buttons
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { formatCurrency, formatRelativeTime } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Payout } from '@/lib/api/validators';
import { payoutAdminApi } from '@/lib/api/admin/payout-admin-api';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminPayoutApprovalWidgetProps {
  /**
   * Maximum number of payouts to display
   * @default 5
   */
  maxItems?: number;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Callback when a payout is approved
   */
  onApprove?: (payoutId: string) => Promise<void>;

  /**
   * Callback when a payout is rejected
   */
  onReject?: (payoutId: string, reason: string) => Promise<void>;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function PayoutItem({
  payout,
  onApprove,
  onReject,
  isProcessing,
}: {
  payout: Payout;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {formatCurrency(payout.amount, payout.currency)}
            </span>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Bekliyor
            </Badge>
          </div>
          <p className="line-clamp-1 text-sm text-gray-600">
            {payout.description || 'Para çekme talebi'}
          </p>
          {payout.paymentMethodDetails && (
            <p className="mt-1 line-clamp-1 font-mono text-xs text-gray-500">
              {payout.paymentMethodDetails}
            </p>
          )}
        </div>
        <Link
          href={`/admin/payouts/${payout.id}`}
          className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-3 text-xs text-gray-500">
        {formatRelativeTime(payout.requestedAt)}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onApprove}
          disabled={isProcessing}
          className="flex-1"
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Onayla
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
        >
          <XCircle className="mr-1 h-4 w-4" />
          Reddet
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <p className="text-sm font-medium text-gray-900">Bekleyen Talep Yok</p>
      <p className="text-xs text-gray-500">Tüm para çekme talepleri işlendi</p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminPayoutApprovalWidget({
  maxItems = 5,
  className = '',
  onApprove,
  onReject,
}: AdminPayoutApprovalWidgetProps) {
  // ==================== STATE ====================

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== HANDLERS ====================

  const loadPayouts = async () => {
    try {
      setIsLoading(true);
      const data = await payoutAdminApi.getPendingPayouts();
      setPayouts(data.slice(0, maxItems) as Payout[]);
    } catch (error) {
      logger.error(
        'Failed to load pending payouts:',
        error instanceof Error ? error : new Error(String(error))
      );
      // Fallback to empty array on error
      setPayouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (payoutId: string) => {
    if (!onApprove) return;

    try {
      setProcessingId(payoutId);
      await onApprove(payoutId);

      // Remove from list after successful approval
      setPayouts((prev) => prev.filter((p) => p.id !== payoutId));
    } catch (error) {
      logger.error(
        'Failed to approve payout:',
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payoutId: string) => {
    if (!onReject) return;

    const reason = prompt('Reddetme nedeni:');
    if (!reason) return;

    try {
      setProcessingId(payoutId);
      await onReject(payoutId, reason);

      // Remove from list after successful rejection
      setPayouts((prev) => prev.filter((p) => p.id !== payoutId));
    } catch (error) {
      logger.error(
        'Failed to reject payout:',
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==================== RENDER ====================

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Bekleyen Para Çekme Talepleri
          </CardTitle>
          <Link
            href="/admin/payouts"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Tümünü Gör
          </Link>
        </div>
        {!isLoading && payouts.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            {payouts.length} talep onay bekliyor
          </p>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <PayoutItem
                key={payout.id}
                payout={payout}
                onApprove={() => handleApprove(payout.id)}
                onReject={() => handleReject(payout.id)}
                isProcessing={processingId === payout.id}
              />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && payouts.length > 0 && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Toplam Tutar:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(
                  payouts.reduce((sum, p) => sum + p.amount, 0),
                  'TRY'
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminPayoutApprovalWidget;
