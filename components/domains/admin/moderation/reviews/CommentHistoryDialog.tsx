/**
 * ================================================
 * COMMENT HISTORY DIALOG COMPONENT
 * ================================================
 * View complete edit and moderation history of a comment
 * Shows timeline of all changes with diffs
 *
 * Sprint 3 Day 2: Moderator Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, User, Edit, Shield, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { BlogComment } from '@/types/blog';

// ================================================
// TYPES
// ================================================

export interface CommentHistoryEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'edited' | 'approved' | 'rejected' | 'spam' | 'escalated';
  actor: {
    id: string;
    name: string;
    role: 'user' | 'moderator' | 'admin';
  };
  content?: string;
  reason?: string;
  previousContent?: string;
}

export interface CommentHistoryDialogProps {
  comment: BlogComment;
  isOpen: boolean;
  onClose: () => void;
  onLoadHistory?: (commentId: string) => Promise<CommentHistoryEntry[]>;
}

// ================================================
// COMPONENT
// ================================================

export function CommentHistoryDialog({
  comment,
  isOpen,
  onClose,
  onLoadHistory,
}: CommentHistoryDialogProps) {
  const [history, setHistory] = useState<CommentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    const loadIfNeeded = async () => {
      if (isOpen && onLoadHistory) {
        await loadHistory();
      }
    };
    loadIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, comment.id]);

  // ================================================
  // HANDLERS
  // ================================================

  const loadHistory = async () => {
    if (!onLoadHistory) {
      // Mock data for demonstration
      setHistory([
        {
          id: '1',
          timestamp: comment.createdAt,
          action: 'created',
          actor: {
            id:
              typeof comment.author === 'string'
                ? comment.author
                : comment.author.id,
            name:
              typeof comment.author === 'string'
                ? comment.author
                : comment.author.name,
            role: 'user',
          },
          content: comment.content,
        },
      ]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await onLoadHistory(comment.id);
      setHistory(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Geçmiş yüklenirken hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // HELPERS
  // ================================================

  const getActionIcon = (action: CommentHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'edited':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'approved':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'spam':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'escalated':
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: CommentHistoryEntry['action']) => {
    const labels: Record<CommentHistoryEntry['action'], string> = {
      created: 'Oluşturuldu',
      edited: 'Düzenlendi',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      spam: 'Spam işaretlendi',
      escalated: 'Yükseltildi',
    };
    return labels[action];
  };

  const getActionColor = (action: CommentHistoryEntry['action']) => {
    const colors: Record<CommentHistoryEntry['action'], string> = {
      created: 'bg-gray-50 border-gray-200',
      edited: 'bg-blue-50 border-blue-200',
      approved: 'bg-green-50 border-green-200',
      rejected: 'bg-red-50 border-red-200',
      spam: 'bg-orange-50 border-orange-200',
      escalated: 'bg-purple-50 border-purple-200',
    };
    return colors[action];
  };

  const getRoleBadge = (role: CommentHistoryEntry['actor']['role']) => {
    const badges: Record<
      CommentHistoryEntry['actor']['role'],
      React.ReactElement
    > = {
      user: (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
          Kullanıcı
        </span>
      ),
      moderator: (
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
          Moderatör
        </span>
      ),
      admin: (
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
          Admin
        </span>
      ),
    };
    return badges[role];
  };

  // Don't render if not open
  if (!isOpen) return null;

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Yorum Geçmişi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[600px] overflow-y-auto px-6 py-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Hata</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={loadHistory}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Timeline */}
          {!loading && !error && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">Geçmiş kaydı bulunamadı</p>
                </div>
              ) : (
                history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`relative rounded-lg border p-4 ${getActionColor(entry.action)}`}
                  >
                    {/* Timeline Connector */}
                    {index < history.length - 1 && (
                      <div className="absolute top-full left-8 h-4 w-0.5 bg-gray-300" />
                    )}

                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getActionIcon(entry.action)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getActionLabel(entry.action)}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {entry.actor.name}
                            </span>
                            {getRoleBadge(entry.actor.role)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(entry.timestamp), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Content */}
                    {entry.content && (
                      <div className="rounded-lg bg-white/50 p-3">
                        <p className="text-sm text-gray-700">{entry.content}</p>
                      </div>
                    )}

                    {/* Previous Content (for edits) */}
                    {entry.previousContent && (
                      <div className="mt-2 rounded-lg bg-white/50 p-3">
                        <p className="mb-1 text-xs font-medium text-gray-600">
                          Önceki İçerik:
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          {entry.previousContent}
                        </p>
                      </div>
                    )}

                    {/* Reason */}
                    {entry.reason && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg bg-white/50 p-2">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                        <p className="text-xs text-gray-600">
                          <strong>Sebep:</strong> {entry.reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentHistoryDialog;
