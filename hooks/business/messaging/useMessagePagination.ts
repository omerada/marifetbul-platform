/**
 * useMessagePagination Hook
 *
 * Manages message history pagination with infinite scroll support.
 * Loads older messages as user scrolls up.
 *
 * Features:
 * - Infinite scroll (load more on scroll up)
 * - Cursor/offset-based pagination
 * - Loading states
 * - Scroll position preservation
 * - "No more messages" detection
 * - Performance optimization
 *
 * @sprint Sprint 1 - Story 1.5: Message History & Pagination
 * @author MarifetBul Development Team
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getMessages } from '@/lib/api/messaging';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Message } from '@/types/message';

// ==================== TYPES ====================

export interface MessagePaginationState {
  /** Current page number (zero-based) */
  page: number;
  /** Page size */
  size: number;
  /** Total number of messages */
  totalElements: number;
  /** Total number of pages */
  totalPages: number;
  /** Is first page */
  first: boolean;
  /** Is last page */
  last: boolean;
  /** Has more messages to load */
  hasMore: boolean;
}

export interface UseMessagePaginationOptions {
  /** Conversation ID */
  conversationId: string;
  /** Initial page size (default: 20) */
  initialSize?: number;
  /** Auto-load initial messages (default: true) */
  autoLoad?: boolean;
  /** Callback when messages loaded */
  onMessagesLoaded?: (messages: Message[], isLoadMore: boolean) => void;
}

export interface UseMessagePaginationReturn {
  /** Current messages */
  messages: Message[];
  /** Pagination state */
  pagination: MessagePaginationState;
  /** Is loading messages */
  isLoading: boolean;
  /** Is loading more (infinite scroll) */
  isLoadingMore: boolean;
  /** Error if any */
  error: string | null;
  /** Load initial messages */
  load: () => Promise<void>;
  /** Load more messages (older) */
  loadMore: () => Promise<void>;
  /** Refresh messages (reset pagination) */
  refresh: () => Promise<void>;
  /** Add new message to the end */
  addMessage: (message: Message) => void;
  /** Update existing message */
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  /** Remove message */
  removeMessage: (messageId: string) => void;
  /** Reset state */
  reset: () => void;
}

// ==================== HOOK ====================

/**
 * useMessagePagination Hook
 *
 * @example
 * ```tsx
 * const {
 *   messages,
 *   pagination,
 *   isLoading,
 *   isLoadingMore,
 *   loadMore
 * } = useMessagePagination({
 *   conversationId: 'conv-123',
 *   initialSize: 30,
 * });
 *
 * // In scroll handler
 * if (isNearTop && pagination.hasMore && !isLoadingMore) {
 *   await loadMore();
 * }
 * ```
 */
export function useMessagePagination(
  options: UseMessagePaginationOptions
): UseMessagePaginationReturn {
  const {
    conversationId,
    initialSize = 20,
    autoLoad = true,
    onMessagesLoaded,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<MessagePaginationState>({
    page: 0,
    size: initialSize,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInitializedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // ==================== LOAD INITIAL MESSAGES ====================

  /**
   * Load initial messages (page 0)
   */
  const load = useCallback(async () => {
    if (isLoadingRef.current) {
      logger.warn('useMessagePagination', 'Load already in progress');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('useMessagePagination', { conversationId, sizeinitialSize,  });

      const response = await getMessages(conversationId, 0, initialSize);

      logger.info('useMessagePagination', { conversationId, countresponsecontentlength, totalElementsresponsetotalElements, totalPagesresponsetotalPages,  });

      // Sort messages by createdAt (oldest first for display)
      const sortedMessages = [...response.content].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
      setPagination({
        page: response.page,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last,
        hasMore: !response.last,
      });

      onMessagesLoaded?.(sortedMessages, false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load messages';
      logger.error('useMessagePagination: Failed to load messages', undefined, {
        error: err,
        conversationId,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
      isInitializedRef.current = true;
    }
  }, [conversationId, initialSize, onMessagesLoaded]);

  // ==================== LOAD MORE (PAGINATION) ====================

  /**
   * Load more messages (older messages, previous page)
   */
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) {
      logger.warn('useMessagePagination', 'Load more already in progress');
      return;
    }

    if (!pagination.hasMore) {
      logger.debug('useMessagePagination', 'No more messages to load');
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = pagination.page + 1;

      logger.debug('useMessagePagination', { conversationId, pagenextPage, sizepaginationsize,  });

      const response = await getMessages(
        conversationId,
        nextPage,
        pagination.size
      );

      logger.info('useMessagePagination', { conversationId, pagenextPage, countresponsecontentlength, totalElementsresponsetotalElements,  });

      // Sort new messages (oldest first)
      const sortedNewMessages = [...response.content].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Prepend older messages to the beginning
      setMessages((prev) => [...sortedNewMessages, ...prev]);
      setPagination({
        page: response.page,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last,
        hasMore: !response.last,
      });

      onMessagesLoaded?.(sortedNewMessages, true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load more messages';
      logger.error('useMessagePagination: Failed to load more messages', undefined, {
        error: err,
        conversationId,
        page: pagination.page + 1,
      });
      setError(errorMessage);
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [conversationId, pagination, onMessagesLoaded]);

  // ==================== REFRESH ====================

  /**
   * Refresh messages (reset to page 0)
   */
  const refresh = useCallback(async () => {
    logger.debug('useMessagePagination', { conversationId,  });

    isInitializedRef.current = false;
    await load();
  }, [conversationId, load]);

  // ==================== MESSAGE MUTATIONS ====================

  /**
   * Add new message to the end (real-time)
   */
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });

    setPagination((prev) => ({
      ...prev,
      totalElements: prev.totalElements + 1,
    }));

    logger.debug('useMessagePagination', { messageIdmessageid,  });
  }, []);

  /**
   * Update existing message
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
      );

      logger.debug('useMessagePagination', { messageId, updates,  });
    },
    []
  );

  /**
   * Remove message
   */
  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    setPagination((prev) => ({
      ...prev,
      totalElements: Math.max(0, prev.totalElements - 1),
    }));

    logger.debug('useMessagePagination', { messageId });
  }, []);

  // ==================== RESET ====================

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setMessages([]);
    setPagination({
      page: 0,
      size: initialSize,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      hasMore: false,
    });
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    isInitializedRef.current = false;
    isLoadingRef.current = false;

    logger.debug('useMessagePagination', { conversationId });
  }, [conversationId, initialSize]);

  // ==================== AUTO-LOAD ====================

  /**
   * Auto-load on mount if enabled
   */
  useEffect(() => {
    if (autoLoad && conversationId && !isInitializedRef.current) {
      load();
    }
  }, [autoLoad, conversationId, load]);

  // ==================== RETURN ====================

  return {
    messages,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    load,
    loadMore,
    refresh,
    addMessage,
    updateMessage,
    removeMessage,
    reset,
  };
}
