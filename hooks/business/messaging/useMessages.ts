'use client';

// Simplified messaging hooks with chat support removed

export function useConversations() {
  return {
    conversations: [],
    isLoading: false,
    error: null,
    refresh: () => Promise.resolve(),
  };
}

export function useConversation(_conversationId: string) {
  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

export function useMessages(_conversationId: string) {
  return {
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: () => Promise.resolve(),
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
    sendMessage: () => Promise.resolve(),
    markAsRead: () => Promise.resolve(),
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