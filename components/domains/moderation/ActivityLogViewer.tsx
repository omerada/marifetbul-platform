'use client';

/**
 * ================================================
 * ACTIVITY LOG VIEWER
 * ================================================
 * Displays moderation activity history with filters
 * Shows audit trail of all moderation actions
 *
 * Day 2 Story 2.4 - Sprint 2
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  AlertOctagon,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';

// API
import { getModeratorActivityHistory } from '@/lib/api/moderation-activity';
import { ActionType } from '@/types/business/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';

/**
 * Activity item type
 */
interface ActivityItem {
  activityId: string;
  actionType: ActionType;
  targetType: string;
  targetId: string;
  reason?: string;
  notes?: string;
  timestamp: string;
  moderatorName: string;
}

/**
 * Component props
 */
export interface ActivityLogViewerProps {
  initialFilters?: {
    actionType?: ActionType;
    startDate?: string;
    endDate?: string;
  };
  pageSize?: number;
  showFilters?: boolean;
}

/**
 * Get action icon
 */
const getActionIcon = (actionType: ActionType) => {
  const icons = {
    [ActionType.APPROVE]: CheckCircle,
    [ActionType.REJECT]: XCircle,
    [ActionType.SPAM]: AlertOctagon,
    [ActionType.BULK_APPROVE]: CheckCircle,
    [ActionType.BULK_REJECT]: XCircle,
    [ActionType.BULK_SPAM]: AlertOctagon,
    [ActionType.RESOLVE]: CheckCircle,
    [ActionType.CLOSE]: XCircle,
    [ActionType.WARN]: AlertOctagon,
    [ActionType.BAN]: XCircle,
  };
  return icons[actionType] || Clock;
};

/**
 * Get action color
 */
const getActionColor = (actionType: ActionType): string => {
  const colors = {
    [ActionType.APPROVE]: 'text-green-600 bg-green-50',
    [ActionType.REJECT]: 'text-red-600 bg-red-50',
    [ActionType.SPAM]: 'text-orange-600 bg-orange-50',
    [ActionType.BULK_APPROVE]: 'text-green-600 bg-green-50',
    [ActionType.BULK_REJECT]: 'text-red-600 bg-red-50',
    [ActionType.BULK_SPAM]: 'text-orange-600 bg-orange-50',
    [ActionType.RESOLVE]: 'text-blue-600 bg-blue-50',
    [ActionType.CLOSE]: 'text-gray-600 bg-gray-50',
    [ActionType.WARN]: 'text-yellow-600 bg-yellow-50',
    [ActionType.BAN]: 'text-red-800 bg-red-100',
  };
  return colors[actionType] || 'text-gray-600 bg-gray-50';
};

/**
 * Get action label in Turkish
 */
const getActionLabel = (actionType: ActionType): string => {
  const labels = {
    [ActionType.APPROVE]: 'Onaylandı',
    [ActionType.REJECT]: 'Reddedildi',
    [ActionType.SPAM]: 'Spam İşaretlendi',
    [ActionType.BULK_APPROVE]: 'Toplu Onay',
    [ActionType.BULK_REJECT]: 'Toplu Ret',
    [ActionType.BULK_SPAM]: 'Toplu Spam',
    [ActionType.RESOLVE]: 'Çözüldü',
    [ActionType.CLOSE]: 'Kapatıldı',
    [ActionType.WARN]: 'Uyarıldı',
    [ActionType.BAN]: 'Yasaklandı',
  };
  return labels[actionType] || actionType;
};

/**
 * Activity Log Viewer Component
 */
export function ActivityLogViewer({
  initialFilters = {},
  pageSize = 20,
  showFilters = true,
}: ActivityLogViewerProps) {
  // State
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Fetch activities
   */
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getModeratorActivityHistory({
        ...filters,
        page: page - 1, // Backend uses 0-indexed
        size: pageSize,
      });

      setActivities(response.activities);
      setTotal(response.total);
    } catch (err) {
      logger.error('Failed to fetch activities', err as Error);
      setError('Aktivite geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  /**
   * Initial load and reload on filter/page change
   */
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchActivities();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Moderasyon Aktivite Geçmişi</CardTitle>
          <UnifiedButton
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </UnifiedButton>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                İşlem Tipi
              </label>
              <Select
                value={filters.actionType || ''}
                onValueChange={(value) =>
                  handleFilterChange('actionType', value)
                }
              >
                <SelectTrigger placeholder="Tümü" />
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value={ActionType.APPROVE}>Onay</SelectItem>
                  <SelectItem value={ActionType.REJECT}>Ret</SelectItem>
                  <SelectItem value={ActionType.SPAM}>Spam</SelectItem>
                  <SelectItem value={ActionType.BULK_APPROVE}>
                    Toplu Onay
                  </SelectItem>
                  <SelectItem value={ActionType.BULK_REJECT}>
                    Toplu Ret
                  </SelectItem>
                  <SelectItem value={ActionType.BULK_SPAM}>
                    Toplu Spam
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && activities.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Yükleniyor...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-red-700">{error}</p>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-3"
            >
              Tekrar Dene
            </UnifiedButton>
          </div>
        )}

        {/* Activity List */}
        {!loading && !error && activities.length === 0 && (
          <div className="py-12 text-center">
            <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Henüz aktivite kaydı bulunmuyor</p>
          </div>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActionIcon(activity.actionType);
              const colorClass = getActionColor(activity.actionType);

              return (
                <div
                  key={activity.activityId}
                  className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  {/* Icon */}
                  <div className={`rounded-lg p-2 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getActionLabel(activity.actionType)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {activity.targetType} #{activity.targetId}
                      </span>
                    </div>

                    {activity.notes && (
                      <p className="mb-2 text-sm text-gray-700">
                        {activity.notes}
                      </p>
                    )}

                    {activity.reason && (
                      <p className="mb-2 text-xs text-gray-600">
                        <span className="font-medium">Neden:</span>{' '}
                        {activity.reason}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.moderatorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(activity.timestamp), 'PPp', {
                          locale: tr,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Info */}
        {total > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Toplam {total} aktivite • Sayfa {page} /{' '}
            {Math.ceil(total / pageSize)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityLogViewer;
