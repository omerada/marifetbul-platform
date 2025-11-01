'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { DisputeResponse } from '@/types/dispute';
import { disputeStatusLabels } from '@/types/dispute';

interface DisputeTimelineProps {
  dispute: DisputeResponse;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'message' | 'evidence' | 'resolved';
  title: string;
  description?: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export function DisputeTimeline({ dispute }: DisputeTimelineProps) {
  const events: TimelineEvent[] = [];

  // Created event
  events.push({
    id: 'created',
    type: 'created',
    title: 'İtiraz Oluşturuldu',
    description: `${dispute.raisedByUserFullName} tarafından açıldı`,
    timestamp: dispute.createdAt,
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-red-500',
  });

  // Status changes (simulated - in real app, would come from backend)
  if (dispute.status !== 'OPEN') {
    events.push({
      id: 'status-review',
      type: 'status_change',
      title: 'Durum Değişikliği',
      description: `Durum: ${disputeStatusLabels[dispute.status]}`,
      timestamp: dispute.updatedAt,
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-blue-500',
    });
  }

  // Evidence uploaded
  if (dispute.evidenceUrls && dispute.evidenceUrls.length > 0) {
    events.push({
      id: 'evidence',
      type: 'evidence',
      title: 'Kanıt Yüklendi',
      description: `${dispute.evidenceUrls.length} dosya eklendi`,
      timestamp: dispute.updatedAt,
      icon: <FileText className="h-4 w-4" />,
      color: 'bg-purple-500',
    });
  }

  // Resolved event
  if (dispute.status === 'RESOLVED' && dispute.resolvedAt) {
    events.push({
      id: 'resolved',
      type: 'resolved',
      title: 'İtiraz Çözüldü',
      description: dispute.resolvedByUserFullName
        ? `${dispute.resolvedByUserFullName} tarafından çözüldü`
        : 'Çözüme kavuşturuldu',
      timestamp: dispute.resolvedAt,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-green-500',
    });
  }

  // Sort events by timestamp (newest first)
  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>İtiraz Zaman Çizelgesi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${event.color} text-white`}
                >
                  {event.icon}
                </div>
                {index < events.length - 1 && (
                  <div className="bg-border mt-2 h-full w-0.5" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-6">
                <div className="mb-1 flex items-start justify-between">
                  <h4 className="text-sm font-semibold">{event.title}</h4>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
                {event.description && (
                  <p className="text-muted-foreground text-sm">
                    {event.description}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(event.timestamp).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Status Badge */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Güncel Durum:</span>
            <Badge variant="outline">
              {disputeStatusLabels[dispute.status]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
