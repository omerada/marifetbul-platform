/**
 * ChatWindow Component
 *
 * Modern chat UI with real-time messaging, typing indicators,
 * file sharing, and responsive design.
 *
 * Features:
 * - Real-time message list with infinite scroll
 * - Message bubbles with sender/receiver styles
 * - Typing indicators
 * - File upload and preview
 * - Read receipts
 * - Auto-scroll to bottom
 * - Mobile-responsive design
 * - Message timestamps
 * - Empty state
 *
 * @sprint Sprint 3 - Messaging & Notifications
 * @author MarifetBul Development Team
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Send, Paperclip, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useConversation } from '@/hooks/business/conversations';
import type { Message } from '@/types/message';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

export interface ChatWindowProps {
  /** Conversation ID (if existing) */
  conversationId?: string;
  /** Participant ID (if starting new) */
  participantId?: string;
  /** Current user ID */
  currentUserId: string;
  /** Participant name */
  participantName: string;
  /** Participant avatar URL */
  participantAvatar?: string;
  /** Max height (default: 600px) */
  maxHeight?: number;
  /** Enable file upload (default: true) */
  enableFileUpload?: boolean;
  /** Max files per message (default: 5) */
  maxFiles?: number;
  /** Custom CSS class */
  className?: string;
  /** On conversation created callback */
  onConversationCreated?: (conversationId: string) => void;
}

// ==================== COMPONENT ====================

export function ChatWindow({
  conversationId,
  participantId,
  currentUserId,
  participantName,
  participantAvatar,
  maxHeight = 600,
  enableFileUpload = true,
  maxFiles = 5,
  className = '',
  onConversationCreated,
}: ChatWindowProps) {
  // ==================== HOOKS ====================

  const {
    conversation,
    messages,
    typingUsers,
    isLoading,
    isLoadingMore,
    hasMore,
    actions,
  } = useConversation({
    conversationId,
    participantId,
    autoLoad: true,
    pageSize: 50,
    enableTyping: true,
    enableReadReceipts: true,
    enableRealtime: true,
  });

  // ==================== STATE ====================

  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== EFFECTS ====================

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark as read when messages visible
  useEffect(() => {
    if (messages.length > 0 && conversation) {
      actions.markAsRead();
    }
  }, [messages, conversation, actions]);

  // Notify parent when conversation created
  useEffect(() => {
    if (conversation && onConversationCreated) {
      onConversationCreated(conversation.id);
    }
  }, [conversation, onConversationCreated]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  // ==================== HANDLERS ====================

  /**
   * Handle message input change
   */
  const handleInputChange = useCallback(
    (value: string) => {
      setMessageInput(value);

      // Send typing indicator
      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        actions.setTyping(true);
      }

      // Reset typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        actions.setTyping(false);
      }, 1000);
    },
    [isTyping, actions]
  );

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      if (selectedFiles.length + files.length > maxFiles) {
        logger.warn('Max files exceeded', { maxFiles });
        return;
      }

      setSelectedFiles((prev) => [...prev, ...files]);
    },
    [selectedFiles, maxFiles]
  );

  /**
   * Remove selected file
   */
  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Send message
   */
  const handleSendMessage = useCallback(async () => {
    const content = messageInput.trim();

    if (!content && selectedFiles.length === 0) {
      return;
    }

    setIsSending(true);

    try {
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        actions.setTyping(false);
      }

      // Send message
      if (selectedFiles.length > 0) {
        await actions.sendMessageWithFiles(content, selectedFiles);
      } else {
        await actions.sendMessage(content);
      }

      // Clear input
      setMessageInput('');
      setSelectedFiles([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      logger.error('ChatWindow: Failed to send message', error as Error);
    } finally {
      setIsSending(false);
    }
  }, [messageInput, selectedFiles, isTyping, actions]);

  /**
   * Handle Enter key
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  /**
   * Load more messages (scroll pagination)
   */
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    if (container.scrollTop === 0) {
      actions.loadMoreMessages();
    }
  }, [isLoadingMore, hasMore, actions]);

  // ==================== RENDER HELPERS ====================

  /**
   * Render message bubble
   */
  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.senderId === currentUserId;
    const showAvatar = !isOwnMessage;
    const prevMessage = messages[index - 1];
    const showTimestamp =
      !prevMessage ||
      new Date(message.createdAt).getTime() -
        new Date(prevMessage.createdAt).getTime() >
        300000; // 5 minutes

    return (
      <div
        key={message.id}
        className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} mb-4`}
      >
        {/* Avatar */}
        {showAvatar && (
          <Avatar src={participantAvatar} alt={message.senderName} size="sm">
            {message.senderName[0]}
          </Avatar>
        )}

        {/* Message Content */}
        <div
          className={`flex max-w-[70%] flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
        >
          {/* Timestamp */}
          {showTimestamp && (
            <span className="text-muted-foreground mb-1 text-xs">
              {formatRelativeTime(message.createdAt)}
            </span>
          )}

          {/* Bubble */}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            {/* Message Text */}
            {message.content && (
              <p className="text-sm break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs hover:underline"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">
                      {attachment.fileName}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Read Status */}
          {isOwnMessage && message.isRead && (
            <span className="text-muted-foreground mt-1 text-xs">Okundu</span>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render typing indicator
   */
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <div className="mb-4 flex gap-2">
        <Avatar src={participantAvatar} alt={participantName} size="sm">
          {participantName[0]}
        </Avatar>
        <div className="bg-muted rounded-2xl px-4 py-2">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: '0.1s' }}
            />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-muted-foreground text-center">
        <p className="text-lg font-medium">Henüz mesaj yok</p>
        <p className="mt-2 text-sm">
          {participantName} ile ilk mesajını gönder
        </p>
      </div>
    </div>
  );

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <Card
        className={`flex items-center justify-center ${className}`}
        style={{ height: maxHeight }}
      >
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </Card>
    );
  }

  return (
    <Card
      className={`flex flex-col ${className}`}
      style={{ height: maxHeight }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar src={participantAvatar} alt={participantName} size="md">
          {participantName[0]}
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{participantName}</h3>
          {conversation?.participantOnline && (
            <Badge variant="success" size="sm">
              Çevrimiçi
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {/* Load More Indicator */}
        {isLoadingMore && (
          <div className="mb-4 flex justify-center">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            {renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-t px-4 py-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="bg-muted relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg"
            >
              {file.type.startsWith('image/') ? (
                <div className="relative h-full w-full">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <Paperclip className="text-muted-foreground mx-auto h-6 w-6" />
                  <span className="block max-w-[60px] truncate text-xs">
                    {file.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => handleRemoveFile(index)}
                className="bg-destructive hover:bg-destructive/90 absolute -top-2 -right-2 rounded-full p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          {/* File Upload */}
          {enableFileUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.zip"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Textarea */}
          <Textarea
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="max-h-[120px] min-h-[40px] flex-1 resize-none"
            disabled={isSending}
          />

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={
              isSending || (!messageInput.trim() && selectedFiles.length === 0)
            }
            size="sm"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Types exported inline above
