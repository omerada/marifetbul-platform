/**
 * ================================================
 * REVIEW MODERATION HISTORY COMPONENT
 * ================================================
 * Display moderation action history for a review
 * Shows timeline of approve/reject/flag actions with moderator info
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 2.2: Admin Review Actions
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ModerationLog,
  ModerationAction,
  ReviewStatus,
} from '@/types/business/review';

export interface ReviewModerationHistoryProps {
  history: ModerationLog[];
  className?: string;
}

export function ReviewModerationHistory({
  history,
  className,
}: ReviewModerationHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="text-muted-foreground mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            Henüz moderasyon geçmişi bulunmuyor
          </p>
        </CardContent>
      </Card>
    );
  }

  const actionConfig = {
    [ModerationAction.APPROVE]: {
      icon: CheckCircle,
      label: 'Onaylandı',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badgeVariant: 'secondary' as const,
    },
    [ModerationAction.REJECT]: {
      icon: XCircle,
      label: 'Reddedildi',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badgeVariant: 'destructive' as const,
    },
    [ModerationAction.FLAG]: {
      icon: Flag,
      label: 'Bayraklandı',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badgeVariant: 'destructive' as const,
    },
    [ModerationAction.UNFLAG]: {
      icon: AlertCircle,
      label: 'Bayrak Kaldırıldı',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badgeVariant: 'secondary' as const,
    },
    [ModerationAction.DELETE]: {
      icon: Trash2,
      label: 'Silindi',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      badgeVariant: 'secondary' as const,
    },
  };

  const statusLabels: Record<ReviewStatus, string> = {
    [ReviewStatus.PENDING]: 'Beklemede',
    [ReviewStatus.APPROVED]: 'Onaylandı',
    [ReviewStatus.REJECTED]: 'Reddedildi',
    [ReviewStatus.FLAGGED]: 'Bayraklı',
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Moderasyon Geçmişi</h3>

        <div className="space-y-4">
          {history.map((log, index) => {
            const config = actionConfig[log.action];
            const Icon = config.icon;
            const timeAgo = formatDistanceToNow(new Date(log.createdAt), {
              addSuffix: true,
              locale: tr,
            });

            return (
              <div
                key={log.id}
                className={cn(
                  'relative flex gap-4 rounded-lg border p-4',
                  config.bgColor
                )}
              >
                {/* Timeline Line */}
                {index < history.length - 1 && (
                  <div className="absolute top-12 left-8 h-full w-0.5 bg-gray-200" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white',
                    'border-2',
                    config.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  {/* Action Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant={config.badgeVariant} className="mb-1">
                        {config.label}
                      </Badge>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <User className="h-3 w-3" />
                        <span>{log.moderatorName}</span>
                        <span>•</span>
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Change */}
                  {log.previousStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {statusLabels[log.previousStatus]}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">
                        {statusLabels[log.newStatus]}
                      </span>
                    </div>
                  )}

                  {/* Reason */}
                  {log.reason && (
                    <div className="rounded-md bg-white p-3 text-sm">
                      <p className="font-medium text-gray-700">Sebep:</p>
                      <p className="mt-1 text-gray-600">{log.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
