'use client';

/**
 * ================================================
 * COMMENT REPORT MODAL - PRODUCTION READY
 * ================================================
 * Unified modal for reporting inappropriate comments
 * Uses real backend API integration
 *
 * Sprint 1: Blog Comment Moderation Completion
 * @version 2.0.0 - Production Ready
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  type FlagCategory,
  type FlagCommentRequest,
  getCategoryLabel,
  flagComment as apiFlagComment,
} from '@/lib/api/comment-flagging';
import type { BlogCommentDto } from '@/types';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface CommentReportModalProps {
  commentId: number;
  comment?: BlogCommentDto;
  commentAuthor?: string;
  commentPreview?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Flag categories mapping for UI
const FLAG_CATEGORIES: Array<{
  value: FlagCategory;
  label: string;
  description: string;
}> = [
  {
    value: 'SPAM' as FlagCategory,
    label: 'Spam veya Reklam',
    description: 'İstenmeyen reklam, spam veya tekrarlayan içerik',
  },
  {
    value: 'HARASSMENT' as FlagCategory,
    label: 'Taciz veya Zorbalık',
    description: 'Taciz, zorbalık veya tehdit içeren yorumlar',
  },
  {
    value: 'OFFENSIVE' as FlagCategory,
    label: 'Rahatsız Edici İçerik',
    description: 'Hakaret, küfür veya saldırgan dil',
  },
  {
    value: 'OFF_TOPIC' as FlagCategory,
    label: 'Konu Dışı',
    description: 'Konu ile alakasız veya ilgisiz içerik',
  },
  {
    value: 'MISINFORMATION' as FlagCategory,
    label: 'Yanlış Bilgi',
    description: 'Kasıtlı olarak yanlış veya yanıltıcı bilgi',
  },
  {
    value: 'INAPPROPRIATE' as FlagCategory,
    label: 'Uygunsuz İçerik',
    description: 'Genel olarak uygunsuz içerik',
  },
  {
    value: 'OTHER' as FlagCategory,
    label: 'Diğer',
    description: 'Yukarıdakilerden hiçbiri',
  },
];

// ================================================
// COMPONENT
// ================================================

export function CommentReportModal({
  commentId,
  comment,
  commentAuthor,
  commentPreview,
  isOpen,
  onClose,
  onSuccess,
}: CommentReportModalProps) {
  // ================================================
  // STATE
  // ================================================

  const [selectedCategory, setSelectedCategory] = useState<FlagCategory | null>(
    null
  );
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ================================================
  // DERIVED VALUES
  // ================================================

  const author = comment?.authorName || commentAuthor || 'Kullanıcı';
  const preview =
    comment?.content || commentPreview || 'Yorum içeriği yüklenemedi';

  // ================================================
  // EFFECTS
  // ================================================

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
      setDetails('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Handle success - close after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, onClose, onSuccess]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ================================================
  // HANDLERS
  // ================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      setError('Lütfen bir kategori seçin');
      return;
    }

    if (selectedCategory === 'OTHER' && !details.trim()) {
      setError('Lütfen "Diğer" kategorisi için açıklama girin');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: FlagCommentRequest = {
        category: selectedCategory,
        reason: getCategoryLabel(selectedCategory),
        customReason: details.trim() || undefined,
      };

      await apiFlagComment(commentId.toString(), request);

      logger.info('Comment flagged successfully', {
        commentId,
        category: selectedCategory,
      });

      toast.success('Şikayetiniz Alındı', {
        description: 'Moderatörlerimiz en kısa sürede inceleyecektir.',
      });

      setSuccess(true);
    } catch (err) {
      logger.error(
        'Failed to flag comment',
        err instanceof Error ? err : new Error(String(err)),
        {
          commentId,
        }
      );

      const message =
        err instanceof Error
          ? err.message
          : 'Şikayet gönderilemedi. Lütfen tekrar deneyin.';

      setError(message);
      toast.error('Hata', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // ================================================
  // COMPUTED
  // ================================================

  const canSubmit =
    selectedCategory &&
    !isSubmitting &&
    (selectedCategory !== 'OTHER' || details.trim().length >= 10);

  const showDetailsField = selectedCategory === 'OTHER' || details.length > 0;

  // ================================================
  // RENDER - Not Open
  // ================================================

  if (!isOpen) return null;

  // ================================================
  // RENDER - Success State
  // ================================================

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Şikayetiniz Alındı
            </h3>
            <p className="text-gray-600">
              Şikayetiniz moderatörlerimiz tarafından incelenecektir.
              <br />
              Teşekkür ederiz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Main Modal
  // ================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Yorumu Şikayet Et
              </h2>
              <p className="text-sm text-gray-500">
                @{author} kullanıcısının yorumu
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            disabled={isSubmitting}
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Comment Preview */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">
              Şikayet edilen yorum:
            </p>
            <p className="mt-2 line-clamp-3 text-sm text-gray-600">
              &ldquo;{preview}&rdquo;
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Category Selection */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-900">
              Şikayet Kategorisi *
            </label>
            <div className="space-y-2">
              {FLAG_CATEGORIES.map((category) => (
                <label
                  key={category.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${
                    selectedCategory === category.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={selectedCategory === category.value}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as FlagCategory)
                    }
                    className="mt-0.5 h-4 w-4 text-red-600 focus:ring-2 focus:ring-red-500"
                    disabled={isSubmitting}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {category.label}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {category.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          {showDetailsField && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Ek Açıklama {selectedCategory === 'OTHER' && '*'}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Lütfen şikayetiniz hakkında daha fazla bilgi verin..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                disabled={isSubmitting}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {details.length} / 500 karakter
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Not:</strong> Şikayetiniz gizli kalacak ve sadece
              moderatörler tarafından görülebilecektir. Kötüye kullanım
              durumunda hesabınız kısıtlanabilir.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span>Şikayet Gönder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommentReportModal;
