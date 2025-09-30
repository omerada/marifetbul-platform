// ================================================
// SIMPLIFIED MESSAGING HOOKS
// ================================================
// Basic messaging hooks with live chat support removed

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
    conversation: null,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

export function useMessages(_conversationId: string) {
  return {
    data: {
      items: [],
      total: 0,
      isLoading: false,
      error: null,
    },
    messages: [],
    isLoading: false,
    error: null,
    refresh: () => Promise.resolve(),
    refetch: () => Promise.resolve(),
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
    sendMessage: (_content: string) => Promise.resolve(),
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

// Legacy exports for backward compatibility
export const MessagingHooks = {
  useConversations,
  useConversation,
  useMessages,
  useUnreadCount,
  useMessaging,
};

export default MessagingHooks;
