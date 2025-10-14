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

export function useConversation(conversationId: string) {
  return {
    conversation: null,
    conversationId, // Use the parameter
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

export function useMessages(conversationId: string) {
  return {
    data: {
      items: [],
      total: 0,
      isLoading: false,
      error: null,
    },
    messages: [],
    conversationId, // Use the parameter
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
    sendMessage: async (content: string, conversationId: string) => {
      try {
        const response = await fetch('/api/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content, conversationId }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    markAsRead: async (messageId: string) => {
      try {
        await fetch(`/api/v1/messages/${messageId}/read`, {
          method: 'PUT',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    },
    createConversation: async (userId: string) => {
      try {
        const response = await fetch('/api/v1/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }

        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
    },
    deleteMessage: async (messageId: string) => {
      try {
        await fetch(`/api/v1/messages/${messageId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    },
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
