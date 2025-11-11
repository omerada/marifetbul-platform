'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Conversation, Message } from '@/types';

export type ConversationFilter = 'all' | 'active' | 'archived';

export function useConversations(filter: ConversationFilter = 'all') {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = '/api/v1/conversations';
      if (filter === 'archived') {
        endpoint = '/api/v1/conversations/archived';
      } else if (filter === 'active') {
        endpoint = '/api/v1/conversations/active';
      }

      const response = await fetch(endpoint, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data?.content || data.data || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load conversations'
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const archiveConversation = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(
          `/api/v1/conversations/${conversationId}/archive`,
          {
            method: 'PUT',
            credentials: 'include',
          }
        );
        if (response.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch (err) {
        logger.error('Error archiving conversation:', err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [refresh]
  );

  const unarchiveConversation = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(
          `/api/v1/conversations/${conversationId}/unarchive`,
          {
            method: 'PUT',
            credentials: 'include',
          }
        );
        if (response.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch (err) {
        logger.error('Error unarchiving conversation:', err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [refresh]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(
          `/api/v1/conversations/${conversationId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
        if (response.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch (err) {
        logger.error('Error deleting conversation:', err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [refresh]
  );

  return {
    conversations,
    isLoading,
    error,
    refresh,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
  };
}

export function useConversation(conversationId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/conversations/${conversationId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConversation(data.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load conversation'
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    refetch();
  }, [conversationId, refetch]);

  return { conversation, isLoading, error, refetch };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/conversations/${conversationId}/messages`,
        {
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    refresh();
  }, [conversationId, refresh]);

  return { messages, isLoading, error, refresh };
}

export function useUnreadCount() {
  return {
    data: {
      total: 0,
      byConversation: {},
    },
    refetch: () => Promise.resolve(),
  };
}

export interface AttachmentInfo {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface SendMessageOptions {
  content: string;
  attachment?: AttachmentInfo;
}

export function useMessaging() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    conversationId: string,
    options: string | SendMessageOptions
  ) => {
    setIsLoading(true);
    try {
      // Support both old string format and new options format
      const payload =
        typeof options === 'string' ? { content: options } : options;

      const response = await fetch(
        `/api/v1/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (conversationId?: string) => {
    if (!conversationId) return;

    try {
      await fetch(`/api/v1/conversations/${conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      logger.error('Error marking as read:', error);
    }
  };

  const createConversation = async (participantIds: string[]) => {
    try {
      const response = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantIds }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      logger.error('Error creating conversation:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await fetch(`/api/v1/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  };

  return {
    sendMessage,
    markAsRead,
    createConversation,
    deleteMessage,
    isLoading,
    isSending: false,
    isMarkingRead: false,
    isCreating: false,
    isDeleting: false,
    error: null,
  };
}

export function useUnreadMessagesCount() {
  return 0;
}
