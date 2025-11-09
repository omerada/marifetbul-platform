'use client';

/**
 * ================================================
 * DISPUTE MESSAGES COMPONENT
 * ================================================
 * Sprint 2 Story 2.1: Real-time messaging for disputes
 *
 * Features:
 * - Real-time chat interface (10s auto-refresh)
 * - Message history with auto-scroll
 * - File attachment support
 * - System message display
 * - Participant role badges
 * - Message timestamps
 * - Read/unread tracking
 * - Message deletion (5-min window)
 * - Empty states
 * - Loading states
 *
 * @updated Sprint 2: Integrated with backend messaging API
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2: Backend Integration
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Send,
  Paperclip,
  X,
  User,
  Shield,
  AlertCircle,
  Trash2,
  Bot,
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Button, Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useDisputeMessages } from '@/hooks/business/disputes';
import { uploadDisputeAttachment } from '@/lib/api/disputes';
import { formatFileSize } from '@/lib/shared/formatters';
import type { MessageRole } from '@/types/dispute';

// ================================================
// TYPES
// ================================================

interface DisputeMessagesProps {
  disputeId: string;
  currentUserId: string;
  className?: string;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function getRoleBadgeColor(role: MessageRole): {
  bg: string;
  text: string;
} {
  switch (role) {
    case 'ADMIN':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'BUYER':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'SELLER':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'SYSTEM':
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

function getRoleLabel(role: MessageRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'BUYER':
      return 'Alıcı';
    case 'SELLER':
      return 'Satıcı';
    case 'SYSTEM':
      return 'Sistem';
    default:
      return 'Bilinmeyen';
  }
}

function getRoleIcon(
  role: MessageRole
): typeof Shield | typeof User | typeof Bot {
  switch (role) {
    case 'ADMIN':
      return Shield;
    case 'SYSTEM':
      return Bot;
    case 'BUYER':
    case 'SELLER':
    default:
      return User;
  }
}

function canDeleteMessage(createdAt: string): boolean {
  const messageTime = new Date(createdAt).getTime();
  const now = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;
  return now - messageTime < fiveMinutesInMs;
}

// ================================================
// COMPONENT
// ================================================

export default function DisputeMessages({
  disputeId,
  currentUserId,
  className = '',
}: DisputeMessagesProps) {
  // Use the real hook instead of mock data
  const { messages, isLoading, isSending, sendMessage, deleteMessage } =
    useDisputeMessages(disputeId);

  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() && attachments.length === 0) return;

    try {
      // Upload attachments if any
      const attachmentUrls: string[] = [];

      if (attachments.length > 0) {
        setIsUploading(true);

        for (const file of attachments) {
          try {
            const uploadResponse = await uploadDisputeAttachment(
              file,
              (progress: number) => {
                setUploadProgress((prev: Record<string, number>) => ({
                  ...prev,
                  [file.name]: progress,
                }));
              }
            );

            attachmentUrls.push(uploadResponse.fileUrl);
          } catch (_uploadError) {
            toast.error('Dosya yüklenemedi', {
              description: `${file.name} yüklenirken hata oluştu.`,
            });
            setIsUploading(false);
            return;
          }
        }

        setIsUploading(false);
        setUploadProgress({});
      }

      // Send message with attachment URLs
      const success = await sendMessage(messageText.trim(), attachmentUrls);

      if (success) {
        setMessageText('');
        setAttachments([]);
      }
    } catch (_error) {
      toast.error('Mesaj gönderilemedi', {
        description: 'Lütfen tekrar deneyin.',
      });
      setIsUploading(false);
    }
  }, [messageText, attachments, sendMessage]);

  // Handle delete message
  const handleDeleteMessage = useCallback(
    async (messageId: string, createdAt: string) => {
      if (!canDeleteMessage(createdAt)) {
        toast.error('Bu mesaj artık silinemez', {
          description:
            'Mesajlar sadece gönderildikten sonraki 5 dakika içinde silinebilir',
        });
        return;
      }

      const success = await deleteMessage(messageId);
      if (success) {
        toast.success('Mesaj silindi');
      }
    },
    [deleteMessage]
  );

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error('Dosya çok büyük', {
          description: `${file.name} 10MB'dan büyük olamaz.`,
        });
        return false;
      }
      return true;
    });

    // Limit to 5 files
    const totalFiles = attachments.length + validFiles.length;
    if (totalFiles > 5) {
      toast.error('Çok fazla dosya', {
        description: 'Maksimum 5 dosya ekleyebilirsiniz.',
      });
      setAttachments((prev) => [...prev, ...validFiles].slice(0, 5));
    } else {
      setAttachments((prev) => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <Loading size="md" text="Mesajlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Messages List */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-200 p-6">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Henüz mesaj yok
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Bu itirazda henüz mesajlaşma başlamadı.
              <br />
              İlk mesajı gönderin.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              // System messages have senderId = null
              const isSystemMessage = message.isSystemMessage;
              const isOwnMessage =
                !isSystemMessage && message.senderId === currentUserId;
              const RoleIcon = getRoleIcon(message.senderRole);
              const roleBadge = getRoleBadgeColor(message.senderRole);
              const canDelete = isOwnMessage && !isSystemMessage;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isSystemMessage
                      ? 'justify-center'
                      : isOwnMessage
                        ? 'flex-row-reverse'
                        : 'flex-row'
                  }`}
                >
                  {/* System Message Styling */}
                  {isSystemMessage ? (
                    <div className="mx-auto w-full max-w-md">
                      <div className="mb-2 flex items-center justify-center gap-2">
                        <Bot className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-center">
                        <p className="text-sm whitespace-pre-wrap text-gray-700">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Avatar */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${roleBadge.bg}`}
                      >
                        <RoleIcon className={`h-5 w-5 ${roleBadge.text}`} />
                      </div>

                      {/* Message Content */}
                      <div
                        className={`max-w-md flex-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}
                      >
                        {/* Header */}
                        <div
                          className={`mb-1 flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {message.senderFullName || 'Sistem'}
                          </span>
                          <Badge
                            className={`${roleBadge.bg} ${roleBadge.text} text-xs`}
                          >
                            {getRoleLabel(message.senderRole)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`inline-block rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-200 bg-white text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>

                          {/* Attachments */}
                          {message.attachmentUrls &&
                            message.attachmentUrls.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachmentUrls.map(
                                  (attachmentUrl: string, index: number) => (
                                    <a
                                      key={index}
                                      href={attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center gap-2 rounded p-2 transition-opacity hover:opacity-80 ${
                                        isOwnMessage
                                          ? 'bg-purple-700'
                                          : 'border border-gray-200 bg-gray-50'
                                      }`}
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span className="truncate text-xs">
                                        {attachmentUrl.split('/').pop() ||
                                          'Dosya'}
                                      </span>
                                    </a>
                                  )
                                )}
                              </div>
                            )}

                          {/* Status Indicators */}
                          {isOwnMessage && (
                            <div className="mt-1 flex items-center justify-end gap-1">
                              {!message.isRead && (
                                <Check className="h-3 w-3 text-purple-200" />
                              )}
                              {message.isRead && (
                                <CheckCheck className="h-3 w-3 text-purple-200" />
                              )}
                            </div>
                          )}

                          {/* Delete Button (5-min window) */}
                          {canDelete && canDeleteMessage(message.createdAt) && (
                            <button
                              onClick={() =>
                                handleDeleteMessage(
                                  message.id,
                                  message.createdAt
                                )
                              }
                              className="mt-2 flex items-center gap-1 text-xs text-purple-200 transition-colors hover:text-white"
                              title="Mesajı sil (5 dakika içinde)"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Sil</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing Indicator - Placeholder for future WebSocket implementation */}
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="border-t bg-white p-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-gray-600" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {isUploading && uploadProgress[file.name] !== undefined && (
                    <div className="mt-1">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-purple-600 transition-all duration-300"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {uploadProgress[file.name]}%
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end gap-2">
          {/* File Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isUploading || attachments.length >= 5}
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın... (Enter: Gönder, Shift+Enter: Yeni satır)"
              disabled={isSending || isUploading}
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:bg-gray-100"
              style={{ maxHeight: '150px' }}
            />
          </div>

          {/* Send Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={
              isSending ||
              isUploading ||
              (!messageText.trim() && attachments.length === 0)
            }
            className="flex-shrink-0"
          >
            {isSending || isUploading ? (
              <Loading size="sm" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="mt-2 text-xs text-gray-500">
          Maksimum 5 dosya (10MB/dosya). Desteklenen formatlar: resim, PDF,
          Word, TXT
        </p>
      </div>
    </div>
  );
}
