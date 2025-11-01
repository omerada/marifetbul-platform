/**
 * ================================================
 * USER MODERATION HISTORY
 * ================================================
 * Timeline display of all moderation actions for a user
 *
 * Features:
 * - Chronological timeline
 * - Warnings and suspensions combined
 * - Appeal status display
 * - Revocation info
 *
 * Sprint: Moderator Reporting & Actions
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 */

'use client';

import { useEffect, useState } from 'react';
import {
  History,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { useUserModeration } from '@/hooks/business/useUserModeration';
import type { UserWarning, UserSuspension } from '@/lib/api/moderation';

/**
 * Props for UserModerationHistory
 */
interface UserModerationHistoryProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

/**
 * Combined moderation event type
 */
type ModerationEvent = {
  id: string;
  type: 'warning' | 'suspension';
  timestamp: string;
  status: string;
  data: UserWarning | UserSuspension;
};

/**
 * User Moderation History Component
 */
export function UserModerationHistory({
  open,
  onClose,
  userId,
}: UserModerationHistoryProps) {
  // State
  const [events, setEvents] = useState<ModerationEvent[]>([]);

  // Hooks
  const { fetchUserWarnings, fetchUserSuspensions, isLoading } =
    useUserModeration();

  // Load moderation history
  useEffect(() => {
    if (open && userId) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  /**
   * Load and combine warnings and suspensions
   */
  const loadHistory = async () => {
    const [warnings, suspensions] = await Promise.all([
      fetchUserWarnings(userId),
      fetchUserSuspensions(userId),
    ]);

    const combinedEvents: ModerationEvent[] = [
      ...(warnings || []).map((w) => ({
        id: w.id,
        type: 'warning' as const,
        timestamp: w.createdAt,
        status: w.status,
        data: w,
      })),
      ...(suspensions || []).map((s) => ({
        id: s.id,
        type: 'suspension' as const,
        timestamp: s.createdAt,
        status: s.status,
        data: s,
      })),
    ];

    // Sort by timestamp (newest first)
    combinedEvents.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setEvents(combinedEvents);
  };

  /**
   * Render warning level badge
   */
  const renderWarningLevelBadge = (level: string) => {
    const colors = {
      LEVEL_1: 'bg-yellow-100 text-yellow-800',
      LEVEL_2: 'bg-orange-100 text-orange-800',
      LEVEL_3: 'bg-red-100 text-red-800',
    };
    return (
      <Badge
        className={
          colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        }
      >
        {level}
      </Badge>
    );
  };

  /**
   * Render status badge
   */
  const renderStatusBadge = (
    status: string,
    _type: 'warning' | 'suspension'
  ) => {
    const statusColors: Record<string, string> = {
      // Warning statuses
      ACTIVE: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-600',
      APPEALED: 'bg-blue-100 text-blue-800',
      REVOKED: 'bg-purple-100 text-purple-800',
      ESCALATED: 'bg-orange-100 text-orange-800',
      // Suspension statuses
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
      LIFTED: 'bg-green-100 text-green-800',
    };

    const color = statusColors[status] || 'bg-gray-100 text-gray-800';
    const label = status.replace(/_/g, ' ');

    return <Badge className={color}>{label}</Badge>;
  };

  /**
   * Render warning event
   */
  const renderWarningEvent = (event: ModerationEvent) => {
    const warning = event.data as UserWarning;

    return (
      <div className="relative border-l-2 border-gray-200 pb-8 pl-8 last:border-l-0">
        {/* Icon */}
        <div className="absolute top-0 -left-3 rounded-full bg-yellow-100 p-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                Uyarı Verildi
                {renderWarningLevelBadge(warning.warningLevel)}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(warning.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
            {renderStatusBadge(warning.status, 'warning')}
          </div>

          {/* Details */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
            <div>
              <span className="font-semibold">Neden:</span>{' '}
              {warning.reason.replace(/_/g, ' ')}
            </div>
            <div>
              <span className="font-semibold">Detay:</span> {warning.details}
            </div>
            {warning.relatedContentRef && (
              <div>
                <span className="font-semibold">İçerik Ref:</span>{' '}
                <code className="rounded bg-white px-2 py-1 text-xs">
                  {warning.relatedContentRef}
                </code>
              </div>
            )}
            {warning.expiresAt && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>
                  Süre sonu:{' '}
                  {new Date(warning.expiresAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
          </div>

          {/* Appeal Info */}
          {warning.status === 'APPEALED' && warning.appealedAt && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  İtiraz Edildi
                </span>
              </div>
              <p className="text-blue-700">
                {new Date(warning.appealedAt).toLocaleString('tr-TR')}
              </p>
            </div>
          )}

          {/* Revocation Info */}
          {warning.status === 'REVOKED' && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-800">
                  İptal Edildi
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render suspension event
   */
  const renderSuspensionEvent = (event: ModerationEvent) => {
    const suspension = event.data as UserSuspension;

    return (
      <div className="relative border-l-2 border-gray-200 pb-8 pl-8 last:border-l-0">
        {/* Icon */}
        <div className="absolute top-0 -left-3 rounded-full bg-red-100 p-2">
          <Ban className="h-4 w-4 text-red-600" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold">
                Askıya Alındı - {suspension.suspensionType.replace(/_/g, ' ')}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(suspension.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
            {renderStatusBadge(suspension.status, 'suspension')}
          </div>

          {/* Details */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
            <div>
              <span className="font-semibold">Neden:</span>{' '}
              {suspension.reason.replace(/_/g, ' ')}
            </div>
            <div>
              <span className="font-semibold">Detay:</span> {suspension.details}
            </div>
            {suspension.expiresAt && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>
                  Süre sonu:{' '}
                  {new Date(suspension.expiresAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
          </div>

          {/* Appeal Info */}
          {suspension.status === 'APPEALED' && suspension.appealedAt && (
            <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  İtiraz Gönderildi
                </span>
              </div>
              <p className="text-blue-700">
                {new Date(suspension.appealedAt).toLocaleString('tr-TR')}
              </p>
              {suspension.appealMessage && (
                <div className="text-blue-700">
                  <span className="font-semibold">İtiraz Sebebi:</span>{' '}
                  {suspension.appealMessage}
                </div>
              )}
              {suspension.appealDecision && (
                <div className="mt-2 border-t border-blue-200 pt-2">
                  <span className="font-semibold text-blue-800">Karar:</span>{' '}
                  <Badge
                    className={
                      suspension.appealDecision === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : suspension.appealDecision === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {suspension.appealDecision}
                  </Badge>
                  {suspension.appealDecisionReason && (
                    <p className="mt-1 text-blue-700">
                      {suspension.appealDecisionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Lifted Info */}
          {suspension.status === 'LIFTED' && suspension.unsuspendedAt && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">
                  Askı Kaldırıldı
                </span>
              </div>
              <p className="text-green-700">
                {new Date(suspension.unsuspendedAt).toLocaleString('tr-TR')}
              </p>
              {suspension.unsuspensionReason && (
                <p className="mt-1 text-green-700">
                  Sebep: {suspension.unsuspensionReason}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Moderasyon Geçmişi
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-2" style={{ maxHeight: '70vh' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">
                Bu kullanıcı için moderasyon kaydı bulunamadı.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {events.map((event) => (
                <div key={event.id}>
                  {event.type === 'warning'
                    ? renderWarningEvent(event)
                    : renderSuspensionEvent(event)}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
