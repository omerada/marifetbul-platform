// ================================================
// REFACTORED MESSAGING HOOKS - RESPONSIBILITY SEPARATION
// ================================================
// Separated concerns for messaging functionality

import { useCallback } from 'react';
import {
  createDataHook,
  createMutationHook,
  createPaginationHook,
} from '../../shared/base/patterns';
import { apiClient } from '@/lib/infrastructure/api/UnifiedApiClient';
import type { Message, Conversation } from '@/types';

// ================================================
// MESSAGING TYPES
// ================================================

interface SendMessageParams {
  conversationId: string;
  content: string;
  attachments?: File[];
}

interface CreateConversationParams {
  participantId: string;
  initialMessage: string;
}

interface MarkAsReadParams {
  conversationId: string;
  messageIds?: string[];
}

// ================================================
// CONVERSATION DATA HOOKS - DATA FETCHING
// ================================================

/**
 * Hook for fetching conversations list
 * Responsibility: Fetch and cache conversations data
 */
export function useConversations() {
  return createDataHook(
    async () => {
      return await apiClient.get<Conversation[]>('/conversations');
    },
    {
      refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time effect
    }
  )();
}

/**
 * Hook for fetching a specific conversation
 * Responsibility: Fetch single conversation details
 */
export function useConversation(conversationId: string) {
  return createDataHook(
    async () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return await apiClient.get<Conversation>(
        `/conversations/${conversationId}`
      );
    },
    {
      enabled: !!conversationId,
      refetchInterval: 10 * 1000, // Refetch every 10 seconds
    }
  )();
}

/**
 * Hook for fetching messages in a conversation with pagination
 * Responsibility: Fetch and paginate conversation messages
 */
export function useMessages(conversationId: string, pageSize: number = 50) {
  return createPaginationHook(async (page: number, limit: number) => {
    const response = await apiClient.get<{
      messages: Message[];
      total: number;
    }>(`/conversations/${conversationId}/messages`, {
      page: page.toString(),
      limit: limit.toString(),
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    return {
      items: response.messages.reverse(), // Show oldest first
      total: response.total,
    };
  }, pageSize)({
    enabled: !!conversationId,
  });
}

/**
 * Hook for getting unread message count
 * Responsibility: Fetch unread counts across conversations
 */
export function useUnreadCount() {
  return createDataHook(
    async () => {
      return await apiClient.get<{
        total: number;
        byConversation: Record<string, number>;
      }>('/conversations/unread-count');
    },
    {
      refetchInterval: 15 * 1000, // Refetch every 15 seconds
    }
  )();
}

// ================================================
// MESSAGING ACTION HOOKS - MUTATIONS
// ================================================

/**
 * Hook for sending messages
 * Responsibility: Handle message sending mutations
 */
export function useSendMessage() {
  return createMutationHook(
    async (params: SendMessageParams) => {
      const { conversationId, content, attachments } = params;

      // Handle file uploads if present
      let uploadedFiles: Array<{
        id: string;
        url: string;
        name: string;
        type: string;
      }> = [];

      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });

        uploadedFiles = await apiClient.post<
          Array<{ id: string; url: string; name: string; type: string }>
        >('/files/upload', formData);
      }

      return await apiClient.post<Message>(
        `/conversations/${conversationId}/messages`,
        {
          content,
          attachments: uploadedFiles,
        }
      );
    },
    {
      onSuccess: (data: Message) => {
        console.log('Message sent successfully:', data.id);
      },
      onError: (error: Error) => {
        console.error('Failed to send message:', error.message);
      },
    }
  )();
}

/**
 * Hook for creating new conversations
 * Responsibility: Handle conversation creation
 */
export function useCreateConversation() {
  return createMutationHook(
    async (params: CreateConversationParams) => {
      return await apiClient.post<Conversation>('/conversations', params);
    },
    {
      onSuccess: (data: Conversation) => {
        console.log('Conversation created:', data.id);
      },
      onError: (error: Error) => {
        console.error('Failed to create conversation:', error.message);
      },
    }
  )();
}

/**
 * Hook for marking messages as read
 * Responsibility: Handle read status updates
 */
export function useMarkAsRead() {
  return createMutationHook(
    async (params: MarkAsReadParams) => {
      const { conversationId, messageIds } = params;

      return await apiClient.post<{ success: boolean; updatedCount: number }>(
        `/conversations/${conversationId}/mark-read`,
        { messageIds }
      );
    },
    {
      onSuccess: (data: { success: boolean; updatedCount: number }) => {
        console.log(`Marked ${data.updatedCount} messages as read`);
      },
      onError: (error: Error) => {
        console.error('Failed to mark messages as read:', error.message);
      },
    }
  )();
}

/**
 * Hook for deleting messages
 * Responsibility: Handle message deletion
 */
export function useDeleteMessage() {
  return createMutationHook(
    async (messageId: string) => {
      return await apiClient.delete<{ success: boolean }>(
        `/messages/${messageId}`
      );
    },
    {
      onSuccess: () => {
        console.log('Message deleted successfully');
      },
      onError: (error: Error) => {
        console.error('Failed to delete message:', error.message);
      },
    }
  )();
}

// ================================================
// MESSAGING BUSINESS LOGIC HOOKS
// ================================================

/**
 * Hook for managing conversation participants
 * Responsibility: Handle participant-related business logic
 */
export function useConversationParticipants(conversationId: string) {
  const { data: conversation } = useConversation(conversationId);

  const getOtherParticipant = useCallback(
    (currentUserId: string) => {
      if (!conversation?.participants) return null;
      return (
        conversation.participants.find((p) => p.id !== currentUserId) || null
      );
    },
    [conversation?.participants]
  );

  const isParticipant = useCallback(
    (userId: string) => {
      if (!conversation?.participants) return false;
      return conversation.participants.some((p) => p.id === userId);
    },
    [conversation?.participants]
  );

  const getParticipantCount = useCallback(() => {
    return conversation?.participants?.length || 0;
  }, [conversation?.participants]);

  return {
    participants: conversation?.participants || [],
    getOtherParticipant,
    isParticipant,
    getParticipantCount,
  };
}

/**
 * Hook for managing message status and metadata
 * Responsibility: Handle message status business logic
 */
export function useMessageStatus() {
  const isMessageRead = useCallback(
    (message: Message, currentUserId: string) => {
      // Check if message has read status or is from current user
      return message.isRead || message.senderId === currentUserId;
    },
    []
  );

  const isMessageFromCurrentUser = useCallback(
    (message: Message, currentUserId: string) => {
      return message.senderId === currentUserId;
    },
    []
  );

  const getMessageTimestamp = useCallback((message: Message) => {
    return new Date(message.createdAt);
  }, []);

  const hasAttachments = useCallback((message: Message) => {
    return message.attachments && message.attachments.length > 0;
  }, []);

  return {
    isMessageRead,
    isMessageFromCurrentUser,
    getMessageTimestamp,
    hasAttachments,
  };
}

// ================================================
// REAL-TIME MESSAGING HOOKS
// ================================================

/**
 * Hook for real-time message updates
 * Responsibility: Handle WebSocket connections for real-time messaging
 */
export function useRealTimeMessages(conversationId: string) {
  // This would integrate with WebSocket for real-time updates
  // For now, using polling with shorter intervals

  const messages = useMessages(conversationId);
  const conversation = useConversation(conversationId);
  const unreadCount = useUnreadCount();

  // Auto-refresh more frequently when conversation is active
  return {
    messages: messages.data,
    conversation: conversation.data,
    unreadCount: unreadCount.data,
    isLoading: messages.data.isLoading || conversation.isLoading,
    error: messages.data.error || conversation.error,
    refetch: async () => {
      await Promise.all([
        messages.refetch(),
        conversation.refetch?.(),
        unreadCount.refetch?.(),
      ]);
    },
  };
}

// ================================================
// LEGACY COMPATIBILITY HOOKS
// ================================================

/**
 * Legacy useMessaging hook for backward compatibility
 * Combines messaging actions for existing components
 */
export function useMessaging() {
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const createConversation = useCreateConversation();
  const deleteMessage = useDeleteMessage();

  return {
    // Actions
    sendMessage: sendMessage.mutate,
    markAsRead: markAsRead.mutate,
    createConversation: createConversation.mutate,
    deleteMessage: deleteMessage.mutate,

    // Loading states
    isLoading:
      sendMessage.isLoading ||
      markAsRead.isLoading ||
      createConversation.isLoading ||
      deleteMessage.isLoading,

    // Individual loading states
    isSending: sendMessage.isLoading,
    isMarkingRead: markAsRead.isLoading,
    isCreating: createConversation.isLoading,
    isDeleting: deleteMessage.isLoading,

    // Error states
    error:
      sendMessage.error ||
      markAsRead.error ||
      createConversation.error ||
      deleteMessage.error,
  };
}

// ================================================
// HOOK EXPORTS WITH CLEAR RESPONSIBILITIES
// ================================================

export const MessagingHooks = {
  // Data fetching
  useConversations,
  useConversation,
  useMessages,
  useUnreadCount,

  // Actions/Mutations
  useSendMessage,
  useCreateConversation,
  useMarkAsRead,
  useDeleteMessage,

  // Business logic
  useConversationParticipants,
  useMessageStatus,

  // Real-time
  useRealTimeMessages,

  // Legacy compatibility
  useMessaging,
};

export default MessagingHooks;
