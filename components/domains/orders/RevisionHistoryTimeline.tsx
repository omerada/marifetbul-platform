/**
 * ================================================
 * MILESTONE REVISION HISTORY TIMELINE
 * ================================================
 * Timeline component showing milestone revision history
 *
 * Features:
 * - Chronological revision events
 * - User avatars
 * - Timestamps
 * - Revision reasons
 * - Status indicators
 *
 * @version 1.0.0
 * @sprint Sprint 1 - Story 3 (Milestone Revision UI)
 * @author MarifetBul Development Team
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  CheckCircle,
  RefreshCw,
  Clock,
  Package,
  MessageSquare,
} from 'lucide-react';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface RevisionEvent {
  id: string;
  type: 'delivered' | 'accepted' | 'rejected' | 'revision_delivered';
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    avatar?: string;
    role: 'buyer' | 'seller';
  };
  reason?: string;
  notes?: string;
}

export interface RevisionHistoryTimelineProps {
  /** Milestone data */
  milestone: OrderMilestone;
  /** Custom className */
  className?: string;
}

// ================================================
// EVENT METADATA
// ================================================

const eventMetadata = {
  delivered: {
    icon: Package,
    label: 'Teslim Edildi',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  accepted: {
    icon: CheckCircle,
    label: 'Onaylandı',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  rejected: {
    icon: RefreshCw,
    label: 'Revizyon Talep Edildi',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  revision_delivered: {
    icon: Package,
    label: 'Revizyon Teslim Edildi',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
} as const;

// ================================================
// COMPONENT
// ================================================

export function RevisionHistoryTimeline({
  milestone,
  className,
}: RevisionHistoryTimelineProps) {
  // Build timeline events from milestone data
  const events: RevisionEvent[] = React.useMemo(() => {
    const timeline: RevisionEvent[] = [];

    // Initial delivery
    if (milestone.deliveredAt) {
      timeline.push({
        id: `delivered-${milestone.id}`,
        type: 'delivered',
        timestamp: new Date(milestone.deliveredAt),
        actor: {
          id: milestone.orderId, // Seller info would come from order
          name: 'Satıcı',
          role: 'seller',
        },
        notes: milestone.deliveryNotes,
      });
    }

    // Acceptance/Rejection
    if (milestone.status === 'ACCEPTED' && milestone.acceptedAt) {
      timeline.push({
        id: `accepted-${milestone.id}`,
        type: 'accepted',
        timestamp: new Date(milestone.acceptedAt),
        actor: {
          id: milestone.orderId,
          name: 'Alıcı',
          role: 'buyer',
        },
      });
    } else if (milestone.status === 'REVISION_REQUESTED') {
      timeline.push({
        id: `rejected-${milestone.id}`,
        type: 'rejected',
        timestamp: new Date(milestone.updatedAt),
        actor: {
          id: milestone.orderId,
          name: 'Alıcı',
          role: 'buyer',
        },
        reason: 'Revizyon gereksinimi', // Would come from backend in real scenario
      });
    }

    // Sort by timestamp (newest first)
    return timeline.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [milestone]);

  if (events.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-gray-500">
          <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm">Henüz bir aktivite yok</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        Revizyon Geçmişi
      </h3>

      <div className="space-y-6">
        {events.map((event, index) => {
          const metadata = eventMetadata[event.type];
          const Icon = metadata.icon;
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div
                  className="absolute top-12 bottom-0 left-6 w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}

              {/* Event Container */}
              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
                    metadata.bgColor
                  )}
                >
                  <Icon className={cn('h-6 w-6', metadata.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={event.actor.avatar}
                        alt={event.actor.name}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.actor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          <Badge
                            variant={
                              event.actor.role === 'buyer'
                                ? 'secondary'
                                : 'default'
                            }
                            size="sm"
                          >
                            {event.actor.role === 'buyer' ? 'Alıcı' : 'Satıcı'}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500">
                      {format(event.timestamp, 'dd MMM yyyy, HH:mm', {
                        locale: tr,
                      })}
                    </p>
                  </div>

                  {/* Event Label */}
                  <div className="mt-2">
                    <p className={cn('text-sm font-medium', metadata.color)}>
                      {metadata.label}
                    </p>
                  </div>

                  {/* Reason/Notes */}
                  {(event.reason || event.notes) && (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div className="text-sm text-gray-700">
                          {event.reason && (
                            <p className="mb-1">
                              <span className="font-medium">Neden:</span>{' '}
                              {event.reason}
                            </p>
                          )}
                          {event.notes && (
                            <p>
                              <span className="font-medium">Notlar:</span>{' '}
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default RevisionHistoryTimeline;
