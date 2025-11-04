/**
 * Comment Moderation Card Component
 * Displays a blog comment for moderation with actions
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  CheckCircle,
  XCircle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  FileText,
  ArrowUpCircle,
} from 'lucide-react';
import type { BlogCommentResponse } from '@/types/backend-aligned';
import {
  getCommentStatusLabel,
  getCommentStatusColor,
} from '@/lib/api/blog-moderation';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface CommentModerationCardProps {
  comment: BlogCommentResponse;
  onApprove: (commentId: number) => void;
  onReject: (commentId: number) => void;
  onMarkSpam: (commentId: number) => void;
  onEscalate?: (commentId: number) => void;
  onSelect?: (commentId: number, selected: boolean) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function CommentModerationCard({
  comment,
  onApprove,
  onReject,
  onMarkSpam,
  onEscalate,
  onSelect,
  isSelected = false,
  showActions = true,
}: CommentModerationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const canModerate = comment.status === 'PENDING';
  const contentPreview =
    comment.content.length > 200
      ? comment.content.substring(0, 200) + '...'
      : comment.content;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(comment.id, e.target.checked);
  };

  return (
    <Card
      className={`p-4 transition-all ${
        isSelected ? 'shadow-md ring-2 ring-blue-500' : ''
      } ${!canModerate ? 'opacity-75' : ''}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        {/* Checkbox for bulk selection */}
        {onSelect && canModerate && (
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onChange={handleCheckboxChange}
              aria-label={`Yorumu seç: ${comment.id}`}
            />
          </div>
        )}

        {/* Author Avatar */}
        <Avatar
          src={comment.author.avatarUrl}
          alt={comment.author.name}
          size="md"
        >
          {!comment.author.avatarUrl && (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>

        {/* Author Info & Status */}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {comment.author.name}
              </h4>
              <Badge className={getCommentStatusColor(comment.status)}>
                {getCommentStatusLabel(comment.status)}
              </Badge>
            </div>

            {/* Expand/Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Daralt
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Genişlet
                </>
              )}
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            </div>

            {comment.author.email && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{comment.author.email}</span>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{comment.replies.length} yanıt</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-3 ml-12">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {isExpanded ? comment.content : contentPreview}
          </p>
        </div>

        {comment.content.length > 200 && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-1 text-xs text-blue-600 hover:text-blue-700"
          >
            Devamını oku
          </button>
        )}
      </div>

      {/* Approval Info */}
      {comment.approvedAt && (
        <div className="mb-3 ml-12 text-xs text-gray-500">
          Onaylandı:{' '}
          {formatDistanceToNow(new Date(comment.approvedAt), {
            addSuffix: true,
            locale: tr,
          })}
        </div>
      )}

      {/* Nested Replies Preview */}
      {isExpanded && comment.replies && comment.replies.length > 0 && (
        <div className="mb-3 ml-12 space-y-2">
          <div className="text-xs font-medium text-gray-700">
            Yanıtlar ({comment.replies.length}):
          </div>
          {comment.replies.slice(0, 3).map((reply) => (
            <div
              key={reply.id}
              className="rounded border border-gray-200 bg-white p-2"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-900">
                  {reply.author.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {getCommentStatusLabel(reply.status)}
                </Badge>
              </div>
              <p className="line-clamp-2 text-xs text-gray-600">
                {reply.content}
              </p>
            </div>
          ))}
          {comment.replies.length > 3 && (
            <div className="text-xs text-gray-500">
              +{comment.replies.length - 3} daha...
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && canModerate && (
        <div className="ml-12 flex flex-wrap gap-2 border-t pt-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(comment.id)}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            Onayla
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(comment.id)}
            className="flex items-center gap-1 text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />
            Reddet
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkSpam(comment.id)}
            className="flex items-center gap-1 text-gray-600 hover:bg-gray-100"
          >
            <AlertOctagon className="h-4 w-4" />
            Spam İşaretle
          </Button>

          {/* Sprint 1 - Task 6: Escalation Button */}
          {onEscalate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEscalate(comment.id)}
              className="flex items-center gap-1 text-orange-600 hover:bg-orange-50"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Üste İlet
            </Button>
          )}
        </div>
      )}

      {/* Read-only Actions for Non-Pending */}
      {!canModerate && (
        <div className="ml-12 border-t pt-3">
          <p className="text-xs text-gray-500 italic">
            Bu yorum zaten işlenmiş. Durumu:{' '}
            {getCommentStatusLabel(comment.status)}
          </p>
        </div>
      )}
    </Card>
  );
}
