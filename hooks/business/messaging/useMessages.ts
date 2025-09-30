'use client';

import type { Conversation, Message } from '@/types';

// Simplified messaging hooks with chat support removed

export function useConversations() {
  return {
    conversations: [] as Conversation[],
    isLoading: false,
    error: null,
    refresh: () => Promise.resolve(),
  };
}

export function useConversation(conversationId: string) {
  // Mock data for development
  const mockConversation: Conversation | null = conversationId
    ? {
        id: conversationId,
        participants: [
          {
            userId: 'user1',
            id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            avatar: '/default-avatar.png',
            userType: 'freelancer' as const,
          },
        ],
        participantIds: ['user1', 'user2'],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        jobId: 'job1',
        packageId: 'package1',
      }
    : null;

  return {
    conversation: mockConversation,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

export function useMessages(conversationId: string) {
  // Mock data for development
  const mockMessages: Message[] = conversationId
    ? [
        {
          id: 'msg1',
          conversationId,
          senderId: 'user1',
          content: 'Merhaba, nasılsınız?',
          type: 'text' as const,
          isRead: true,
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        },
      ]
    : [];

  return {
    messages: mockMessages,
    isLoading: false,
    error: null,
    refresh: () => Promise.resolve(),
  };
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

export function useMessaging() {
  return {
    sendMessage: (_conversationId: string, _content: string) =>
      Promise.resolve(),
    markAsRead: (_conversationId?: string) => Promise.resolve(),
    createConversation: () => Promise.resolve(),
    deleteMessage: () => Promise.resolve(),
    isLoading: false,
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
