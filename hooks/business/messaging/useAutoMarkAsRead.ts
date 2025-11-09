'use client';

/**
 * useAutoMarkAsRead Hook
 *
 * Automatically marks messages as read when they enter the viewport
 * using Intersection Observer API. Includes debouncing to avoid
 * excessive API calls.
 *
 * Features:
 * - Intersection Observer for viewport detection
 * - Debouncing (aggregate multiple messages)
 * - Only marks unread messages
 * - Only marks received messages (not own messages)
 * - Batching for better performance
 *
 * @sprint Sprint 1 - Story 1.4: Read Receipts Enhancement
 * @author MarifetBul Development Team
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

export interface UseAutoMarkAsReadOptions {
  /** Callback to mark message as read */
  onMarkAsRead: (messageId: string) => Promise<void>;
  /** Current user ID (don't mark own messages) */
  currentUserId: string;
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number;
  /** Enable auto-mark (default: true) */
  enabled?: boolean;
  /** Intersection threshold (0-1, default: 0.5 = 50% visible) */
  threshold?: number;
}

export interface UseAutoMarkAsReadReturn {
  /** Ref to attach to message element */
  observeMessage: (
    element: HTMLElement | null,
    messageId: string,
    isRead: boolean,
    isOwnMessage: boolean
  ) => void;
}

// ==================== HOOK ====================

/**
 * useAutoMarkAsRead Hook
 *
 * @example
 * ```tsx
 * const { observeMessage } = useAutoMarkAsRead({
 *   onMarkAsRead: async (messageId) => {
 *     await markMessageAsRead(messageId);
 *   },
 *   currentUserId: user.id,
 * });
 *
 * return messages.map((message) => (
 *   <div
 *     ref={(el) => observeMessage(
 *       el,
 *       message.id,
 *       message.isRead,
 *       message.senderId === user.id
 *     )}
 *   >
 *     {message.content}
 *   </div>
 * ));
 * ```
 */
export function useAutoMarkAsRead(
  options: UseAutoMarkAsReadOptions
): UseAutoMarkAsReadReturn {
  const {
    onMarkAsRead,
    currentUserId: _currentUserId,
    debounceMs = 500,
    enabled = true,
    threshold = 0.5,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const pendingMarksRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observedElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  // ==================== MARK AS READ BATCH ====================

  /**
   * Execute pending mark-as-read API calls
   */
  const executePendingMarks = useCallback(async () => {
    if (pendingMarksRef.current.size === 0) return;

    const messageIds = Array.from(pendingMarksRef.current);
    pendingMarksRef.current.clear();

    logger.debug('useAutoMarkAsRead', { countmessageIdslength, messageIds,  });

    // Execute marks in parallel
    await Promise.allSettled(
      messageIds.map(async (messageId) => {
        try {
          await onMarkAsRead(messageId);
          logger.debug('useAutoMarkAsRead', { messageId,  });
        } catch (err) {
          logger.error('useAutoMarkAsRead: Failed to mark as read', undefined, {
            error: err,
            messageId,
          });
        }
      })
    );
  }, [onMarkAsRead]);

  // ==================== DEBOUNCED MARK ====================

  /**
   * Add message to pending marks and trigger debounced execution
   */
  const scheduleMarkAsRead = useCallback(
    (messageId: string) => {
      pendingMarksRef.current.add(messageId);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Schedule execution
      debounceTimerRef.current = setTimeout(() => {
        executePendingMarks();
      }, debounceMs);
    },
    [debounceMs, executePendingMarks]
  );

  // ==================== INTERSECTION OBSERVER ====================

  /**
   * Initialize Intersection Observer
   */
  useEffect(() => {
    if (!enabled) return;

    // Capture refs for cleanup
    const pendingMarks = pendingMarksRef.current;
    const observedElements = observedElementsRef.current;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            const isRead = entry.target.getAttribute('data-is-read') === 'true';
            const isOwnMessage =
              entry.target.getAttribute('data-is-own-message') === 'true';

            if (messageId && !isRead && !isOwnMessage) {
              logger.debug('useAutoMarkAsRead', { messageId, intersectionRatioentryintersectionRatio,  });

              scheduleMarkAsRead(messageId);
            }
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold,
      }
    );

    return () => {
      // Cleanup observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Clear pending timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Execute any pending marks
      if (pendingMarks.size > 0) {
        executePendingMarks();
      }

      // Clear observed elements
      observedElements.clear();
    };
  }, [enabled, threshold, scheduleMarkAsRead, executePendingMarks]);

  // ==================== OBSERVE MESSAGE ====================

  /**
   * Attach observer to message element
   */
  const observeMessage = useCallback(
    (
      element: HTMLElement | null,
      messageId: string,
      isRead: boolean,
      isOwnMessage: boolean
    ) => {
      if (!enabled || !observerRef.current) return;

      // Unobserve previous element
      const previousElement = observedElementsRef.current.get(messageId);
      if (previousElement) {
        observerRef.current.unobserve(previousElement);
        observedElementsRef.current.delete(messageId);
      }

      // Observe new element
      if (element) {
        element.setAttribute('data-message-id', messageId);
        element.setAttribute('data-is-read', String(isRead));
        element.setAttribute('data-is-own-message', String(isOwnMessage));

        observerRef.current.observe(element);
        observedElementsRef.current.set(messageId, element);
      }
    },
    [enabled]
  );

  // ==================== RETURN ====================

  return {
    observeMessage,
  };
}
