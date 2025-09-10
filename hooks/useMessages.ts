'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Message, Conversation, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api/client';

// Hook to fetch conversations
export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<Conversation[]>
  >('/api/conversations', apiClient.get);

  return {
    conversations: data?.data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to fetch specific conversation
export function useConversation(conversationId: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Conversation>>(
    conversationId ? `/api/conversations/${conversationId}` : null,
    apiClient.get
  );

  return {
    conversation: data?.data,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to fetch messages for a conversation
export function useMessages(conversationId: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Message[]>>(
    conversationId ? `/api/conversations/${conversationId}/messages` : null,
    apiClient.get,
    {
      refreshInterval: 3000, // Refresh every 3 seconds for real-time effect
    }
  );

  return {
    messages: data?.data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to send messages
export function useMessaging() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (conversationId: string, content: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<Message>>(
        `/api/conversations/${conversationId}/messages`,
        { content }
      );
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (
    participantId: string,
    initialMessage?: string,
    jobId?: string,
    packageId?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<Conversation>>(
        '/api/conversations',
        {
          participantId,
          jobId,
          packageId,
          initialMessage,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await apiClient.patch(`/api/conversations/${conversationId}/mark-read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return {
    sendMessage,
    createConversation,
    markAsRead,
    isLoading,
  };
}

// Hook to get unread message count
export function useUnreadCount() {
  const { conversations } = useConversations();

  const unreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  return unreadCount;
}
