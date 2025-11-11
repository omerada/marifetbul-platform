'use client';

/**
 * ================================================
 * ORDER MESSAGING PANEL
 * ================================================
 * Real-time messaging panel for order communication
 *
 * Features:
 * - Order context display
 * - Real-time chat with WebSocket
 * - Typing indicators
 * - File attachments
 * - Message history
 * - Auto-scroll to latest
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 5: Order Messaging Integration
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, FileText } from 'lucide-react';
import { Button, Textarea, Loading } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks';
import type { OrderResponse as Order } from '@/types/backend-aligned';
import { useWebSocket } from '@/hooks';
import { fileUploadService } from '@/lib/services/file-upload.service';
import { getOrCreateConversation, getMessages } from '@/lib/api/messaging';
import type { Message as ApiMessage } from '@/types/message';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  contextType?: 'ORDER';
  contextId?: string;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Map API message to component message format
 */
function mapApiMessage(apiMsg: ApiMessage): Message {
  return {
    id: apiMsg.id,
    conversationId: apiMsg.conversationId,
    senderId: apiMsg.senderId,
    senderName: apiMsg.senderName,
    content: apiMsg.content,
    timestamp: apiMsg.createdAt, // Map createdAt to timestamp
    type: apiMsg.type.toLowerCase() as 'text' | 'image' | 'file',
    isRead: apiMsg.isRead,
    attachments: apiMsg.attachments?.map((att) => ({
      id: att.id,
      name: att.fileName,
      url: att.fileUrl,
      type: att.mimeType, // Use mimeType
      size: att.fileSize,
    })),
  };
}

export interface OrderMessagingPanelProps {
  /** Order data */
  order: Order;
  /** Current user ID */
  currentUserId: string;
  /** Current user role */
  userRole: 'buyer' | 'seller';
  /** Optional conversation ID (if exists) */
  conversationId?: string;
  /** Optional class name */
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function OrderMessagingPanel({
  order,
  currentUserId,
  userRole,
  conversationId: initialConversationId,
  className,
}: OrderMessagingPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const socket = useWebSocket();
  const { error: showErrorToast } = useToast();

  // Other user info
  const otherUser =
    userRole === 'buyer'
      ? { id: order.sellerId, name: order.sellerName || 'Satıcı' }
      : { id: order.buyerId, name: order.buyerName || 'Alıcı' };

  // ================================================
  // AUTO-SCROLL
  // ================================================

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ================================================
  // LOAD MESSAGES
  // ================================================

  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;

      try {
        setIsLoading(true);

        // Fetch messages from API with pagination
        const response = await getMessages(conversationId, 0, 50);
        // Map API messages to component format
        const mappedMessages = response.content.map(mapApiMessage);
        setMessages(mappedMessages);
      } catch (error) {
        logger.error('Failed to load messages:', error);
        showErrorToast('Mesajlar yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, showErrorToast]);

  // ================================================
  // WEBSOCKET SUBSCRIPTIONS
  // ================================================

  useEffect(() => {
    if (!socket.isConnected || !conversationId) return;

    // Subscribe to conversation messages
    const messageSubId = socket.subscribe(
      `/topic/conversation.${conversationId}`,
      (rawMessage: unknown) => {
        try {
          if (
            !rawMessage ||
            typeof rawMessage !== 'object' ||
            !('body' in rawMessage)
          ) {
            return;
          }

          const msgBody = (rawMessage as { body: string }).body;
          const wsMessage = JSON.parse(msgBody);

          // Handle chat message
          if (wsMessage.type === 'CHAT_MESSAGE' && wsMessage.data) {
            const chatMessage: Message = {
              id: wsMessage.data.id || `msg-${Date.now()}`,
              conversationId: wsMessage.data.conversationId,
              senderId: wsMessage.data.senderId,
              senderName: wsMessage.data.senderName,
              content: wsMessage.data.content,
              timestamp: wsMessage.data.timestamp || new Date().toISOString(),
              type: wsMessage.data.type || 'text',
              isRead: wsMessage.data.isRead || false,
              attachments: wsMessage.data.attachments,
              contextType: wsMessage.data.contextType,
              contextId: wsMessage.data.contextId,
            };

            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === chatMessage.id)) {
                return prev;
              }
              return [...prev, chatMessage];
            });
          }

          // Handle typing indicator
          if (wsMessage.type === 'TYPING' && wsMessage.data) {
            const typingData = wsMessage.data;
            if (typingData.userId !== currentUserId) {
              setTypingUsers((prev) => {
                const updated = new Set(prev);
                if (typingData.isTyping) {
                  updated.add(typingData.userId);
                } else {
                  updated.delete(typingData.userId);
                }
                return updated;
              });
            }
          }
        } catch (error) {
          logger.error('Failed to parse message:', error);
        }
      }
    );

    return () => {
      socket.unsubscribe(messageSubId);
    };
  }, [socket, conversationId, currentUserId]);

  // ================================================
  // SEND MESSAGE
  // ================================================

  const sendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      setIsSending(true);

      // Create or get conversation if not exists
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        try {
          const conversation = await getOrCreateConversation(otherUser.id);
          activeConversationId = conversation.id;
          setConversationId(conversation.id);
        } catch (error) {
          logger.error('Failed to create conversation:', error);
          showErrorToast(
            'Konuşma başlatılamadı',
            'Lütfen tekrar deneyin veya sayfayı yenileyin.'
          );
          return;
        }
      }

      // Upload attachments first if any
      let attachmentUrls: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
      }> = [];

      if (attachments.length > 0) {
        setIsUploadingFiles(true);
        try {
          const results = await fileUploadService.uploadFiles(attachments, {
            folder: `orders/${order.id}/messages`,
            metadata: {
              orderId: order.id,
              conversationId: activeConversationId,
              type: 'message',
            },
          });

          attachmentUrls = results.map((result) => ({
            id: result.id,
            name: result.fileName,
            url: result.fileUrl,
            type: result.fileType,
            size: result.fileSize,
          }));
        } catch (error) {
          logger.error('File upload failed:', error);
          // Continue sending message without attachments
        } finally {
          setIsUploadingFiles(false);
        }
      }

      // Send message via WebSocket
      const chatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: currentUserId,
        senderName: 'Me', // Will be set by backend
        content: message.trim(),
        timestamp: new Date().toISOString(),
        type: attachmentUrls.length > 0 ? 'file' : 'text',
        isRead: false,
        attachments: attachmentUrls,
        contextType: 'ORDER',
        contextId: order.id,
      };

      // Send via WebSocket
      socket.send('/app/chat/message', chatMessage);

      // Optimistically add to UI
      setMessages((prev) => [
        ...prev,
        {
          ...chatMessage,
          senderId: currentUserId,
          senderName: 'Me',
        } as Message,
      ]);

      // Clear input
      setMessage('');
      setAttachments([]);
    } catch (error) {
      logger.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }; // ================================================
  // TYPING INDICATOR
  // ================================================

  const handleTyping = () => {
    if (!conversationId || !socket.isConnected) return;

    // Send typing indicator
    socket.send('/app/chat/typing', {
      conversationId,
      userId: currentUserId,
      username: 'Me',
      isTyping: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.send('/app/chat/typing', {
        conversationId,
        userId: currentUserId,
        username: 'Me',
        isTyping: false,
      });
    }, 3000);
  };

  // ================================================
  // FILE ATTACHMENT
  // ================================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Card className={cn('flex h-[600px] flex-col', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{otherUser.name} ile Mesajlaşma</h3>
            <p className="text-muted-foreground text-sm">
              Sipariş #{order.orderNumber}
            </p>
          </div>
          <div className="text-muted-foreground text-xs">
            {order.packageTitle || order.jobTitle || 'Özel Sipariş'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loading size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-muted-foreground mb-2">Henüz mesaj yok</p>
              <p className="text-muted-foreground text-sm">
                İlk mesajı göndererek sohbeti başlatın
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  isOwnMessage ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-4 py-2',
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {!isOwnMessage && (
                    <p className="mb-1 text-xs font-semibold">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="mt-1 text-xs opacity-70">
                    {formatDistanceToNow(new Date(msg.timestamp), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <p className="text-muted-foreground text-sm">
                {otherUser.name} yazıyor...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="bg-muted/50 border-t px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="bg-background flex items-center gap-2 rounded px-3 py-1.5 text-sm"
              >
                <FileText className="h-4 w-4" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="px-3"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Mesajınızı yazın..."
              className="min-h-[60px] resize-none"
              disabled={isSending}
            />
          </div>

          <Button
            onClick={sendMessage}
            disabled={
              isSending ||
              isUploadingFiles ||
              (!message.trim() && attachments.length === 0)
            }
            size="sm"
            className="px-3"
          >
            {isSending || isUploadingFiles ? (
              <Loading size="sm" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Upload Status */}
        {isUploadingFiles && (
          <div className="text-muted-foreground py-1 text-center text-xs">
            Dosyalar yükleniyor...
          </div>
        )}
      </div>
    </Card>
  );
}
