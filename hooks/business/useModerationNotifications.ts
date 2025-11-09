'use client';

/**
 * ================================================
 * MODERATION NOTIFICATIONS HOOK
 * ================================================
 * Real-time WebSocket notifications for comment moderation
 * Handles NEW_COMMENT, COMMENT_APPROVED, COMMENT_REJECTED events
 *
 * Features:
 * - Real-time comment notifications via WebSocket
 * - Auto-refresh moderation queue on new comments
 * - Toast notifications for moderation events
 * - Callback support for custom handling
 * - Type-safe event handlers
 *
 * Sprint 2 - Day 3 Story 3.1
 * @author MarifetBul Development Team
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/infrastructure/websocket';
import { useToast } from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

/**
 * Moderation event types from backend
 */
export type ModerationEventType =
  | 'COMMENT_APPROVED' // Comment approved by moderator
  | 'COMMENT_REJECTED' // Comment rejected by moderator
  | 'COMMENT_FLAGGED' // Comment flagged by user
  | 'NEW_COMMENT' // New comment submitted
  | 'COMMENT_SPAM' // Comment marked as spam
  | 'BULK_MODERATION'; // Bulk moderation action

/**
 * Comment event payload
 */
export interface CommentEventPayload {
  commentId: number;
  postId?: number;
  postTitle?: string;
  authorName?: string;
  content?: string;
  moderatorName?: string;
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  timestamp: string;
}

/**
 * Bulk moderation event payload
 */
export interface BulkModerationEventPayload {
  commentIds: number[];
  action: 'APPROVE' | 'REJECT' | 'SPAM';
  moderatorName?: string;
  count: number;
  timestamp: string;
}

/**
 * WebSocket message format for moderation events
 */
export interface ModerationWebSocketMessage {
  type: ModerationEventType;
  data: CommentEventPayload | BulkModerationEventPayload;
  userId?: string;
  timestamp: string;
}

/**
 * Callback handlers for different event types
 */
export interface ModerationEventHandlers {
  onNewComment?: (payload: CommentEventPayload) => void;
  onCommentApproved?: (payload: CommentEventPayload) => void;
  onCommentRejected?: (payload: CommentEventPayload) => void;
  onCommentFlagged?: (payload: CommentEventPayload) => void;
  onCommentSpam?: (payload: CommentEventPayload) => void;
  onBulkModeration?: (payload: BulkModerationEventPayload) => void;
}

/**
 * Hook options
 */
export interface UseModerationNotificationsOptions {
  /** Enable WebSocket connection (default: true) */
  enabled?: boolean;
  /** Show toast notifications (default: true) */
  showToasts?: boolean;
  /** Auto-refresh callback when new events arrive */
  onRefreshNeeded?: () => void;
  /** Custom event handlers */
  handlers?: ModerationEventHandlers;
  /** Enable sound notifications (default: false) */
  enableSound?: boolean;
}

/**
 * Hook return type
 */
export interface UseModerationNotificationsReturn {
  /** Is WebSocket connected */
  isConnected: boolean;
  /** Manually refresh */
  refresh: () => void;
  /** Last event received */
  lastEvent: ModerationWebSocketMessage | null;
}

// ==================== HOOK ====================

/**
 * useModerationNotifications Hook
 *
 * Subscribe to real-time moderation events via WebSocket
 *
 * @example
 * ```tsx
 * const { isConnected, lastEvent } = useModerationNotifications({
 *   showToasts: true,
 *   onRefreshNeeded: () => refetchComments(),
 *   handlers: {
 *     onNewComment: (payload) => {
 *       logger.debug('New comment received:', payload);
 *     },
 *   },
 * });
 * ```
 */
export function useModerationNotifications(
  options: UseModerationNotificationsOptions = {}
): UseModerationNotificationsReturn {
  const {
    enabled = true,
    showToasts = true,
    onRefreshNeeded,
    handlers = {},
    enableSound = false,
  } = options;

  const { info, success, warning, error: errorToast } = useToast();
  const lastEventRef = useRef<ModerationWebSocketMessage | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize WebSocket connection
  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    autoConnect: enabled,
    enableStoreIntegration: true,
    onConnect: () => {
      logger.info('useModerationNotifications', 'WebSocket connected');
    },
    onDisconnect: () => {
      logger.info('useModerationNotifications', 'WebSocket disconnected');
    },
    onError: (error) => {
      logger.error('useModerationNotifications: WebSocket error', undefined, { error });
    },
  });

  // ==================== AUDIO SETUP ====================

  useEffect(() => {
    if (enableSound && typeof window !== 'undefined') {
      soundRef.current = new Audio('/sounds/notification.mp3');
      soundRef.current.volume = 0.5;
    }

    return () => {
      if (soundRef.current) {
        soundRef.current = null;
      }
    };
  }, [enableSound]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Play notification sound
   */
  const playSound = useCallback(() => {
    if (soundRef.current && enableSound) {
      soundRef.current.play().catch((err) => {
        logger.debug('useModerationNotifications', { errorerr,  });
      });
    }
  }, [enableSound]);

  /**
   * Handle new comment event
   */
  const handleNewComment = useCallback(
    (payload: CommentEventPayload) => {
      logger.info('useModerationNotifications', { commentIdpayloadcommentId, postTitlepayloadpostTitle,  });

      // Custom handler
      handlers.onNewComment?.(payload);

      // Show toast
      if (showToasts) {
        info(
          'Yeni Yorum',
          `${payload.authorName || 'Bilinmeyen'} yeni yorum gönderdi: "${payload.postTitle}"`,
          payload.postId
            ? {
                action: {
                  label: 'İncele',
                  onClick: () => {
                    // Will be handled by parent component
                  },
                },
              }
            : undefined
        );
      }

      // Play sound
      playSound();

      // Trigger refresh
      onRefreshNeeded?.();
    },
    [handlers, showToasts, info, playSound, onRefreshNeeded]
  );

  /**
   * Handle comment approved event
   */
  const handleCommentApproved = useCallback(
    (payload: CommentEventPayload) => {
      logger.info('useModerationNotifications', { commentIdpayloadcommentId, moderatorpayloadmoderatorName,  });

      // Custom handler
      handlers.onCommentApproved?.(payload);

      // Show toast
      if (showToasts) {
        success(
          'Yorum Onaylandı',
          `${payload.moderatorName || 'Moderatör'} bir yorumu onayladı`
        );
      }

      // Trigger refresh
      onRefreshNeeded?.();
    },
    [handlers, showToasts, success, onRefreshNeeded]
  );

  /**
   * Handle comment rejected event
   */
  const handleCommentRejected = useCallback(
    (payload: CommentEventPayload) => {
      logger.info('useModerationNotifications', { commentIdpayloadcommentId, moderatorpayloadmoderatorName, reasonpayloadreason,  });

      // Custom handler
      handlers.onCommentRejected?.(payload);

      // Show toast
      if (showToasts) {
        warning(
          'Yorum Reddedildi',
          `${payload.moderatorName || 'Moderatör'} bir yorumu reddetti${payload.reason ? `: ${payload.reason}` : ''}`
        );
      }

      // Trigger refresh
      onRefreshNeeded?.();
    },
    [handlers, showToasts, warning, onRefreshNeeded]
  );

  /**
   * Handle comment flagged event
   */
  const handleCommentFlagged = useCallback(
    (payload: CommentEventPayload) => {
      logger.info('useModerationNotifications', { commentIdpayloadcommentId,  });

      // Custom handler
      handlers.onCommentFlagged?.(payload);

      // Show toast with urgency
      if (showToasts) {
        errorToast(
          'Yorum Bildirildi',
          'Bir yorum kullanıcı tarafından bildirildi. Acil inceleme gerekiyor.',
          {
            duration: 10000, // Longer duration for flagged content
          }
        );
      }

      // Play sound for flagged content
      playSound();

      // Trigger refresh
      onRefreshNeeded?.();
    },
    [handlers, showToasts, errorToast, playSound, onRefreshNeeded]
  );

  /**
   * Handle comment marked as spam event
   */
  const handleCommentSpam = useCallback(
    (payload: CommentEventPayload) => {
      logger.info('useModerationNotifications', { commentIdpayloadcommentId, moderatorpayloadmoderatorName,  });

      // Custom handler
      handlers.onCommentSpam?.(payload);

      // Show toast
      if (showToasts) {
        warning(
          'Spam İşaretlendi',
          `${payload.moderatorName || 'Moderatör'} bir yorumu spam olarak işaretledi`
        );
      }

      // Trigger refresh
      onRefreshNeeded?.();
    },
    [handlers, showToasts, warning, onRefreshNeeded]
  );

  /**
   * Handle bulk moderation event
   */
  const handleBulkModeration = useCallback(
    (payload: BulkModerationEventPayload) => {
      logger.info('useModerationNotifications', { countpayloadcount, actionpayloadaction, moderatorpayloadmoderatorName,  });

      // Custom handler
      handlers.onBulkModeration?.(payload);

      // Show toast
      if (showToasts) {
        const actionText =
          payload.action === 'APPROVE'
            ? 'onaylandı'
            : payload.action === 'REJECT'
              ? 'reddedildi'
              : 'spam olarak işaretlendi';

        info(
          'Toplu İşlem',
          `${payload.count} yorum ${actionText} (${payload.moderatorName || 'Moderatör'})`
        );
      }

      // Trigger refresh
      onRefreshNeeded?.();
    },
    [handlers, showToasts, info, onRefreshNeeded]
  );

  /**
   * Main message handler - routes to specific handlers
   */
  const handleModerationMessage = useCallback(
    (message: unknown) => {
      try {
        const wsMessage = message as ModerationWebSocketMessage;

        // Store last event
        lastEventRef.current = wsMessage;

        // Route to specific handler based on event type
        switch (wsMessage.type) {
          case 'NEW_COMMENT':
            handleNewComment(wsMessage.data as CommentEventPayload);
            break;

          case 'COMMENT_APPROVED':
            handleCommentApproved(wsMessage.data as CommentEventPayload);
            break;

          case 'COMMENT_REJECTED':
            handleCommentRejected(wsMessage.data as CommentEventPayload);
            break;

          case 'COMMENT_FLAGGED':
            handleCommentFlagged(wsMessage.data as CommentEventPayload);
            break;

          case 'COMMENT_SPAM':
            handleCommentSpam(wsMessage.data as CommentEventPayload);
            break;

          case 'BULK_MODERATION':
            handleBulkModeration(wsMessage.data as BulkModerationEventPayload);
            break;

          default:
            logger.debug('useModerationNotifications', { wsMessage });
        }
      } catch (error) {
        logger.error('useModerationNotifications: Failed to handle message', undefined, {
          error,
          message,
        });
      }
    },
    [
      handleNewComment,
      handleCommentApproved,
      handleCommentRejected,
      handleCommentFlagged,
      handleCommentSpam,
      handleBulkModeration,
    ]
  );

  // ==================== WEBSOCKET SUBSCRIPTIONS ====================

  useEffect(() => {
    if (!enabled || !isConnected) return;

    logger.info(
      'useModerationNotifications',
      'Subscribing to moderation events'
    );

    // Subscribe to moderation topic
    // Backend sends to: /topic/moderation or /user/queue/moderation
    subscribe('/topic/moderation', handleModerationMessage);

    return () => {
      logger.info(
        'useModerationNotifications',
        'Unsubscribing from moderation events'
      );
      unsubscribe('/topic/moderation');
    };
  }, [enabled, isConnected, subscribe, unsubscribe, handleModerationMessage]);

  // ==================== MANUAL REFRESH ====================

  const refresh = useCallback(() => {
    logger.debug('useModerationNotifications', 'Manual refresh triggered');
    onRefreshNeeded?.();
  }, [onRefreshNeeded]);

  // ==================== RETURN ====================

  return {
    isConnected,
    refresh,
    lastEvent: lastEventRef.current,
  };
}

export default useModerationNotifications;
