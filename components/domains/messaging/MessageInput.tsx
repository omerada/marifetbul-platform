/**
 * MessageInput Component
 *
 * Message input with:
 * - Text input with auto-resize
 * - Send button
 * - Typing indicator emission
 * - File upload (future)
 * - Emoji picker (future)
 * - @ mentions (future)
 *
 * @sprint Sprint 1 - Story 1.5
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { logger } from '@/lib/shared/utils/logger';

interface MessageInputProps {
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether a message is being sent */
  isSending?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when message is sent */
  onSend: (content: string) => Promise<void>;
  /** Callback when user starts typing */
  onTypingStart?: () => void;
  /** Callback when user stops typing */
  onTypingStop?: () => void;
  /** Maximum message length */
  maxLength?: number;
}

/**
 * MessageInput Component
 */
export function MessageInput({
  disabled = false,
  isSending = false,
  placeholder = 'Mesajınızı yazın...',
  onSend,
  onTypingStart,
  onTypingStop,
  maxLength = 5000,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [text]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    // Start typing indicator if not already typing
    if (!isTypingRef.current && onTypingStart) {
      isTypingRef.current = true;
      onTypingStart();
      logger.debug('MessageInput', 'Typing started');
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && onTypingStop) {
        isTypingRef.current = false;
        onTypingStop();
        logger.debug('MessageInput', 'Typing stopped (timeout)');
      }
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;

      // Enforce max length
      if (newText.length > maxLength) {
        return;
      }

      setText(newText);

      // Trigger typing indicator
      if (newText.trim()) {
        handleTyping();
      }
    },
    [maxLength, handleTyping]
  );

  // Send message
  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || isSending || disabled) return;

    try {
      // Clear input immediately for better UX
      setText('');

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && onTypingStop) {
        isTypingRef.current = false;
        onTypingStop();
      }

      // Send message
      await onSend(content);

      logger.info('MessageInput', 'Message sent successfully');
    } catch (error) {
      logger.error('MessageInput', 'Failed to send message', { error });
      // Restore text on error
      setText(content);
    }
  }, [text, isSending, disabled, onSend, onTypingStop]);

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && onTypingStop) {
        onTypingStop();
      }
    };
  }, [onTypingStop]);

  const isDisabled = disabled || isSending;
  const canSend = text.trim().length > 0 && !isDisabled;
  const characterCount = text.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div
        className={`flex items-end gap-2 rounded-2xl border-2 transition-colors ${
          isFocused
            ? 'border-blue-500 bg-blue-50/30'
            : 'border-gray-200 bg-gray-50'
        } ${isDisabled ? 'opacity-50' : ''}`}
      >
        {/* Emoji Picker Button (Future) */}
        <button
          type="button"
          disabled={isDisabled}
          className="flex-shrink-0 p-3 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          title="Emoji ekle (yakında)"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isDisabled}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none border-0 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none disabled:cursor-not-allowed"
            style={{ maxHeight: '120px' }}
          />

          {/* Character Count */}
          {characterCount > 0 && (
            <div
              className={`pb-2 text-right text-xs ${
                isNearLimit ? 'font-semibold text-red-500' : 'text-gray-400'
              }`}
            >
              {characterCount}/{maxLength}
            </div>
          )}
        </div>

        {/* File Upload Button (Future) */}
        <button
          type="button"
          disabled={isDisabled}
          className="flex-shrink-0 p-3 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          title="Dosya ekle (yakında)"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="m-2 flex-shrink-0"
          size="sm"
        >
          {isSending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Keyboard Hint */}
      <div className="mt-2 text-center text-xs text-gray-400">
        <kbd className="rounded bg-gray-100 px-1.5 py-0.5">Enter</kbd> gönder,{' '}
        <kbd className="rounded bg-gray-100 px-1.5 py-0.5">Shift</kbd> +{' '}
        <kbd className="rounded bg-gray-100 px-1.5 py-0.5">Enter</kbd> yeni
        satır
      </div>
    </div>
  );
}
