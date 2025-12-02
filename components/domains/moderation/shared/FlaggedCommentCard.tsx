'use client';

/**
 * ================================================
 * FLAGGED COMMENT CARD
 * ================================================
 * Individual card for displaying flagged comment
 * Shows flag details, comment preview, and quick actions
 *
 * Sprint 1: Comment Moderation UI Completion
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since December 2, 2025
 */

import React, { memo } from 'react';
import { Flag, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { CommentFlag } from '@/lib/api/comment-flagging';
import { FlagCategory, FlagStatus } from '@/lib/api/comment-flagging';

// ================================================
// TYPES
// ================================================

export interface FlaggedCommentCardProps {
  flag: CommentFlag;
  onResolve: () => void;
  onDismiss: () => void;
  role?: 'admin' | 'moderator';
}

// ================================================
// CONSTANTS
// ================================================

const CATEGORY_LABELS: Record<FlagCategory, string> = {
  [FlagCategory.SPAM]: 'Spam',
  [FlagCategory.OFFENSIVE]: 'Saldırgan',
  [FlagCategory.INAPPROPRIATE]: 'Uygunsuz',
  [FlagCategory.MISINFORMATION]: 'Yanlış Bilgi',
  [FlagCategory.HARASSMENT]: 'Taciz',
  [FlagCategory.OFF_TOPIC]: 'Konu Dışı',
  [FlagCategory.COPYRIGHT]: 'Telif Hakkı',
  [FlagCategory.OTHER]: 'Diğer',
};

const CATEGORY_COLORS: Record<
  FlagCategory,
  'default' | 'warning' | 'destructive'
> = {
  [FlagCategory.SPAM]: 'warning',
  [FlagCategory.OFFENSIVE]: 'destructive',
  [FlagCategory.INAPPROPRIATE]: 'destructive',
  [FlagCategory.MISINFORMATION]: 'warning',
  [FlagCategory.HARASSMENT]: 'destructive',
  [FlagCategory.OFF_TOPIC]: 'default',
  [FlagCategory.COPYRIGHT]: 'warning',
  [FlagCategory.OTHER]: 'default',
};

// ================================================
// COMPONENT
// ================================================

export const FlaggedCommentCard = memo(function FlaggedCommentCard({
  flag,
  onResolve,
  onDismiss,
}: FlaggedCommentCardProps) {
  const isPending = flag.status === FlagStatus.PENDING;
  const isResolved = flag.status === FlagStatus.RESOLVED;
  const isDismissed = flag.status === FlagStatus.DISMISSED;

  const createdAtText = formatDistanceToNow(new Date(flag.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  // ================================================
  // RENDER
  // ================================================

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
        isPending ? 'border-orange-200' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-lg p-2 ${
              isPending
                ? 'bg-orange-100'
                : isResolved
                  ? 'bg-green-100'
                  : 'bg-gray-100'
            }`}
          >
            {isPending ? (
              <Flag className="h-5 w-5 text-orange-600" />
            ) : isResolved ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-600" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                Flag ID: {flag.id}
              </h4>
              <Badge variant={CATEGORY_COLORS[flag.category]}>
                {CATEGORY_LABELS[flag.category]}
              </Badge>
              {isPending && <Badge variant="warning">Beklemede</Badge>}
              {isResolved && <Badge variant="success">Çözüldü</Badge>}
              {isDismissed && <Badge variant="default">Reddedildi</Badge>}
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <User className="h-3 w-3" />
              <span>{flag.reporterName}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{createdAtText}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {isPending && (
          <div className="flex items-center gap-2">
            <button
              onClick={onResolve}
              className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              Çöz
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Reddet
            </button>
          </div>
        )}
      </div>

      {/* Flag Reason */}
      <div className="mb-3 pl-14">
        <p className="text-sm font-medium text-gray-700">Raporlama Nedeni:</p>
        <p className="mt-1 text-sm text-gray-600">{flag.reason}</p>
        {flag.customReason && (
          <p className="mt-1 text-sm text-gray-500 italic">
            &quot;{flag.customReason}&quot;
          </p>
        )}
      </div>

      {/* Resolution Info */}
      {(isResolved || isDismissed) && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3 pl-14">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">
              {isResolved ? 'Çözüm:' : 'Red Nedeni:'}
            </span>
            <span className="text-gray-600">
              {flag.resolutionNote || 'Not belirtilmedi'}
            </span>
          </div>
          {flag.resolvedBy && (
            <div className="mt-1 text-xs text-gray-500">
              {flag.resolvedBy} tarafından{' '}
              {flag.resolvedAt &&
                formatDistanceToNow(new Date(flag.resolvedAt), {
                  addSuffix: true,
                  locale: tr,
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

FlaggedCommentCard.displayName = 'FlaggedCommentCard';

export default FlaggedCommentCard;
