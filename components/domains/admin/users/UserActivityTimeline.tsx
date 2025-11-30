'use client';

/**
 * ================================================
 * USER ACTIVITY TIMELINE COMPONENT
 * ================================================
 * Display user activity history with filtering and pagination
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2.3
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Filter, Calendar, Activity as ActivityIcon } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { adminUsersApi } from '@/lib/api/admin-users';
import { useToast } from '@/hooks';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  type UserActivityLog,
  type ActivityType,
  type ActivityCategory,
  getActivityTypeConfig,
  getActivityCategoryConfig,
  formatActivityDescription,
  isActivityError,
  isActivitySlow,
} from '@/types/admin/user-activity';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { UnifiedLoading } from '@/components/ui/UnifiedLoadingSystem';

interface UserActivityTimelineProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
  'LOGIN',
  'LOGOUT',
  'REGISTRATION',
  'PROFILE_UPDATE',
  'PACKAGE_VIEW',
  'PACKAGE_CREATED',
  'ORDER_CREATED',
  'PAYMENT',
  'MESSAGE_SENT',
  'REVIEW_POSTED',
];

const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'AUTHENTICATION',
  'PROFILE',
  'MARKETPLACE',
  'TRANSACTION',
  'MESSAGING',
  'SOCIAL',
  'CONTENT',
];

export function UserActivityTimeline({
  userId,
  userName,
  open,
  onClose,
}: UserActivityTimelineProps) {
  const { error: showError } = useToast();
  const [activities, setActivities] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [activityTypeFilter, setActivityTypeFilter] = useState<
    ActivityType | 'ALL'
  >('ALL');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<
    ActivityCategory | 'ALL'
  >('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<
    '24h' | '7d' | '30d' | 'all'
  >('7d');

  // Selected activity for details
  const [selectedActivity, setSelectedActivity] =
    useState<UserActivityLog | null>(null);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);

      // Calculate date range
      let startDate: string | undefined;
      const now = new Date();
      if (dateRangeFilter !== 'all') {
        const daysAgo = {
          '24h': 1,
          '7d': 7,
          '30d': 30,
        }[dateRangeFilter];

        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        startDate = date.toISOString();
      }

      const response = await adminUsersApi.getUserActivity(userId, {
        activityType:
          activityTypeFilter !== 'ALL' ? activityTypeFilter : undefined,
        activityCategory:
          activityCategoryFilter !== 'ALL' ? activityCategoryFilter : undefined,
        startDate,
        endDate: now.toISOString(),
        page,
        size: 20,
        sort: 'activityTimestamp,desc',
      });

      if (response.success && response.data) {
        setActivities(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      logger.error('Error fetching user activities', error as Error);
      showError('Hata', 'Kullanıcı aktiviteleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and filter changes
  useEffect(() => {
    if (open) {
      setPage(0); // Reset to first page on filter change
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    userId,
    activityTypeFilter,
    activityCategoryFilter,
    dateRangeFilter,
  ]);

  // Fetch on page change
  useEffect(() => {
    if (open && page > 0) {
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Reset filters
  const resetFilters = () => {
    setActivityTypeFilter('ALL');
    setActivityCategoryFilter('ALL');
    setDateRangeFilter('7d');
    setPage(0);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5" />
                Kullanıcı Aktiviteleri - {userName}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Filters */}
          <div className="space-y-3 border-b pb-4">
            <div className="flex items-center gap-2">
              <Filter className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Filtreler</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto text-xs"
              >
                Sıfırla
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Activity Type Filter */}
              <Select
                value={activityTypeFilter}
                onValueChange={(value) =>
                  setActivityTypeFilter(value as ActivityType | 'ALL')
                }
              >
                <SelectTrigger placeholder="Aktivite Tipi" />
                <SelectContent>
                  <SelectItem value="ALL">Tüm Aktiviteler</SelectItem>
                  {ACTIVITY_TYPES.map((type) => {
                    const config = getActivityTypeConfig(type);
                    return (
                      <SelectItem key={type} value={type}>
                        {config.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Activity Category Filter */}
              <Select
                value={activityCategoryFilter}
                onValueChange={(value) =>
                  setActivityCategoryFilter(value as ActivityCategory | 'ALL')
                }
              >
                <SelectTrigger placeholder="Kategori" />
                <SelectContent>
                  <SelectItem value="ALL">Tüm Kategoriler</SelectItem>
                  {ACTIVITY_CATEGORIES.map((category) => {
                    const config = getActivityCategoryConfig(category);
                    return (
                      <SelectItem key={category} value={category}>
                        {config.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select
                value={dateRangeFilter}
                onValueChange={(value) =>
                  setDateRangeFilter(value as '24h' | '7d' | '30d' | 'all')
                }
              >
                <SelectTrigger placeholder="Tarih Aralığı" />
                <SelectContent>
                  <SelectItem value="24h">Son 24 Saat</SelectItem>
                  <SelectItem value="7d">Son 7 Gün</SelectItem>
                  <SelectItem value="30d">Son 30 Gün</SelectItem>
                  <SelectItem value="all">Tüm Zamanlar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <p className="text-muted-foreground text-sm">
              Toplam {totalElements} aktivite bulundu
            </p>
          </div>

          {/* Timeline */}
          <ScrollArea className="h-[500px] pr-4">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <UnifiedLoading variant="spinner" size="lg" />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <ActivityIcon className="text-muted-foreground mb-2 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  Aktivite bulunamadı
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <ActivityTimelineItem
                    key={activity.id}
                    activity={activity}
                    isLast={index === activities.length - 1}
                    onClick={() => setSelectedActivity(activity)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
              >
                Önceki
              </Button>

              <span className="text-muted-foreground text-sm">
                Sayfa {page + 1} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
              >
                Sonraki
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Details Dialog */}
      {selectedActivity && (
        <ActivityDetailsDialog
          activity={selectedActivity}
          open={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </>
  );
}

// Activity Timeline Item Component
interface ActivityTimelineItemProps {
  activity: UserActivityLog;
  isLast: boolean;
  onClick: () => void;
}

function ActivityTimelineItem({
  activity,
  isLast,
  onClick,
}: ActivityTimelineItemProps) {
  const typeConfig = getActivityTypeConfig(activity.activityType);
  const categoryConfig = getActivityCategoryConfig(activity.activityCategory);
  const isError = isActivityError(activity);
  const isSlow = isActivitySlow(activity);

  return (
    <div className="group flex gap-3">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
            isError
              ? 'border-red-500 bg-red-100'
              : 'border-blue-500 bg-blue-100'
          }`}
        >
          <ActivityIcon className="h-4 w-4" />
        </div>
        {!isLast && <div className="bg-border mt-2 w-0.5 flex-1" />}
      </div>

      {/* Activity Content */}
      <div
        className="hover:bg-accent/50 -mx-2 flex-1 cursor-pointer rounded-md px-2 py-1 pb-6 transition-colors"
        onClick={onClick}
      >
        <div className="mb-1 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${typeConfig.color}`}>
              {formatActivityDescription(activity)}
            </span>
            {isError && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
            {isSlow && (
              <Badge variant="warning" className="text-xs">
                Slow
              </Badge>
            )}
          </div>

          <time className="text-muted-foreground text-xs">
            {format(new Date(activity.activityTimestamp), 'dd MMM yyyy HH:mm', {
              locale: tr,
            })}
          </time>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={`text-xs ${categoryConfig.color}`}
          >
            {categoryConfig.label}
          </Badge>

          {activity.statusCode && (
            <Badge
              variant="outline"
              className={`text-xs ${
                isError
                  ? 'border-red-500 text-red-700'
                  : 'border-green-500 text-green-700'
              }`}
            >
              {activity.statusCode}
            </Badge>
          )}

          {activity.responseTimeMs && (
            <Badge variant="outline" className="text-xs">
              {activity.responseTimeMs}ms
            </Badge>
          )}
        </div>

        {activity.endpoint && (
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {activity.httpMethod} {activity.endpoint}
          </p>
        )}
      </div>
    </div>
  );
}

// Activity Details Dialog Component
interface ActivityDetailsDialogProps {
  activity: UserActivityLog;
  open: boolean;
  onClose: () => void;
}

function ActivityDetailsDialog({
  activity,
  open,
  onClose,
}: ActivityDetailsDialogProps) {
  const typeConfig = getActivityTypeConfig(activity.activityType);
  const categoryConfig = getActivityCategoryConfig(activity.activityCategory);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Aktivite Detayları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground text-xs font-medium">
                Aktivite Tipi
              </label>
              <p className={`text-sm font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </p>
            </div>

            <div>
              <label className="text-muted-foreground text-xs font-medium">
                Kategori
              </label>
              <Badge className={`${categoryConfig.color} mt-1`}>
                {categoryConfig.label}
              </Badge>
            </div>

            <div>
              <label className="text-muted-foreground text-xs font-medium">
                Tarih & Saat
              </label>
              <p className="text-sm">
                {format(
                  new Date(activity.activityTimestamp),
                  'dd MMMM yyyy, HH:mm:ss',
                  { locale: tr }
                )}
              </p>
            </div>

            <div>
              <label className="text-muted-foreground text-xs font-medium">
                Session ID
              </label>
              <p className="font-mono text-xs break-all">
                {activity.sessionId || 'N/A'}
              </p>
            </div>
          </div>

          {/* Request Details */}
          {(activity.endpoint || activity.httpMethod) && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-semibold">İstek Detayları</h4>

              {activity.httpMethod && activity.endpoint && (
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Endpoint
                  </label>
                  <p className="bg-muted rounded p-2 font-mono text-sm">
                    {activity.httpMethod} {activity.endpoint}
                  </p>
                </div>
              )}

              {activity.requestPath && (
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Request Path
                  </label>
                  <p className="font-mono text-sm">{activity.requestPath}</p>
                </div>
              )}

              {activity.queryParams && (
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Query Parameters
                  </label>
                  <p className="bg-muted rounded p-2 font-mono text-xs break-all">
                    {activity.queryParams}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Response Details */}
          {(activity.statusCode || activity.responseTimeMs) && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-semibold">Yanıt Detayları</h4>

              <div className="grid grid-cols-2 gap-4">
                {activity.statusCode && (
                  <div>
                    <label className="text-muted-foreground text-xs font-medium">
                      Status Code
                    </label>
                    <Badge
                      variant="outline"
                      className={
                        isActivityError(activity)
                          ? 'border-red-500 text-red-700'
                          : 'border-green-500 text-green-700'
                      }
                    >
                      {activity.statusCode}
                    </Badge>
                  </div>
                )}

                {activity.responseTimeMs && (
                  <div>
                    <label className="text-muted-foreground text-xs font-medium">
                      Response Time
                    </label>
                    <Badge
                      variant="outline"
                      className={
                        isActivitySlow(activity)
                          ? 'border-orange-500 text-orange-700'
                          : 'border-green-500 text-green-700'
                      }
                    >
                      {activity.responseTimeMs}ms
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Details */}
          {(activity.ipAddress || activity.userAgent) && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-semibold">Kullanıcı Bilgileri</h4>

              {activity.ipAddress && (
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    IP Adresi
                  </label>
                  <p className="font-mono text-sm">{activity.ipAddress}</p>
                </div>
              )}

              {activity.userAgent && (
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    User Agent
                  </label>
                  <p className="bg-muted rounded p-2 font-mono text-xs break-all">
                    {activity.userAgent}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feature Details */}
          {activity.featureName && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-semibold">Özellik Kullanımı</h4>

              <div>
                <label className="text-muted-foreground text-xs font-medium">
                  Özellik Adı
                </label>
                <p className="text-sm">{activity.featureName}</p>
              </div>

              {activity.featureParams && (
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Parametreler
                  </label>
                  <pre className="bg-muted max-h-32 overflow-auto rounded p-2 text-xs">
                    {JSON.stringify(activity.featureParams, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
