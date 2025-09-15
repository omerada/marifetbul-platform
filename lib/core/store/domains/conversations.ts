import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ChatConversation, PaginationMeta } from '@/types';

/**
 * Conversation Domain Store
 * Handles conversation-specific state and operations
 * Separated from messaging for better modularity
 */
interface ConversationState {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}

interface ConversationActions {
  // Core conversation operations
  loadConversations: () => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  createConversation: (
    participantId: string,
    initialMessage?: string
  ) => Promise<ChatConversation | null>;

  // Conversation management
  deleteConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  pinConversation: (conversationId: string) => Promise<void>;
  unpinConversation: (conversationId: string) => Promise<void>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

type ConversationStore = ConversationState & ConversationActions;

export const useConversationStore = create<ConversationStore>()(
  immer((set, get) => ({
    // Initial state
    conversations: [],
    currentConversation: null,
    isLoading: false,
    error: null,
    pagination: null,

    // Actions
    loadConversations: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/conversations?page=1&pageSize=20');
        if (!response.ok) throw new Error('Failed to load conversations');

        const data = await response.json();

        set((state) => {
          state.conversations = data.conversations;
          state.pagination = data.pagination;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.isLoading = false;
        });
      }
    },

    loadMoreConversations: async () => {
      const { pagination } = get();
      if (!pagination?.hasNext) return;

      set((state) => {
        state.isLoading = true;
      });

      try {
        const response = await fetch(
          `/api/conversations?page=${pagination.page + 1}&pageSize=${pagination.pageSize}`
        );
        if (!response.ok) throw new Error('Failed to load more conversations');

        const data = await response.json();

        set((state) => {
          state.conversations.push(...data.conversations);
          state.pagination = data.pagination;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.isLoading = false;
        });
      }
    },

    setCurrentConversation: (conversation) => {
      set((state) => {
        state.currentConversation = conversation;
      });
    },

    createConversation: async (participantId, initialMessage) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId,
            initialMessage,
          }),
        });

        if (!response.ok) throw new Error('Failed to create conversation');

        const data = await response.json();
        const newConversation = data.conversation;

        set((state) => {
          state.conversations.unshift(newConversation);
          state.currentConversation = newConversation;
          state.isLoading = false;
        });

        return newConversation;
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.isLoading = false;
        });
        return null;
      }
    },

    deleteConversation: async (conversationId) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete conversation');

        set((state) => {
          state.conversations = state.conversations.filter(
            (c) => c.id !== conversationId
          );
          if (state.currentConversation?.id === conversationId) {
            state.currentConversation = null;
          }
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    archiveConversation: async (conversationId) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/archive`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) throw new Error('Failed to archive conversation');

        set((state) => {
          const convIndex = state.conversations.findIndex(
            (c) => c.id === conversationId
          );
          if (convIndex !== -1) {
            state.conversations[convIndex].isArchived = true;
          }
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    unarchiveConversation: async (conversationId) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/unarchive`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) throw new Error('Failed to unarchive conversation');

        set((state) => {
          const convIndex = state.conversations.findIndex(
            (c) => c.id === conversationId
          );
          if (convIndex !== -1) {
            state.conversations[convIndex].isArchived = false;
          }
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    pinConversation: async (conversationId) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/pin`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) throw new Error('Failed to pin conversation');

        set((state) => {
          const convIndex = state.conversations.findIndex(
            (c) => c.id === conversationId
          );
          if (convIndex !== -1) {
            state.conversations[convIndex].isPinned = true;
            // Move pinned conversation to top
            const conversation = state.conversations.splice(convIndex, 1)[0];
            state.conversations.unshift(conversation);
          }
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    unpinConversation: async (conversationId) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/unpin`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) throw new Error('Failed to unpin conversation');

        set((state) => {
          const convIndex = state.conversations.findIndex(
            (c) => c.id === conversationId
          );
          if (convIndex !== -1) {
            state.conversations[convIndex].isPinned = false;
          }
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    reset: () => {
      set((state) => {
        state.conversations = [];
        state.currentConversation = null;
        state.isLoading = false;
        state.error = null;
        state.pagination = null;
      });
    },
  }))
);

// Selectors for better performance
export const useConversations = () =>
  useConversationStore((state) => state.conversations);
export const useCurrentConversation = () =>
  useConversationStore((state) => state.currentConversation);
export const useConversationLoading = () =>
  useConversationStore((state) => state.isLoading);
export const useConversationError = () =>
  useConversationStore((state) => state.error);

// Action selectors
export const useConversationActions = () => {
  const store = useConversationStore();
  return {
    loadConversations: store.loadConversations,
    loadMoreConversations: store.loadMoreConversations,
    setCurrentConversation: store.setCurrentConversation,
    createConversation: store.createConversation,
    deleteConversation: store.deleteConversation,
    archiveConversation: store.archiveConversation,
    unarchiveConversation: store.unarchiveConversation,
    pinConversation: store.pinConversation,
    unpinConversation: store.unpinConversation,
    clearError: store.clearError,
    reset: store.reset,
  };
};
