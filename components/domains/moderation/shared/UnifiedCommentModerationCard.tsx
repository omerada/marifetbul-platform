/**
 * ================================================
 * UNIFIED COMMENT MODERATION CARD
 * ================================================
 * Single, reusable component for both Admin & Moderator comment moderation
 * Eliminates duplicate code and ensures consistency
 *
 * Features:
 * - Role-based rendering (admin vs moderator views)
 * - Compact & detailed view modes
 * - All moderation actions (approve, reject, spam, escalate)
 * - Bulk selection support
 * - Optimistic UI updates
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication (Comments)
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 8, 2025 - Consolidated types to @/types/business/moderation
 */

'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flag,
  ArrowUpCircle,
} from 'lucide-react';
import { Badge, UnifiedButton, Card, Avatar, Checkbox } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { BlogComment } from '@/types/blog';
import type { BlogCommentResponse } from '@/types/backend-aligned';
import type { ViewMode, UserRole } from '@/types/business/moderation';

// ============================================================================
// TYPES
// ============================================================================

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Support both BlogComment and BlogCommentResponse types
type CommentData = BlogComment | BlogCommentResponse;

export interface UnifiedCommentModerationCardProps {
  comment: CommentData;
  viewMode?: ViewMode;
  role?: UserRole;

  // Selection
  selected?: boolean;
  onSelect?: (id: string | number) => void;

  // Actions
  onApprove?: (id: string | number) => Promise<boolean>;
  onReject?: (id: string | number, reason?: string) => Promise<boolean>;
  onMarkSpam?: (id: string | number) => Promise<boolean>;
  onEscalate?: (
    id: string | number,
    reason: string,
    priority: Priority
  ) => Promise<boolean>;
  onViewPost?: (postId: string | number) => void;

  // Callbacks
  onUpdated?: () => void;

  // Display options
  showActions?: boolean;
  reportCount?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedCommentModerationCard({
  comment,
  viewMode = 'card',
  role = 'admin',
  selected = false,
  onSelect,
  onApprove,
  onReject,
  onMarkSpam,
  onEscalate,
  onViewPost,
  onUpdated,
  showActions = true,
  reportCount = 0,
}: UnifiedCommentModerationCardProps) {
  // ================================================
  // STATE
  // ================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(viewMode === 'detailed');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalatePriority, setEscalatePriority] = useState<Priority>('MEDIUM');

  // ================================================
  // COMPUTED VALUES
  // ================================================

  // Normalize comment data (handle both BlogComment and BlogCommentResponse)
  const commentId = comment.id;
  const authorName =
    typeof comment.author === 'string'
      ? comment.author
      : comment.author?.name || 'Unknown';

  // Get avatar from either avatar or avatarUrl property
  const authorAvatar =
    typeof comment.author === 'object'
      ? 'avatar' in comment.author
        ? comment.author.avatar
        : 'avatarUrl' in comment.author
          ? comment.author.avatarUrl
          : undefined
      : undefined;

  const content = comment.content || '';
  const createdAt = comment.createdAt;

  // Get postId - BlogComment uses string, BlogCommentResponse doesn't have it
  const postId = 'postId' in comment ? comment.postId : undefined;

  // Status determination - BlogComment has approved boolean, BlogCommentResponse has status enum
  const status: CommentStatus =
    ('status' in comment && (comment.status as CommentStatus)) ||
    ('approved' in comment && comment.approved === true
      ? 'APPROVED'
      : 'approved' in comment && comment.approved === false
        ? 'REJECTED'
        : 'PENDING');

  const isPending = status === 'PENDING';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const isSpam = status === 'SPAM';

  const createdAtText = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: tr,
  });

  const contentPreview =
    content.length > 200 ? content.substring(0, 200) + '...' : content;

  // ================================================
  // HANDLERS
  // ================================================

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);

      if (onApprove) {
        const success = await onApprove(commentId);
        if (success) {
          logger.info('Comment approved', { commentId });
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('Yorum onaylanamadı');
      logger.error(
        'Failed to approve comment',
        err instanceof Error ? err : new Error(String(err)),
        { commentId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (
      showRejectDialog &&
      (!rejectReason.trim() || rejectReason.length < 10)
    ) {
      setError('Lütfen en az 10 karakter red nedeni giriniz');
      return;
    }

    if (!showRejectDialog && onReject) {
      // Show dialog if reason is needed
      setShowRejectDialog(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (onReject) {
        const success = await onReject(commentId, rejectReason);
        if (success) {
          logger.info('Comment rejected', { commentId, reason: rejectReason });
          setShowRejectDialog(false);
          setRejectReason('');
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('Yorum reddedilemedi');
      logger.error(
        'Failed to reject comment',
        err instanceof Error ? err : new Error(String(err)),
        { commentId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSpam = async () => {
    try {
      setLoading(true);
      setError(null);

      if (onMarkSpam) {
        const success = await onMarkSpam(commentId);
        if (success) {
          logger.info('Comment marked as spam', { commentId });
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('Yorum spam olarak işaretlenemedi');
      logger.error(
        'Failed to mark comment as spam',
        err instanceof Error ? err : new Error(String(err)),
        { commentId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim() || escalateReason.length < 10) {
      setError('Lütfen en az 10 karakter yükseltme nedeni giriniz');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (onEscalate) {
        const success = await onEscalate(
          commentId,
          escalateReason,
          escalatePriority
        );
        if (success) {
          logger.info('Comment escalated', {
            commentId,
            reason: escalateReason,
            priority: escalatePriority,
          });
          setShowEscalateDialog(false);
          setEscalateReason('');
          setEscalatePriority('MEDIUM');
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('Yorum yükseltilemedi');
      logger.error(
        'Failed to escalate comment',
        err instanceof Error ? err : new Error(String(err)),
        { commentId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCheckboxChange = () => {
    onSelect?.(commentId);
  };

  // ================================================
  // RENDER HELPERS
  // ================================================

  const getStatusBadge = () => {
    if (isApproved) {
      return <Badge variant="success">Onaylandı</Badge>;
    }
    if (isRejected) {
      return <Badge variant="destructive">Reddedildi</Badge>;
    }
    if (isSpam) {
      return <Badge variant="warning">Spam</Badge>;
    }
    return <Badge variant="default">Beklemede</Badge>;
  };

  const renderActions = () => {
    if (!showActions || !isPending) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {/* Approve Button */}
        <UnifiedButton
          variant="success"
          size="sm"
          onClick={handleApprove}
          disabled={loading}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Onayla
        </UnifiedButton>

        {/* Reject Button */}
        <UnifiedButton
          variant="destructive"
          size="sm"
          onClick={handleReject}
          disabled={loading}
        >
          <XCircle className="mr-1 h-4 w-4" />
          Reddet
        </UnifiedButton>

        {/* Spam Button */}
        <UnifiedButton
          variant="warning"
          size="sm"
          onClick={handleMarkSpam}
          disabled={loading}
        >
          <AlertOctagon className="mr-1 h-4 w-4" />
          Spam
        </UnifiedButton>

        {/* Escalate Button - Moderator Only */}
        {role === 'moderator' && onEscalate && (
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={() => setShowEscalateDialog(true)}
            disabled={loading}
          >
            <ArrowUpCircle className="mr-1 h-4 w-4" />
            Yükselt
          </UnifiedButton>
        )}

        {/* View Post Button */}
        {postId && onViewPost && (
          <UnifiedButton
            variant="ghost"
            size="sm"
            onClick={() => onViewPost(postId)}
          >
            <ExternalLink className="mr-1 h-4 w-4" />
            Gönderiyi Gör
          </UnifiedButton>
        )}
      </div>
    );
  };

  // ================================================
  // RENDER MODES
  // ================================================

  if (viewMode === 'compact') {
    return (
      <div
        className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
          selected
            ? 'bg-blue-50 ring-2 ring-blue-500'
            : 'bg-white hover:bg-gray-50'
        } ${!isPending ? 'opacity-75' : ''}`}
      >
        {/* Checkbox */}
        {onSelect && isPending && (
          <Checkbox
            checked={selected}
            onChange={handleCheckboxChange}
            aria-label={`Yorumu seç: ${commentId}`}
          />
        )}

        {/* Author */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Avatar src={authorAvatar} alt={authorName} size="sm">
            {!authorAvatar && (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{authorName}</p>
            <p className="truncate text-xs text-gray-500">{contentPreview}</p>
          </div>
        </div>

        {/* Status */}
        <div>{getStatusBadge()}</div>

        {/* Report Count */}
        {reportCount > 0 && (
          <Badge variant="warning">
            <Flag className="mr-1 h-3 w-3" />
            {reportCount}
          </Badge>
        )}

        {/* Time */}
        <span className="text-xs whitespace-nowrap text-gray-500">
          {createdAtText}
        </span>
      </div>
    );
  }

  // Card and Detailed views
  return (
    <Card
      className={`transition-all ${
        selected ? 'shadow-md ring-2 ring-blue-500' : ''
      } ${!isPending ? 'opacity-75' : ''}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          {/* Checkbox */}
          {onSelect && isPending && (
            <div className="pt-1">
              <Checkbox
                checked={selected}
                onChange={handleCheckboxChange}
                aria-label={`Yorumu seç: ${commentId}`}
              />
            </div>
          )}

          {/* Avatar */}
          <Avatar src={authorAvatar} alt={authorName} size="md">
            {!authorAvatar && (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>

          {/* Author Info & Status */}
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {authorName}
                </span>
                {getStatusBadge()}
                {reportCount > 0 && (
                  <Badge variant="warning">
                    <Flag className="mr-1 h-3 w-3" />
                    {reportCount} Şikayet
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-500">{createdAtText}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3 pl-12">
          <p className="whitespace-pre-wrap text-gray-700">
            {isExpanded || viewMode === 'detailed' ? content : contentPreview}
          </p>
          {content.length > 200 && viewMode !== 'detailed' && (
            <button
              onClick={handleToggleExpand}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Daha az göster
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Devamını oku
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="pl-12">{renderActions()}</div>

        {/* Reject Dialog */}
        {showRejectDialog && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold">Reddetme Nedeni</h4>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Neden reddedildiğini açıklayın... (en az 10 karakter)"
              className="mb-2 w-full rounded-md border p-2"
              rows={3}
            />
            <div className="flex gap-2">
              <UnifiedButton
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={loading || rejectReason.length < 10}
              >
                Reddet
              </UnifiedButton>
              <UnifiedButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
              >
                İptal
              </UnifiedButton>
            </div>
          </div>
        )}

        {/* Escalate Dialog - Moderator Only */}
        {showEscalateDialog && role === 'moderator' && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold">Yöneticiye Yükselt</h4>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Yükseltme nedenini açıklayın... (en az 10 karakter)"
              className="mb-2 w-full rounded-md border p-2"
              rows={3}
            />
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium">Öncelik</label>
              <select
                value={escalatePriority}
                onChange={(e) =>
                  setEscalatePriority(e.target.value as Priority)
                }
                className="w-full rounded-md border p-2"
              >
                <option value="LOW">Düşük</option>
                <option value="MEDIUM">Orta</option>
                <option value="HIGH">Yüksek</option>
                <option value="URGENT">Acil</option>
              </select>
            </div>
            <div className="flex gap-2">
              <UnifiedButton
                variant="primary"
                size="sm"
                onClick={handleEscalate}
                disabled={loading || escalateReason.length < 10}
              >
                Yükselt
              </UnifiedButton>
              <UnifiedButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEscalateDialog(false);
                  setEscalateReason('');
                  setEscalatePriority('MEDIUM');
                }}
              >
                İptal
              </UnifiedButton>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default UnifiedCommentModerationCard;
