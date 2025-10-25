/**
 * ================================================
 * COMMENT MODERATION CARD COMPONENT
 * ================================================
 * Individual comment card for moderation queue
 * Displays comment with moderation actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  ExternalLink,
  Flag,
} from 'lucide-react';
import type { BlogComment } from '@/types/blog';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// ================================================
// TYPES
// ================================================

export interface CommentModerationCardProps {
  comment: BlogComment;
  isSelected: boolean;
  onSelect: () => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onSpam: () => Promise<void>;
  onViewPost?: () => void;
  reportCount?: number;
}

// ================================================
// COMPONENT
// ================================================

export function CommentModerationCard({
  comment,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onSpam,
  onViewPost,
  reportCount = 0,
}: CommentModerationCardProps) {
  // ================================================
  // STATE
  // ================================================

  const [loading, setLoading] = useState<'approve' | 'reject' | 'spam' | null>(
    null
  );

  // ================================================
  // COMPUTED
  // ================================================

  const authorName =
    typeof comment.author === 'string' ? comment.author : comment.author.name;

  const authorAvatar =
    typeof comment.author === 'object' ? comment.author.avatar : undefined;

  const createdAtText = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  const isApproved = comment.approved === true;
  const isRejected = comment.approved === false;
  const isPending = comment.approved === undefined || comment.approved === null;

  // ================================================
  // HANDLERS
  // ================================================

  const handleApprove = async () => {
    setLoading('approve');
    try {
      await onApprove();
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    try {
      await onReject();
    } finally {
      setLoading(null);
    }
  };

  const handleSpam = async () => {
    if (
      !confirm('Bu yorumu spam olarak işaretlemek istediğinize emin misiniz?')
    ) {
      return;
    }
    setLoading('spam');
    try {
      await onSpam();
    } finally {
      setLoading(null);
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${loading ? 'opacity-60' : ''}`}
    >
      <div className="p-4">
        {/* Header with Checkbox and Status */}
        <div className="mb-3 flex items-start justify-between gap-3">
          {/* Checkbox and Author Info */}
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              disabled={!!loading}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Yorumu seç"
            />

            {/* Author Avatar and Name */}
            <div className="flex items-center gap-2">
              {authorAvatar ? (
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              )}

              <div>
                <p className="font-medium text-gray-900">{authorName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{createdAtText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {reportCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                <Flag className="h-3 w-3" />
                <span>{reportCount} rapor</span>
              </div>
            )}

            {isApproved && (
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                <CheckCircle className="h-3 w-3" />
                <span>Onaylı</span>
              </div>
            )}

            {isRejected && (
              <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                <XCircle className="h-3 w-3" />
                <span>Reddedildi</span>
              </div>
            )}

            {isPending && (
              <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                <AlertTriangle className="h-3 w-3" />
                <span>Bekliyor</span>
              </div>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-3 ml-16 rounded-lg bg-gray-50 p-3">
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {comment.content}
          </p>
        </div>

        {/* Post Link */}
        {onViewPost && (
          <div className="mb-3 ml-16 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <button
              onClick={onViewPost}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <span>Gönderiyi görüntüle</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="ml-16 flex items-center gap-2">
          {/* Approve */}
          <button
            onClick={handleApprove}
            disabled={!!loading || isApproved}
            className="flex items-center gap-1 rounded-lg border border-green-600 bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{loading === 'approve' ? 'Onaylanıyor...' : 'Onayla'}</span>
          </button>

          {/* Reject */}
          <button
            onClick={handleReject}
            disabled={!!loading || isRejected}
            className="flex items-center gap-1 rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            <span>{loading === 'reject' ? 'Reddediliyor...' : 'Reddet'}</span>
          </button>

          {/* Spam */}
          <button
            onClick={handleSpam}
            disabled={!!loading}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{loading === 'spam' ? 'İşleniyor...' : 'Spam'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModerationCard;
