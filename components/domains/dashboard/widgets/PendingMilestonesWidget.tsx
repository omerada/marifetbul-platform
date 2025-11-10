/**
 * ================================================
 * PENDING MILESTONES WIDGET - SELLER VIEW
 * ================================================
 * Sprint 1 - Story 1.6: Dashboard milestone overview for sellers
 *
 * Displays seller&apos;s pending milestones requiring action
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Package,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { MilestoneResponse } from '@/types/backend-aligned';
import { UnifiedDeliveryButton } from '@/components/domains/orders/UnifiedDeliveryButton';

// ============================================================================
// HELPERS
// ============================================================================

function getMilestoneStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Beklemede',
    IN_PROGRESS: 'Devam Ediyor',
    DELIVERED: 'Teslim Edildi',
    ACCEPTED: 'Kabul Edildi',
    REVISION_REQUESTED: 'Revize İstendi',
    CANCELLED: 'İptal Edildi',
  };
  return labels[status] || status;
}

function getMilestoneStatusColor(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' {
  const colors: Record<
    string,
    'default' | 'success' | 'warning' | 'destructive'
  > = {
    PENDING: 'default',
    IN_PROGRESS: 'default',
    DELIVERED: 'default',
    ACCEPTED: 'success',
    REVISION_REQUESTED: 'warning',
    CANCELLED: 'destructive',
  };
  return colors[status] || 'default';
}

// ============================================================================
// TYPES
// ============================================================================

export interface PendingMilestonesWidgetProps {
  milestones: MilestoneResponse[];
  isLoading?: boolean;
  maxItems?: number;
  className?: string;
  onActionComplete?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PendingMilestonesWidget = memo(function PendingMilestonesWidget({
  milestones,
  isLoading = false,
  maxItems = 5,
  className,
  onActionComplete,
}: PendingMilestonesWidgetProps) {
  // Sort milestones by priority: REVISION_REQUESTED > IN_PROGRESS > PENDING
  const sortedMilestones = useMemo(() => {
    const priorityMap: Record<string, number> = {
      REVISION_REQUESTED: 1,
      IN_PROGRESS: 2,
      PENDING: 3,
    };

    return [...milestones]
      .sort((a, b) => {
        const priorityA = priorityMap[a.status] || 99;
        const priorityB = priorityMap[b.status] || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;

        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      })
      .slice(0, maxItems);
  }, [milestones, maxItems]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return milestones.reduce(
      (acc, milestone) => {
        if (milestone.status === 'PENDING') acc.pending++;
        else if (milestone.status === 'IN_PROGRESS') acc.inProgress++;
        else if (milestone.status === 'REVISION_REQUESTED')
          acc.revisionRequested++;
        acc.totalAmount += milestone.amount;
        return acc;
      },
      { pending: 0, inProgress: 0, revisionRequested: 0, totalAmount: 0 }
    );
  }, [milestones]);

  return (
    <Card className={className}>
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Package className="text-primary h-5 w-5" />
            Bekleyen Milestone&apos;lar
          </h3>
          {milestones.length > maxItems && (
            <Link href="/dashboard/orders?status=active">
              <Button variant="ghost" size="sm">
                Tümünü Gör
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-yellow-50 px-3 py-2 dark:bg-yellow-950/20">
            <div className="font-medium text-yellow-900 dark:text-yellow-100">
              {stats.pending}
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              Başlanacak
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/20">
            <div className="font-medium text-blue-900 dark:text-blue-100">
              {stats.inProgress}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              Devam Ediyor
            </div>
          </div>
          <div className="rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950/20">
            <div className="font-medium text-orange-900 dark:text-orange-100">
              {stats.revisionRequested}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300">
              Revize İstendi
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : sortedMilestones.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <p className="text-muted-foreground mt-2 text-sm">
              Bekleyen milestone yok
            </p>
            <p className="text-muted-foreground text-xs">
              Tüm milestone&apos;lar teslim edildi veya tamamlandı
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMilestones.map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                onActionComplete={onActionComplete}
              />
            ))}

            {/* Total Pending Amount */}
            {stats.totalAmount > 0 && (
              <div className="mt-4 border-t pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Toplam Bekleyen Tutar:
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(stats.totalAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

// ============================================================================
// MILESTONE ITEM COMPONENT
// ============================================================================

interface MilestoneItemProps {
  milestone: MilestoneResponse;
  onActionComplete?: () => void;
}

const MilestoneItem = memo(function MilestoneItem({
  milestone,
  onActionComplete,
}: MilestoneItemProps) {
  const isOverdue =
    milestone.dueDate && new Date(milestone.dueDate) < new Date();
  const statusColor = getMilestoneStatusColor(milestone.status);

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
            <Badge variant={statusColor} className="text-xs">
              {getMilestoneStatusLabel(milestone.status)}
            </Badge>
          </div>

          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="font-medium">
              {formatCurrency(milestone.amount)}
            </span>
            {milestone.dueDate && (
              <span
                className={`flex items-center gap-1 ${isOverdue ? 'font-medium text-red-600 dark:text-red-400' : ''}`}
              >
                <Clock className="h-3 w-3" />
                {formatDate(milestone.dueDate)}
                {isOverdue && ' (Gecikmiş)'}
              </span>
            )}
          </div>

          {milestone.deliveryNotes &&
            milestone.status === 'REVISION_REQUESTED' && (
              <div className="mt-1 flex items-start gap-1 rounded bg-orange-50 px-2 py-1 dark:bg-orange-950/20">
                <AlertCircle className="mt-0.5 h-3 w-3 text-orange-600 dark:text-orange-400" />
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Revize nedeni: {milestone.deliveryNotes}
                </p>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {milestone.status === 'IN_PROGRESS' ||
          milestone.status === 'REVISION_REQUESTED' ? (
            <UnifiedDeliveryButton
              mode="milestone"
              milestoneId={milestone.id}
              orderId={milestone.orderId}
              title="Teslim Et"
              subtitle={milestone.title}
              variant="primary"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onSuccess={onActionComplete}
            />
          ) : milestone.status === 'PENDING' ? (
            <Link href={`/dashboard/orders/${milestone.orderId}`}>
              <Button variant="outline" size="sm">
                Başla
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          ) : null}

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
