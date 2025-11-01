'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ActionType } from '@/types/business/moderation';
import type { ModeratorActivity } from '@/types/business/moderation';

interface ModerationHistoryProps {
  activities: ModeratorActivity[];
  isLoading?: boolean;
  className?: string;
}

const actionConfigBase: Partial<
  Record<ActionType, { icon: React.ReactNode; label: string; color: string }>
> = {
  [ActionType.APPROVE]: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Onaylandı',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  [ActionType.REJECT]: {
    icon: <XCircle className="h-4 w-4" />,
    label: 'Reddedildi',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  [ActionType.SPAM]: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: 'Spam',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  [ActionType.RESOLVE]: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Çözüldü',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [ActionType.WARN]: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: 'Uyarı Verildi',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [ActionType.BAN]: {
    icon: <Ban className="h-4 w-4" />,
    label: 'Askıya Alındı',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  [ActionType.CLOSE]: {
    icon: <XCircle className="h-4 w-4" />,
    label: 'Kapatıldı',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  [ActionType.BULK_APPROVE]: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Toplu Onay',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  [ActionType.BULK_REJECT]: {
    icon: <XCircle className="h-4 w-4" />,
    label: 'Toplu Red',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  [ActionType.BULK_SPAM]: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: 'Toplu Spam',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

// Default config for unknown action types
const defaultConfig = {
  icon: <User className="h-4 w-4" />,
  label: 'İşlem',
  color: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ModerationHistory({
  activities,
  isLoading = false,
  className = '',
}: ModerationHistoryProps) {
  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="mb-4 text-lg font-semibold">Moderasyon Geçmişi</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="mb-4 text-lg font-semibold">Moderasyon Geçmişi</h3>
        <div className="py-8 text-center text-gray-500">
          <Clock className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p>Henüz moderasyon geçmişi bulunmuyor</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Moderasyon Geçmişi</h3>
        <Badge variant="outline" className="text-xs">
          {activities.length} işlem
        </Badge>
      </div>

      <div className="max-h-[600px] space-y-4 overflow-y-auto">
        {activities.map((activity) => {
          const config = actionConfigBase[activity.actionType] || defaultConfig;

          return (
            <div
              key={activity.activityId}
              className="-mx-2 flex gap-4 rounded-lg border-b px-2 py-2 pb-4 transition-colors last:border-b-0 last:pb-0 hover:bg-gray-50"
            >
              {/* Moderator Avatar */}
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Activity Content */}
              <div className="min-w-0 flex-1">
                {/* Header */}
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {activity.moderatorName}
                    </span>
                    <Badge
                      className={`${config.color} flex items-center gap-1 text-xs`}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  <time className="flex flex-shrink-0 items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </time>
                </div>

                {/* Target Info */}
                <div className="mb-2 text-sm text-gray-600">
                  <span className="font-medium">{activity.targetType}</span>
                  {activity.targetId && (
                    <span className="text-gray-400"> #{activity.targetId}</span>
                  )}
                  {activity.affectedUserName && (
                    <span>
                      {' '}
                      ·{' '}
                      <span className="text-gray-900">
                        {activity.affectedUserName}
                      </span>
                    </span>
                  )}
                </div>

                {/* Notes/Reason */}
                {activity.reason && (
                  <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-2 text-sm text-gray-700">
                    {activity.reason}
                  </div>
                )}

                {/* Description */}
                {activity.description && (
                  <div className="mt-1 text-sm text-gray-600">
                    {activity.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default ModerationHistory;
