/**
 * ================================================
 * COMMENT EDIT FORM COMPONENT
 * ================================================
 * Inline editor for editing existing comments
 * Used within CommentCard for in-place editing
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useCommentActions } from '@/hooks/business/useCommentActions';

// ================================================
// TYPES
// ================================================

export interface CommentEditFormProps {
  commentId: number;
  initialContent: string;
  onSuccess: (updatedContent: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

// ================================================
// COMPONENT
// ================================================

export function CommentEditForm({
  commentId,
  initialContent,
  onSuccess,
  onCancel,
  autoFocus = true,
}: CommentEditFormProps) {
  // ================================================
  // STATE
  // ================================================

  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ================================================
  // HOOKS
  // ================================================

  const { isUpdating, error, updateComment, resetError } = useCommentActions();

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [autoFocus, content.length]);

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

  const characterCount = content.length;
  const isValidLength =
    characterCount >= MIN_LENGTH && characterCount <= MAX_LENGTH;
  const hasChanges = content.trim() !== initialContent.trim();
  const canSubmit = isValidLength && hasChanges && !isUpdating;

  // ================================================
  // HANDLERS
  // ================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const result = await updateComment(commentId, content.trim());

    if (result) {
      onSuccess(result.content);
    }
  };

  const handleCancel = () => {
    resetError();
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSubmit) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }

    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Textarea */}
      <div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full resize-none rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${
            characterCount > MAX_LENGTH
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          disabled={isUpdating}
          rows={3}
          placeholder="Yorumunuzu düzenleyin..."
        />

        {/* Character Counter */}
        <div className="mt-1 flex items-center justify-between text-xs">
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
          <span className="hidden sm:inline">Ctrl+Enter ile kaydet, </span>
          <span>Esc ile iptal</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            disabled={isUpdating}
          >
            <X className="h-3.5 w-3.5" />
            <span>İptal</span>
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper Text */}
      {!hasChanges && (
        <p className="text-xs text-gray-500">Değişiklik yapmadınız</p>
      )}
    </form>
  );
}

export default CommentEditForm;
