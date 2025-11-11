'use client';

/**
 * ================================================
 * COMMENT FORM COMPONENT
 * ================================================
 * Form for submitting new comments and replies
 * Features: Validation, character counter, spam detection
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useCommentSubmission } from '@/hooks/business/useCommentSubmission';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import type { BlogComment } from '@/lib/api/blog';

// ================================================
// TYPES
// ================================================

export interface CommentFormProps {
  postId: number;
  parentCommentId?: number;
  onSuccess?: (comment: BlogComment) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showGuidelines?: boolean;
  compact?: boolean;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

// ================================================
// COMPONENT
// ================================================

export function CommentForm({
  postId,
  parentCommentId,
  onSuccess,
  onCancel,
  placeholder = 'Düşüncelerinizi paylaşın...',
  autoFocus = false,
  showGuidelines = true,
  compact = false,
}: CommentFormProps) {
  // ================================================
  // STATE
  // ================================================

  const [content, setContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // ================================================
  // HOOKS
  // ================================================

  const user = authSelectors.useUser();
  const isAuthenticated = authSelectors.useIsAuthenticated();
  const { isSubmitting, error, success, submitComment, resetState } =
    useCommentSubmission();

  // ================================================
  // COMPUTED
  // ================================================

  const characterCount = content.length;
  const isValidLength =
    characterCount >= MIN_LENGTH && characterCount <= MAX_LENGTH;
  const canSubmit = isValidLength && !isSubmitting && isAuthenticated;

  // ================================================
  // EFFECTS
  // ================================================

  // Show success message and reset form
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setContent('');

      const timer = setTimeout(() => {
        setShowSuccess(false);
        resetState();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, resetState]);

  // ================================================
  // HANDLERS
  // ================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const comment = await submitComment({
      postId,
      content: content.trim(),
      parentId: parentCommentId,
    });

    if (comment && onSuccess) {
      onSuccess(comment);
    }
  };

  const handleCancel = () => {
    setContent('');
    resetState();
    onCancel?.();
  };

  // ================================================
  // RENDER - Not Authenticated
  // ================================================

  if (!isAuthenticated) {
    return (
      <div className={compact ? 'rounded-lg border border-gray-200 p-4' : ''}>
        <div className="rounded-lg bg-blue-50 p-6 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-blue-600" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Yorum yapmak için giriş yapın
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Düşüncelerinizi paylaşmak için hesabınıza giriş yapmanız
            gerekmektedir.
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="/login?redirect=/blog"
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Giriş Yap
            </a>
            <a
              href="/register?redirect=/blog"
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kayıt Ol
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Success Message
  // ================================================

  if (showSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-900">
              Yorumunuz başarıyla gönderildi!
            </h4>
            <p className="text-sm text-green-700">
              İncelendikten sonra yayınlanacaktır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Form
  // ================================================

  return (
    <div className={compact ? '' : 'space-y-4'}>
      {/* Form Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {parentCommentId ? 'Yanıt Yaz' : 'Yorum Yap'}
          </h3>
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span>{user.name || 'Kullanıcı'}</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={compact ? 3 : 5}
            className={`w-full resize-none rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
              characterCount > MAX_LENGTH
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            disabled={isSubmitting}
          />

          {/* Character Counter */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <div
              className={`${
                characterCount < MIN_LENGTH
                  ? 'text-gray-400'
                  : characterCount > MAX_LENGTH
                    ? 'text-red-600'
                    : 'text-green-600'
              }`}
            >
              {characterCount < MIN_LENGTH ? (
                <span>En az {MIN_LENGTH} karakter gerekli</span>
              ) : characterCount > MAX_LENGTH ? (
                <span>
                  Karakter sınırı aşıldı! ({characterCount - MAX_LENGTH} fazla)
                </span>
              ) : (
                <span>✓ Geçerli uzunluk</span>
              )}
            </div>
            <div
              className={
                characterCount > MAX_LENGTH ? 'text-red-600' : 'text-gray-500'
              }
            >
              {characterCount} / {MAX_LENGTH}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <p>Yorumunuz incelendikten sonra yayınlanacaktır.</p>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                disabled={isSubmitting}
              >
                İptal
              </button>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{parentCommentId ? 'Yanıtla' : 'Yorum Yap'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Guidelines */}
      {showGuidelines && !compact && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">
            Yorum Kuralları
          </h4>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• Saygılı ve yapıcı yorumlar yazın</li>
            <li>
              • Kişisel saldırılar ve hakaret içeren yorumlar onaylanmayacaktır
            </li>
            <li>• Reklam ve spam içerikler yayınlanmayacaktır</li>
            <li>• Konuyla ilgili yorumlar yapmaya özen gösterin</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default CommentForm;
