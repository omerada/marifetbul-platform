/**
 * MessageInput Component
 *
 * Message input with:
 * - Text input with auto-resize
 * - Send button
 * - Typing indicator emission
 * - File upload ✅ Sprint 1 - Story 1.1
 * - Emoji picker (future)
 * - @ mentions (future)
 *
 * @sprint Sprint 1 - File Attachments Complete
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, X, File, Image as ImageIcon } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { logger } from '@/lib/shared/utils/logger';
import {
  useMessageAttachments,
  type MessageAttachment,
} from '@/hooks/business/messaging/useMessageAttachments';
import { toast } from 'sonner';

interface MessageInputProps {
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether a message is being sent */
  isSending?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when message is sent (with optional attachments) */
  onSend: (content: string, attachments?: MessageAttachment[]) => Promise<void>;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // File upload hook
  const {
    uploadFiles,
    isUploading,
    uploadProgress,
    error: uploadError,
  } = useMessageAttachments();

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
    if ((!content && selectedFiles.length === 0) || isSending || disabled)
      return;

    try {
      // Upload files first if any
      let attachments: MessageAttachment[] | undefined;
      if (selectedFiles.length > 0) {
        try {
          attachments = await uploadFiles(selectedFiles);
          logger.info('MessageInput', 'Files uploaded', {
            count: attachments.length,
          });
        } catch (error) {
          toast.error('Dosyalar yüklenemedi');
          logger.error('MessageInput', 'File upload failed', { error });
          return; // Don't send message if files fail to upload
        }
      }

      // Clear input immediately for better UX
      setText('');
      setSelectedFiles([]);

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && onTypingStop) {
        isTypingRef.current = false;
        onTypingStop();
      }

      // Send message with attachments
      await onSend(content, attachments);

      logger.info('MessageInput', 'Message sent successfully', {
        hasAttachments: !!attachments,
      });
    } catch (error) {
      logger.error('MessageInput', 'Failed to send message', { error });
      toast.error('Mesaj gönderilemedi');
      // Restore text on error (but not files - they're already uploaded)
      setText(content);
    }
  }, [
    text,
    selectedFiles,
    isSending,
    disabled,
    onSend,
    onTypingStop,
    uploadFiles,
  ]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      // Validate file count (max 3 files)
      if (selectedFiles.length + files.length > 3) {
        toast.error('En fazla 3 dosya ekleyebilirsiniz');
        return;
      }

      // Validate file sizes (max 10MB each)
      const invalidFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error("Dosya boyutu 10MB'yi geçemez");
        return;
      }

      // Validate file types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/zip',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const invalidTypes = files.filter((f) => !allowedTypes.includes(f.type));
      if (invalidTypes.length > 0) {
        toast.error('Geçersiz dosya türü');
        return;
      }

      setSelectedFiles((prev) => [...prev, ...files]);

      // Clear input so same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    },
    [selectedFiles]
  );

  // Remove selected file
  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Trigger file input click
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Show upload error toast
  useEffect(() => {
    if (uploadError) {
      toast.error(uploadError.message || 'Dosya yüklenemedi');
    }
  }, [uploadError]);

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

  const isDisabled = disabled || isSending || isUploading;
  const canSend =
    (text.trim().length > 0 || selectedFiles.length > 0) && !isDisabled;
  const characterCount = text.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* File Preview Area */}
      {selectedFiles.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {selectedFiles.length} dosya seçildi
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
              >
                <File className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span className="max-w-[200px] truncate text-gray-700">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round(file.size / 1024)}KB)
                </span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="flex-shrink-0 text-gray-400 transition-colors hover:text-red-600"
                  aria-label={`${file.name} dosyasını kaldır`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Dosyalar yükleniyor...
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Dosya seç"
        />

        <div
          className={`flex items-end gap-2 rounded-2xl border-2 transition-colors ${
            isFocused
              ? 'border-blue-500 bg-blue-50/30'
              : 'border-gray-200 bg-gray-50'
          } ${isDisabled ? 'opacity-50' : ''}`}
        >
          {/* File Attach Button */}
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={isDisabled || selectedFiles.length >= 3}
            className="flex-shrink-0 p-3 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="Dosya ekle (maks. 3 dosya, 10MB)"
          >
            <ImageIcon className="h-5 w-5" />
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

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="m-2 flex-shrink-0"
            size="sm"
          >
            {isSending || isUploading ? (
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
    </div>
  );
}
