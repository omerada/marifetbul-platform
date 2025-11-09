/**
 * ============================================================================
 * USE DISPUTE MESSAGES HOOK - Real-time Messaging Management
 * ============================================================================
 * React hook for managing dispute messages with WebSocket support
 *
 * Features:
 * - Real-time message updates via WebSocket
 * - Send & receive messages
 * - Typing indicators
 * - Read receipts
 * - Message history pagination
 * - File attachment support
 * - Optimistic UI updates
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 5
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  disputeMessagesApi,
  MessageSenderType,
  MessageStatus,
  type DisputeMessage,
  type SendMessageRequest,
  type TypingIndicator,
} from '@/lib/api/dispute-messages';
import { useWebSocket } from '@/hooks/infrastructure/websocket';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UseDisputeMessagesReturn {
  // State
  messages: DisputeMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  unreadCount: number;
  typingUsers: string[];

  // Actions
  sendMessage: (request: SendMessageRequest) => Promise<boolean>;
  loadMessages: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;

  // Computed
  totalMessages: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * React hook for dispute messaging
 *
 * @param disputeId - Dispute ID
 * @param autoConnect - Auto-connect to WebSocket (default: true)
 * @param pageSize - Number of messages per page (default: 50)
 *
 * @example
 * ```tsx
 * function DisputeChat({ disputeId }) {
 *   const {
 *     messages,
 *     sendMessage,
 *     isLoading,
 *     typingUsers
 *   } = useDisputeMessages(disputeId);
 *
 *   return (
 *     <div>
 *       {messages.map(msg => <Message key={msg.id} {...msg} />)}
 *       {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDisputeMessages(
  disputeId: string,
  autoConnect: boolean = true,
  pageSize: number = 50
): UseDisputeMessagesReturn {
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingRef = useRef<boolean>(false);

  // WebSocket connection
  const { isConnected, subscribe, unsubscribe, send } = useWebSocket({
    autoConnect,
  });

  // ============================================================================
  // LOAD MESSAGES
  // ============================================================================

  const loadMessages = useCallback(
    async (reset: boolean = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const page = reset ? 0 : currentPage;

        logger.debug('useDisputeMessages.loadMessages: Loading', {
          disputeId,
          page,
          pageSize,
          reset,
        });

        const response = await disputeMessagesApi.getDisputeMessages(
          disputeId,
          page,
          pageSize
        );

        if (reset) {
          setMessages(response.messages);
          setCurrentPage(0);
        } else {
          setMessages((prev) => [...prev, ...response.messages]);
        }

        setHasMore(response.hasMore);

        logger.info('useDisputeMessages.loadMessages: Success', {
          disputeId,
          count: response.messages.length,
          total: response.total,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load messages';

        logger.error('useDisputeMessages.loadMessages: Failed', err as Error);

        setError(errorMessage);

        toast.error('Mesajlar yüklenemedi', {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [disputeId, currentPage, pageSize]
  );

  // ============================================================================
  // LOAD MORE
  // ============================================================================

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setCurrentPage((prev) => prev + 1);
    await loadMessages(false);
  }, [hasMore, isLoading, loadMessages]);

  // ============================================================================
  // SEND MESSAGE
  // ============================================================================

  const sendMessage = useCallback(
    async (request: SendMessageRequest): Promise<boolean> => {
      try {
        setIsSending(true);
        setError(null);

        logger.debug('useDisputeMessages.sendMessage: Sending', {
          disputeId,
          hasAttachment: !!request.attachmentUrl,
        });

        // Optimistic update
        const tempMessage: DisputeMessage = {
          id: `temp-${Date.now()}`,
          disputeId,
          senderId: 'current-user',
          senderName: 'Sen',
          senderType: MessageSenderType.BUYER,
          content: request.content,
          attachmentUrl: request.attachmentUrl,
          attachmentName: request.attachmentName,
          attachmentType: request.attachmentType,
          status: MessageStatus.SENT,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [tempMessage, ...prev]);

        // Send to server
        const message = await disputeMessagesApi.sendDisputeMessage(
          disputeId,
          request
        );

        // Replace temp message with real message
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? message : msg))
        );

        // Stop typing indicator
        if (lastTypingRef.current) {
          sendTypingIndicator(false);
        }

        logger.info('useDisputeMessages.sendMessage: Success', {
          disputeId,
          messageId: message.id,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';

        logger.error('useDisputeMessages.sendMessage: Failed', err as Error);

        setError(errorMessage);

        // Remove optimistic message
        setMessages((prev) =>
          prev.filter((msg) => !msg.id.startsWith('temp-'))
        );

        toast.error('Mesaj gönderilemedi', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsSending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disputeId]
  );

  // ============================================================================
  // MARK AS READ
  // ============================================================================

  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        logger.debug('useDisputeMessages.markAsRead', {
          disputeId,
          messageId,
        });

        await disputeMessagesApi.markMessageAsRead(disputeId, messageId);

        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  status: MessageStatus.READ,
                  readAt: new Date().toISOString(),
                }
              : msg
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));

        logger.info('useDisputeMessages.markAsRead: Success', {
          disputeId,
          messageId,
        });
      } catch (err) {
        logger.error('useDisputeMessages.markAsRead: Failed', err as Error);
      }
    },
    [disputeId]
  );

  // ============================================================================
  // MARK ALL AS READ
  // ============================================================================

  const markAllAsRead = useCallback(async () => {
    try {
      logger.debug('useDisputeMessages.markAllAsRead', { disputeId });

      await disputeMessagesApi.markAllMessagesAsRead(disputeId);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          status: MessageStatus.READ,
          readAt: msg.readAt || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);

      logger.info('useDisputeMessages.markAllAsRead: Success', { disputeId });
    } catch (err) {
      logger.error('useDisputeMessages.markAllAsRead: Failed', err as Error);
    }
  }, [disputeId]);

  // ============================================================================
  // TYPING INDICATOR
  // ============================================================================

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!isConnected) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Only send if state changed
      if (lastTypingRef.current === isTyping) return;

      lastTypingRef.current = isTyping;

      try {
        const destination = disputeMessagesApi.getTypingDestination(disputeId);

        send(destination, { isTyping });

        logger.debug('useDisputeMessages.sendTypingIndicator', {
          disputeId,
          isTyping,
        });

        // Auto-stop typing after 3 seconds
        if (isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
          }, 3000);
        }
      } catch (err) {
        logger.error(
          'useDisputeMessages.sendTypingIndicator: Failed',
          err as Error
        );
      }
    },
    [isConnected, disputeId, send]
  );

  // ============================================================================
  // WEBSOCKET SUBSCRIPTIONS
  // ============================================================================

  useEffect(() => {
    if (!isConnected || !disputeId) return;

    // Subscribe to new messages
    const messagesTopic = disputeMessagesApi.getDisputeMessagesTopic(disputeId);
    const messagesSubId = subscribe(messagesTopic, (payload) => {
      try {
        const message = payload as DisputeMessage;

        logger.debug('useDisputeMessages: Received message', {
          disputeId,
          messageId: message.id,
        });

        // Add new message to top
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((msg) => msg.id === message.id)) {
            return prev;
          }
          return [message, ...prev];
        });

        // Increment unread count if not from current user
        if (message.senderId !== 'current-user') {
          setUnreadCount((prev) => prev + 1);

          // Show notification
          toast.info(
            `${message.senderName}: ${message.content.substring(0, 50)}...`
          );
        }
      } catch (err) {
        logger.error(
          'useDisputeMessages: Failed to process message',
          err as Error
        );
      }
    });

    // Subscribe to typing indicators
    const typingTopic = disputeMessagesApi.getTypingTopic(disputeId);
    const typingSubId = subscribe(typingTopic, (payload) => {
      try {
        const typing = payload as TypingIndicator;

        logger.debug('useDisputeMessages: Received typing indicator', {
          disputeId,
          userId: typing.userId,
          isTyping: typing.isTyping,
        });

        setTypingUsers((prev) => {
          if (typing.isTyping) {
            // Add user if not already in list
            if (!prev.includes(typing.userName)) {
              return [...prev, typing.userName];
            }
            return prev;
          } else {
            // Remove user
            return prev.filter((name) => name !== typing.userName);
          }
        });

        // Auto-remove after 5 seconds
        if (typing.isTyping) {
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((name) => name !== typing.userName)
            );
          }, 5000);
        }
      } catch (err) {
        logger.error(
          'useDisputeMessages: Failed to process typing indicator',
          err as Error
        );
      }
    });

    logger.info('useDisputeMessages: WebSocket subscriptions active', {
      disputeId,
      messagesSubId,
      typingSubId,
    });

    // Cleanup
    return () => {
      unsubscribe(messagesTopic);
      unsubscribe(typingTopic);

      logger.info('useDisputeMessages: WebSocket subscriptions cleaned up', {
        disputeId,
      });
    };
  }, [isConnected, disputeId, subscribe, unsubscribe]);

  // ============================================================================
  // LOAD INITIAL MESSAGES & UNREAD COUNT
  // ============================================================================

  useEffect(() => {
    if (!disputeId) return;

    loadMessages(true);

    // Load unread count
    disputeMessagesApi
      .getUnreadCount(disputeId)
      .then(setUnreadCount)
      .catch((err) => {
        logger.error('useDisputeMessages: Failed to load unread count', err);
      });
  }, [disputeId, loadMessages]);

  // ============================================================================
  // CLEANUP TYPING TIMEOUT
  // ============================================================================

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const totalMessages = messages.length;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    messages,
    isLoading,
    isSending,
    error,
    hasMore,
    unreadCount,
    typingUsers,

    // Actions
    sendMessage,
    loadMessages,
    loadMore,
    markAsRead,
    markAllAsRead,
    sendTypingIndicator,

    // Computed
    totalMessages,
  };
}
