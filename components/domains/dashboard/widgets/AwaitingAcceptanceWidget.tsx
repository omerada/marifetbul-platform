/**
 * ================================================
 * AWAITING ACCEPTANCE WIDGET - BUYER VIEW
 * ================================================
 * Sprint 1 - Story 1.6: Dashboard milestone overview for buyers
 *
 * Displays buyer&apos;s milestones awaiting acceptance
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { MilestoneResponse } from '@/types/backend-aligned';

// ============================================================================
// TYPES
// ============================================================================

export interface AwaitingAcceptanceWidgetProps {
  milestones: MilestoneResponse[];
  isLoading?: boolean;
  maxItems?: number;
  className?: string;
  onActionComplete?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AwaitingAcceptanceWidget = memo(function AwaitingAcceptanceWidget({
  milestones,
  isLoading = false,
  maxItems = 5,
  className,
}: AwaitingAcceptanceWidgetProps) {
  // Filter only DELIVERED milestones and sort by delivery date
  const deliveredMilestones = useMemo(() => {
    return milestones
      .filter((m) => m.status === 'DELIVERED')
      .sort((a, b) => {
        const dateA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
        const dateB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
        return dateA - dateB; // Oldest first
      })
      .slice(0, maxItems);
  }, [milestones, maxItems]);

  // Calculate total amount awaiting acceptance
  const totalAmount = useMemo(() => {
    return deliveredMilestones.reduce((sum, m) => sum + m.amount, 0);
  }, [deliveredMilestones]);

  return (
    <Card className={className}>
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle className="text-primary h-5 w-5" />
            Onay Bekleyen Teslimatlar
          </h3>
          {milestones.filter((m) => m.status === 'DELIVERED').length >
            maxItems && (
            <Link href="/dashboard/orders?status=delivered">
              <Button variant="ghost" size="sm">
                Tümünü Gör
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {deliveredMilestones.length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Teslimat Bekliyor
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Toplam Tutar
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : deliveredMilestones.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <p className="text-muted-foreground mt-2 text-sm">
              Onay bekleyen teslimat yok
            </p>
            <p className="text-muted-foreground text-xs">
              Tüm teslimatlar onaylandı
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveredMilestones.map((milestone) => (
              <DeliveredMilestoneItem
                key={milestone.id}
                milestone={milestone}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
});

// ============================================================================
// DELIVERED MILESTONE ITEM COMPONENT
// ============================================================================

interface DeliveredMilestoneItemProps {
  milestone: MilestoneResponse;
}

const DeliveredMilestoneItem = memo(function DeliveredMilestoneItem({
  milestone,
}: DeliveredMilestoneItemProps) {
  const hoursSinceDelivery = milestone.deliveredAt
    ? Math.floor(
        (new Date().getTime() - new Date(milestone.deliveredAt).getTime()) /
          (1000 * 60 * 60)
      )
    : 0;

  const isUrgent = hoursSinceDelivery > 48; // More than 48 hours

  return (
    <div className="group hover:bg-muted/50 rounded-lg border p-3 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Milestone Info */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/orders/${milestone.orderId}`}
              className="hover:text-primary text-sm font-medium hover:underline"
            >
              {milestone.title}
            </Link>
            <Badge variant="default" className="text-xs">
              Teslim Edildi
            </Badge>
          </div>

          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="font-medium">
              {formatCurrency(milestone.amount)}
            </span>
            {milestone.deliveredAt && (
              <span
                className={`flex items-center gap-1 ${isUrgent ? 'font-medium text-orange-600 dark:text-orange-400' : ''}`}
              >
                <Clock className="h-3 w-3" />
                {formatDate(milestone.deliveredAt)}
                {isUrgent && ` (${hoursSinceDelivery}sa önce)`}
              </span>
            )}
          </div>

          {milestone.deliveryNotes && (
            <div className="mt-1 rounded bg-gray-50 px-2 py-1 dark:bg-gray-900/20">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Not:</strong> {milestone.deliveryNotes}
              </p>
            </div>
          )}

          {isUrgent && (
            <div className="mt-1 flex items-start gap-1 rounded bg-orange-50 px-2 py-1 dark:bg-orange-950/20">
              <AlertCircle className="mt-0.5 h-3 w-3 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Teslimat {hoursSinceDelivery} saat önce yapıldı. Lütfen
                inceleyin.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/orders/${milestone.orderId}`}>
            <Button
              variant="primary"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              İncele
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>

          <Link href={`/dashboard/orders/${milestone.orderId}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});
