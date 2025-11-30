/**
 * ================================================
 * DISPUTE TIMELINE COMPONENT
 * ================================================
 * Timeline component showing dispute event history
 *
 * Features:
 * - Chronological event display
 * - Event type icons and colors
 * - User actions and admin responses
 * - Timestamps
 * - Visual timeline connector
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2.2: Dispute Timeline Component
 */

'use client';

import React from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui';

// ================================================
// TYPES
// ================================================

export type DisputeEventType =
  | 'CREATED'
  | 'UPDATED'
  | 'UNDER_REVIEW'
  | 'ADMIN_COMMENT'
  | 'USER_RESPONSE'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED';

export interface DisputeEvent {
  id: string;
  type: DisputeEventType;
  title: string;
  description?: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
    role: 'user' | 'admin' | 'system';
  };
  metadata?: Record<string, unknown>;
}

interface DisputeTimelineProps {
  /** List of events in chronological order */
  events: DisputeEvent[];
  /** Whether to show compact view */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEventIcon(type: DisputeEventType): React.ReactNode {
  const iconProps = { className: 'h-4 w-4' };

  switch (type) {
    case 'CREATED':
      return <AlertCircle {...iconProps} />;
    case 'UPDATED':
      return <FileText {...iconProps} />;
    case 'UNDER_REVIEW':
      return <Clock {...iconProps} />;
    case 'ADMIN_COMMENT':
      return <MessageSquare {...iconProps} />;
    case 'USER_RESPONSE':
      return <User {...iconProps} />;
    case 'RESOLVED':
      return <CheckCircle {...iconProps} />;
    case 'REJECTED':
      return <XCircle {...iconProps} />;
    case 'CLOSED':
      return <CheckCircle {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
}

function getEventColor(type: DisputeEventType): {
  bg: string;
  text: string;
  border: string;
} {
  switch (type) {
    case 'CREATED':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
      };
    case 'UPDATED':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
      };
    case 'UNDER_REVIEW':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
      };
    case 'ADMIN_COMMENT':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
      };
    case 'USER_RESPONSE':
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
      };
    case 'RESOLVED':
      return {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
      };
    case 'REJECTED':
      return {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
      };
    case 'CLOSED':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
      };
  }
}

// ================================================
// COMPONENT
// ================================================

export function DisputeTimeline({
  events,
  compact = false,
  className = '',
}: DisputeTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <p className="text-center text-sm text-gray-500">
          Henüz hiçbir olay kaydedilmemiş
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {events.map((event, index) => {
        const colors = getEventColor(event.type);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-3">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute top-10 left-4 h-full w-0.5 bg-gray-200" />
            )}

            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {getEventIcon(event.type)}
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 ${compact ? 'pb-2' : 'pb-4'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  {event.description && !compact && (
                    <p className="mt-1 text-sm text-gray-600">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatTimestamp(event.timestamp)}</span>
                    {event.actor && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.actor.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata (if any) */}
              {event.metadata &&
                Object.keys(event.metadata).length > 0 &&
                !compact && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <div className="space-y-1 text-xs">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            {key}:
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
      })}
    </div>
  );
}

// ================================================
// HELPER FUNCTION TO CREATE EVENTS FROM DISPUTE
// ================================================

export function createTimelineEvents(dispute: {
  id: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  status: string;
  raisedByUserFullName: string;
  resolvedByUserFullName?: string | null;
  resolutionType?: string | null;
}): DisputeEvent[] {
  const events: DisputeEvent[] = [];

  // Created event
  events.push({
    id: `${dispute.id}-created`,
    type: 'CREATED',
    title: 'İtiraz Oluşturuldu',
    description: 'İtiraz başarıyla oluşturuldu ve incelemeye alındı.',
    timestamp: dispute.createdAt,
    actor: {
      id: 'user',
      name: dispute.raisedByUserFullName,
      role: 'user',
    },
  });

  // Under review event (if updated)
  if (dispute.updatedAt !== dispute.createdAt) {
    events.push({
      id: `${dispute.id}-review`,
      type: 'UNDER_REVIEW',
      title: 'İnceleme Başladı',
      description: 'İtiraz yönetim ekibi tarafından inceleniyor.',
      timestamp: dispute.updatedAt,
      actor: {
        id: 'system',
        name: 'Sistem',
        role: 'system',
      },
    });
  }

  // Resolved event
  if (
    dispute.resolvedAt &&
    (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED')
  ) {
    events.push({
      id: `${dispute.id}-resolved`,
      type: dispute.status === 'RESOLVED' ? 'RESOLVED' : 'CLOSED',
      title:
        dispute.status === 'RESOLVED'
          ? 'İtiraz Çözümlendi'
          : 'İtiraz Kapatıldı',
      description:
        dispute.status === 'RESOLVED'
          ? 'İtiraz başarıyla çözümlendi ve karar bildirildi.'
          : 'İtiraz kapatıldı.',
      timestamp: dispute.resolvedAt,
      actor: dispute.resolvedByUserFullName
        ? {
            id: 'admin',
            name: dispute.resolvedByUserFullName,
            role: 'admin',
          }
        : undefined,
      metadata: dispute.resolutionType
        ? { 'Çözüm Tipi': dispute.resolutionType }
        : undefined,
    });
  }

  return events;
}

export default DisputeTimeline;
