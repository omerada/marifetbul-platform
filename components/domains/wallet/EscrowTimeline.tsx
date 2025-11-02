/**
 * ================================================
 * ESCROW TIMELINE COMPONENT
 * ================================================
 * Visual timeline of escrow payment lifecycle events
 *
 * Features:
 * - Chronological event display
 * - Status-based styling
 * - Icon indicators
 * - Event descriptions
 * - Dispute integration
 * - Real-time updates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Escrow System Enhancement
 */

'use client';

import React from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Shield,
  Snowflake,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

export type EscrowEventType =
  | 'PAYMENT_HELD'
  | 'DISPUTE_RAISED'
  | 'PAYMENT_FROZEN'
  | 'DISPUTE_RESOLVED'
  | 'PAYMENT_UNFROZEN'
  | 'PAYMENT_RELEASED'
  | 'REFUND_ISSUED'
  | 'AUTO_RELEASE_SCHEDULED'
  | 'ORDER_COMPLETED'
  | 'ORDER_DELIVERED';

export interface EscrowTimelineEvent {
  id: string;
  type: EscrowEventType;
  title: string;
  description: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN' | 'SYSTEM';
  };
  metadata?: Record<string, unknown>;
}

export interface EscrowTimelineProps {
  /** Timeline events */
  events: EscrowTimelineEvent[];

  /** Loading state */
  isLoading?: boolean;

  /** Show compact version */
  compact?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// EVENT CONFIGURATION
// ============================================================================

const EVENT_CONFIG: Record<
  EscrowEventType,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  PAYMENT_HELD: {
    icon: Lock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  DISPUTE_RAISED: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  PAYMENT_FROZEN: {
    icon: Snowflake,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  DISPUTE_RESOLVED: {
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  PAYMENT_UNFROZEN: {
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  PAYMENT_RELEASED: {
    icon: Unlock,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  REFUND_ISSUED: {
    icon: XCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  AUTO_RELEASE_SCHEDULED: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  ORDER_COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  ORDER_DELIVERED: {
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function EscrowTimeline({
  events,
  isLoading = false,
  compact = false,
  className = '',
}: EscrowTimelineProps) {
  // Sort events by timestamp (newest first)
  const sortedEvents = React.useMemo(() => {
    return [...events].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <div className="space-y-4 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                <div className="bg-muted h-3 w-48 animate-pulse rounded" />
                <div className="bg-muted h-3 w-24 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <Card className={className}>
        <div className="p-8 text-center">
          <Clock className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Henüz Etkinlik Yok
          </h3>
          <p className="text-muted-foreground text-sm">
            Emanet işlem geçmişi burada görünecektir.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className={compact ? 'p-4' : 'p-6'}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          İşlem Geçmişi
        </h3>

        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="bg-border absolute top-0 left-5 h-full w-0.5" />

          {/* Timeline events */}
          {sortedEvents.map((event, index) => {
            const config = EVENT_CONFIG[event.type];
            const Icon = config.icon;
            const isLast = index === sortedEvents.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4 pb-2">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${config.borderColor} ${config.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {/* Timestamp */}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>

                    {/* Actor */}
                    {event.actor && (
                      <span className="flex items-center gap-1">
                        •<span className="font-medium">{event.actor.name}</span>
                        {event.actor.role !== 'SYSTEM' && (
                          <span className="text-muted-foreground">
                            ({getRoleLabel(event.actor.role)})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleLabel(role: 'BUYER' | 'SELLER' | 'ADMIN' | 'SYSTEM'): string {
  const labels = {
    BUYER: 'Alıcı',
    SELLER: 'Satıcı',
    ADMIN: 'Admin',
    SYSTEM: 'Sistem',
  };
  return labels[role];
}

/**
 * Create timeline event from payment/order data
 */
export function createEscrowTimelineEvent(
  type: EscrowEventType,
  data: {
    id: string;
    timestamp: string;
    actor?: EscrowTimelineEvent['actor'];
    metadata?: Record<string, unknown>;
  }
): EscrowTimelineEvent {
  const titles: Record<EscrowEventType, string> = {
    PAYMENT_HELD: 'Ödeme Emanete Alındı',
    DISPUTE_RAISED: 'İhtilaf Açıldı',
    PAYMENT_FROZEN: 'Ödeme Donduruldu',
    DISPUTE_RESOLVED: 'İhtilaf Çözümlendi',
    PAYMENT_UNFROZEN: 'Ödeme Çözüldü',
    PAYMENT_RELEASED: 'Ödeme Serbest Bırakıldı',
    REFUND_ISSUED: 'İade Yapıldı',
    AUTO_RELEASE_SCHEDULED: 'Otomatik Serbest Bırakma Planlandı',
    ORDER_COMPLETED: 'Sipariş Tamamlandı',
    ORDER_DELIVERED: 'Sipariş Teslim Edildi',
  };

  const descriptions: Record<EscrowEventType, string> = {
    PAYMENT_HELD: 'Ödeme güvenli şekilde emanette tutuluyor',
    DISPUTE_RAISED: 'Sipariş için ihtilaf süreci başlatıldı',
    PAYMENT_FROZEN: 'İhtilaf nedeniyle ödeme donduruldu',
    DISPUTE_RESOLVED: 'İhtilaf yönetici tarafından çözümlendi',
    PAYMENT_UNFROZEN: 'Ödeme işleme alınmaya hazır',
    PAYMENT_RELEASED: 'Ödeme satıcı hesabına aktarıldı',
    REFUND_ISSUED: 'Ödeme alıcıya iade edildi',
    AUTO_RELEASE_SCHEDULED: 'Ödeme 30 gün sonra otomatik serbest bırakılacak',
    ORDER_COMPLETED: 'Sipariş başarıyla tamamlandı',
    ORDER_DELIVERED: 'Satıcı işi teslim etti',
  };

  return {
    id: data.id,
    type,
    title: titles[type],
    description: descriptions[type],
    timestamp: data.timestamp,
    actor: data.actor,
    metadata: data.metadata,
  };
}

export default EscrowTimeline;
