import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ChatMessage, PaginationMeta } from '@/types';

/**
 * Messages Domain Store
 * Handles message-specific state and operations
 * Focused solely on message management
 */
interface MessageState {
  // Message data organized by conversation
  messagesByConversation: Record<string, ChatMessage[]>;

  // UI state
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Pagination per conversation
  paginationByConversation: Record<string, PaginationMeta>;

  // Message drafts
  draftsByConversation: Record<string, string>;
}

interface MessageActions {
  // Core message operations
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
    attachments?: File[]
  ) => Promise<ChatMessage | null>;

  // Message management
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;

  // Draft management
  saveDraft: (conversationId: string, content: string) => void;
  clearDraft: (conversationId: string) => void;
  getDraft: (conversationId: string) => string;

  // Real-time message handling
  handleNewMessage: (message: ChatMessage) => void;
  handleMessageUpdate: (message: ChatMessage) => void;
  handleMessageDelete: (messageId: string) => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

type MessageStore = MessageState & MessageActions;

export const useMessageStore = create<MessageStore>()(
  immer((set, get) => ({
    // Initial state
    messagesByConversation: {},
    isLoading: false,
    isSending: false,
    error: null,
    paginationByConversation: {},
    draftsByConversation: {},

    // Actions
    loadMessages: async (conversationId) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages?page=1&pageSize=50`
        );
        if (!response.ok) throw new Error('Failed to load messages');

        const data = await response.json();

        set((state) => {
          state.messagesByConversation[conversationId] = data.messages;
          state.paginationByConversation[conversationId] = data.pagination;
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

    loadMoreMessages: async (conversationId) => {
      const { paginationByConversation } = get();
      const pagination = paginationByConversation[conversationId];

      if (!pagination?.hasNext) return;

      set((state) => {
        state.isLoading = true;
      });

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages?page=${pagination.page + 1}&pageSize=${pagination.pageSize}`
        );
        if (!response.ok) throw new Error('Failed to load more messages');

        const data = await response.json();

        set((state) => {
          // Prepend older messages to the beginning of the array
          const existingMessages =
            state.messagesByConversation[conversationId] || [];
          state.messagesByConversation[conversationId] = [
            ...data.messages,
            ...existingMessages,
          ];
          state.paginationByConversation[conversationId] = data.pagination;
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

    sendMessage: async (conversationId, content, attachments) => {
      set((state) => {
        state.isSending = true;
        state.error = null;
      });

      try {
        const formData = new FormData();
        formData.append('content', content);

        if (attachments) {
          attachments.forEach((file, index) => {
            formData.append(`attachment_${index}`, file);
          });
        }

        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();
        const newMessage = data.message;

        set((state) => {
          // Add new message to the end of the conversation
          if (!state.messagesByConversation[conversationId]) {
            state.messagesByConversation[conversationId] = [];
          }
          state.messagesByConversation[conversationId].push(newMessage);

          // Clear draft after sending
          delete state.draftsByConversation[conversationId];

          state.isSending = false;
        });

        return newMessage;
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.isSending = false;
        });
        return null;
      }
    },

    editMessage: async (messageId, content) => {
      try {
        const response = await fetch(`/api/messages/${messageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) throw new Error('Failed to edit message');

        const data = await response.json();
        const updatedMessage = data.message;

        set((state) => {
          // Find and update the message in all conversations
          Object.keys(state.messagesByConversation).forEach(
            (conversationId) => {
              const messages = state.messagesByConversation[conversationId];
              const messageIndex = messages.findIndex(
                (m) => m.id === messageId
              );
              if (messageIndex !== -1) {
                messages[messageIndex] = updatedMessage;
              }
            }
          );
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    deleteMessage: async (messageId) => {
      try {
        const response = await fetch(`/api/messages/${messageId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete message');

        set((state) => {
          // Remove message from all conversations
          Object.keys(state.messagesByConversation).forEach(
            (conversationId) => {
              state.messagesByConversation[conversationId] =
                state.messagesByConversation[conversationId].filter(
                  (m) => m.id !== messageId
                );
            }
          );
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    markAsRead: async (conversationId) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/mark-read`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) throw new Error('Failed to mark messages as read');

        set((state) => {
          const messages = state.messagesByConversation[conversationId];
          if (messages) {
            messages.forEach((message) => {
              message.isRead = true;
            });
          }
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
        });
      }
    },

    saveDraft: (conversationId, content) => {
      set((state) => {
        state.draftsByConversation[conversationId] = content;
      });
    },

    clearDraft: (conversationId) => {
      set((state) => {
        delete state.draftsByConversation[conversationId];
      });
    },

    getDraft: (conversationId) => {
      return get().draftsByConversation[conversationId] || '';
    },

    handleNewMessage: (message) => {
      set((state) => {
        const conversationId = message.conversationId;
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }

        // Check if message already exists (avoid duplicates)
        const exists = state.messagesByConversation[conversationId].some(
          (m) => m.id === message.id
        );

        if (!exists) {
          state.messagesByConversation[conversationId].push(message);
        }
      });
    },

    handleMessageUpdate: (message) => {
      set((state) => {
        const conversationId = message.conversationId;
        const messages = state.messagesByConversation[conversationId];

        if (messages) {
          const messageIndex = messages.findIndex((m) => m.id === message.id);
          if (messageIndex !== -1) {
            messages[messageIndex] = message;
          }
        }
      });
    },

    handleMessageDelete: (messageId) => {
      set((state) => {
        Object.keys(state.messagesByConversation).forEach((conversationId) => {
          state.messagesByConversation[conversationId] =
            state.messagesByConversation[conversationId].filter(
              (m) => m.id !== messageId
            );
        });
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    reset: () => {
      set((state) => {
        state.messagesByConversation = {};
        state.isLoading = false;
        state.isSending = false;
        state.error = null;
        state.paginationByConversation = {};
        state.draftsByConversation = {};
      });
    },
  }))
);

// Selectors for better performance
export const useMessages = (conversationId: string) =>
  useMessageStore(
    (state) => state.messagesByConversation[conversationId] || []
  );

export const useMessageLoading = () =>
  useMessageStore((state) => state.isLoading);
export const useMessageSending = () =>
  useMessageStore((state) => state.isSending);
export const useMessageError = () => useMessageStore((state) => state.error);

export const useDraft = (conversationId: string) =>
  useMessageStore((state) => state.draftsByConversation[conversationId] || '');

// Action selectors
export const useMessageActions = () => {
  const store = useMessageStore();
  return {
    loadMessages: store.loadMessages,
    loadMoreMessages: store.loadMoreMessages,
    sendMessage: store.sendMessage,
    editMessage: store.editMessage,
    deleteMessage: store.deleteMessage,
    markAsRead: store.markAsRead,
    saveDraft: store.saveDraft,
    clearDraft: store.clearDraft,
    getDraft: store.getDraft,
    handleNewMessage: store.handleNewMessage,
    handleMessageUpdate: store.handleMessageUpdate,
    handleMessageDelete: store.handleMessageDelete,
    clearError: store.clearError,
    reset: store.reset,
  };
};
