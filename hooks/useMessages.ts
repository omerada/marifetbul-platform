'use client';

import useSWR from 'swr';
import { Message, Conversation, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api/client';
import { useAsyncOperation, useAsyncAction } from './useAsyncOperation';

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

// Hook to send messages - REFACTORED to use useAsyncOperation
export function useMessaging() {
  const sendMessageOperation = useAsyncOperation<ApiResponse<Message>>();
  const createConversationOperation =
    useAsyncOperation<ApiResponse<Conversation>>();
  const markAsReadAction = useAsyncAction();

  const sendMessage = async (conversationId: string, content: string) => {
    return await sendMessageOperation.execute(async () => {
      const response = await apiClient.post<ApiResponse<Message>>(
        `/api/conversations/${conversationId}/messages`,
        { content }
      );
      return response;
    });
  };

  const createConversation = async (
    participantId: string,
    initialMessage?: string,
    jobId?: string,
    packageId?: string
  ) => {
    return await createConversationOperation.execute(async () => {
      const response = await apiClient.post<ApiResponse<Conversation>>(
        '/api/conversations',
        {
          participantId,
          jobId,
          packageId,
          initialMessage,
        }
      );
      return response;
    });
  };

  const markAsRead = async (conversationId: string) => {
    await markAsReadAction.execute(async () => {
      await apiClient.patch(`/api/conversations/${conversationId}/mark-read`);
    });
  };

  return {
    sendMessage,
    createConversation,
    markAsRead,
    isLoading:
      sendMessageOperation.isLoading ||
      createConversationOperation.isLoading ||
      markAsReadAction.isLoading,
    error:
      sendMessageOperation.error ||
      createConversationOperation.error ||
      markAsReadAction.error,
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
