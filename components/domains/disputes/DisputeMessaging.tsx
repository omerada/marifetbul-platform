/**
 * ============================================================================
 * DISPUTE MESSAGING COMPONENT - Real-time Chat Interface
 * ============================================================================
 * Chat interface for dispute communication with admin participation
 *
 * Features:
 * - Real-time message updates via WebSocket
 * - Send & receive messages
 * - File attachments
 * - Admin participation badge
 * - Typing indicators
 * - Read receipts
 * - Auto-scroll to latest message
 * - Message timestamps
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 5
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Paperclip,
  Shield,
  Loader2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { useDisputeMessages } from '@/hooks/business/useDisputeMessages';
import { useDisputeEvidence } from '@/hooks/business/useDisputeEvidence';
import {
  disputeMessagesApi,
  MessageSenderType,
} from '@/lib/api/dispute-messages';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

interface DisputeMessagingProps {
  disputeId: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DisputeMessaging({
  disputeId,
  className,
}: DisputeMessagingProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    loadMore,
    hasMore,
    typingUsers,
    sendTypingIndicator,
    markAllAsRead,
  } = useDisputeMessages(disputeId);

  const { uploadEvidence } = useDisputeEvidence();

  // ============================================================================
  // AUTO-SCROLL TO BOTTOM
  // ============================================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================================================
  // MARK AS READ ON MOUNT
  // ============================================================================

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // ============================================================================
  // HANDLE FILE ATTACHMENT
  // ============================================================================

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAttachmentFile(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
  };

  // ============================================================================
  // HANDLE TYPING INDICATOR
  // ============================================================================

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };

  // ============================================================================
  // SEND MESSAGE
  // ============================================================================

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !attachmentFile) || isSending) return;

    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;
    let attachmentType: string | undefined;

    // Upload attachment first if exists
    if (attachmentFile) {
      setIsUploadingAttachment(true);

      try {
        // Upload to dispute evidence
        const result = await uploadEvidence(disputeId, {
          file: attachmentFile,
          description: 'Message attachment',
        });

        if (result) {
          attachmentUrl = result.url || '';
          attachmentName = attachmentFile.name;
          attachmentType = attachmentFile.type;
        } else {
          setIsUploadingAttachment(false);
          return; // Don't send message if attachment upload fails
        }
      } catch (_error) {
        setIsUploadingAttachment(false);
        return; // Don't send message if attachment upload fails
      } finally {
        setIsUploadingAttachment(false);
      }
    }

    // Send message
    const success = await sendMessage({
      content: messageInput.trim() || '📎 Dosya eklendi',
      attachmentUrl,
      attachmentName,
      attachmentType,
    });

    if (success) {
      setMessageInput('');
      setAttachmentFile(null);
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('flex h-[600px] flex-col', className)}>
      {/* Messages List */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMore()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                'Daha Fazla Mesaj Yükle'
              )}
            </Button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 && !isLoading && (
          <div className="py-12 text-center text-gray-500">
            <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm">Henüz mesaj yok</p>
            <p className="mt-1 text-xs">İlk mesajı gönderin</p>
          </div>
        )}

        {[...messages].reverse().map((message) => {
          const isAdmin = message.senderType === MessageSenderType.ADMIN;
          const isCurrentUser = message.senderName === 'Sen';
          const hasAttachment = !!message.attachmentUrl;

          return (
            <div
              key={message.id}
              className={cn(
                'flex flex-col',
                isCurrentUser ? 'items-end' : 'items-start'
              )}
            >
              {/* Sender Name & Badge */}
              <div className="mb-1 flex items-center gap-2 px-1">
                <span className="text-xs font-medium text-gray-600">
                  {message.senderName}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                    <Shield className="h-3 w-3" />
                    <span className="text-xs font-medium">Yönetim</span>
                  </div>
                )}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    disputeMessagesApi.getSenderBadgeColor(message.senderType)
                  )}
                >
                  {disputeMessagesApi.getSenderLabel(message.senderType)}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg p-3',
                  isCurrentUser
                    ? 'bg-purple-600 text-white'
                    : isAdmin
                      ? 'border border-red-200 bg-red-50 text-red-900'
                      : 'border border-gray-200 bg-white text-gray-900'
                )}
              >
                {/* Attachment Preview */}
                {hasAttachment && (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'mb-2 block overflow-hidden rounded-lg border',
                      isCurrentUser ? 'border-purple-400' : 'border-gray-300'
                    )}
                  >
                    {message.attachmentType?.startsWith('image/') ? (
                      <div className="relative aspect-video w-full bg-gray-100">
                        <Image
                          src={message.attachmentUrl!}
                          alt={message.attachmentName || 'Attachment'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center gap-3 p-3',
                          isCurrentUser ? 'bg-purple-700' : 'bg-gray-50'
                        )}
                      >
                        <FileText
                          className={cn(
                            'h-8 w-8',
                            isCurrentUser ? 'text-purple-200' : 'text-gray-400'
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-sm font-medium',
                              isCurrentUser ? 'text-white' : 'text-gray-900'
                            )}
                          >
                            {message.attachmentName}
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              isCurrentUser
                                ? 'text-purple-200'
                                : 'text-gray-500'
                            )}
                          >
                            {message.attachmentType}
                          </p>
                        </div>
                      </div>
                    )}
                  </a>
                )}

                {/* Message Content */}
                <p className="text-sm break-words whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Timestamp & Status */}
                <div className="mt-2 flex items-center justify-end gap-2">
                  <span
                    className={cn(
                      'text-xs',
                      isCurrentUser ? 'text-purple-200' : 'text-gray-500'
                    )}
                  >
                    {disputeMessagesApi.formatMessageTime(message.createdAt)}
                  </span>
                  {isCurrentUser && message.readAt && (
                    <span className="text-xs text-purple-200">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-start">
            <div className="max-w-[70%] rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200" />
                </div>
                <span className="text-xs text-gray-600">
                  {typingUsers.join(', ')} yazıyor...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <Card className="rounded-t-none border-t">
        <CardContent className="p-4">
          {/* Attachment Preview */}
          {attachmentFile && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
              {attachmentFile.type.startsWith('image/') ? (
                <ImageIcon className="h-8 w-8 text-purple-600" />
              ) : (
                <FileText className="h-8 w-8 text-purple-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-purple-900">
                  {attachmentFile.name}
                </p>
                <p className="text-xs text-purple-600">
                  {(attachmentFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeAttachment}
                disabled={isUploadingAttachment}
              >
                Kaldır
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploadingAttachment}
              className="flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Message Input */}
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın..."
              disabled={isSending || isUploadingAttachment}
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={
                (!messageInput.trim() && !attachmentFile) ||
                isSending ||
                isUploadingAttachment
              }
              className="flex-shrink-0"
            >
              {isSending || isUploadingAttachment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gönder
                </>
              )}
            </Button>
          </div>

          {/* Helper Text */}
          <p className="mt-2 text-xs text-gray-500">
            <strong>💡 İpucu:</strong> Enter ile gönder, Shift+Enter ile yeni
            satır
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default DisputeMessaging;
