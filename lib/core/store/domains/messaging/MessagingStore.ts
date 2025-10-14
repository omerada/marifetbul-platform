import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Message,
  Conversation,
  MessagesResponse,
  ConversationsResponse,
  SendMessageRequest,
  CreateConversationRequest,
  MessageSearchResponse,
  MessageSearchResult,
  PaginationMeta,
} from '@/types';

// ================================================
// DOMAIN: MESSAGING STORE - OPTIMIZED
// ================================================
// Consolidates all messaging related functionality
// Optimized for performance and memory usage

interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

interface MessagingState {
  // Core Data - using arrays for compatibility
  conversations: Conversation[];
  messages: Record<string, Message[]>; // key: conversationId
  currentConversationId: string | null;

  // Derived data
  totalUnreadCount: number;
  onlineUsers: string[];
  typingUsers: Record<string, string[]>; // conversationId -> userIds

  // UI State
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  searchQuery: string;
  searchResults: MessageSearchResult[];
  isSearching: boolean;

  // Pagination
  conversationsPagination: PaginationMeta | null;
  messagesPagination: Record<string, PaginationMeta>; // conversationId -> pagination

  // Error State
  error: string | null;

  // Actions
  setConversations: (response: ConversationsResponse) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  loadConversations: () => Promise<void>;

  setMessages: (conversationId: string, response: MessagesResponse) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;

  setCurrentConversation: (id: string | null) => void;

  setTypingStatus: (status: TypingStatus) => void;
  clearTypingStatus: (conversationId: string, userId: string) => void;

  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;

  searchMessages: (query: string) => Promise<void>;
  clearSearch: () => void;

  sendMessage: (request: SendMessageRequest) => Promise<void>;
  createConversation: (
    request: CreateConversationRequest
  ) => Promise<Conversation>;

  markAsRead: (conversationId: string, messageId?: string) => Promise<void>;

  // Computed getters
  typingStatuses: TypingStatus[];
  updateTypingStatus: (
    userId: string,
    conversationId: string,
    isTyping: boolean
  ) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;

  // Utilities
  reset: () => void;
  clearError: () => void;
}

const initialState = {
  conversations: [],
  messages: {},
  currentConversationId: null,
  totalUnreadCount: 0,
  onlineUsers: [],
  typingUsers: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  conversationsPagination: null,
  messagesPagination: {},
  error: null,
};

export const useMessagingStore = create<MessagingState>()(
  persist(
    immer((set) => ({
      ...initialState,

      // ================================================
      // CONVERSATION ACTIONS
      // ================================================
      setConversations: (response) =>
        set((state) => {
          // Convert BasicConversation to Conversation format
          state.conversations = response.conversations.map((conv) => ({
            ...conv,
            participants: [],
            unreadCount: conv.unreadCount || 0,
          })) as any;
          state.conversationsPagination = response.pagination;
          state.isLoadingConversations = false;

          // Update unread count
          state.totalUnreadCount = state.conversations.reduce(
            (sum, conv) => sum + (conv.unreadCount || 0),
            0
          );
        }),

      addConversation: (conversation) =>
        set((state) => {
          const exists = state.conversations.find(
            (c) => c.id === conversation.id
          );
          if (!exists) {
            state.conversations.push(conversation);
            state.totalUnreadCount += conversation.unreadCount;
          }
        }),

      updateConversation: (id, updates) =>
        set((state) => {
          const index = state.conversations.findIndex((c) => c.id === id);
          if (index !== -1) {
            const existing = state.conversations[index];
            const updated = { ...existing, ...updates };
            state.conversations[index] = updated;

            // Update unread count if changed
            if ('unreadCount' in updates) {
              state.totalUnreadCount = state.conversations.reduce(
                (sum, conv) => sum + conv.unreadCount,
                0
              );
            }
          }
        }),

      removeConversation: (id) =>
        set((state) => {
          const conversation = state.conversations.find((c) => c.id === id);
          if (conversation) {
            state.totalUnreadCount -= conversation.unreadCount;
            state.conversations = state.conversations.filter(
              (c) => c.id !== id
            );
            delete state.messages[id];
            delete state.messagesPagination[id];
            delete state.typingUsers[id];

            if (state.currentConversationId === id) {
              state.currentConversationId = null;
            }
          }
        }),

      // ================================================
      // MESSAGE ACTIONS
      // ================================================
      setMessages: (conversationId, response) =>
        set((state) => {
          state.messages[conversationId] = response.messages;
          state.messagesPagination[conversationId] = response.pagination;
          state.isLoadingMessages = false;
        }),

      addMessage: (message) =>
        set((state) => {
          const conversationMessages =
            state.messages[message.conversationId] || [];

          // Avoid duplicates
          const exists = conversationMessages.some((m) => m.id === message.id);
          if (!exists) {
            conversationMessages.push(message);
            state.messages[message.conversationId] = conversationMessages;

            // Update conversation last message
            const conversationIndex = state.conversations.findIndex(
              (c) => c.id === message.conversationId
            );
            if (conversationIndex !== -1) {
              state.conversations[conversationIndex].lastMessage = message;
              state.conversations[conversationIndex].lastActivity =
                message.createdAt;
              state.conversations[conversationIndex].updatedAt =
                message.createdAt;
            }
          }
        }),

      updateMessage: (id, updates) =>
        set((state) => {
          // Find message across all conversations
          for (const messages of Object.values(state.messages)) {
            const messageIndex = messages.findIndex((m) => m.id === id);
            if (messageIndex !== -1) {
              messages[messageIndex] = {
                ...messages[messageIndex],
                ...updates,
              };
              break;
            }
          }
        }),

      removeMessage: (id) =>
        set((state) => {
          for (const [conversationId, messages] of Object.entries(
            state.messages
          )) {
            const filtered = messages.filter((m) => m.id !== id);
            if (filtered.length !== messages.length) {
              state.messages[conversationId] = filtered;
              break;
            }
          }
        }),

      // ================================================
      // UI ACTIONS
      // ================================================
      setCurrentConversation: (id) =>
        set((state) => {
          state.currentConversationId = id;
          state.error = null;
        }),

      setTypingStatus: (status) =>
        set((state) => {
          const conversationTypers =
            state.typingUsers[status.conversationId] || [];

          if (status.isTyping) {
            if (!conversationTypers.includes(status.userId)) {
              conversationTypers.push(status.userId);
            }
          } else {
            const index = conversationTypers.indexOf(status.userId);
            if (index > -1) {
              conversationTypers.splice(index, 1);
            }
          }

          if (conversationTypers.length > 0) {
            state.typingUsers[status.conversationId] = conversationTypers;
          } else {
            delete state.typingUsers[status.conversationId];
          }
        }),

      clearTypingStatus: (conversationId, userId) =>
        set((state) => {
          const conversationTypers = state.typingUsers[conversationId];
          if (conversationTypers) {
            const index = conversationTypers.indexOf(userId);
            if (index > -1) {
              conversationTypers.splice(index, 1);
              if (conversationTypers.length === 0) {
                delete state.typingUsers[conversationId];
              }
            }
          }
        }),

      setOnlineUsers: (userIds) =>
        set((state) => {
          state.onlineUsers = userIds;
        }),

      addOnlineUser: (userId) =>
        set((state) => {
          if (!state.onlineUsers.includes(userId)) {
            state.onlineUsers.push(userId);
          }
        }),

      removeOnlineUser: (userId) =>
        set((state) => {
          const index = state.onlineUsers.indexOf(userId);
          if (index > -1) {
            state.onlineUsers.splice(index, 1);
          }
        }),

      // ================================================
      // SEARCH ACTIONS
      // ================================================
      searchMessages: async (query) => {
        set((state) => {
          state.searchQuery = query;
          state.isSearching = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/v1/messages/search?query=${encodeURIComponent(query)}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );

          if (!response.ok) {
            throw new Error('Mesaj arama başarısız oldu');
          }

          const data = (await response.json()) as MessageSearchResponse;

          set((state) => {
            state.searchResults = data.messages.map((message) => ({
              message,
              conversation: state.conversations.find(
                (c) => c.id === message.conversationId
              ) || {
                id: message.conversationId,
                participants: [],
                participantIds: [],
                unreadCount: 0,
                createdAt: '',
                updatedAt: '',
              },
              highlights: [],
            }));
            state.isSearching = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Search failed';
            state.isSearching = false;
          });
        }
      },

      clearSearch: () =>
        set((state) => {
          state.searchQuery = '';
          state.searchResults = [];
          state.isSearching = false;
        }),

      // ================================================
      // API ACTIONS
      // ================================================
      sendMessage: async (request) => {
        set((state) => {
          state.isSendingMessage = true;
          state.error = null;
        });

        try {
          const formData = new FormData();
          formData.append('conversationId', request.conversationId);
          formData.append('content', request.content);
          if (request.type) formData.append('type', request.type);
          if (request.attachments) {
            request.attachments.forEach((file) => {
              formData.append('attachments', file);
            });
          }

          const response = await fetch('/api/v1/messages', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Mesaj gönderme başarısız oldu');
          }

          const { data: sentMessage } = await response.json();

          set((state) => {
            const conversationMessages =
              state.messages[request.conversationId] || [];
            conversationMessages.push(sentMessage);
            state.messages[request.conversationId] = conversationMessages;
            state.isSendingMessage = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Failed to send message';
            state.isSendingMessage = false;
          });
        }
      },

      createConversation: async (request: CreateConversationRequest) => {
        set((state) => {
          state.isLoadingConversations = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Konuşma oluşturma başarısız oldu');
          }

          const { data: conversation } = await response.json();

          set((state) => {
            state.conversations.push(conversation);
            state.isLoadingConversations = false;
          });

          return conversation;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : 'Failed to create conversation';
            state.isLoadingConversations = false;
          });
          throw error;
        }
      },

      // ================================================
      // ASYNC API ACTIONS
      // ================================================

      loadConversations: async () => {
        set((state) => {
          state.isLoadingConversations = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/conversations', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Konuşmalar yüklenemedi');
          }

          const data = (await response.json()) as ConversationsResponse;

          set((state) => {
            state.conversations = data.conversations;
            state.conversationsPagination = data.pagination;
            state.isLoadingConversations = false;
            state.totalUnreadCount = state.conversations.reduce(
              (sum, conv) => sum + conv.unreadCount,
              0
            );
          });
        } catch (error) {
          set((state) => {
            state.isLoadingConversations = false;
            state.error =
              error instanceof Error
                ? error.message
                : 'Failed to load conversations';
          });
        }
      },

      loadMessages: async (conversationId: string) => {
        set((state) => {
          state.isLoadingMessages = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/v1/conversations/${conversationId}/messages`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );

          if (!response.ok) {
            throw new Error('Mesajlar yüklenemedi');
          }

          const data = (await response.json()) as MessagesResponse;

          set((state) => {
            state.messages[conversationId] = data.messages;
            state.messagesPagination[conversationId] = data.pagination;
            state.isLoadingMessages = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoadingMessages = false;
            state.error =
              error instanceof Error
                ? error.message
                : 'Failed to load messages';
          });
        }
      },

      editMessage: async (messageId: string, content: string) => {
        try {
          const response = await fetch(`/api/v1/messages/${messageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
            credentials: 'include',
          });

          if (!response.ok) throw new Error('Mesaj düzenlenemedi');

          const { data: updatedMessage } = await response.json();

          set((state) => {
            // Find and update the message
            Object.keys(state.messages).forEach((conversationId) => {
              const messages = state.messages[conversationId];
              const index = messages.findIndex((m) => m.id === messageId);
              if (index !== -1) {
                messages[index] = updatedMessage;
              }
            });
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Failed to edit message';
          });
          throw error;
        }
      },

      deleteMessage: async (messageId: string) => {
        try {
          const response = await fetch(`/api/v1/messages/${messageId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) throw new Error('Mesaj silinemedi');

          set((state) => {
            // Find and remove the message
            Object.keys(state.messages).forEach((conversationId) => {
              const messages = state.messages[conversationId];
              state.messages[conversationId] = messages.filter(
                (m) => m.id !== messageId
              );
            });
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : 'Failed to delete message';
          });
          throw error;
        }
      },

      markMessagesAsRead: async (conversationId: string) => {
        try {
          const response = await fetch(
            `/api/v1/conversations/${conversationId}/mark-read`,
            {
              method: 'POST',
              credentials: 'include',
            }
          );

          if (!response.ok)
            throw new Error('Mesajlar okundu olarak işaretlenemedi');

          set((state) => {
            // Update conversation unread count
            const conversationIndex = state.conversations.findIndex(
              (c) => c.id === conversationId
            );
            if (conversationIndex !== -1) {
              const oldUnread =
                state.conversations[conversationIndex].unreadCount;
              state.conversations[conversationIndex].unreadCount = 0;
              state.totalUnreadCount -= oldUnread;
            }

            // Mark messages as read
            const messages = state.messages[conversationId];
            if (messages) {
              messages.forEach((message) => {
                if (!message.isRead) {
                  message.isRead = true;
                  message.readAt = new Date().toISOString();
                }
              });
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : 'Failed to mark messages as read';
          });
          throw error;
        }
      },

      // Computed getters and additional utilities
      typingStatuses: [],

      updateTypingStatus: (
        userId: string,
        conversationId: string,
        isTyping: boolean
      ) => {
        set((state) => {
          if (!state.typingUsers[conversationId]) {
            state.typingUsers[conversationId] = [];
          }

          const users = state.typingUsers[conversationId];
          const index = users.indexOf(userId);

          if (isTyping && index === -1) {
            users.push(userId);
          } else if (!isTyping && index !== -1) {
            users.splice(index, 1);
          }
        });
      },

      updateUserStatus: (userId: string, isOnline: boolean) => {
        set((state) => {
          const index = state.onlineUsers.indexOf(userId);
          if (isOnline && index === -1) {
            state.onlineUsers.push(userId);
          } else if (!isOnline && index !== -1) {
            state.onlineUsers.splice(index, 1);
          }
        });
      },

      markAsRead: async (conversationId: string, messageId?: string) => {
        try {
          const endpoint = messageId
            ? `/api/v1/messages/${messageId}/read`
            : `/api/v1/conversations/${conversationId}/mark-read`;

          const response = await fetch(endpoint, {
            method: 'POST',
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Okundu olarak işaretlenemedi');
          }

          set((state) => {
            const conversationIndex = state.conversations.findIndex(
              (c) => c.id === conversationId
            );
            if (
              conversationIndex !== -1 &&
              state.conversations[conversationIndex].unreadCount > 0
            ) {
              const oldUnread =
                state.conversations[conversationIndex].unreadCount;
              state.conversations[conversationIndex].unreadCount = 0;
              state.totalUnreadCount -= oldUnread;
            }

            // Mark messages as read
            const messages = state.messages[conversationId];
            if (messages) {
              messages.forEach((message) => {
                if (!message.isRead) {
                  message.isRead = true;
                  message.readAt = new Date().toISOString();
                }
              });
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Failed to mark as read';
          });
        }
      },

      // ================================================
      // UTILITY ACTIONS
      // ================================================
      reset: () => set(() => ({ ...initialState })),

      clearError: () =>
        set((state) => {
          state.error = null;
        }),
    })),
    {
      name: 'messaging-store',
      partialize: (state) => ({
        // Only persist essential data
        conversations: state.conversations,
        totalUnreadCount: state.totalUnreadCount,
      }),
    }
  )
);

// ================================================
// OPTIMIZED SELECTOR HOOKS
// ================================================
// Use these hooks to prevent unnecessary re-renders

// Conversations
export const useConversations = () =>
  useMessagingStore((state) => state.conversations);

export const useCurrentConversation = () =>
  useMessagingStore((state) => {
    if (!state.currentConversationId) return null;
    return (
      state.conversations.find((c) => c.id === state.currentConversationId) ||
      null
    );
  });

export const useConversationById = (id: string) =>
  useMessagingStore(
    (state) => state.conversations.find((c) => c.id === id) || null
  );

// Messages
export const useMessagesByConversation = (conversationId: string) =>
  useMessagingStore((state) => state.messages[conversationId] || []);

export const useCurrentMessages = () =>
  useMessagingStore((state) => {
    if (!state.currentConversationId) return [];
    return state.messages[state.currentConversationId] || [];
  });

// Status
export const useTotalUnreadCount = () =>
  useMessagingStore((state) => state.totalUnreadCount);

export const useIsUserOnline = (userId: string) =>
  useMessagingStore((state) => state.onlineUsers.includes(userId));

export const useTypingUsersInConversation = (conversationId: string) =>
  useMessagingStore((state) => state.typingUsers[conversationId] || []);

// Loading states
export const useIsLoadingConversations = () =>
  useMessagingStore((state) => state.isLoadingConversations);
export const useIsLoadingMessages = () =>
  useMessagingStore((state) => state.isLoadingMessages);
export const useIsSendingMessage = () =>
  useMessagingStore((state) => state.isSendingMessage);

// Search
export const useSearchResults = () =>
  useMessagingStore((state) => state.searchResults);
export const useIsSearching = () =>
  useMessagingStore((state) => state.isSearching);
export const useSearchQuery = () =>
  useMessagingStore((state) => state.searchQuery);

// Error
export const useMessagingError = () =>
  useMessagingStore((state) => state.error);

// ================================================
// UTILITY HOOKS
// ================================================

export const useConversationDetail = () => {
  const conversation = useCurrentConversation();
  const messages = useCurrentMessages();
  const isLoading = useIsLoadingMessages();

  return {
    conversation,
    messages,
    isLoading,
  };
};

export const useConversationStatus = (conversationId: string) => {
  const conversation = useConversationById(conversationId);
  const typingUsers = useTypingUsersInConversation(conversationId);

  return {
    conversation,
    unreadCount: conversation?.unreadCount || 0,
    typingUsers,
    isTyping: typingUsers.length > 0,
  };
};

export default useMessagingStore;
