/**
 * ================================================
 * COMMENT EDIT DIALOG COMPONENT
 * ================================================
 * Modal dialog for editing comment content
 * Includes content validation and history tracking
 *
 * Sprint 3 Day 2: Moderator Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogComment } from '@/types/blog';

// ================================================
// TYPES
// ================================================

export interface CommentEditDialogProps {
  comment: BlogComment;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    commentId: string,
    newContent: string,
    reason: string
  ) => Promise<void>;
}

// ================================================
// COMPONENT
// ================================================

export function CommentEditDialog({
  comment,
  isOpen,
  onClose,
  onSave,
}: CommentEditDialogProps) {
  const [content, setContent] = useState(comment.content);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when comment changes
  useEffect(() => {
    setContent(comment.content);
    setReason('');
    setError(null);
  }, [comment]);

  // ================================================
  // VALIDATION
  // ================================================

  const validate = (): boolean => {
    if (!content.trim()) {
      setError('Yorum içeriği boş olamaz');
      return false;
    }

    if (content.length < 10) {
      setError('Yorum en az 10 karakter olmalı');
      return false;
    }

    if (content.length > 5000) {
      setError('Yorum en fazla 5000 karakter olabilir');
      return false;
    }

    if (content === comment.content) {
      setError('Değişiklik yapılmadı');
      return false;
    }

    if (!reason.trim()) {
      setError('Düzenleme sebebi girilmeli');
      return false;
    }

    setError(null);
    return true;
  };

  // ================================================
  // HANDLERS
  // ================================================

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(comment.id, content.trim(), reason.trim());
      toast.success('Yorum başarıyla güncellendi');
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Yorum güncellenirken hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (
      content !== comment.content &&
      !confirm('Değişiklikler kaydedilmedi. Çıkmak istediğinize emin misiniz?')
    ) {
      return;
    }
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Yorumu Düzenle
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Original Content Info */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-600">
              Orijinal İçerik:
            </p>
            <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
          </div>

          {/* Content Editor */}
          <div>
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Yeni İçerik
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              rows={6}
              placeholder="Yorum içeriği..."
            />
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{content.length} / 5000 karakter</span>
              <span
                className={
                  content.length > 5000 ? 'font-medium text-red-600' : ''
                }
              >
                {content.length > 5000 && 'Maksimum karakter aşıldı!'}
              </span>
            </div>
          </div>

          {/* Edit Reason */}
          <div>
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Düzenleme Sebebi *
            </label>
            <input
              type="text"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder="Örn: Yazım hatası düzeltildi, uygunsuz kelime kaldırıldı..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium">Dikkat:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>Bu işlem yorum geçmişine kaydedilecektir</li>
                  <li>Düzenleme sebebi kullanıcıya gösterilmeyecektir</li>
                  <li>Orijinal içerik sistem tarafından saklanacaktır</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim() || !reason.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentEditDialog;
