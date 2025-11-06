/**
 * Conversation Page - Real-time Messaging
 *
 * Full-featured messaging interface with:
 * - Real-time message delivery via WebSocket
 * - Typing indicators
 * - Message history with infinite scroll
 * - File attachments
 * - Message status (sent/delivered/read)
 *
 * @sprint Sprint 5 - Real-time Messaging
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStompWebSocket } from '@/hooks/infrastructure/websocket';
import { useReadReceipts } from '@/hooks/business/messaging';
import { AppLayout } from '@/components/layout';
import { Loading } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/shared/useAuth';
import { useToast } from '@/hooks';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  getConversationById,
  getMessages,
  sendMessage,
} from '@/lib/api/messaging';
import {
  Message,
  Conversation,
  WebSocketMessageEvent,
  WebSocketTypingEvent,
  MessageStatus,
  MessageType,
} from '@/types/message';
import {
  Send,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
} from 'lucide-react';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { error: showErrorToast } = useToast();
  const conversationId = params?.id as string;

  // State
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection
  const {
    isConnected,
    subscribe,
    unsubscribe,
    send: wsSend,
  } = useStompWebSocket({
    autoConnect: true,
    onConnect: () => {
      logger.info('ConversationPage', 'WebSocket connected');
    },
  });

  // Read Receipts - Real-time read status updates
  const { markAsRead: _markAsRead, markAllAsRead } = useReadReceipts({
    conversationId: conversationId || '',
    onMessageRead: (event) => {
      logger.debug('ConversationPage', { messageIdeventmessageId, readByeventreadByName, readAteventreadAt,  });
    },
  });

  // Load conversation and messages
  useEffect(() => {
    if (!conversationId || !isAuthenticated) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load conversation details
        const convData = await getConversationById(conversationId);
        setConversation(convData);

        // Load messages
        const messagesData = await getMessages(conversationId, 0, 50);
        setMessages(messagesData.content.reverse()); // Reverse to show oldest first

        // Mark all messages as read (bulk operation)
        await markAllAsRead();

        logger.info('ConversationPage', { conversationId, messageCountmessagesDatacontentlength,  });
      } catch (error) {
        logger.error('ConversationPage: Failed to load data', undefined, { error });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [conversationId, isAuthenticated, markAllAsRead]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!isConnected || !conversationId || !user) return;

    logger.info('ConversationPage', { conversationId, userIduserid,  });

    // Subscribe to new messages for this user
    const messageDestination = subscribe(
      `/topic/user/${user.id}/messages`,
      (message: unknown) => {
        const event = message as WebSocketMessageEvent;
        logger.info('ConversationPage', { event });

        if (event.conversationId === conversationId) {
          if (event.type === 'NEW_MESSAGE') {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === event.message.id)) {
                return prev;
              }
              return [...prev, event.message];
            });

            // Mark as read if not from current user
            if (event.message.senderId !== user.id) {
              markAllAsRead().catch((err) =>
                logger.error('ConversationPage: Failed to mark as read', undefined, {
                  error: err,
                })
              );
            }
          } else if (event.type === 'MESSAGE_UPDATE') {
            setMessages((prev) =>
              prev.map((m) => (m.id === event.message.id ? event.message : m))
            );
          } else if (event.type === 'MESSAGE_DELETE') {
            setMessages((prev) =>
              prev.filter((m) => m.id !== event.message.id)
            );
          }
        }
      }
    );

    // Subscribe to typing indicators
    const typingDestination = subscribe(
      `/topic/conversation/${conversationId}/typing`,
      (message: unknown) => {
        const event = message as WebSocketTypingEvent;
        logger.debug('ConversationPage', { event });

        // Ignore own typing events
        if (event.userId === user.id) return;

        if (event.type === 'TYPING_START') {
          setIsTyping(true);
          setTypingUser(event.userName);
        } else if (event.type === 'TYPING_STOP') {
          setIsTyping(false);
          setTypingUser(null);
        }
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribe(messageDestination);
      unsubscribe(typingDestination);
    };
  }, [
    isConnected,
    conversationId,
    user,
    subscribe,
    unsubscribe,
    markAllAsRead,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);

      if (!isConnected || !conversationId) return;

      // Send typing start
      wsSend(`/app/conversation/${conversationId}/typing/start`, {
        userId: user?.id,
        userName: user?.name || 'User',
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        wsSend(`/app/conversation/${conversationId}/typing/stop`, {
          userId: user?.id,
          userName: user?.name || 'User',
        });
      }, 2000);
    },
    [isConnected, conversationId, user, wsSend]
  );

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !conversationId) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isConnected) {
      wsSend(`/app/conversation/${conversationId}/typing/stop`, {
        userId: user?.id,
        userName: user?.name || 'User',
      });
    }

    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        conversationId,
        senderId: user?.id || '',
        senderName: user?.name || '',
        recipientId: conversation?.participantId || '',
        recipientName: conversation?.participantName || '',
        content: messageText,
        type: MessageType.TEXT,
        status: MessageStatus.SENDING,
        isRead: false,
        isEdited: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Send to backend
      const { message } = await sendMessage({
        conversationId,
        content: messageText,
        type: MessageType.TEXT,
      });

      // Replace optimistic message with real one
      setMessages((prev) => prev.map((m) => (m.id === tempId ? message : m)));

      logger.info('ConversationPage', { messageIdmessageid,  });
    } catch (error) {
      logger.error('ConversationPage: Failed to send message', undefined, { error });

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));

      // Show error toast
      showErrorToast(
        'Mesaj gönderilemedi',
        'Lütfen tekrar deneyin veya internet bağlantınızı kontrol edin.'
      );
    } finally {
      setSending(false);
    }
  }, [
    inputText,
    isSending,
    conversationId,
    conversation,
    user,
    isConnected,
    wsSend,
    showErrorToast,
  ]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get message status icon
  const getStatusIcon = (message: Message) => {
    if (message.senderId !== user?.id) return null;

    switch (message.status) {
      case MessageStatus.SENDING:
        return (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        );
      case MessageStatus.SENT:
        return <Check className="h-4 w-4 text-gray-400" />;
      case MessageStatus.DELIVERED:
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case MessageStatus.READ:
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" text="Konuşma yükleniyor..." />
        </div>
      </AppLayout>
    );
  }

  // Not found
  if (!conversation) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              Konuşma Bulunamadı
            </h2>
            <p className="mt-2 text-gray-600">
              Bu konuşmaya erişim yetkiniz yok veya konuşma mevcut değil.
            </p>
            <Button onClick={() => router.push('/messages')} className="mt-4">
              Mesajlara Dön
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="flex h-screen flex-col bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/messages')}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                  {conversation.participantOnline && (
                    <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    {conversation.participantName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {conversation.participantOnline
                      ? 'Çevrimiçi'
                      : conversation.lastSeenAt
                        ? `Son görülme: ${formatTime(conversation.lastSeenAt)}`
                        : 'Çevrimdışı'}
                  </p>
                </div>
              </div>
            </div>

            <button className="rounded-lg p-2 hover:bg-gray-100">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <div
                      className={`mt-1 flex items-center gap-1 text-xs ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {getStatusIcon(message)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && typingUser && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl bg-gray-200 px-4 py-2">
                  <p className="text-sm text-gray-600 italic">
                    {typingUser} yazıyor...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </button>

            <Input
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Mesajınızı yazın..."
              className="flex-1"
              disabled={isSending}
            />

            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              className="rounded-lg px-4 py-2"
            >
              {isSending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Connection status */}
          {!isConnected && (
            <div className="mt-2 text-center text-xs text-amber-600">
              ⚠️ Bağlantı kuruluyor... Gerçek zamanlı mesajlar gecikmeli
              gelebilir.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
