import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  ChatMessage,
  ChatConversation,
  MessagesResponse,
  ConversationsResponse,
  SendMessageRequest,
  CreateConversationRequest,
  MessageSearchResponse,
  MessageSearchResult,
  PaginationMeta,
} from '@/types';

interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

interface MessagingState {
  // Data
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  currentConversation: ChatConversation | null;
  typingStatuses: TypingStatus[];

  // UI State
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  searchQuery: string;
  searchResults: MessageSearchResult[];
  isSearching: boolean;

  // Pagination
  conversationsPagination: PaginationMeta | null;
  messagesPagination: Record<string, PaginationMeta>;

  // Errors
  error: string | null;

  // Online status
  onlineUsers: Set<string>;

  // Unread counts
  totalUnreadCount: number;
}

interface MessagingActions {
  // Conversation actions
  loadConversations: () => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  createConversation: (
    request: CreateConversationRequest
  ) => Promise<ChatConversation | null>;
  deleteConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  pinConversation: (conversationId: string) => Promise<void>;
  unpinConversation: (conversationId: string) => Promise<void>;

  // Message actions
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    request: SendMessageRequest
  ) => Promise<ChatMessage | null>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;

  // Search actions
  searchMessages: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Typing indicators
  setTypingStatus: (
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) => void;
  clearTypingStatus: (conversationId: string, userId: string) => void;

  // Online status
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;

  // Utility actions
  clearError: () => void;
  resetState: () => void;

  // Real-time updates
  handleNewMessage: (message: ChatMessage) => void;
  handleMessageUpdate: (message: ChatMessage) => void;
  handleConversationUpdate: (conversation: ChatConversation) => void;
}

type MessagingStore = MessagingState & MessagingActions;

const initialState: MessagingState = {
  conversations: [],
  messages: {},
  currentConversation: null,
  typingStatuses: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  conversationsPagination: null,
  messagesPagination: {},
  error: null,
  onlineUsers: new Set(),
  totalUnreadCount: 0,
};

export const useMessagingStore = create<MessagingStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Conversation actions
      loadConversations: async () => {
        set((state) => {
          state.isLoadingConversations = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/conversations');
          if (!response.ok) throw new Error('Failed to load conversations');

          const data: ConversationsResponse = await response.json();

          set((state) => {
            state.conversations = data.conversations;
            state.conversationsPagination = data.pagination;
            state.totalUnreadCount = data.conversations.reduce(
              (sum, conv) => sum + (conv.unreadCount || 0),
              0
            );
            state.isLoadingConversations = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isLoadingConversations = false;
          });
        }
      },

      loadMoreConversations: async () => {
        const { conversationsPagination } = get();
        if (!conversationsPagination?.hasNext) return;

        set((state) => {
          state.isLoadingConversations = true;
        });

        try {
          const response = await fetch(
            `/api/conversations?page=${conversationsPagination.page + 1}&pageSize=${conversationsPagination.pageSize}`
          );
          if (!response.ok)
            throw new Error('Failed to load more conversations');

          const data: ConversationsResponse = await response.json();

          set((state) => {
            state.conversations.push(...data.conversations);
            state.conversationsPagination = data.pagination;
            state.isLoadingConversations = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isLoadingConversations = false;
          });
        }
      },

      setCurrentConversation: (conversation) => {
        set((state) => {
          state.currentConversation = conversation;
        });
      },

      createConversation: async (request) => {
        try {
          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
          });

          if (!response.ok) throw new Error('Failed to create conversation');

          const { data: conversation } = await response.json();

          set((state) => {
            state.conversations.unshift(conversation);
            state.currentConversation = conversation;
          });

          return conversation;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
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
            delete state.messages[conversationId];
            delete state.messagesPagination[conversationId];
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

      // Message actions
      loadMessages: async (conversationId) => {
        set((state) => {
          state.isLoadingMessages = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/conversations/${conversationId}/messages`
          );
          if (!response.ok) throw new Error('Failed to load messages');

          const data: MessagesResponse = await response.json();

          set((state) => {
            state.messages[conversationId] = data.messages;
            state.messagesPagination[conversationId] = data.pagination;
            state.isLoadingMessages = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isLoadingMessages = false;
          });
        }
      },

      loadMoreMessages: async (conversationId) => {
        const { messagesPagination } = get();
        const pagination = messagesPagination[conversationId];
        if (!pagination?.hasNext) return;

        set((state) => {
          state.isLoadingMessages = true;
        });

        try {
          const response = await fetch(
            `/api/conversations/${conversationId}/messages?page=${pagination.page + 1}&pageSize=${pagination.pageSize}`
          );
          if (!response.ok) throw new Error('Failed to load more messages');

          const data: MessagesResponse = await response.json();

          set((state) => {
            const existingMessages = state.messages[conversationId] || [];
            state.messages[conversationId] = [
              ...data.messages,
              ...existingMessages,
            ];
            state.messagesPagination[conversationId] = data.pagination;
            state.isLoadingMessages = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isLoadingMessages = false;
          });
        }
      },

      sendMessage: async (conversationId, request) => {
        set((state) => {
          state.isSendingMessage = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/conversations/${conversationId}/messages`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(request),
            }
          );

          if (!response.ok) throw new Error('Failed to send message');

          const { data: message } = await response.json();

          set((state) => {
            // Add message to conversation
            if (!state.messages[conversationId]) {
              state.messages[conversationId] = [];
            }
            state.messages[conversationId].push(message);

            // Update conversation's last message
            const convIndex = state.conversations.findIndex(
              (c) => c.id === conversationId
            );
            if (convIndex !== -1) {
              state.conversations[convIndex].lastMessage = message;
              // Note: updatedAt will be handled by real-time updates
            }

            state.isSendingMessage = false;
          });

          return message;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isSendingMessage = false;
          });
          return null;
        }
      },

      markMessagesAsRead: async (conversationId) => {
        try {
          const response = await fetch(
            `/api/conversations/${conversationId}/read`,
            {
              method: 'POST',
            }
          );

          if (!response.ok) throw new Error('Failed to mark messages as read');

          set((state) => {
            // Mark all messages as read
            const messages = state.messages[conversationId] || [];
            messages.forEach((message) => {
              if (message.readAt === undefined) {
                message.readAt = new Date().toISOString();
              }
            });

            // Update conversation unread count
            const convIndex = state.conversations.findIndex(
              (c) => c.id === conversationId
            );
            if (convIndex !== -1) {
              const prevUnreadCount =
                state.conversations[convIndex].unreadCount || 0;
              state.conversations[convIndex].unreadCount = 0;
              state.totalUnreadCount = Math.max(
                0,
                state.totalUnreadCount - prevUnreadCount
              );
            }
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
            Object.keys(state.messages).forEach((conversationId) => {
              state.messages[conversationId] = state.messages[
                conversationId
              ].filter((m) => m.id !== messageId);
            });
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
          });
        }
      },

      editMessage: async (messageId, content) => {
        try {
          const response = await fetch(`/api/messages/${messageId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          });

          if (!response.ok) throw new Error('Failed to edit message');

          const { data: updatedMessage } = await response.json();

          set((state) => {
            // Update message in all conversations
            Object.keys(state.messages).forEach((conversationId) => {
              const messageIndex = state.messages[conversationId].findIndex(
                (m) => m.id === messageId
              );
              if (messageIndex !== -1) {
                state.messages[conversationId][messageIndex] = updatedMessage;
              }
            });
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
          });
        }
      },

      // Search actions
      searchMessages: async (query) => {
        set((state) => {
          state.isSearching = true;
          state.searchQuery = query;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/messages/search?q=${encodeURIComponent(query)}`
          );
          if (!response.ok) throw new Error('Failed to search messages');

          const data: MessageSearchResponse = await response.json();

          set((state) => {
            state.searchResults = data.results;
            state.isSearching = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isSearching = false;
          });
        }
      },

      clearSearch: () => {
        set((state) => {
          state.searchQuery = '';
          state.searchResults = [];
        });
      },

      // Typing indicators
      setTypingStatus: (conversationId, userId, isTyping) => {
        set((state) => {
          const existingIndex = state.typingStatuses.findIndex(
            (t) => t.conversationId === conversationId && t.userId === userId
          );

          if (existingIndex !== -1) {
            state.typingStatuses[existingIndex] = {
              ...state.typingStatuses[existingIndex],
              isTyping,
              timestamp: new Date().toISOString(),
            };
          } else {
            state.typingStatuses.push({
              conversationId,
              userId,
              isTyping,
              timestamp: new Date().toISOString(),
            });
          }
        });
      },

      clearTypingStatus: (conversationId, userId) => {
        set((state) => {
          state.typingStatuses = state.typingStatuses.filter(
            (t) => !(t.conversationId === conversationId && t.userId === userId)
          );
        });
      },

      // Online status
      setUserOnline: (userId) => {
        set((state) => {
          state.onlineUsers.add(userId);
        });
      },

      setUserOffline: (userId) => {
        set((state) => {
          state.onlineUsers.delete(userId);
        });
      },

      // Utility actions
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      resetState: () => {
        set(() => ({ ...initialState, onlineUsers: new Set() }));
      },

      // Real-time updates
      handleNewMessage: (message) => {
        set((state) => {
          const conversationId = message.conversationId;

          // Add message to conversation
          if (!state.messages[conversationId]) {
            state.messages[conversationId] = [];
          }
          state.messages[conversationId].push(message);

          // Update conversation's last message and unread count
          const convIndex = state.conversations.findIndex(
            (c) => c.id === conversationId
          );
          if (convIndex !== -1) {
            state.conversations[convIndex].lastMessage = message;
            // Note: updatedAt will be handled by real-time updates

            // Only increment unread if it's not from current user
            if (message.senderId !== 'current-user-id') {
              // TODO: Get from auth store
              state.conversations[convIndex].unreadCount =
                (state.conversations[convIndex].unreadCount || 0) + 1;
              state.totalUnreadCount += 1;
            }
          }
        });
      },

      handleMessageUpdate: (message) => {
        set((state) => {
          const conversationId = message.conversationId;
          const messages = state.messages[conversationId];

          if (messages) {
            const messageIndex = messages.findIndex((m) => m.id === message.id);
            if (messageIndex !== -1) {
              state.messages[conversationId][messageIndex] = message;
            }
          }
        });
      },

      handleConversationUpdate: (conversation) => {
        set((state) => {
          const convIndex = state.conversations.findIndex(
            (c) => c.id === conversation.id
          );
          if (convIndex !== -1) {
            state.conversations[convIndex] = conversation;
          } else {
            state.conversations.unshift(conversation);
          }
        });
      },
    })),
    {
      name: 'messaging-store',
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        onlineUsers: Array.from(state.onlineUsers), // Convert Set to Array for serialization
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.onlineUsers && Array.isArray(state.onlineUsers)) {
            // Convert Array back to Set
            state.onlineUsers = new Set(state.onlineUsers);
          } else {
            state.onlineUsers = new Set();
          }
        }
      },
    }
  )
);
