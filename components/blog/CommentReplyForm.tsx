'use client';

/**
 * ================================================
 * COMMENT REPLY FORM COMPONENT
 * ================================================
 * Form for replying to blog comments
 * Displays inline below parent comment
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Reply, X, AlertCircle, Loader2 } from 'lucide-react';
import { useCommentSubmission } from '@/hooks/business/useCommentSubmission';
import type { BlogComment } from '@/lib/api/blog';

// ================================================
// TYPES
// ================================================

export interface CommentReplyFormProps {
  postId: number;
  parentCommentId: number;
  parentAuthor: string;
  onSuccess: (reply: BlogComment) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function CommentReplyForm({
  postId,
  parentCommentId,
  parentAuthor,
  onSuccess,
  onCancel,
  autoFocus = true,
}: CommentReplyFormProps) {
  // ================================================
  // HOOKS
  // ================================================

  const { replyToComment, isSubmitting, error, resetError } =
    useCommentSubmission();

  // ================================================
  // STATE
  // ================================================

  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // ================================================
  // COMPUTED
  // ================================================

  const charCount = content.length;
  const charLimit = 1000;
  const charRemaining = charLimit - charCount;
  const isValid = charCount >= 10 && charCount <= charLimit;

  // ================================================
  // HANDLERS
  // ================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();

    if (!isValid) return;

    const reply = await replyToComment(postId, parentCommentId, content);

    if (reply) {
      setContent('');
      onSuccess(reply);
    }
  };

  const handleCancel = () => {
    setContent('');
    resetError();
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isValid) {
        void handleSubmit(e as unknown as React.FormEvent);
      }
    }
    // Cancel on Escape
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Reply className="h-4 w-4 text-blue-600" />
          <span>
            <strong>{parentAuthor}</strong> kullanıcısına yanıt veriyorsunuz
          </span>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="İptal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Textarea */}
        <div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            placeholder="Yanıtınızı yazın... (En az 10 karakter)"
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
            rows={3}
            minLength={10}
            maxLength={1000}
          />

          {/* Character Counter */}
          <div className="mt-1 flex items-center justify-between text-xs">
            <span
              className={`${
                charCount < 10
                  ? 'text-red-600'
                  : charRemaining < 50
                    ? 'text-orange-600'
                    : 'text-gray-500'
              }`}
            >
              {charCount < 10
                ? `En az ${10 - charCount} karakter daha yazmalısınız`
                : `${charRemaining} karakter kaldı`}
            </span>
            <span className="text-gray-400">
              {charCount} / {charLimit}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <>
                <Reply className="h-4 w-4" />
                <span>Yanıtla</span>
              </>
            )}
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <p className="text-xs text-gray-500">
          <kbd className="rounded bg-gray-200 px-1.5 py-0.5">Ctrl+Enter</kbd>{' '}
          ile gönder,{' '}
          <kbd className="rounded bg-gray-200 px-1.5 py-0.5">Esc</kbd> ile iptal
        </p>
      </form>
    </div>
  );
}
