/**
 * ================================================
 * ORDER ACTIVITY LOG
 * ================================================
 * Enhanced activity timeline for order detail pages
 *
 * Features:
 * - Full order history
 * - Status changes
 * - User actions
 * - System events
 * - File attachments
 * - Message references
 * - Revision tracking
 * - Real-time updates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  FileText,
  MessageSquare,
  RefreshCw,
  Flag,
  DollarSign,
  User,
  Upload,
  Download,
} from 'lucide-react';
import type { OrderEvent } from '@/types/backend-aligned';
import { useWebSocket } from '@/hooks';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

interface OrderActivityLogProps {
  /** Order ID */
  orderId: string;
  /** Initial events */
  events?: OrderEvent[];
  /** Enable real-time updates */
  enableRealtime?: boolean;
  /** Show detailed metadata */
  showDetails?: boolean;
  /** Maximum height (scrollable) */
  maxHeight?: string;
}

interface ActivityItemProps {
  event: OrderEvent;
  showDetails: boolean;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

const getEventIcon = (eventType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    ORDER_CREATED: <Package className="h-4 w-4" />,
    ORDER_PAID: <DollarSign className="h-4 w-4" />,
    ORDER_ACCEPTED: <CheckCircle className="h-4 w-4" />,
    ORDER_STARTED: <Clock className="h-4 w-4" />,
    ORDER_DELIVERED: <Upload className="h-4 w-4" />,
    ORDER_APPROVED: <CheckCircle className="h-4 w-4" />,
    ORDER_COMPLETED: <CheckCircle className="h-4 w-4" />,
    ORDER_CANCELLED: <XCircle className="h-4 w-4" />,
    REVISION_REQUESTED: <RefreshCw className="h-4 w-4" />,
    REVISION_SUBMITTED: <Upload className="h-4 w-4" />,
    DISPUTE_CREATED: <Flag className="h-4 w-4" />,
    DISPUTE_RESOLVED: <CheckCircle className="h-4 w-4" />,
    MESSAGE_SENT: <MessageSquare className="h-4 w-4" />,
    FILE_UPLOADED: <FileText className="h-4 w-4" />,
    FILE_DOWNLOADED: <Download className="h-4 w-4" />,
    STATUS_CHANGED: <AlertCircle className="h-4 w-4" />,
  };

  return iconMap[eventType] || <AlertCircle className="h-4 w-4" />;
};

// Map OrderEvent.type to display properties
const mapEventType = (event: OrderEvent) => {
  return {
    eventType: event.type,
    timestamp: event.createdAt,
    actorName: event.performedByName || event.performedBy,
  };
};

const getEventColor = (eventType: string) => {
  const colorMap: Record<string, { icon: string; bg: string; border: string }> = {
    ORDER_CREATED: { icon: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    ORDER_PAID: { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    ORDER_ACCEPTED: { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    ORDER_STARTED: { icon: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    ORDER_DELIVERED: { icon: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    ORDER_APPROVED: { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    ORDER_COMPLETED: { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    ORDER_CANCELLED: { icon: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    REVISION_REQUESTED: { icon: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
    REVISION_SUBMITTED: { icon: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    DISPUTE_CREATED: { icon: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    DISPUTE_RESOLVED: { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    MESSAGE_SENT: { icon: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
    FILE_UPLOADED: { icon: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    FILE_DOWNLOADED: { icon: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
    STATUS_CHANGED: { icon: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
  };

  return colorMap[eventType] || { icon: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
};

const getEventTitle = (eventType: string) => {
  const titleMap: Record<string, string> = {
    ORDER_CREATED: 'Sipariş Oluşturuldu',
    ORDER_PAID: 'Ödeme Tamamlandı',
    ORDER_ACCEPTED: 'Sipariş Kabul Edildi',
    ORDER_STARTED: 'İş Başlatıldı',
    ORDER_DELIVERED: 'Teslimat Yapıldı',
    ORDER_APPROVED: 'Teslimat Onaylandı',
    ORDER_COMPLETED: 'Sipariş Tamamlandı',
    ORDER_CANCELLED: 'Sipariş İptal Edildi',
    REVISION_REQUESTED: 'Revizyon İstendi',
    REVISION_SUBMITTED: 'Revizyon Teslim Edildi',
    DISPUTE_CREATED: 'İtiraz Açıldı',
    DISPUTE_RESOLVED: 'İtiraz Çözüldü',
    MESSAGE_SENT: 'Mesaj Gönderildi',
    FILE_UPLOADED: 'Dosya Yüklendi',
    FILE_DOWNLOADED: 'Dosya İndirildi',
    STATUS_CHANGED: 'Durum Değişti',
  };

  return titleMap[eventType] || eventType;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ================================================
// SUB-COMPONENTS
// ================================================

function ActivityItem({ event, showDetails }: ActivityItemProps) {
  const mapped = mapEventType(event);
  const colors = getEventColor(mapped.eventType);

  return (
    <div className="flex gap-4">
      {/* Icon */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2',
            colors.bg,
            colors.border
          )}
        >
          <span className={colors.icon}>{getEventIcon(mapped.eventType)}</span>
        </div>
        {/* Connector line */}
        <div className="mt-2 h-full w-0.5 bg-gray-200" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">
              {getEventTitle(mapped.eventType)}
            </h4>
            {event.description && (
              <p className="mt-1 text-sm text-gray-600">{event.description}</p>
            )}
          </div>
          <time className="text-xs text-gray-500">
            {formatTimestamp(mapped.timestamp)}
          </time>
        </div>

        {/* Actor */}
        {mapped.actorName && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>{mapped.actorName}</span>
          </div>
        )}

        {/* Metadata */}
        {showDetails && event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="space-y-1 text-xs">
              {Object.entries(event.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function OrderActivityLog({
  orderId,
  events: initialEvents = [],
  enableRealtime = true,
  showDetails = true,
  maxHeight = '600px',
}: OrderActivityLogProps) {
  const [events, setEvents] = useState<OrderEvent[]>(initialEvents);
  const { subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: enableRealtime,
    enableStoreIntegration: false,
  });

  // Update events when prop changes
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime || !isConnected || !orderId) return;

    const destination = `/user/queue/orders/${orderId}/events`;
    const _subscriptionId = subscribe(destination, (msg: unknown) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = msg as any;
        const newEvent = JSON.parse(message.body) as OrderEvent;

        // Add new event to the top
        setEvents((prev) => [newEvent, ...prev]);
      } catch (err) {
        logger.error('Failed to parse order event:', err);
      }
    });

    return () => {
      unsubscribe(destination);
    };
  }, [enableRealtime, isConnected, orderId, subscribe, unsubscribe]);

  // ================================================
  // RENDER
  // ================================================

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-900">Aktivite Geçmişi</h3>
        <p className="text-xs text-gray-600">
          Sipariş ile ilgili tüm işlemler
        </p>
      </div>

      {/* Timeline */}
      <div
        className="overflow-y-auto p-6"
        style={{ maxHeight }}
      >
        {events.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Henüz aktivite yok</p>
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event, index) => (
              <ActivityItem
                key={event.id || index}
                event={event}
                showDetails={showDetails}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
