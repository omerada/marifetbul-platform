/**
 * useReadReceipts Hook
 *
 * Manages real-time read receipt updates via WebSocket.
 * Subscribes to /topic/conversation/{conversationId}/read-receipt
 * and updates message read status in real-time.
 *
 * Backend Event Format (ReadReceiptEvent):
 * {
 *   conversationId: string;
 *   messageId: string;
 *   readBy: string;        // User ID who read the message
 *   readByName: string;    // User display name
 *   readAt: string;        // ISO timestamp
 * }
 *
 * Features:
 * - Real-time read receipt updates
 * - Automatic store synchronization
 * - Manual mark-as-read API calls
 * - Bulk mark-as-read for conversations
 *
 * @sprint Sprint 1 - Story 1.4: Read Receipts Enhancement
 * @author MarifetBul Development Team
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/infrastructure/websocket';
import { useMessagingStore } from '@/lib/core/store/domains/messaging/MessagingStore';
import { markMessageAsRead, markConversationAsRead } from '@/lib/api/messaging';
import { logger } from '@/lib/shared/utils/logger';

// ==================== TYPES ====================

/**
 * Read Receipt Event from backend WebSocket
 */
export interface ReadReceiptEvent {
  conversationId: string;
  messageId: string;
  readBy: string;
  readByName: string;
  readAt: string; // ISO timestamp
}

export interface UseReadReceiptsOptions {
  /** Conversation ID to subscribe to */
  conversationId: string;
  /** Enable automatic subscription (default: true) */
  autoSubscribe?: boolean;
  /** Callback when message is marked as read */
  onMessageRead?: (event: ReadReceiptEvent) => void;
}

export interface UseReadReceiptsReturn {
  /** Mark a message as read */
  markAsRead: (messageId: string) => Promise<void>;
  /** Mark all messages in conversation as read */
  markAllAsRead: () => Promise<void>;
  /** Is marking in progress */
  isMarking: boolean;
}

// ==================== HOOK ====================

/**
 * useReadReceipts Hook
 *
 * @example
 * ```tsx
 * const { markAsRead, markAllAsRead } = useReadReceipts({
 *   conversationId: 'conv-123',
 *   onMessageRead: (event) => {
 *     console.log('Message read:', event.messageId);
 *   }
 * });
 *
 * // Mark single message as read
 * await markAsRead('msg-456');
 *
 * // Mark all messages as read
 * await markAllAsRead();
 * ```
 */
export function useReadReceipts(
  options: UseReadReceiptsOptions
): UseReadReceiptsReturn {
  const { conversationId, autoSubscribe = true, onMessageRead } = options;

  const messagingStore = useMessagingStore();
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  const subscriptionIdRef = useRef<string | null>(null);
  const isMarkingRef = useRef(false);

  // ==================== READ RECEIPT HANDLER ====================

  /**
   * Handle read receipt event from WebSocket
   */
  const handleReadReceipt = useCallback(
    (message: unknown) => {
      try {
        const event = message as ReadReceiptEvent;

        logger.debug('useReadReceipts', 'Read receipt received', {
          conversationId: event.conversationId,
          messageId: event.messageId,
          readBy: event.readBy,
          readAt: event.readAt,
        });

        // Update message in store
        messagingStore.updateMessage(event.messageId, {
          isRead: true,
          readAt: event.readAt,
        });

        // Callback
        onMessageRead?.(event);
      } catch (err) {
        logger.error('useReadReceipts', 'Error handling read receipt', {
          error: err,
          message,
        });
      }
    },
    [messagingStore, onMessageRead]
  );

  // ==================== SUBSCRIPTION ====================

  /**
   * Subscribe to read receipt events for conversation
   */
  useEffect(() => {
    if (!conversationId || !isConnected || !autoSubscribe) return;

    // Unsubscribe from previous conversation if exists
    if (subscriptionIdRef.current) {
      unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
    }

    // Subscribe to read receipt topic
    const destination = `/topic/conversation/${conversationId}/read-receipt`;

    logger.debug('useReadReceipts', 'Subscribing to read receipts', {
      destination,
      conversationId,
    });

    try {
      const subId = subscribe(destination, handleReadReceipt);
      subscriptionIdRef.current = subId;

      logger.info('useReadReceipts', 'Subscribed to read receipts', {
        subscriptionId: subId,
        conversationId,
      });
    } catch (err) {
      logger.error('useReadReceipts', 'Subscription failed', {
        error: err,
        conversationId,
      });
    }

    // Cleanup on unmount or conversation change
    return () => {
      if (subscriptionIdRef.current) {
        logger.debug('useReadReceipts', 'Unsubscribing from read receipts', {
          subscriptionId: subscriptionIdRef.current,
          conversationId,
        });
        unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
    };
  }, [
    conversationId,
    isConnected,
    autoSubscribe,
    subscribe,
    unsubscribe,
    handleReadReceipt,
  ]);

  // ==================== API CALLS ====================

  /**
   * Mark a single message as read
   */
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (isMarkingRef.current) {
        logger.warn('useReadReceipts', 'Mark as read already in progress');
        return;
      }

      isMarkingRef.current = true;

      try {
        logger.debug('useReadReceipts', 'Marking message as read', {
          messageId,
          conversationId,
        });

        // Call API (backend will broadcast WebSocket event)
        await markMessageAsRead(messageId);

        logger.info('useReadReceipts', 'Message marked as read', {
          messageId,
        });
      } catch (err) {
        logger.error('useReadReceipts', 'Failed to mark message as read', {
          error: err,
          messageId,
        });
        throw err;
      } finally {
        isMarkingRef.current = false;
      }
    },
    [conversationId]
  );

  /**
   * Mark all messages in conversation as read (bulk operation)
   */
  const markAllAsRead = useCallback(async () => {
    if (isMarkingRef.current) {
      logger.warn('useReadReceipts', 'Mark all as read already in progress');
      return;
    }

    isMarkingRef.current = true;

    try {
      logger.debug('useReadReceipts', 'Marking all messages as read', {
        conversationId,
      });

      // Call API (backend will broadcast WebSocket events for each message)
      const result = await markConversationAsRead(conversationId);

      logger.info('useReadReceipts', 'All messages marked as read', {
        conversationId,
        count: result.count || 0,
      });
    } catch (err) {
      logger.error('useReadReceipts', 'Failed to mark all messages as read', {
        error: err,
        conversationId,
      });
      throw err;
    } finally {
      isMarkingRef.current = false;
    }
  }, [conversationId]);

  // ==================== RETURN ====================

  return {
    markAsRead,
    markAllAsRead,
    isMarking: isMarkingRef.current,
  };
}
