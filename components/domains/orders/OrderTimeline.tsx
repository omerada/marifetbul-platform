/**
 * ================================================
 * ORDER TIMELINE COMPONENT
 * ================================================
 * Displays chronological order events with real-time updates
 *
 * Features:
 * - Chronological event list
 * - Status-based icons & colors
 * - User attribution
 * - Real-time WebSocket updates
 * - Metadata display
 * - Timestamp formatting
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1.3: Enhanced with Real-time & OrderEvent support
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  DollarSign,
  RefreshCw,
  Send,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderEvent } from '@/types/backend-aligned';
import { useWebSocket } from '@/hooks';

// ================================================
// TYPES
// ================================================

// Legacy type for backward compatibility
interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface OrderTimelineProps {
  /** Order ID for WebSocket subscriptions */
  orderId?: string;
  /** Events data - supports both OrderEvent and legacy TimelineEvent */
  events: OrderEvent[] | TimelineEvent[];
  /** Enable real-time WebSocket updates */
  enableRealtime?: boolean;
  /** Compact mode (less spacing) */
  compact?: boolean;
  /** Show header */
  showHeader?: boolean;
  /** Max height (scrollable) */
  maxHeight?: string;
  /** Custom className */
  className?: string;
}

interface EventIconConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function OrderTimeline({
  orderId,
  events,
  enableRealtime = false,
  compact = false,
  showHeader = true,
  maxHeight,
  className = '',
}: OrderTimelineProps) {
  const [timelineEvents, setTimelineEvents] =
    useState<(OrderEvent | TimelineEvent)[]>(events);
  const { subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: enableRealtime && !!orderId,
    enableStoreIntegration: false,
  });

  // Update events when prop changes
  useEffect(() => {
    setTimelineEvents(events);
  }, [events]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!enableRealtime || !isConnected || !orderId) return;

    const subscriptionId = subscribe(
      `/user/queue/orders/${orderId}/events`,
      (message: unknown) => {
        try {
          if (!message || typeof message !== 'object' || !('body' in message)) {
            return;
          }

          const msgBody = (message as { body: string }).body;
          const newEvent = JSON.parse(msgBody) as OrderEvent;

          // Add new event to the beginning
          setTimelineEvents((prev) => [newEvent, ...prev]);
        } catch (err) {
          console.error('Failed to parse order event:', err);
        }
      }
    );

    return () => {
      unsubscribe(subscriptionId);
    };
  }, [enableRealtime, isConnected, orderId, subscribe, unsubscribe]);

  // Type guard to check if event is OrderEvent
  const isOrderEvent = (
    event: OrderEvent | TimelineEvent
  ): event is OrderEvent => {
    return 'type' in event && !('isCompleted' in event);
  };

  // Get icon config for OrderEvent type
  const getOrderEventIcon = (eventType: string): EventIconConfig => {
    const EVENT_ICONS: Record<string, EventIconConfig> = {
      ORDER_CREATED: {
        icon: <Package className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      ORDER_PAID: {
        icon: <DollarSign className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      ORDER_ACCEPTED: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      ORDER_STARTED: {
        icon: <Send className="h-4 w-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      DELIVERY_SUBMITTED: {
        icon: <FileText className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      REVISION_REQUESTED: {
        icon: <RefreshCw className="h-4 w-4" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
      },
      ORDER_COMPLETED: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      ORDER_CANCELED: {
        icon: <XCircle className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
      DISPUTE_OPENED: {
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
      MESSAGE_SENT: {
        icon: <MessageSquare className="h-4 w-4" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      },
      DEFAULT: {
        icon: <Clock className="h-4 w-4" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      },
    };

    return EVENT_ICONS[eventType] || EVENT_ICONS.DEFAULT;
  };
  // Get status icon
  const getStatusIcon = (event: TimelineEvent) => {
    if (event.isCompleted) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    if (event.isCurrent) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
          <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-600"></div>
        </div>
      );
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
      </div>
    );
  };

  // Get display data for any event type
  const getEventDisplayData = (event: OrderEvent | TimelineEvent) => {
    if (isOrderEvent(event)) {
      return {
        title: event.description,
        timestamp: event.createdAt,
        actor: event.performedByName || null,
        badge: event.type,
        isCompleted: [
          'ORDER_COMPLETED',
          'ORDER_CANCELED',
          'DISPUTE_RESOLVED',
        ].includes(event.type),
        isCurrent: false,
      };
    }

    return {
      title: event.title,
      timestamp: event.timestamp,
      actor: event.actor || null,
      badge: event.status,
      isCompleted: event.isCompleted,
      isCurrent: event.isCurrent,
    };
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const displayEvents = timelineEvents.length > 0 ? timelineEvents : events;
  const isEmpty = displayEvents.length === 0;

  if (isEmpty) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sipariş Zaman Çizelgesi
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-3 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500">Henüz hiç olay kaydedilmedi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sipariş Zaman Çizelgesi
            {enableRealtime && isConnected && (
              <Badge variant="outline" className="ml-auto text-xs">
                <div className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Canlı
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={compact ? 'p-4' : undefined}>
        <div className="relative">
          <div className="absolute top-0 left-5 h-full w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {displayEvents.map((event, index) => {
              const eventData = getEventDisplayData(event);
              const eventIcon = isOrderEvent(event) ? (
                <div className="relative z-10">
                  {getOrderEventIcon(event.type).icon && (
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        getOrderEventIcon(event.type).bgColor
                      )}
                    >
                      <div className={getOrderEventIcon(event.type).color}>
                        {getOrderEventIcon(event.type).icon}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative z-10">
                  {getStatusIcon(event as TimelineEvent)}
                </div>
              );

              return (
                <div
                  key={isOrderEvent(event) ? event.id : `legacy-${index}`}
                  className="relative flex gap-4"
                >
                  {eventIcon}

                  <div className="flex-1 pb-8">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4
                            className={cn(
                              'font-semibold',
                              eventData.isCurrent && 'text-indigo-600',
                              eventData.isCompleted && 'text-gray-900',
                              !eventData.isCurrent &&
                                !eventData.isCompleted &&
                                'text-gray-500'
                            )}
                          >
                            {eventData.title}
                          </h4>
                          {isOrderEvent(event) && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {eventData.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
                          <span>
                            {new Date(eventData.timestamp).toLocaleDateString(
                              'tr-TR',
                              {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                          {!compact && (
                            <span className="text-gray-400">
                              {formatRelativeTime(
                                new Date(eventData.timestamp)
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {isOrderEvent(event) && event.metadata && (
                        <p className="mb-2 text-sm text-gray-600">
                          {JSON.stringify(event.metadata)}
                        </p>
                      )}

                      {eventData.actor && (
                        <p className="mt-2 text-xs text-gray-500">
                          {eventData.actor} tarafından
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderTimeline;
