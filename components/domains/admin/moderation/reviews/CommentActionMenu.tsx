/**
 * ================================================
 * COMMENT ACTION MENU COMPONENT
 * ================================================
 * Advanced action menu for individual comment management
 * Includes edit, reply, history, and moderation notes
 *
 * Sprint 3 Day 2: Moderator Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import {
  MoreVertical,
  Edit,
  MessageSquare,
  History,
  FileText,
  Trash2,
  User,
  Ban,
} from 'lucide-react';
import type { BlogComment } from '@/types/blog';

// ================================================
// TYPES
// ================================================

export interface CommentActionMenuProps {
  comment: BlogComment;
  onEdit?: (comment: BlogComment) => void;
  onReply?: (comment: BlogComment) => void;
  onViewHistory?: (comment: BlogComment) => void;
  onAddNote?: (comment: BlogComment) => void;
  onViewAuthor?: (authorId: string) => void;
  onDelete?: (comment: BlogComment) => void;
  onBanUser?: (authorId: string) => void;
  disabled?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function CommentActionMenu({
  comment,
  onEdit,
  onReply,
  onViewHistory,
  onAddNote,
  onViewAuthor,
  onDelete,
  onBanUser,
  disabled = false,
}: CommentActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const authorId =
    typeof comment.author === 'string' ? comment.author : comment.author.id;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Yorum işlemleri"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {/* Edit */}
            {onEdit && (
              <button
                onClick={() => handleAction(() => onEdit(comment))}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                <span>Düzenle</span>
              </button>
            )}

            {/* Reply */}
            {onReply && (
              <button
                onClick={() => handleAction(() => onReply(comment))}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Yanıtla</span>
              </button>
            )}

            {/* View History */}
            {onViewHistory && (
              <button
                onClick={() => handleAction(() => onViewHistory(comment))}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <History className="h-4 w-4" />
                <span>Geçmişi Görüntüle</span>
              </button>
            )}

            {/* Add Note */}
            {onAddNote && (
              <button
                onClick={() => handleAction(() => onAddNote(comment))}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                <span>Not Ekle</span>
              </button>
            )}

            {/* Divider */}
            {(onEdit || onReply || onViewHistory || onAddNote) &&
              (onViewAuthor || onDelete || onBanUser) && (
                <div className="my-1 border-t border-gray-200" />
              )}

            {/* View Author */}
            {onViewAuthor && (
              <button
                onClick={() => handleAction(() => onViewAuthor(authorId))}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                <span>Yazarı Görüntüle</span>
              </button>
            )}

            {/* Ban User */}
            {onBanUser && (
              <button
                onClick={() => handleAction(() => onBanUser(authorId))}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-orange-600 transition-colors hover:bg-orange-50"
              >
                <Ban className="h-4 w-4" />
                <span>Kullanıcıyı Engelle</span>
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => handleAction(() => onDelete(comment))}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sil</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CommentActionMenu;
