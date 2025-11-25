/**
 * useConversation Hook
 *
 * Real-time conversation management with WebSocket integration.
 * Provides message history, real-time updates, typing indicators,
 * read receipts, and file sharing.
 *
 * Features:
 * - Real-time message delivery via WebSocket
 * - Optimistic UI updates
 * - Typing indicators
 * - Read receipts
 * - Message pagination (infinite scroll)
 * - File upload support
 * - Auto-reconnection handling
 * - Message status tracking
 *
 * @sprint Sprint 3 - Messaging & Notifications
 * @author MarifetBul Development Team
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';
import type {
  Message,
  Conversation,
  SendMessageResponse,
  TypingIndicator,
} from '@/types/message';
import { MessageStatus, MessageType } from '@/types/message';
import type { PaginationMeta } from '@/types';
import { getWebSocketService } from '@/lib/infrastructure/websocket/WebSocketService';
import { fileUploadService } from '@/lib/services';
import { useToast } from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

export interface UseConversationOptions {
  /** Conversation ID (if existing conversation) */
  conversationId?: string;
  /** Participant ID (if starting new conversation) */
  participantId?: string;
  /** Auto-fetch messages on mount */
  autoLoad?: boolean;
  /** Page size for message pagination */
  pageSize?: number;
  /** Enable typing indicators */
  enableTyping?: boolean;
  /** Enable read receipts */
  enableReadReceipts?: boolean;
  /** Enable WebSocket real-time updates */
  enableRealtime?: boolean;
}

export interface ConversationState {
  /** Current conversation */
  conversation: Conversation | null;
  /** Message list (newest last) */
  messages: Message[];
  /** Typing users in this conversation */
  typingUsers: TypingIndicator[];
  /** Loading state */
  isLoading: boolean;
  /** Loading more messages */
  isLoadingMore: boolean;
  /** Has more messages to load */
  hasMore: boolean;
  /** Error state */
  error: string | null;
  /** Pagination metadata */
  pagination: PaginationMeta | null;
}

export interface ConversationActions {
  /** Send a text message */
  sendMessage: (content: string) => Promise<Message | null>;
  /** Send a message with attachments */
  sendMessageWithFiles: (
    content: string,
    files: File[]
  ) => Promise<Message | null>;
  /** Load more messages (pagination) */
  loadMoreMessages: () => Promise<void>;
  /** Mark messages as read */
  markAsRead: () => Promise<void>;
  /** Send typing indicator */
  setTyping: (isTyping: boolean) => void;
  /** Delete a message */
  deleteMessage: (messageId: string) => Promise<void>;
  /** Refresh conversation data */
  refresh: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

export type UseConversationReturn = ConversationState & {
  actions: ConversationActions;
};

// ==================== CACHE KEYS ====================

const CONVERSATION_CACHE_KEY = (conversationId: string) =>
  `/api/conversations/${conversationId}`;

const MESSAGES_CACHE_KEY = (conversationId: string, page: number) =>
  `/api/conversations/${conversationId}/messages?page=${page}`;

// ==================== HOOK ====================

export function useConversation(
  options: UseConversationOptions = {}
): UseConversationReturn {
  const {
    conversationId: initialConversationId,
    participantId,
    autoLoad = true,
    pageSize = 50,
    enableTyping = true,
    enableReadReceipts = true,
    enableRealtime = true,
  } = options;

  const toast = useToast();

  // ==================== STATE ====================

  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsSubscriptionsRef = useRef<Array<() => void>>([]);

  // ==================== DATA FETCHING ====================

  // Fetch conversation
  const {
    data: conversation,
    error: conversationError,
    isLoading: isLoadingConversation,
  } = useSWR<Conversation>(
    conversationId && autoLoad ? CONVERSATION_CACHE_KEY(conversationId) : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      const data = await response.json();
      return data.conversation || data;
    }
  );

  // Fetch initial messages
  const {
    data: messagesData,
    error: messagesError,
    isLoading: isLoadingMessages,
  } = useSWR<{ messages: Message[]; pagination: PaginationMeta }>(
    conversationId && autoLoad
      ? MESSAGES_CACHE_KEY(conversationId, currentPage)
      : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    }
  );

  // Update messages when data changes
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.messages || []);
      setPagination(messagesData.pagination);
      setHasMore(messagesData.pagination?.hasNext ?? false);
    }
  }, [messagesData]);

  // Update error state
  useEffect(() => {
    if (conversationError || messagesError) {
      const errorMsg =
        conversationError?.message || messagesError?.message || 'Unknown error';
      setError(errorMsg);
      logger.error(
        'useConversation: Data fetch error',
        conversationError as Error
      );
    }
  }, [conversationError, messagesError]);

  // ==================== MARK AS READ INTERNAL ====================

  /**
   * Mark messages as read (internal)
   */
  const markAsReadInternal = useCallback(
    async (messageIds: string[]) => {
      if (!conversationId || messageIds.length === 0) return;

      try {
        await fetch(`/api/conversations/${conversationId}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds }),
        });

        setMessages((prev) =>
          prev.map((m) =>
            messageIds.includes(m.id)
              ? { ...m, isRead: true, status: MessageStatus.READ }
              : m
          )
        );
      } catch (err) {
        logger.error('useConversation: Failed to mark as read', err as Error);
      }
    },
    [conversationId]
  );

  // ==================== WEBSOCKET SETUP ====================

  useEffect(() => {
    if (!conversationId || !enableRealtime) return;

    try {
      const ws = getWebSocketService();

      if (!ws.isConnected) {
        logger.warn('useConversation: WebSocket not connected, skipping setup');
        return;
      }

      // Subscribe to conversation messages
      ws.subscribe(
        `/topic/conversation.${conversationId}`,
        (payload: unknown) => {
          const data = payload as { type: string; data: Message };

          if (data.type === 'CHAT_MESSAGE') {
            const newMessage = data.data;

            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });

            // Auto-mark as read if enabled
            if (
              enableReadReceipts &&
              newMessage.senderId !== conversation?.participantId
            ) {
              markAsReadInternal([newMessage.id]);
            }
          }
        }
      );

      // Subscribe to typing indicators
      ws.subscribe(
        `/topic/conversation.${conversationId}.typing`,
        (payload: unknown) => {
          const indicator = payload as TypingIndicator;

          setTypingUsers((prev) => {
            if (indicator.isTyping) {
              // Add or update typing indicator
              const filtered = prev.filter(
                (t) => t.userId !== indicator.userId
              );
              return [...filtered, indicator];
            } else {
              // Remove typing indicator
              return prev.filter((t) => t.userId !== indicator.userId);
            }
          });

          // Auto-clear typing after 5 seconds
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((t) => t.userId !== indicator.userId)
            );
          }, 5000);
        }
      );

      // Subscribe to read receipts
      ws.subscribe(
        `/topic/conversation.${conversationId}.read`,
        (payload: unknown) => {
          const data = payload as { messageIds: string[]; userId: string };

          setMessages((prev) =>
            prev.map((msg) =>
              data.messageIds.includes(msg.id)
                ? { ...msg, isRead: true, status: MessageStatus.READ }
                : msg
            )
          );
        }
      );

      // Create unsubscribe functions
      wsSubscriptionsRef.current = [
        () => ws.unsubscribe(`/topic/conversation.${conversationId}`),
        () => ws.unsubscribe(`/topic/conversation.${conversationId}.typing`),
        () => ws.unsubscribe(`/topic/conversation.${conversationId}.read`),
      ];

      logger.info('useConversation: WebSocket subscriptions established', {
        conversationId,
      });
    } catch (err) {
      logger.error('useConversation: WebSocket setup failed', err as Error);
    }

    // Cleanup on unmount
    return () => {
      wsSubscriptionsRef.current.forEach((unsub) => unsub());
      wsSubscriptionsRef.current = [];
    };
  }, [
    conversationId,
    enableRealtime,
    enableReadReceipts,
    conversation,
    markAsReadInternal,
  ]);

  // ==================== ACTIONS ====================

  /**
   * Send a text message
   */
  const sendMessage = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!content.trim()) {
        toast.warning('Mesaj boş olamaz');
        return null;
      }

      // Create conversation if needed
      let activeConversationId = conversationId;

      if (!activeConversationId && participantId) {
        try {
          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantId }),
          });

          if (!response.ok) throw new Error('Failed to create conversation');

          const data = await response.json();
          activeConversationId = data.conversation.id;
          setConversationId(activeConversationId);
        } catch (err) {
          logger.error(
            'useConversation: Failed to create conversation',
            err as Error
          );
          toast.error('Sohbet oluşturulamadı');
          return null;
        }
      }

      if (!activeConversationId) {
        toast.error('Sohbet kimliği bulunamadı');
        return null;
      }

      // Optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: 'me',
        senderName: 'Me',
        recipientId: participantId || '',
        recipientName: '',
        content,
        type: MessageType.TEXT,
        status: MessageStatus.SENDING,
        isRead: false,
        isEdited: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const ws = getWebSocketService();

        if (ws.isConnected()) {
          // Send via WebSocket
          ws.send('/app/chat/message', {
            conversationId: activeConversationId,
            content,
            type: MessageType.TEXT,
          });

          // Update optimistic message status
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimisticMessage.id
                ? { ...m, status: MessageStatus.SENT }
                : m
            )
          );

          return optimisticMessage;
        } else {
          // Fallback to HTTP
          const response = await fetch(
            `/api/conversations/${activeConversationId}/messages`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content, type: MessageType.TEXT }),
            }
          );

          if (!response.ok) throw new Error('Failed to send message');

          const data: SendMessageResponse = await response.json();

          // Replace optimistic message with real one
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticMessage.id ? data.message : m))
          );

          return data.message;
        }
      } catch (err) {
        logger.error('useConversation: Failed to send message', err as Error);

        // Mark as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id
              ? { ...m, status: MessageStatus.FAILED }
              : m
          )
        );

        toast.error('Mesaj gönderilemedi');
        return null;
      }
    },
    [conversationId, participantId, toast]
  );

  /**
   * Send message with file attachments
   */
  const sendMessageWithFiles = useCallback(
    async (content: string, files: File[]): Promise<Message | null> => {
      if (!conversationId) {
        toast.error('Sohbet kimliği bulunamadı');
        return null;
      }

      if (files.length === 0) {
        return sendMessage(content);
      }

      try {
        // Upload files
        const uploadPromises = files.map((file) =>
          fileUploadService.uploadFile(file, {
            onProgress: (progress: { progress: number }) => {
              logger.debug('File upload progress', { progress });
            },
          })
        );

        const uploadResults = await Promise.all(uploadPromises);

        const attachmentUrls = uploadResults.map((result) => result.fileUrl);

        // Send message via HTTP (with attachments)
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content,
              type: MessageType.FILE,
              attachments: attachmentUrls,
            }),
          }
        );

        if (!response.ok) throw new Error('Failed to send message');

        const data: SendMessageResponse = await response.json();

        // Add to messages
        setMessages((prev) => [...prev, data.message]);

        toast.success('Mesaj gönderildi');
        return data.message;
      } catch (err) {
        logger.error(
          'useConversation: Failed to send message with files',
          err as Error
        );
        toast.error('Dosyalar yüklenemedi');
        return null;
      }
    },
    [conversationId, sendMessage, toast]
  );

  /**
   * Load more messages (pagination)
   */
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?page=${nextPage}&pageSize=${pageSize}`
      );

      if (!response.ok) throw new Error('Failed to load more messages');

      const data = await response.json();

      setMessages((prev) => [...data.messages, ...prev]);
      setPagination(data.pagination);
      setHasMore(data.pagination?.hasNext ?? false);
      setCurrentPage(nextPage);

      // Update cache
      mutate(MESSAGES_CACHE_KEY(conversationId, nextPage), data, {
        revalidate: false,
      });
    } catch (err) {
      logger.error(
        'useConversation: Failed to load more messages',
        err as Error
      );
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, hasMore, isLoadingMore, currentPage, pageSize, toast]);

  /**
   * Mark all unread messages as read
   */
  const markAsRead = useCallback(async () => {
    const unreadMessageIds = messages.filter((m) => !m.isRead).map((m) => m.id);

    if (unreadMessageIds.length === 0) return;

    await markAsReadInternal(unreadMessageIds);
  }, [messages, markAsReadInternal]);

  /**
   * Send typing indicator
   */
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId || !enableTyping) return;

      try {
        const ws = getWebSocketService();

        if (!ws.isConnected) return;

        ws.send('/app/chat/typing', {
          conversationId,
          isTyping,
        });

        // Auto-stop typing after 3 seconds
        if (isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
          }, 3000);
        }
      } catch (err) {
        logger.error(
          'useConversation: Failed to send typing indicator',
          err as Error
        );
      }
    },
    [conversationId, enableTyping]
  );

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return;

      try {
        const response = await fetch(`/api/messages/${messageId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete message');

        setMessages((prev) => prev.filter((m) => m.id !== messageId));

        toast.success('Mesaj silindi');
      } catch (err) {
        logger.error('useConversation: Failed to delete message', err as Error);
        toast.error('Mesaj silinemedi');
      }
    },
    [conversationId, toast]
  );

  /**
   * Refresh conversation and messages
   */
  const refresh = useCallback(async () => {
    if (!conversationId) return;

    try {
      await Promise.all([
        mutate(CONVERSATION_CACHE_KEY(conversationId)),
        mutate(MESSAGES_CACHE_KEY(conversationId, 1)),
      ]);

      setCurrentPage(1);
      setError(null);
    } catch (err) {
      logger.error('useConversation: Refresh failed', err as Error);
    }
  }, [conversationId]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== RETURN ====================

  return {
    conversation: conversation || null,
    messages,
    typingUsers,
    isLoading: isLoadingConversation || isLoadingMessages,
    isLoadingMore,
    hasMore,
    error,
    pagination,
    actions: {
      sendMessage,
      sendMessageWithFiles,
      loadMoreMessages,
      markAsRead,
      setTyping,
      deleteMessage,
      refresh,
      clearError,
    },
  };
}

// Types are already exported inline above
